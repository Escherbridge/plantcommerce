import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { AdminAnalyticsService } from '../../services/lms/adminAnalytics';
import { LearnerAnalyticsService } from '../../services/lms/learnerAnalytics';

export const analyticsRouter = router({
	dashboard: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.user.role !== 'admin') throw new Error('Admin only');
		return AdminAnalyticsService.getLMSDashboardStats();
	}),

	courseAnalytics: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ ctx, input }) => {
			if (ctx.user.role !== 'admin' && ctx.user.role !== 'instructor')
				throw new Error('Unauthorized');
			return AdminAnalyticsService.getCourseAnalytics(input.courseId);
		}),

	enrollmentTrends: protectedProcedure
		.input(
			z.object({
				startDate: z.string().transform((s) => new Date(s)),
				endDate: z.string().transform((s) => new Date(s)),
				granularity: z.enum(['day', 'week', 'month']).optional()
			})
		)
		.query(async ({ ctx, input }) => {
			if (ctx.user.role !== 'admin') throw new Error('Admin only');
			return AdminAnalyticsService.getEnrollmentTrends(
				input.startDate,
				input.endDate,
				input.granularity
			);
		}),

	quizAnalytics: protectedProcedure
		.input(z.object({ quizId: z.string() }))
		.query(async ({ ctx, input }) => {
			if (ctx.user.role !== 'admin' && ctx.user.role !== 'instructor')
				throw new Error('Unauthorized');
			return AdminAnalyticsService.getQuizAnalytics(input.quizId);
		}),

	revenueReport: protectedProcedure
		.input(
			z.object({
				startDate: z.string().transform((s) => new Date(s)),
				endDate: z.string().transform((s) => new Date(s))
			})
		)
		.query(async ({ ctx, input }) => {
			if (ctx.user.role !== 'admin') throw new Error('Admin only');
			return AdminAnalyticsService.getRevenueReport(input.startDate, input.endDate);
		}),

	myStats: protectedProcedure.query(async ({ ctx }) => {
		return LearnerAnalyticsService.getLearnerStats(ctx.user.id);
	}),

	myActivity: protectedProcedure
		.input(z.object({ limit: z.number().optional() }))
		.query(async ({ ctx, input }) => {
			return LearnerAnalyticsService.getRecentActivity(ctx.user.id, input.limit);
		})
});
