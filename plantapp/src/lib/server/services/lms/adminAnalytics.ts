import { eq, and, desc, count, avg, sql, gte, lte } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export class AdminAnalyticsService {
	static async getLMSDashboardStats() {
		const [coursesResult] = await db
			.select({ count: count() })
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.status, 'published'));

		const [enrollmentsResult] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.status, 'active'));

		const [completedResult] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.status, 'completed'));

		const totalEnrollments = (enrollmentsResult?.count || 0) + (completedResult?.count || 0);
		const completionRate =
			totalEnrollments > 0
				? Math.round(((completedResult?.count || 0) / totalEnrollments) * 100)
				: 0;

		// Revenue from paid courses
		const revenueResult = await db
			.select({
				total: sql<string>`COALESCE(SUM(CAST(${lmsTable.lmsCourse.price} AS DECIMAL)), 0)`
			})
			.from(lmsTable.lmsEnrollment)
			.innerJoin(lmsTable.lmsCourse, eq(lmsTable.lmsEnrollment.courseId, lmsTable.lmsCourse.id))
			.where(eq(lmsTable.lmsCourse.pricingType, 'one_time'));

		// Average rating
		const [ratingResult] = await db
			.select({ avg: avg(lmsTable.lmsCourseReview.rating) })
			.from(lmsTable.lmsCourseReview)
			.where(eq(lmsTable.lmsCourseReview.status, 'approved'));

		return {
			totalCourses: coursesResult?.count || 0,
			totalEnrollments,
			completionRate,
			totalRevenue: parseFloat(revenueResult[0]?.total || '0'),
			averageRating: ratingResult?.avg ? parseFloat(String(ratingResult.avg)) : 0
		};
	}

	static async getCourseAnalytics(courseId: string) {
		const [enrollmentCount] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.courseId, courseId));

		const [completedCount] = await db
			.select({ count: count() })
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.courseId, courseId),
					eq(lmsTable.lmsEnrollment.status, 'completed')
				)
			);

		const total = enrollmentCount?.count || 0;
		const completed = completedCount?.count || 0;
		const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

		// Drop-off analysis: for each module, count learners who have progress
		const modules = await db
			.select({
				id: lmsTable.lmsModule.id,
				title: lmsTable.lmsModule.title,
				sortOrder: lmsTable.lmsModule.sortOrder
			})
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.courseId, courseId))
			.orderBy(lmsTable.lmsModule.sortOrder);

		const dropOff = [];
		for (const mod of modules) {
			const [activeInModule] = await db
				.select({ count: count() })
				.from(lmsTable.lmsProgress)
				.where(eq(lmsTable.lmsProgress.moduleId, mod.id));
			dropOff.push({
				moduleId: mod.id,
				title: mod.title,
				sortOrder: mod.sortOrder,
				learnersReached: activeInModule?.count || 0
			});
		}

		return {
			enrollments: total,
			completions: completed,
			completionRate,
			dropOff
		};
	}

	static async getEnrollmentTrends(
		startDate: Date,
		endDate: Date,
		granularity: 'day' | 'week' | 'month' = 'day'
	) {
		const dateFormat =
			granularity === 'month'
				? `TO_CHAR(${lmsTable.lmsEnrollment.enrolledAt}, 'YYYY-MM')`
				: granularity === 'week'
					? `TO_CHAR(${lmsTable.lmsEnrollment.enrolledAt}, 'IYYY-IW')`
					: `TO_CHAR(${lmsTable.lmsEnrollment.enrolledAt}, 'YYYY-MM-DD')`;

		const trends = await db
			.select({
				period: sql<string>`${sql.raw(dateFormat)}`,
				enrollments: count()
			})
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					gte(lmsTable.lmsEnrollment.enrolledAt, startDate),
					lte(lmsTable.lmsEnrollment.enrolledAt, endDate)
				)
			)
			.groupBy(sql`${sql.raw(dateFormat)}`)
			.orderBy(sql`${sql.raw(dateFormat)}`);

		return trends;
	}

	static async getQuizAnalytics(quizId: string) {
		const attempts = await db
			.select()
			.from(lmsTable.lmsQuizAttempt)
			.where(eq(lmsTable.lmsQuizAttempt.quizId, quizId));

		const submitted = attempts.filter((attempt) => attempt.submittedAt !== null);
		const finalized = submitted.filter((attempt) => attempt.passed !== null);
		const passed = finalized.filter((attempt) => attempt.passed === true);
		const scored = finalized.filter((attempt) => (attempt.totalPoints ?? 0) > 0);

		const passRate =
			finalized.length > 0 ? Math.round((passed.length / finalized.length) * 100) : 0;
		const averageScore =
			scored.length > 0
				? Math.round(
						scored.reduce(
							(sum, attempt) => sum + ((attempt.score ?? 0) / (attempt.totalPoints ?? 1)) * 100,
							0
						) / scored.length
					)
				: 0;

		return {
			totalAttempts: attempts.length,
			completedAttempts: submitted.length,
			pendingGradingAttempts: submitted.length - finalized.length,
			passRate,
			averageScore
		};
	}

	static async getRevenueReport(startDate: Date, endDate: Date) {
		const enrollments = await db
			.select({
				courseId: lmsTable.lmsEnrollment.courseId,
				courseTitle: lmsTable.lmsCourse.title,
				price: lmsTable.lmsCourse.price,
				enrolledAt: lmsTable.lmsEnrollment.enrolledAt
			})
			.from(lmsTable.lmsEnrollment)
			.innerJoin(lmsTable.lmsCourse, eq(lmsTable.lmsEnrollment.courseId, lmsTable.lmsCourse.id))
			.where(
				and(
					eq(lmsTable.lmsCourse.pricingType, 'one_time'),
					gte(lmsTable.lmsEnrollment.enrolledAt, startDate),
					lte(lmsTable.lmsEnrollment.enrolledAt, endDate)
				)
			)
			.orderBy(desc(lmsTable.lmsEnrollment.enrolledAt));

		const byCourse: Record<string, { title: string; enrollments: number; revenue: number }> = {};
		let totalRevenue = 0;

		for (const e of enrollments) {
			const price = parseFloat(e.price || '0');
			totalRevenue += price;
			if (!byCourse[e.courseId]) {
				byCourse[e.courseId] = { title: e.courseTitle, enrollments: 0, revenue: 0 };
			}
			byCourse[e.courseId].enrollments++;
			byCourse[e.courseId].revenue += price;
		}

		return {
			totalRevenue,
			totalEnrollments: enrollments.length,
			byCourse: Object.entries(byCourse).map(([courseId, data]) => ({
				courseId,
				...data
			}))
		};
	}

	static async getDropOffAnalysis(courseId: string) {
		return (await this.getCourseAnalytics(courseId)).dropOff;
	}
}

export default AdminAnalyticsService;
