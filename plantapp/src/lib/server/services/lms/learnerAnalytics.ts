import { and, count, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

/** Learner aggregates based on enrollment-owned, submitted quiz attempts. */
export class LearnerAnalyticsService {
	static async getLearnerStats(userId: string) {
		const [enrolledResult] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.userId, userId));

		const [completedResult] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.status, 'completed')
				)
			);

		const quizAttempts = await db
			.select({
				score: lmsTable.lmsQuizAttempt.score,
				totalPoints: lmsTable.lmsQuizAttempt.totalPoints
			})
			.from(lmsTable.lmsQuizAttempt)
			.innerJoin(
				lmsTable.lmsEnrollment,
				eq(lmsTable.lmsQuizAttempt.enrollmentId, lmsTable.lmsEnrollment.id)
			)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					isNotNull(lmsTable.lmsQuizAttempt.submittedAt),
					isNotNull(lmsTable.lmsQuizAttempt.passed)
				)
			);

		const scoredAttempts = quizAttempts.filter((attempt) => (attempt.totalPoints ?? 0) > 0);
		const averageQuizScore =
			scoredAttempts.length > 0
				? Math.round(
						scoredAttempts.reduce(
							(sum, attempt) => sum + ((attempt.score ?? 0) / (attempt.totalPoints ?? 1)) * 100,
							0
						) / scoredAttempts.length
					)
				: 0;

		return {
			coursesEnrolled: enrolledResult?.count || 0,
			coursesCompleted: completedResult?.count || 0,
			totalLearningMinutes: 0,
			averageQuizScore,
			currentStreak: await this.getLearningStreak(userId)
		};
	}

	static async getLearningStreak(userId: string): Promise<number> {
		const enrollments = await db
			.select({ id: lmsTable.lmsEnrollment.id })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.userId, userId));

		if (enrollments.length === 0) return 0;

		const activityDates = await db
			.select({ activityDate: sql<string>`DATE(${lmsTable.lmsProgress.updatedAt})` })
			.from(lmsTable.lmsProgress)
			.where(
				inArray(
					lmsTable.lmsProgress.enrollmentId,
					enrollments.map(({ id }) => id)
				)
			)
			.groupBy(sql`DATE(${lmsTable.lmsProgress.updatedAt})`)
			.orderBy(desc(sql`DATE(${lmsTable.lmsProgress.updatedAt})`));

		if (activityDates.length === 0) return 0;

		let streak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let index = 0; index < activityDates.length; index += 1) {
			const activityDate = new Date(activityDates[index].activityDate);
			activityDate.setHours(0, 0, 0, 0);

			const expectedDate = new Date(today);
			expectedDate.setDate(expectedDate.getDate() - index);
			if (activityDate.getTime() !== expectedDate.getTime()) break;
			streak += 1;
		}

		return streak;
	}

	static async getRecentActivity(userId: string, limit = 10) {
		const enrollments = await db
			.select({ id: lmsTable.lmsEnrollment.id })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.userId, userId));

		if (enrollments.length === 0) return [];

		return db
			.select({
				id: lmsTable.lmsProgress.id,
				lessonId: lmsTable.lmsProgress.lessonId,
				status: lmsTable.lmsProgress.status,
				progressPercent: lmsTable.lmsProgress.progressPercent,
				updatedAt: lmsTable.lmsProgress.updatedAt,
				enrollmentId: lmsTable.lmsProgress.enrollmentId
			})
			.from(lmsTable.lmsProgress)
			.where(
				inArray(
					lmsTable.lmsProgress.enrollmentId,
					enrollments.map(({ id }) => id)
				)
			)
			.orderBy(desc(lmsTable.lmsProgress.updatedAt))
			.limit(limit);
	}

	static async getQuizPerformanceHistory(userId: string) {
		return db
			.select({
				quizId: lmsTable.lmsQuizAttempt.quizId,
				score: lmsTable.lmsQuizAttempt.score,
				totalPoints: lmsTable.lmsQuizAttempt.totalPoints,
				passed: lmsTable.lmsQuizAttempt.passed,
				startedAt: lmsTable.lmsQuizAttempt.startedAt,
				submittedAt: lmsTable.lmsQuizAttempt.submittedAt,
				timeSpent: lmsTable.lmsQuizAttempt.timeSpent,
				quizTitle: lmsTable.lmsQuiz.title
			})
			.from(lmsTable.lmsQuizAttempt)
			.innerJoin(
				lmsTable.lmsEnrollment,
				eq(lmsTable.lmsQuizAttempt.enrollmentId, lmsTable.lmsEnrollment.id)
			)
			.innerJoin(lmsTable.lmsQuiz, eq(lmsTable.lmsQuizAttempt.quizId, lmsTable.lmsQuiz.id))
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					isNotNull(lmsTable.lmsQuizAttempt.submittedAt)
				)
			)
			.orderBy(desc(lmsTable.lmsQuizAttempt.submittedAt));
	}

	static async getCourseProgress(userId: string, courseId: string) {
		const [enrollment] = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.courseId, courseId)
				)
			)
			.limit(1);

		if (!enrollment) return null;

		const { ProgressService } = await import('./progress');
		return ProgressService.getProgressForCourse(enrollment.id);
	}
}

export default LearnerAnalyticsService;
