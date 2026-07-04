import { eq, and, desc, count, avg, sql, gte } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

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
			.select({ score: lmsTable.lmsQuizAttempt.score, maxScore: lmsTable.lmsQuizAttempt.maxScore })
			.from(lmsTable.lmsQuizAttempt)
			.where(
				and(
					eq(lmsTable.lmsQuizAttempt.userId, userId),
					eq(lmsTable.lmsQuizAttempt.status, 'completed')
				)
			);

		let averageQuizScore = 0;
		if (quizAttempts.length > 0) {
			const totalPercent = quizAttempts.reduce((sum, a) => {
				const maxScore = a.maxScore || 1;
				return sum + ((a.score || 0) / maxScore) * 100;
			}, 0);
			averageQuizScore = Math.round(totalPercent / quizAttempts.length);
		}

		const streak = await this.getLearningStreak(userId);

		return {
			coursesEnrolled: enrolledResult?.count || 0,
			coursesCompleted: completedResult?.count || 0,
			totalLearningMinutes: 0, // Would need session tracking to calculate
			averageQuizScore,
			currentStreak: streak
		};
	}

	static async getLearningStreak(userId: string): Promise<number> {
		// Get distinct dates with progress activity, ordered desc
		const enrollments = await db
			.select({ id: lmsTable.lmsEnrollment.id })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.userId, userId));

		if (enrollments.length === 0) return 0;

		const enrollmentIds = enrollments.map((e) => e.id);

		const activityDates = await db
			.select({
				activityDate: sql<string>`DATE(${lmsTable.lmsProgress.updatedAt})`
			})
			.from(lmsTable.lmsProgress)
			.where(sql`${lmsTable.lmsProgress.enrollmentId} IN (${sql.join(enrollmentIds.map(id => sql`${id}`), sql`, `)})`)
			.groupBy(sql`DATE(${lmsTable.lmsProgress.updatedAt})`)
			.orderBy(desc(sql`DATE(${lmsTable.lmsProgress.updatedAt})`));

		if (activityDates.length === 0) return 0;

		let streak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < activityDates.length; i++) {
			const activityDate = new Date(activityDates[i].activityDate);
			activityDate.setHours(0, 0, 0, 0);

			const expectedDate = new Date(today);
			expectedDate.setDate(expectedDate.getDate() - i);

			if (activityDate.getTime() === expectedDate.getTime()) {
				streak++;
			} else {
				break;
			}
		}

		return streak;
	}

	static async getRecentActivity(userId: string, limit = 10) {
		const enrollments = await db
			.select({ id: lmsTable.lmsEnrollment.id, courseId: lmsTable.lmsEnrollment.courseId })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.userId, userId));

		if (enrollments.length === 0) return [];

		const enrollmentIds = enrollments.map((e) => e.id);

		const progress = await db
			.select({
				id: lmsTable.lmsProgress.id,
				lessonId: lmsTable.lmsProgress.lessonId,
				status: lmsTable.lmsProgress.status,
				progressPercent: lmsTable.lmsProgress.progressPercent,
				updatedAt: lmsTable.lmsProgress.updatedAt,
				enrollmentId: lmsTable.lmsProgress.enrollmentId
			})
			.from(lmsTable.lmsProgress)
			.where(sql`${lmsTable.lmsProgress.enrollmentId} IN (${sql.join(enrollmentIds.map(id => sql`${id}`), sql`, `)})`)
			.orderBy(desc(lmsTable.lmsProgress.updatedAt))
			.limit(limit);

		return progress;
	}

	static async getQuizPerformanceHistory(userId: string) {
		const attempts = await db
			.select({
				quizId: lmsTable.lmsQuizAttempt.quizId,
				score: lmsTable.lmsQuizAttempt.score,
				maxScore: lmsTable.lmsQuizAttempt.maxScore,
				passed: lmsTable.lmsQuizAttempt.passed,
				startedAt: lmsTable.lmsQuizAttempt.startedAt,
				quizTitle: lmsTable.lmsQuiz.title
			})
			.from(lmsTable.lmsQuizAttempt)
			.innerJoin(lmsTable.lmsQuiz, eq(lmsTable.lmsQuizAttempt.quizId, lmsTable.lmsQuiz.id))
			.where(eq(lmsTable.lmsQuizAttempt.userId, userId))
			.orderBy(desc(lmsTable.lmsQuizAttempt.startedAt));

		return attempts;
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
