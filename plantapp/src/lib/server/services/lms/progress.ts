import { eq, and, desc, count, avg, max, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export class ProgressService {
	static async updateContentBlockProgress(
		enrollmentId: string,
		contentBlockId: string,
		data: { status?: string; progressPercent?: number; metadata?: Record<string, any> }
	) {
		// Check if progress record exists
		const [existing] = await db
			.select()
			.from(lmsTable.lmsProgress)
			.where(
				and(
					eq(lmsTable.lmsProgress.enrollmentId, enrollmentId),
					eq(lmsTable.lmsProgress.contentBlockId, contentBlockId)
				)
			)
			.limit(1);

		if (existing) {
			const updates: Record<string, any> = { updatedAt: new Date() };
			if (data.status) updates.status = data.status;
			if (data.progressPercent !== undefined) updates.progressPercent = data.progressPercent;
			if (data.metadata) updates.metadata = JSON.stringify(data.metadata);

			const [updated] = await db
				.update(lmsTable.lmsProgress)
				.set(updates)
				.where(eq(lmsTable.lmsProgress.id, existing.id))
				.returning();
			return updated;
		}

		// Get lesson and module IDs from content block
		const [block] = await db
			.select()
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.id, contentBlockId))
			.limit(1);

		let moduleId: string | null = null;
		if (block?.lessonId) {
			const [lesson] = await db
				.select()
				.from(lmsTable.lmsLesson)
				.where(eq(lmsTable.lmsLesson.id, block.lessonId))
				.limit(1);
			moduleId = lesson?.moduleId || null;
		}

		const [created] = await db
			.insert(lmsTable.lmsProgress)
			.values({
				id: randomUUID(),
				enrollmentId,
				contentBlockId,
				lessonId: block?.lessonId || null,
				moduleId,
				status: data.status || 'in_progress',
				progressPercent: data.progressPercent ?? 0,
				metadata: data.metadata ? JSON.stringify(data.metadata) : null
			})
			.returning();
		return created;
	}

	static async calculateLessonProgress(enrollmentId: string, lessonId: string): Promise<number> {
		const [totalResult] = await db
			.select({ total: count() })
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.lessonId, lessonId));

		const [completedResult] = await db
			.select({ completed: count() })
			.from(lmsTable.lmsProgress)
			.where(
				and(
					eq(lmsTable.lmsProgress.enrollmentId, enrollmentId),
					eq(lmsTable.lmsProgress.lessonId, lessonId),
					eq(lmsTable.lmsProgress.status, 'completed')
				)
			);

		const total = totalResult?.total || 0;
		const completed = completedResult?.completed || 0;
		return total > 0 ? Math.round((completed / total) * 100) : 0;
	}

	static async calculateModuleProgress(enrollmentId: string, moduleId: string): Promise<number> {
		const lessons = await db
			.select({ id: lmsTable.lmsLesson.id })
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.moduleId, moduleId));

		if (lessons.length === 0) return 0;

		let totalProgress = 0;
		for (const lesson of lessons) {
			totalProgress += await this.calculateLessonProgress(enrollmentId, lesson.id);
		}
		return Math.round(totalProgress / lessons.length);
	}

	static async calculateCourseProgress(enrollmentId: string): Promise<number> {
		const [enrollment] = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.limit(1);
		if (!enrollment) return 0;

		const modules = await db
			.select({ id: lmsTable.lmsModule.id })
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, enrollment.courseId));

		if (modules.length === 0) return 0;

		let totalProgress = 0;
		for (const mod of modules) {
			totalProgress += await this.calculateModuleProgress(enrollmentId, mod.id);
		}
		return Math.round(totalProgress / modules.length);
	}

	static async getResumePoint(enrollmentId: string) {
		const [latest] = await db
			.select()
			.from(lmsTable.lmsProgress)
			.where(eq(lmsTable.lmsProgress.enrollmentId, enrollmentId))
			.orderBy(desc(lmsTable.lmsProgress.updatedAt))
			.limit(1);

		if (!latest) return null;
		return {
			moduleId: latest.moduleId,
			lessonId: latest.lessonId,
			contentBlockId: latest.contentBlockId
		};
	}

	static async markLessonComplete(enrollmentId: string, lessonId: string) {
		const blocks = await db
			.select({ id: lmsTable.lmsContentBlock.id })
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.lessonId, lessonId));

		for (const block of blocks) {
			await this.updateContentBlockProgress(enrollmentId, block.id, {
				status: 'completed',
				progressPercent: 100
			});
		}
	}

	static async markCourseComplete(enrollmentId: string) {
		await db
			.update(lmsTable.lmsEnrollment)
			.set({
				status: 'completed',
				completedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId));
	}

	static async getProgressForCourse(enrollmentId: string) {
		const [enrollment] = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.limit(1);
		if (!enrollment) return null;

		const modules = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, enrollment.courseId))
			.orderBy(lmsTable.lmsModule.sortOrder);

		const tree = [];
		for (const mod of modules) {
			const lessons = await db
				.select()
				.from(lmsTable.lmsLesson)
				.where(eq(lmsTable.lmsLesson.moduleId, mod.id))
				.orderBy(lmsTable.lmsLesson.sortOrder);

			const lessonData = [];
			for (const lesson of lessons) {
				const progress = await this.calculateLessonProgress(enrollmentId, lesson.id);
				lessonData.push({ ...lesson, progressPercent: progress });
			}

			const moduleProgress = await this.calculateModuleProgress(enrollmentId, mod.id);
			tree.push({ ...mod, progressPercent: moduleProgress, lessons: lessonData });
		}

		return {
			enrollmentId,
			courseId: enrollment.courseId,
			overallProgress: await this.calculateCourseProgress(enrollmentId),
			modules: tree
		};
	}

	static async resetProgress(enrollmentId: string) {
		await db
			.delete(lmsTable.lmsProgress)
			.where(eq(lmsTable.lmsProgress.enrollmentId, enrollmentId));

		await db
			.update(lmsTable.lmsEnrollment)
			.set({ status: 'active', completedAt: null, updatedAt: new Date() })
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId));
	}
}

export default ProgressService;
