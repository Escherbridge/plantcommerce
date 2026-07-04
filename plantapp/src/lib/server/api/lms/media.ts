import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { LmsMediaService } from '../../services/lms/media';

export const mediaRouter = router({
	requestUploadUrl: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				filename: z.string(),
				mimeType: z.string(),
				mediaType: z.enum(['video', 'audio', 'document', 'image'])
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.user.role !== 'admin' && ctx.user.role !== 'instructor') {
				throw new Error('Only admins and instructors can upload media');
			}
			return LmsMediaService.generateUploadUrl(
				input.courseId,
				input.filename,
				input.mimeType,
				input.mediaType,
				ctx.user.id
			);
		}),

	confirmUpload: protectedProcedure
		.input(z.object({ fileId: z.string(), fileSize: z.number().positive() }))
		.mutation(async ({ input }) => {
			await LmsMediaService.confirmUpload(input.fileId, input.fileSize);
			return { success: true };
		}),

	getStreamingUrl: protectedProcedure
		.input(z.object({ fileId: z.string(), expiresIn: z.number().optional() }))
		.query(async ({ input }) => {
			const url = await LmsMediaService.generateStreamingUrl(input.fileId, input.expiresIn);
			return { url };
		}),

	getMediaLibrary: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				type: z.string().optional(),
				page: z.number().optional(),
				limit: z.number().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			if (ctx.user.role !== 'admin' && ctx.user.role !== 'instructor') {
				throw new Error('Only admins and instructors can view media library');
			}
			return LmsMediaService.getMediaLibrary(input.courseId, input.type, input.page, input.limit);
		}),

	deleteMedia: protectedProcedure
		.input(z.object({ fileId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (ctx.user.role !== 'admin' && ctx.user.role !== 'instructor') {
				throw new Error('Only admins and instructors can delete media');
			}
			await LmsMediaService.deleteMedia(input.fileId, ctx.user.id);
			return { success: true };
		})
});
