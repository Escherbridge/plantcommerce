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

type CartIdentity = { userId?: string; sessionId?: string };

/**
 * Read-only identity resolution: never mutates cookies. A guest without an
 * established guest-cart session resolves to no identity, so reads (getCart)
 * return an empty cart instead of provisioning a session on every page poll.
 */
function readCartIdentity(ctx: Pick<Context, 'user' | 'event'>): CartIdentity {
	if (ctx.user) {
		return { userId: ctx.user.id };
	}

	const sessionId = readGuestCartSessionId(ctx.event.cookies);
	return sessionId ? { sessionId } : {};
}

/**
 * Write identity resolution: establishes a guest-cart session cookie for
 * anonymous visitors so a cart can be persisted (used when adding items).
 */
function writeCartIdentity(ctx: Pick<Context, 'user' | 'event'>): CartIdentity {
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
			const identity = readCartIdentity(ctx);
			// No user and no guest session yet → empty cart, never an error.
			if (!identity.userId && !identity.sessionId) {
				return null;
			}
			return await CartService.getCart(identity.userId, identity.sessionId);
		} catch (error) {
			console.error('Failed to retrieve cart:', error);
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
				const identity = writeCartIdentity(ctx);
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
				const identity = readCartIdentity(ctx);
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
				const identity = readCartIdentity(ctx);
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
			const identity = readCartIdentity(ctx);
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
