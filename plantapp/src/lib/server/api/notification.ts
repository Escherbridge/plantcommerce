import { z } from 'zod';
import { router, protectedProcedure } from './trpc';
import { NotificationService } from '../services/notification';

export const notificationRouter = router({
	getUnread: protectedProcedure.query(async ({ ctx }) => {
		return NotificationService.getUnread(ctx.user.id);
	}),

	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		return NotificationService.getUnreadCount(ctx.user.id);
	}),

	getAll: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0)
			})
		)
		.query(async ({ ctx, input }) => {
			return NotificationService.getAll(ctx.user.id, input.limit, input.offset);
		}),

	markRead: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await NotificationService.markRead(input.id, ctx.user.id);
			return { success: true };
		}),

	markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
		await NotificationService.markAllRead(ctx.user.id);
		return { success: true };
	})
});
