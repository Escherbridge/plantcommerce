import { eq, and, like, or, desc, asc, count, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';
import * as table from '$lib/server/db/schema';
import { sanitizeLike } from '$lib/utils/string';

import type { LmsCourse } from '$lib/server/db/lms-schema';

// ======= INTERFACES =======

export interface CreateCourseParams {
	title: string;
	slug: string;
	description?: string;
	courseType?: 'self_paced' | 'instructor_led' | 'blended' | 'cohort';
	instructorId?: string;
	thumbnailFileId?: string;
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	language?: string;
	durationEstimate?: number;
	price?: string;
	pricingType?: 'free' | 'one_time';
	enrollmentType?: 'open' | 'approval' | 'invite' | 'capacity';
	maxEnrollment?: number;
	passingScore?: number;
	programId?: string;
	sequentialEnabled?: boolean;
	isFeatured?: boolean;
	metaTitle?: string;
	metaDescription?: string;
}

export interface UpdateCourseParams {
	title?: string;
	slug?: string;
	description?: string;
	courseType?: 'self_paced' | 'instructor_led' | 'blended' | 'cohort';
	instructorId?: string;
	thumbnailFileId?: string;
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	language?: string;
	durationEstimate?: number;
	price?: string;
	pricingType?: 'free' | 'one_time';
	enrollmentType?: 'open' | 'approval' | 'invite' | 'capacity';
	maxEnrollment?: number;
	passingScore?: number;
	programId?: string;
	sequentialEnabled?: boolean;
	isFeatured?: boolean;
	metaTitle?: string;
	metaDescription?: string;
	status?: 'draft' | 'published' | 'archived';
}

export interface CourseFilter {
	status?: 'draft' | 'published' | 'archived';
	courseType?: 'self_paced' | 'instructor_led' | 'blended' | 'cohort';
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	pricingType?: 'free' | 'one_time';
	instructorId?: string;
	search?: string;
	isFeatured?: boolean;
	isAdmin?: boolean;
	limit?: number;
	offset?: number;
	sortBy?: 'title' | 'createdAt' | 'price';
	sortOrder?: 'asc' | 'desc';
}

export interface CourseWithDetails extends LmsCourse {
	instructor: {
		id: string;
		username: string;
		firstName: string | null;
		lastName: string | null;
	} | null;
	moduleCount: number;
	enrollmentCount: number;
}

export interface CourseListItem {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	courseType: string;
	difficulty: string | null;
	price: string | null;
	pricingType: string;
	status: string;
	isFeatured: boolean;
	thumbnailFileId: string | null;
	instructorName: string | null;
	moduleCount: number;
	enrollmentCount: number;
	createdAt: Date;
}

// ======= SERVICE =======

export class LmsCourseService {
	/**
	 * Create a new course
	 */
	static async createCourse(params: CreateCourseParams): Promise<LmsCourse> {
		// Check slug uniqueness
		const existingCourse = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.slug, params.slug))
			.limit(1);

		if (existingCourse.length > 0) {
			throw new Error('Slug already exists');
		}

		// Verify instructorId exists and has correct role
		if (params.instructorId) {
			const instructor = await db
				.select()
				.from(table.user)
				.where(eq(table.user.id, params.instructorId))
				.limit(1);

			if (instructor.length === 0) {
				throw new Error('Instructor not found');
			}

			if (instructor[0].role !== 'instructor' && instructor[0].role !== 'admin') {
				throw new Error('User does not have instructor or admin role');
			}
		}

		const courseData: typeof lmsTable.lmsCourse.$inferInsert = {
			id: randomUUID(),
			title: params.title,
			slug: params.slug,
			description: params.description || null,
			courseType: params.courseType || 'self_paced',
			instructorId: params.instructorId || null,
			thumbnailFileId: params.thumbnailFileId || null,
			difficulty: params.difficulty || null,
			language: params.language || 'en',
			durationEstimate: params.durationEstimate || null,
			price: params.price || null,
			pricingType: params.pricingType || 'free',
			enrollmentType: params.enrollmentType || 'open',
			maxEnrollment: params.maxEnrollment || null,
			passingScore: params.passingScore || 70,
			status: 'draft',
			programId: params.programId || null,
			sequentialEnabled: params.sequentialEnabled ?? true,
			isFeatured: params.isFeatured || false,
			metaTitle: params.metaTitle || null,
			metaDescription: params.metaDescription || null
		};

		const [course] = await db.insert(lmsTable.lmsCourse).values(courseData).returning();
		return course;
	}

	/**
	 * Update an existing course
	 */
	static async updateCourse(courseId: string, params: UpdateCourseParams): Promise<LmsCourse> {
		// Check slug uniqueness if slug is being changed
		if (params.slug) {
			const existingCourse = await db
				.select()
				.from(lmsTable.lmsCourse)
				.where(eq(lmsTable.lmsCourse.slug, params.slug))
				.limit(1);

			if (existingCourse.length > 0 && existingCourse[0].id !== courseId) {
				throw new Error('Slug already exists');
			}
		}

		// Build update object
		const updateData: Partial<typeof lmsTable.lmsCourse.$inferInsert> = {
			updatedAt: new Date()
		};

		// Copy all defined parameters
		Object.keys(params).forEach((key) => {
			const value = params[key as keyof UpdateCourseParams];
			if (value !== undefined) {
				(updateData as any)[key] = value;
			}
		});

		const [updatedCourse] = await db
			.update(lmsTable.lmsCourse)
			.set(updateData)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.returning();

		if (!updatedCourse) {
			throw new Error('Course not found');
		}

		return updatedCourse;
	}

	/**
	 * Soft-delete course (set status to 'archived')
	 */
	static async deleteCourse(courseId: string): Promise<void> {
		const [result] = await db
			.update(lmsTable.lmsCourse)
			.set({ status: 'archived', updatedAt: new Date() })
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.returning();

		if (!result) {
			throw new Error('Course not found');
		}
	}

	/**
	 * Get course by slug with instructor info, module count, and enrollment count
	 */
	static async getCourseBySlug(
		slug: string,
		includeUnpublished: boolean = false
	): Promise<CourseWithDetails | null> {
		// Build conditions
		const conditions = [eq(lmsTable.lmsCourse.slug, slug)];
		if (!includeUnpublished) {
			conditions.push(eq(lmsTable.lmsCourse.status, 'published'));
		}

		const courseResult = await db
			.select({
				course: lmsTable.lmsCourse,
				instructor: {
					id: table.user.id,
					username: table.user.username,
					firstName: table.user.firstName,
					lastName: table.user.lastName
				}
			})
			.from(lmsTable.lmsCourse)
			.leftJoin(table.user, eq(lmsTable.lmsCourse.instructorId, table.user.id))
			.where(and(...conditions))
			.limit(1);

		if (courseResult.length === 0) {
			return null;
		}

		const { course, instructor } = courseResult[0];

		// Get module count
		const moduleCountResult = await db
			.select({ value: count() })
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, course.id));

		const moduleCount = moduleCountResult[0]?.value ?? 0;

		// Get active enrollment count
		const enrollmentCountResult = await db
			.select({ value: count() })
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.courseId, course.id),
					eq(lmsTable.lmsEnrollment.status, 'active')
				)
			);

		const enrollmentCount = enrollmentCountResult[0]?.value ?? 0;

		return {
			...course,
			instructor: instructor?.id ? instructor : null,
			moduleCount,
			enrollmentCount
		};
	}

	/**
	 * List courses with pagination and filters
	 */
	static async listCourses(
		filter: CourseFilter
	): Promise<{ courses: CourseListItem[]; total: number }> {
		const {
			status,
			courseType,
			difficulty,
			pricingType,
			instructorId,
			search,
			isFeatured,
			isAdmin = false,
			limit = 20,
			offset = 0,
			sortBy = 'createdAt',
			sortOrder = 'desc'
		} = filter;

		// Build conditions
		const conditions = [];

		// Default: only published unless admin
		if (!isAdmin) {
			conditions.push(eq(lmsTable.lmsCourse.status, 'published'));
		} else if (status) {
			conditions.push(eq(lmsTable.lmsCourse.status, status));
		}

		if (courseType) {
			conditions.push(eq(lmsTable.lmsCourse.courseType, courseType));
		}

		if (difficulty) {
			conditions.push(eq(lmsTable.lmsCourse.difficulty, difficulty));
		}

		if (pricingType) {
			conditions.push(eq(lmsTable.lmsCourse.pricingType, pricingType));
		}

		if (instructorId) {
			conditions.push(eq(lmsTable.lmsCourse.instructorId, instructorId));
		}

		if (search) {
			const sanitizedSearch = sanitizeLike(search);
			conditions.push(
				or(
					like(lmsTable.lmsCourse.title, `%${sanitizedSearch}%`),
					like(lmsTable.lmsCourse.description, `%${sanitizedSearch}%`)
				)
			);
		}

		if (isFeatured !== undefined) {
			conditions.push(eq(lmsTable.lmsCourse.isFeatured, isFeatured));
		}

		// Determine sort column
		const sortColumn =
			sortBy === 'title'
				? lmsTable.lmsCourse.title
				: sortBy === 'price'
					? lmsTable.lmsCourse.price
					: lmsTable.lmsCourse.createdAt;

		const sortFn = sortOrder === 'asc' ? asc : desc;

		// Build where clause
		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Get total count
		const totalResult = await db
			.select({ value: count() })
			.from(lmsTable.lmsCourse)
			.where(whereClause);

		const total = totalResult[0]?.value ?? 0;

		// Get courses with instructor name, module count, enrollment count
		const coursesRaw = await db
			.select({
				id: lmsTable.lmsCourse.id,
				title: lmsTable.lmsCourse.title,
				slug: lmsTable.lmsCourse.slug,
				description: lmsTable.lmsCourse.description,
				courseType: lmsTable.lmsCourse.courseType,
				difficulty: lmsTable.lmsCourse.difficulty,
				price: lmsTable.lmsCourse.price,
				pricingType: lmsTable.lmsCourse.pricingType,
				status: lmsTable.lmsCourse.status,
				isFeatured: lmsTable.lmsCourse.isFeatured,
				thumbnailFileId: lmsTable.lmsCourse.thumbnailFileId,
				createdAt: lmsTable.lmsCourse.createdAt,
				instructorFirstName: table.user.firstName,
				instructorLastName: table.user.lastName,
				instructorUsername: table.user.username
			})
			.from(lmsTable.lmsCourse)
			.leftJoin(table.user, eq(lmsTable.lmsCourse.instructorId, table.user.id))
			.where(whereClause)
			.orderBy(sortFn(sortColumn))
			.limit(limit)
			.offset(offset);

		// For each course, get module count and enrollment count
		const courses: CourseListItem[] = await Promise.all(
			coursesRaw.map(async (row) => {
				const moduleCountResult = await db
					.select({ value: count() })
					.from(lmsTable.lmsModule)
					.where(eq(lmsTable.lmsModule.courseId, row.id));

				const enrollmentCountResult = await db
					.select({ value: count() })
					.from(lmsTable.lmsEnrollment)
					.where(
						and(
							eq(lmsTable.lmsEnrollment.courseId, row.id),
							eq(lmsTable.lmsEnrollment.status, 'active')
						)
					);

				// Build instructor display name
				let instructorName: string | null = null;
				if (row.instructorFirstName || row.instructorLastName) {
					instructorName = [row.instructorFirstName, row.instructorLastName]
						.filter(Boolean)
						.join(' ');
				} else if (row.instructorUsername) {
					instructorName = row.instructorUsername;
				}

				return {
					id: row.id,
					title: row.title,
					slug: row.slug,
					description: row.description,
					courseType: row.courseType,
					difficulty: row.difficulty,
					price: row.price,
					pricingType: row.pricingType,
					status: row.status,
					isFeatured: row.isFeatured,
					thumbnailFileId: row.thumbnailFileId,
					instructorName,
					moduleCount: moduleCountResult[0]?.value ?? 0,
					enrollmentCount: enrollmentCountResult[0]?.value ?? 0,
					createdAt: row.createdAt
				};
			})
		);

		return { courses, total };
	}

	/**
	 * Clone a course (deep copy without enrollments, progress, reviews, discussions)
	 */
	static async cloneCourse(
		courseId: string,
		newTitle: string,
		newSlug: string
	): Promise<LmsCourse> {
		// Check slug uniqueness
		const existingCourse = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.slug, newSlug))
			.limit(1);

		if (existingCourse.length > 0) {
			throw new Error('Slug already exists');
		}

		// Get source course
		const sourceCourse = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.limit(1);

		if (sourceCourse.length === 0) {
			throw new Error('Course not found');
		}

		const source = sourceCourse[0];

		// Create new course
		const newCourseId = randomUUID();
		const courseData: typeof lmsTable.lmsCourse.$inferInsert = {
			id: newCourseId,
			title: newTitle,
			slug: newSlug,
			description: source.description,
			courseType: source.courseType,
			instructorId: source.instructorId,
			thumbnailFileId: source.thumbnailFileId,
			difficulty: source.difficulty,
			language: source.language,
			durationEstimate: source.durationEstimate,
			price: source.price,
			pricingType: source.pricingType,
			enrollmentType: source.enrollmentType,
			maxEnrollment: source.maxEnrollment,
			passingScore: source.passingScore,
			status: 'draft',
			programId: source.programId,
			sequentialEnabled: source.sequentialEnabled,
			isFeatured: false,
			metaTitle: source.metaTitle,
			metaDescription: source.metaDescription
		};

		const [newCourse] = await db.insert(lmsTable.lmsCourse).values(courseData).returning();

		// Copy modules
		const sourceModules = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, courseId))
			.orderBy(asc(lmsTable.lmsModule.sortOrder));

		for (const sourceModule of sourceModules) {
			const newModuleId = randomUUID();
			await db.insert(lmsTable.lmsModule).values({
				id: newModuleId,
				title: sourceModule.title,
				slug: `${newSlug}-${sourceModule.slug}`,
				description: sourceModule.description,
				courseId: newCourseId,
				sortOrder: sourceModule.sortOrder,
				isPublished: sourceModule.isPublished
			});

			// Copy lessons for this module
			const sourceLessons = await db
				.select()
				.from(lmsTable.lmsLesson)
				.where(eq(lmsTable.lmsLesson.moduleId, sourceModule.id))
				.orderBy(asc(lmsTable.lmsLesson.sortOrder));

			for (const sourceLesson of sourceLessons) {
				const newLessonId = randomUUID();
				await db.insert(lmsTable.lmsLesson).values({
					id: newLessonId,
					title: sourceLesson.title,
					slug: `${newSlug}-${sourceLesson.slug}`,
					description: sourceLesson.description,
					moduleId: newModuleId,
					sortOrder: sourceLesson.sortOrder,
					isPublished: sourceLesson.isPublished,
					isPreview: sourceLesson.isPreview,
					estimatedMinutes: sourceLesson.estimatedMinutes
				});

				// Copy content blocks for this lesson
				const sourceBlocks = await db
					.select()
					.from(lmsTable.lmsContentBlock)
					.where(eq(lmsTable.lmsContentBlock.lessonId, sourceLesson.id))
					.orderBy(asc(lmsTable.lmsContentBlock.sortOrder));

				for (const sourceBlock of sourceBlocks) {
					await db.insert(lmsTable.lmsContentBlock).values({
						id: randomUUID(),
						lessonId: newLessonId,
						type: sourceBlock.type,
						title: sourceBlock.title,
						content: sourceBlock.content,
						fileId: sourceBlock.fileId, // Keep same file reference
						config: sourceBlock.config,
						sortOrder: sourceBlock.sortOrder,
						isRequired: sourceBlock.isRequired,
						completionThreshold: sourceBlock.completionThreshold
					});
				}
			}
		}

		return newCourse;
	}

	/**
	 * Publish a draft course
	 */
	static async publishCourse(courseId: string): Promise<LmsCourse> {
		// Get current course
		const coursResult = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.limit(1);

		if (coursResult.length === 0) {
			throw new Error('Course not found');
		}

		const course = coursResult[0];

		if (course.status === 'published') {
			throw new Error('Course is already published');
		}

		// Verify course has at least one module with at least one lesson
		const modules = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, courseId));

		if (modules.length === 0) {
			throw new Error('Course must have at least one module before publishing');
		}

		let hasLesson = false;
		for (const mod of modules) {
			const lessons = await db
				.select()
				.from(lmsTable.lmsLesson)
				.where(eq(lmsTable.lmsLesson.moduleId, mod.id))
				.limit(1);

			if (lessons.length > 0) {
				hasLesson = true;
				break;
			}
		}

		if (!hasLesson) {
			throw new Error('Course must have at least one lesson before publishing');
		}

		const [publishedCourse] = await db
			.update(lmsTable.lmsCourse)
			.set({ status: 'published', updatedAt: new Date() })
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.returning();

		return publishedCourse;
	}

	/**
	 * Get course by ID (internal use)
	 */
	static async getCourseById(courseId: string): Promise<LmsCourse | null> {
		const result = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		return result[0];
	}
}

export default LmsCourseService;
