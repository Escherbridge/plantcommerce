import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { ProgressService } from '../../services/lms/progress';
import { LmsAccessService } from '../../services/lms/access';

export const progressRouter = router({
	trackProgress: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				contentBlockId: z.string(),
				status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
				progressPercent: z.number().min(0).max(100).optional(),
				metadata: z.record(z.string(), z.unknown()).optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { enrollment } = await LmsAccessService.requireActiveEnrollment(
				ctx.user,
				input.courseId
			);
			await LmsAccessService.requireContentBlockForCourse(
				input.courseId,
				input.contentBlockId,
				true
			);

			return ProgressService.updateContentBlockProgress(enrollment.id, input.contentBlockId, {
				status: input.status,
				progressPercent: input.progressPercent,
				metadata: input.metadata
			});
		}),

	getCourseProgress: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ ctx, input }) => {
			const { enrollment } = await LmsAccessService.requireActiveEnrollment(
				ctx.user,
				input.courseId
			);
			return ProgressService.getProgressForCourse(enrollment.id);
		}),

	getResumePoint: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ ctx, input }) => {
			const { enrollment } = await LmsAccessService.requireActiveEnrollment(
				ctx.user,
				input.courseId
			);
			return ProgressService.getResumePoint(enrollment.id);
		}),

	resetProgress: protectedProcedure
		.input(z.object({ courseId: z.string(), confirm: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			if (!input.confirm) throw new Error('Confirmation required');
			const { enrollment } = await LmsAccessService.requireActiveEnrollment(
				ctx.user,
				input.courseId
			);
			await ProgressService.resetProgress(enrollment.id);
			return { success: true };
		})
});
