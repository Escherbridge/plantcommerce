import { randomUUID } from 'crypto';
import { eq, and, count, sql, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';
import * as table from '$lib/server/db/schema';

// ======= Types =======

export interface EnrollmentWithCourse {
	id: string;
	userId: string;
	courseId: string;
	status: string;
	enrolledAt: Date;
	completedAt: Date | null;
	lastAccessedAt: Date | null;
	course: {
		title: string;
		slug: string;
		thumbnailFileId: string | null;
		courseType: string;
		instructorName: string | null;
	};
	progressPercent: number;
}

export interface EnrollmentWithUser {
	id: string;
	userId: string;
	courseId: string;
	status: string;
	enrolledAt: Date;
	completedAt: Date | null;
	lastAccessedAt: Date | null;
	user: {
		id: string;
		username: string;
		email: string;
		firstName: string | null;
		lastName: string | null;
	};
}

export interface PaidEnrollmentData {
	courseId: string;
	courseTitle: string;
	price: string;
	userId: string;
}

// ======= Service =======

export class EnrollmentService {
	/**
	 * Enroll a user in a free course.
	 */
	static async enroll(userId: string, courseId: string): Promise<lmsTable.LmsEnrollment> {
		const course = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.then((rows) => rows[0]);

		if (!course) {
			throw new Error('Course not found');
		}
		if (course.status !== 'published') {
			throw new Error('Course is not published');
		}
		if (course.pricingType !== 'free') {
			throw new Error('Course is not free');
		}

		// Check enrollment type
		if (course.enrollmentType === 'approval') {
			throw new Error('This course requires approval to enroll');
		}
		if (course.enrollmentType === 'invite') {
			throw new Error('This course is invite-only');
		}

		// Check for existing enrollment
		const existing = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.courseId, courseId)
				)
			)
			.then((rows) => rows[0]);

		if (existing) {
			throw new Error('User is already enrolled in this course');
		}

		// Check capacity if enrollment type is 'capacity'
		if (course.enrollmentType === 'capacity') {
			const capacity = await EnrollmentService.checkCapacity(courseId);
			if (!capacity.available) {
				throw new Error('Course is at full capacity');
			}
		}

		const now = new Date();
		const enrollment: lmsTable.NewLmsEnrollment = {
			id: randomUUID(),
			userId,
			courseId,
			status: 'active',
			enrolledAt: now,
			lastAccessedAt: now,
			createdAt: now,
			updatedAt: now
		};

		const [created] = await db.insert(lmsTable.lmsEnrollment).values(enrollment).returning();
		return created;
	}

	/**
	 * Request enrollment for approval-required courses.
	 */
	static async requestEnrollment(userId: string, courseId: string): Promise<lmsTable.LmsEnrollment> {
		const course = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.then((rows) => rows[0]);

		if (!course) {
			throw new Error('Course not found');
		}
		if (course.status !== 'published') {
			throw new Error('Course is not published');
		}
		if (course.enrollmentType !== 'approval') {
			throw new Error('This course does not require enrollment approval');
		}

		// Check for existing enrollment
		const existing = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.courseId, courseId)
				)
			)
			.then((rows) => rows[0]);

		if (existing) {
			throw new Error('User already has an enrollment for this course');
		}

		const now = new Date();
		const enrollment: lmsTable.NewLmsEnrollment = {
			id: randomUUID(),
			userId,
			courseId,
			// 'pending' status - requires schema enum update to include 'pending'
			status: 'pending' as lmsTable.LmsEnrollment['status'],
			enrolledAt: now,
			createdAt: now,
			updatedAt: now
		};

		const [created] = await db.insert(lmsTable.lmsEnrollment).values(enrollment).returning();
		return created;
	}

	/**
	 * Approve a pending enrollment (admin/instructor).
	 */
	static async approveEnrollment(enrollmentId: string): Promise<lmsTable.LmsEnrollment> {
		const enrollment = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.then((rows) => rows[0]);

		if (!enrollment) {
			throw new Error('Enrollment not found');
		}
		if (enrollment.status !== ('pending' as string)) {
			throw new Error('Enrollment is not pending approval');
		}

		const [updated] = await db
			.update(lmsTable.lmsEnrollment)
			.set({ status: 'active', updatedAt: new Date() })
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.returning();

		return updated;
	}

	/**
	 * Reject a pending enrollment.
	 */
	static async rejectEnrollment(enrollmentId: string): Promise<void> {
		const enrollment = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.then((rows) => rows[0]);

		if (!enrollment) {
			throw new Error('Enrollment not found');
		}
		if (enrollment.status !== ('pending' as string)) {
			throw new Error('Enrollment is not pending approval');
		}

		await db
			.delete(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId));
	}

	/**
	 * Bulk enroll multiple users in a course.
	 */
	static async bulkEnroll(
		userIds: string[],
		courseId: string
	): Promise<{ enrolled: number; skipped: number }> {
		const course = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.then((rows) => rows[0]);

		if (!course) {
			throw new Error('Course not found');
		}

		// Get existing enrollments for these users
		const existingEnrollments = await db
			.select({ userId: lmsTable.lmsEnrollment.userId })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.courseId, courseId));

		const enrolledUserIds = new Set(existingEnrollments.map((e) => e.userId));

		const now = new Date();
		const newEnrollments: lmsTable.NewLmsEnrollment[] = [];

		for (const userId of userIds) {
			if (!enrolledUserIds.has(userId)) {
				newEnrollments.push({
					id: randomUUID(),
					userId,
					courseId,
					status: 'active',
					enrolledAt: now,
					lastAccessedAt: now,
					createdAt: now,
					updatedAt: now
				});
			}
		}

		if (newEnrollments.length > 0) {
			await db.insert(lmsTable.lmsEnrollment).values(newEnrollments);
		}

		return {
			enrolled: newEnrollments.length,
			skipped: userIds.length - newEnrollments.length
		};
	}

	/**
	 * Check enrollment capacity for a course.
	 */
	static async checkCapacity(
		courseId: string
	): Promise<{ current: number; max: number | null; available: boolean }> {
		const course = await db
			.select({ maxEnrollment: lmsTable.lmsCourse.maxEnrollment })
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.then((rows) => rows[0]);

		if (!course) {
			throw new Error('Course not found');
		}

		const [result] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.courseId, courseId),
					eq(lmsTable.lmsEnrollment.status, 'active')
				)
			);

		const current = result.count;
		const max = course.maxEnrollment;

		return {
			current,
			max,
			available: max === null || current < max
		};
	}

	/**
	 * Suspend an enrollment.
	 */
	static async suspendEnrollment(enrollmentId: string): Promise<lmsTable.LmsEnrollment> {
		const enrollment = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.then((rows) => rows[0]);

		if (!enrollment) {
			throw new Error('Enrollment not found');
		}

		const [updated] = await db
			.update(lmsTable.lmsEnrollment)
			.set({ status: 'suspended', updatedAt: new Date() })
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.returning();

		return updated;
	}

	/**
	 * Get enrollments for a user (My Learning).
	 */
	static async getUserEnrollments(
		userId: string,
		filter?: { status?: string }
	): Promise<EnrollmentWithCourse[]> {
		const conditions = [eq(lmsTable.lmsEnrollment.userId, userId)];

		if (filter?.status) {
			conditions.push(
				eq(lmsTable.lmsEnrollment.status, filter.status as lmsTable.LmsEnrollment['status'])
			);
		}

		const rows = await db
			.select({
				id: lmsTable.lmsEnrollment.id,
				userId: lmsTable.lmsEnrollment.userId,
				courseId: lmsTable.lmsEnrollment.courseId,
				status: lmsTable.lmsEnrollment.status,
				enrolledAt: lmsTable.lmsEnrollment.enrolledAt,
				completedAt: lmsTable.lmsEnrollment.completedAt,
				lastAccessedAt: lmsTable.lmsEnrollment.lastAccessedAt,
				courseTitle: lmsTable.lmsCourse.title,
				courseSlug: lmsTable.lmsCourse.slug,
				courseThumbnailFileId: lmsTable.lmsCourse.thumbnailFileId,
				courseCourseType: lmsTable.lmsCourse.courseType,
				instructorFirstName: table.user.firstName,
				instructorLastName: table.user.lastName
			})
			.from(lmsTable.lmsEnrollment)
			.innerJoin(lmsTable.lmsCourse, eq(lmsTable.lmsEnrollment.courseId, lmsTable.lmsCourse.id))
			.leftJoin(table.user, eq(lmsTable.lmsCourse.instructorId, table.user.id))
			.where(and(...conditions))
			.orderBy(desc(lmsTable.lmsEnrollment.lastAccessedAt));

		// Calculate progress for each enrollment
		const results: EnrollmentWithCourse[] = [];

		for (const row of rows) {
			// Get total content blocks for the course
			const [totalBlocks] = await db
				.select({ count: count() })
				.from(lmsTable.lmsContentBlock)
				.innerJoin(lmsTable.lmsLesson, eq(lmsTable.lmsContentBlock.lessonId, lmsTable.lmsLesson.id))
				.innerJoin(lmsTable.lmsModule, eq(lmsTable.lmsLesson.moduleId, lmsTable.lmsModule.id))
				.where(eq(lmsTable.lmsModule.courseId, row.courseId));

			// Get completed content blocks for this enrollment
			const [completedBlocks] = await db
				.select({ count: count() })
				.from(lmsTable.lmsProgress)
				.where(
					and(
						eq(lmsTable.lmsProgress.enrollmentId, row.id),
						eq(lmsTable.lmsProgress.status, 'completed')
					)
				);

			const progressPercent =
				totalBlocks.count > 0
					? Math.round((completedBlocks.count / totalBlocks.count) * 100)
					: 0;

			const instructorName =
				row.instructorFirstName || row.instructorLastName
					? [row.instructorFirstName, row.instructorLastName].filter(Boolean).join(' ')
					: null;

			results.push({
				id: row.id,
				userId: row.userId,
				courseId: row.courseId,
				status: row.status,
				enrolledAt: row.enrolledAt,
				completedAt: row.completedAt,
				lastAccessedAt: row.lastAccessedAt,
				course: {
					title: row.courseTitle,
					slug: row.courseSlug,
					thumbnailFileId: row.courseThumbnailFileId,
					courseType: row.courseCourseType,
					instructorName
				},
				progressPercent
			});
		}

		return results;
	}

	/**
	 * Get enrollments for a course (admin view).
	 */
	static async getCourseEnrollments(
		courseId: string,
		filter?: { status?: string; limit?: number; offset?: number }
	): Promise<{ enrollments: EnrollmentWithUser[]; total: number }> {
		const conditions = [eq(lmsTable.lmsEnrollment.courseId, courseId)];

		if (filter?.status) {
			conditions.push(
				eq(lmsTable.lmsEnrollment.status, filter.status as lmsTable.LmsEnrollment['status'])
			);
		}

		// Get total count
		const [totalResult] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(and(...conditions));

		// Get paginated enrollments with user data
		let query = db
			.select({
				id: lmsTable.lmsEnrollment.id,
				userId: lmsTable.lmsEnrollment.userId,
				courseId: lmsTable.lmsEnrollment.courseId,
				status: lmsTable.lmsEnrollment.status,
				enrolledAt: lmsTable.lmsEnrollment.enrolledAt,
				completedAt: lmsTable.lmsEnrollment.completedAt,
				lastAccessedAt: lmsTable.lmsEnrollment.lastAccessedAt,
				userUsername: table.user.username,
				userEmail: table.user.email,
				userFirstName: table.user.firstName,
				userLastName: table.user.lastName
			})
			.from(lmsTable.lmsEnrollment)
			.innerJoin(table.user, eq(lmsTable.lmsEnrollment.userId, table.user.id))
			.where(and(...conditions))
			.orderBy(desc(lmsTable.lmsEnrollment.enrolledAt))
			.$dynamic();

		if (filter?.limit) {
			query = query.limit(filter.limit);
		}
		if (filter?.offset) {
			query = query.offset(filter.offset);
		}

		const rows = await query;

		const enrollments: EnrollmentWithUser[] = rows.map((row) => ({
			id: row.id,
			userId: row.userId,
			courseId: row.courseId,
			status: row.status,
			enrolledAt: row.enrolledAt,
			completedAt: row.completedAt,
			lastAccessedAt: row.lastAccessedAt,
			user: {
				id: row.userId,
				username: row.userUsername,
				email: row.userEmail,
				firstName: row.userFirstName,
				lastName: row.userLastName
			}
		}));

		return {
			enrollments,
			total: totalResult.count
		};
	}

	/**
	 * Check if user is enrolled in a course (active enrollment).
	 */
	static async isEnrolled(userId: string, courseId: string): Promise<boolean> {
		const enrollment = await db
			.select({ id: lmsTable.lmsEnrollment.id })
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.courseId, courseId),
					eq(lmsTable.lmsEnrollment.status, 'active')
				)
			)
			.then((rows) => rows[0]);

		return !!enrollment;
	}

	/**
	 * Get a specific enrollment.
	 */
	static async getEnrollment(
		userId: string,
		courseId: string
	): Promise<lmsTable.LmsEnrollment | null> {
		const enrollment = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.courseId, courseId)
				)
			)
			.then((rows) => rows[0] ?? null);

		return enrollment;
	}

	/**
	 * Update last accessed timestamp.
	 */
	static async updateLastAccessed(enrollmentId: string): Promise<void> {
		await db
			.update(lmsTable.lmsEnrollment)
			.set({ lastAccessedAt: new Date(), updatedAt: new Date() })
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId));
	}

	/**
	 * Mark enrollment as completed.
	 */
	static async markCompleted(enrollmentId: string): Promise<lmsTable.LmsEnrollment> {
		const enrollment = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.then((rows) => rows[0]);

		if (!enrollment) {
			throw new Error('Enrollment not found');
		}

		const now = new Date();
		const [updated] = await db
			.update(lmsTable.lmsEnrollment)
			.set({ status: 'completed', completedAt: now, updatedAt: now })
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.returning();

		return updated;
	}

	/**
	 * Initiate paid enrollment (returns data for Stripe checkout).
	 * Does NOT create the enrollment -- that happens on webhook confirmation.
	 */
	static async initiatePaidEnrollment(
		userId: string,
		courseId: string
	): Promise<PaidEnrollmentData> {
		const course = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.then((rows) => rows[0]);

		if (!course) {
			throw new Error('Course not found');
		}
		if (course.status !== 'published') {
			throw new Error('Course is not published');
		}
		if (course.pricingType !== 'one_time') {
			throw new Error('Course is not a paid course');
		}

		// Check not already enrolled
		const existing = await db
			.select({ id: lmsTable.lmsEnrollment.id })
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.courseId, courseId)
				)
			)
			.then((rows) => rows[0]);

		if (existing) {
			throw new Error('User is already enrolled in this course');
		}

		if (!course.price) {
			throw new Error('Course price is not set');
		}

		return {
			courseId: course.id,
			courseTitle: course.title,
			price: course.price,
			userId
		};
	}
}

export default EnrollmentService;
