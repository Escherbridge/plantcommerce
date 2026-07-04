import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { ProgressService } from '../../services/lms/progress';
import { LearnerAnalyticsService } from '../../services/lms/learnerAnalytics';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

async function getEnrollmentForUser(userId: string, courseId: string) {
	const [enrollment] = await db
		.select()
		.from(lmsTable.lmsEnrollment)
		.where(
			and(eq(lmsTable.lmsEnrollment.userId, userId), eq(lmsTable.lmsEnrollment.courseId, courseId))
		)
		.limit(1);
	return enrollment;
}

export const progressRouter = router({
	trackProgress: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				contentBlockId: z.string(),
				status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
				progressPercent: z.number().min(0).max(100).optional(),
				metadata: z.record(z.any()).optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const enrollment = await getEnrollmentForUser(ctx.user.id, input.courseId);
			if (!enrollment) throw new Error('Not enrolled in this course');

			return ProgressService.updateContentBlockProgress(enrollment.id, input.contentBlockId, {
				status: input.status,
				progressPercent: input.progressPercent,
				metadata: input.metadata
			});
		}),

	getCourseProgress: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ ctx, input }) => {
			const enrollment = await getEnrollmentForUser(ctx.user.id, input.courseId);
			if (!enrollment) return null;
			return ProgressService.getProgressForCourse(enrollment.id);
		}),

	getResumePoint: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ ctx, input }) => {
			const enrollment = await getEnrollmentForUser(ctx.user.id, input.courseId);
			if (!enrollment) return null;
			return ProgressService.getResumePoint(enrollment.id);
		}),

	resetProgress: protectedProcedure
		.input(z.object({ courseId: z.string(), confirm: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			if (!input.confirm) throw new Error('Confirmation required');
			const enrollment = await getEnrollmentForUser(ctx.user.id, input.courseId);
			if (!enrollment) throw new Error('Not enrolled');
			await ProgressService.resetProgress(enrollment.id);
			return { success: true };
		})
});
