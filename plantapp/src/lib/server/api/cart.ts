import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router, type Context } from './trpc';
import { CartService } from '../services/cart';
import {
	deleteGuestCartSessionCookie,
	getOrCreateGuestCartSessionId,
	readGuestCartSessionId
} from '../guestCart';
import {
	AffiliateAttributionService,
	clearAffiliateAttributionCookie,
	clearLegacyAffiliateCookie
} from '../affiliateAttribution';
import {
	assertPublicCatalogAvailable,
	getPublicCatalogAvailability
} from '../catalogTruth/publicCatalog';

function getCartIdentity(ctx: Pick<Context, 'user' | 'event'>): {
	userId?: string;
	sessionId?: string;
} {
	if (ctx.user) {
		return { userId: ctx.user.id };
	}

	return { sessionId: getOrCreateGuestCartSessionId(ctx.event.cookies) };
}

export const cartRouter = router({
	getCart: publicProcedure.query(async ({ ctx }) => {
		try {
			if (getPublicCatalogAvailability().status !== 'available') {
				return null;
			}
			const identity = getCartIdentity(ctx);
			return await CartService.getCart(identity.userId, identity.sessionId);
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
				productId: z.number(),
				quantity: z.number().min(1)
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				assertPublicCatalogAvailable();
				const identity = getCartIdentity(ctx);
				clearLegacyAffiliateCookie(ctx.event.cookies);
				let attribution = null;
				try {
					attribution = await AffiliateAttributionService.resolveForCart(
						ctx.event.cookies,
						ctx.user?.id
					);
				} catch (error) {
					// Cart availability takes precedence over optional attribution telemetry.
					console.error('Unable to resolve affiliate attribution for cart:', error);
				}

				await CartService.addItem(
					input.productId,
					input.quantity,
					identity.userId,
					identity.sessionId,
					attribution ?? undefined
				);
				if (attribution) {
					clearAffiliateAttributionCookie(ctx.event.cookies);
				}

				return { success: true };
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
				cartItemId: z.number(),
				quantity: z.number().min(0)
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				assertPublicCatalogAvailable();
				const identity = getCartIdentity(ctx);
				await CartService.updateItemQuantity(
					input.cartItemId,
					input.quantity,
					identity.userId,
					identity.sessionId
				);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update cart'
				});
			}
		}),

	removeItem: publicProcedure
		.input(z.object({ cartItemId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				assertPublicCatalogAvailable();
				const identity = getCartIdentity(ctx);
				await CartService.removeItem(input.cartItemId, identity.userId, identity.sessionId);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to remove item'
				});
			}
		}),

	clearCart: publicProcedure.mutation(async ({ ctx }) => {
		try {
			assertPublicCatalogAvailable();
			const identity = getCartIdentity(ctx);
			await CartService.clearCart(identity.userId, identity.sessionId);
			return { success: true };
		} catch {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to clear cart'
			});
		}
	}),

	transferGuestCart: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			const sessionId = readGuestCartSessionId(ctx.event.cookies);
			if (!sessionId) {
				return { success: true };
			}

			await CartService.transferGuestCart(sessionId, ctx.user.id);
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
