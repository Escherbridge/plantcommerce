import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from './trpc';
import { CartService } from '../services/cart';

export const cartRouter = router({
	/**
	 * Get cart contents (public for guest carts)
	 */
	getCart: publicProcedure
		.input(
			z.object({
				sessionId: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				const userId = ctx.user?.id;
				const sessionId = input.sessionId;
				
				if (!userId && !sessionId) {
					return null; // Empty cart
				}

				const cart = await CartService.getCart(userId, sessionId);
				return cart;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve cart'
				});
			}
		}),

	/**
	 * Add item to cart (public for guest carts)
	 */
	addItem: publicProcedure
		.input(
			z.object({
				productId: z.number(),
				quantity: z.number().min(1),
				sessionId: z.string().optional(),
				affiliateLinkId: z.number().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx.user?.id;
				const { productId, quantity, sessionId, affiliateLinkId } = input;

				if (!userId && !sessionId) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Session ID required for guest checkout'
					});
				}

				await CartService.addItem(
					productId,
					quantity,
					userId,
					sessionId,
					affiliateLinkId
				);

				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to add item to cart'
				});
			}
		}),

	/**
	 * Update item quantity in cart (public for guest carts)
	 */
	updateItemQuantity: publicProcedure
		.input(
			z.object({
				cartItemId: z.number(),
				quantity: z.number().min(0), // 0 to remove
				sessionId: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx.user?.id;
				const { cartItemId, quantity, sessionId } = input;

				await CartService.updateItemQuantity(
					cartItemId,
					quantity,
					userId,
					sessionId
				);

				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update item quantity'
				});
			}
		}),

	/**
	 * Remove item from cart (public for guest carts)
	 */
	removeItem: publicProcedure
		.input(
			z.object({
				cartItemId: z.number(),
				sessionId: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx.user?.id;
				const { cartItemId, sessionId } = input;

				await CartService.removeItem(cartItemId, userId, sessionId);

				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to remove item from cart'
				});
			}
		}),

	/**
	 * Clear cart (public for guest carts)
	 */
	clearCart: publicProcedure
		.input(
			z.object({
				sessionId: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx.user?.id;
				const { sessionId } = input;

				await CartService.clearCart(userId, sessionId);

				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to clear cart'
				});
			}
		}),

	/**
	 * Transfer guest cart to user account (protected)
	 */
	transferGuestCart: protectedProcedure
		.input(
			z.object({
				sessionId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await CartService.transferGuestCart(input.sessionId, ctx.user.id);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to transfer cart'
				});
			}
		})
});

export type CartRouter = typeof cartRouter;
