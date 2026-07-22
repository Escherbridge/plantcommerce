import { eq, and, asc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';
import type { LmsModule, LmsLesson } from '$lib/server/db/lms-schema';
import { randomUUID } from 'crypto';

export interface CurriculumTree {
	modules: Array<{
		id: string;
		title: string;
		slug: string;
		description: string | null;
		sortOrder: number;
		isPublished: boolean;
		lessons: Array<{
			id: string;
			title: string;
			slug: string;
			description: string | null;
			sortOrder: number;
			isPublished: boolean;
			isPreview: boolean;
			estimatedMinutes: number | null;
			contentBlockCount: number;
		}>;
	}>;
}

export class CurriculumService {
	// === MODULES ===

	static async createModule(params: {
		courseId: string;
		title: string;
		slug: string;
		description?: string;
	}): Promise<LmsModule> {
		// Verify course exists
		const course = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, params.courseId))
			.limit(1);

		if (course.length === 0) {
			throw new Error('Course not found');
		}

		// Check slug uniqueness
		const existingSlug = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.slug, params.slug))
			.limit(1);

		if (existingSlug.length > 0) {
			throw new Error('Module slug already exists');
		}

		// Auto-assign sortOrder (max + 1 for this course)
		const maxOrder = await db
			.select({ maxSort: sql<number>`coalesce(max(${lmsTable.lmsModule.sortOrder}), -1)` })
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, params.courseId));

		const sortOrder = (maxOrder[0]?.maxSort ?? -1) + 1;

		const id = randomUUID();
		const now = new Date();

		const result = await db
			.insert(lmsTable.lmsModule)
			.values({
				id,
				title: params.title,
				slug: params.slug,
				description: params.description || null,
				courseId: params.courseId,
				sortOrder,
				createdAt: now,
				updatedAt: now
			})
			.returning();

		return result[0];
	}

	static async updateModule(
		moduleId: string,
		params: {
			title?: string;
			slug?: string;
			description?: string;
			isPublished?: boolean;
		}
	): Promise<LmsModule> {
		// Check slug uniqueness if changing (exclude current)
		if (params.slug) {
			const existingSlug = await db
				.select()
				.from(lmsTable.lmsModule)
				.where(
					and(
						eq(lmsTable.lmsModule.slug, params.slug),
						sql`${lmsTable.lmsModule.id} != ${moduleId}`
					)
				)
				.limit(1);

			if (existingSlug.length > 0) {
				throw new Error('Module slug already exists');
			}
		}

		const updateData: Record<string, unknown> = { updatedAt: new Date() };
		if (params.title !== undefined) updateData.title = params.title;
		if (params.slug !== undefined) updateData.slug = params.slug;
		if (params.description !== undefined) updateData.description = params.description;
		if (params.isPublished !== undefined) updateData.isPublished = params.isPublished;

		const result = await db
			.update(lmsTable.lmsModule)
			.set(updateData)
			.where(eq(lmsTable.lmsModule.id, moduleId))
			.returning();

		if (result.length === 0) {
			throw new Error('Module not found');
		}

		return result[0];
	}

	static async deleteModule(moduleId: string): Promise<void> {
		// Get the module to know its courseId and sortOrder
		const moduleResult = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.id, moduleId))
			.limit(1);

		if (moduleResult.length === 0) {
			throw new Error('Module not found');
		}

		const mod = moduleResult[0];

		// Delete (cascades to lessons and content blocks)
		await db.delete(lmsTable.lmsModule).where(eq(lmsTable.lmsModule.id, moduleId));

		// Reorder remaining modules to fill gap
		await db.execute(
			sql`UPDATE lms_module SET sort_order = sort_order - 1, updated_at = now() WHERE course_id = ${mod.courseId} AND sort_order > ${mod.sortOrder}`
		);
	}

	static async getModulesByCourse(courseId: string): Promise<LmsModule[]> {
		return db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, courseId))
			.orderBy(asc(lmsTable.lmsModule.sortOrder));
	}

	static async reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
		// Verify all moduleIds belong to courseId
		const modules = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, courseId));

		const courseModuleIds = new Set(modules.map((m) => m.id));
		for (const id of moduleIds) {
			if (!courseModuleIds.has(id)) {
				throw new Error(`Module ${id} does not belong to course ${courseId}`);
			}
		}

		// Update sortOrder for each module based on array position
		const now = new Date();
		for (let i = 0; i < moduleIds.length; i++) {
			await db
				.update(lmsTable.lmsModule)
				.set({ sortOrder: i, updatedAt: now })
				.where(eq(lmsTable.lmsModule.id, moduleIds[i]));
		}
	}

	// === LESSONS ===

	static async createLesson(params: {
		moduleId: string;
		title: string;
		slug: string;
		description?: string;
		isPreview?: boolean;
		estimatedMinutes?: number;
	}): Promise<LmsLesson> {
		// Verify module exists
		const moduleResult = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.id, params.moduleId))
			.limit(1);

		if (moduleResult.length === 0) {
			throw new Error('Module not found');
		}

		// Check slug uniqueness
		const existingSlug = await db
			.select()
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.slug, params.slug))
			.limit(1);

		if (existingSlug.length > 0) {
			throw new Error('Lesson slug already exists');
		}

		// Auto-assign sortOrder (max + 1 in module)
		const maxOrder = await db
			.select({ maxSort: sql<number>`coalesce(max(${lmsTable.lmsLesson.sortOrder}), -1)` })
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.moduleId, params.moduleId));

		const sortOrder = (maxOrder[0]?.maxSort ?? -1) + 1;

		const id = randomUUID();
		const now = new Date();

		const result = await db
			.insert(lmsTable.lmsLesson)
			.values({
				id,
				title: params.title,
				slug: params.slug,
				description: params.description || null,
				moduleId: params.moduleId,
				sortOrder,
				isPreview: params.isPreview ?? false,
				estimatedMinutes: params.estimatedMinutes ?? null,
				createdAt: now,
				updatedAt: now
			})
			.returning();

		return result[0];
	}

	static async updateLesson(
		lessonId: string,
		params: {
			title?: string;
			slug?: string;
			description?: string;
			isPublished?: boolean;
			isPreview?: boolean;
			estimatedMinutes?: number;
		}
	): Promise<LmsLesson> {
		// Check slug uniqueness if changing
		if (params.slug) {
			const existingSlug = await db
				.select()
				.from(lmsTable.lmsLesson)
				.where(
					and(
						eq(lmsTable.lmsLesson.slug, params.slug),
						sql`${lmsTable.lmsLesson.id} != ${lessonId}`
					)
				)
				.limit(1);

			if (existingSlug.length > 0) {
				throw new Error('Lesson slug already exists');
			}
		}

		const updateData: Record<string, unknown> = { updatedAt: new Date() };
		if (params.title !== undefined) updateData.title = params.title;
		if (params.slug !== undefined) updateData.slug = params.slug;
		if (params.description !== undefined) updateData.description = params.description;
		if (params.isPublished !== undefined) updateData.isPublished = params.isPublished;
		if (params.isPreview !== undefined) updateData.isPreview = params.isPreview;
		if (params.estimatedMinutes !== undefined)
			updateData.estimatedMinutes = params.estimatedMinutes;

		const result = await db
			.update(lmsTable.lmsLesson)
			.set(updateData)
			.where(eq(lmsTable.lmsLesson.id, lessonId))
			.returning();

		if (result.length === 0) {
			throw new Error('Lesson not found');
		}

		return result[0];
	}

	static async deleteLesson(lessonId: string): Promise<void> {
		// Get the lesson to know its moduleId and sortOrder
		const lessonResult = await db
			.select()
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.id, lessonId))
			.limit(1);

		if (lessonResult.length === 0) {
			throw new Error('Lesson not found');
		}

		const lesson = lessonResult[0];

		// Delete (cascades to content blocks)
		await db.delete(lmsTable.lmsLesson).where(eq(lmsTable.lmsLesson.id, lessonId));

		// Reorder remaining lessons in module
		await db.execute(
			sql`UPDATE lms_lesson SET sort_order = sort_order - 1, updated_at = now() WHERE module_id = ${lesson.moduleId} AND sort_order > ${lesson.sortOrder}`
		);
	}

	static async getLessonsByModule(moduleId: string): Promise<LmsLesson[]> {
		return db
			.select()
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.moduleId, moduleId))
			.orderBy(asc(lmsTable.lmsLesson.sortOrder));
	}

	static async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
		// Verify all lessonIds belong to moduleId
		const lessons = await db
			.select()
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.moduleId, moduleId));

		const moduleLessonIds = new Set(lessons.map((l) => l.id));
		for (const id of lessonIds) {
			if (!moduleLessonIds.has(id)) {
				throw new Error(`Lesson ${id} does not belong to module ${moduleId}`);
			}
		}

		const now = new Date();
		for (let i = 0; i < lessonIds.length; i++) {
			await db
				.update(lmsTable.lmsLesson)
				.set({ sortOrder: i, updatedAt: now })
				.where(eq(lmsTable.lmsLesson.id, lessonIds[i]));
		}
	}

	static async moveLesson(
		lessonId: string,
		targetModuleId: string,
		position: number
	): Promise<void> {
		// Verify lesson exists
		const lessonResult = await db
			.select()
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.id, lessonId))
			.limit(1);

		if (lessonResult.length === 0) {
			throw new Error('Lesson not found');
		}

		const lesson = lessonResult[0];
		const sourceModuleId = lesson.moduleId;

		// Verify target module exists
		const targetModule = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.id, targetModuleId))
			.limit(1);

		if (targetModule.length === 0) {
			throw new Error('Target module not found');
		}

		const now = new Date();

		// Remove from source module: close the gap
		await db.execute(
			sql`UPDATE lms_lesson SET sort_order = sort_order - 1, updated_at = now() WHERE module_id = ${sourceModuleId} AND sort_order > ${lesson.sortOrder}`
		);

		// Make room in target module at position
		await db.execute(
			sql`UPDATE lms_lesson SET sort_order = sort_order + 1, updated_at = now() WHERE module_id = ${targetModuleId} AND sort_order >= ${position}`
		);

		// Move the lesson
		await db
			.update(lmsTable.lmsLesson)
			.set({
				moduleId: targetModuleId,
				sortOrder: position,
				updatedAt: now
			})
			.where(eq(lmsTable.lmsLesson.id, lessonId));
	}

	// === FULL CURRICULUM ===

	static async getFullCurriculum(courseId: string): Promise<CurriculumTree> {
		// Get all modules for this course
		const modules = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, courseId))
			.orderBy(asc(lmsTable.lmsModule.sortOrder));

		if (modules.length === 0) {
			return { modules: [] };
		}

		const moduleIds = modules.map((m) => m.id);

		// Get all lessons for these modules
		const lessons = await db
			.select()
			.from(lmsTable.lmsLesson)
			.where(sql`${lmsTable.lmsLesson.moduleId} IN ${moduleIds}`)
			.orderBy(asc(lmsTable.lmsLesson.sortOrder));

		const lessonIds = lessons.map((l) => l.id);

		// Get content block counts per lesson
		let blockCounts: Map<string, number> = new Map();
		if (lessonIds.length > 0) {
			const counts = await db
				.select({
					lessonId: lmsTable.lmsContentBlock.lessonId,
					count: sql<number>`count(*)::int`
				})
				.from(lmsTable.lmsContentBlock)
				.where(sql`${lmsTable.lmsContentBlock.lessonId} IN ${lessonIds}`)
				.groupBy(lmsTable.lmsContentBlock.lessonId);

			for (const row of counts) {
				blockCounts.set(row.lessonId, row.count);
			}
		}

		// Build nested structure
		const lessonsByModule = new Map<string, typeof lessons>();
		for (const lesson of lessons) {
			const arr = lessonsByModule.get(lesson.moduleId) || [];
			arr.push(lesson);
			lessonsByModule.set(lesson.moduleId, arr);
		}

		return {
			modules: modules.map((mod) => ({
				id: mod.id,
				title: mod.title,
				slug: mod.slug,
				description: mod.description,
				sortOrder: mod.sortOrder,
				isPublished: mod.isPublished,
				lessons: (lessonsByModule.get(mod.id) || []).map((lesson) => ({
					id: lesson.id,
					title: lesson.title,
					slug: lesson.slug,
					description: lesson.description,
					sortOrder: lesson.sortOrder,
					isPublished: lesson.isPublished,
					isPreview: lesson.isPreview,
					estimatedMinutes: lesson.estimatedMinutes,
					contentBlockCount: blockCounts.get(lesson.id) || 0
				}))
			}))
		};
	}
}

export default CurriculumService;
