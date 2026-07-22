import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from './trpc';
import { deleteGuestCartSessionCookie, readGuestCartSessionId } from '../guestCart';
import { getCommerceAdapter } from '../commerce/adapter';

function productIdentifier(value: string | number): string {
	return typeof value === 'number' ? `database-product:${value}` : value;
}

function cartItemIdentifier(value: string | number): string {
	return typeof value === 'number' ? `database-cart-item:${value}` : value;
}

export const cartRouter = router({
	getCart: publicProcedure.query(async ({ ctx }) => {
		try {
			return await (await getCommerceAdapter(ctx.event)).getCart(ctx.event);
		} catch {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve cart'
			});
		}
	}),

	addItem: publicProcedure
		.input(
			z.object({
				productId: z.union([z.string(), z.number()]),
				quantity: z.number().int().min(1).max(99)
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const adapter = await getCommerceAdapter(ctx.event);
				const cart = await adapter.addCartItem(
					ctx.event,
					productIdentifier(input.productId),
					input.quantity
				);
				return { success: true, cart };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to add item to cart'
				});
			}
		}),

	updateItemQuantity: publicProcedure
		.input(
			z.object({
				cartItemId: z.union([z.string(), z.number()]),
				quantity: z.number().int().min(0).max(99)
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const adapter = await getCommerceAdapter(ctx.event);
				const cart = await adapter.updateCartItem(
					ctx.event,
					cartItemIdentifier(input.cartItemId),
					input.quantity
				);
				return { success: true, cart };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update cart'
				});
			}
		}),

	removeItem: publicProcedure
		.input(z.object({ cartItemId: z.union([z.string(), z.number()]) }))
		.mutation(async ({ ctx, input }) => {
			try {
				const adapter = await getCommerceAdapter(ctx.event);
				const cart = await adapter.removeCartItem(ctx.event, cartItemIdentifier(input.cartItemId));
				return { success: true, cart };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to remove item'
				});
			}
		}),

	clearCart: publicProcedure.mutation(async ({ ctx }) => {
		try {
			const cart = await (await getCommerceAdapter(ctx.event)).clearCart(ctx.event);
			return { success: true, cart };
		} catch {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to clear cart'
			});
		}
	}),

	transferGuestCart: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			const adapter = await getCommerceAdapter(ctx.event);
			if (adapter.context.mode === 'demo') return { success: true };
			const sessionId = readGuestCartSessionId(ctx.event.cookies);
			if (!sessionId) {
				return { success: true };
			}

			await (
				await import('../services/cart')
			).CartService.transferGuestCart(sessionId, ctx.user.id);
			deleteGuestCartSessionCookie(ctx.event.cookies);
			return { success: true };
		} catch {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to transfer cart'
			});
		}
	})
});

export type CartRouter = typeof cartRouter;
