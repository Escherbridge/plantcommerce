import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from './trpc';
import { and } from 'drizzle-orm';
import AffiliateService from '../services/affiliate';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import * as table from '../db/schema';

export const affiliateRouter = router({
	/**
	 * Create or get affiliate account for current user
	 */
	createAffiliate: protectedProcedure
		.input(
			z.object({
				customCode: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const affiliate = await AffiliateService.createAffiliate(ctx.user.id, input.customCode);
				
				// Update user role to affiliate if not already
				if (ctx.user.role !== 'affiliate' && ctx.user.role !== 'admin') {
					await db
						.update(table.user)
						.set({ role: 'affiliate' })
						.where(eq(table.user.id, ctx.user.id));
				}

				return affiliate;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create affiliate account'
				});
			}
		}),

	/**
	 * Get affiliate stats for current user
	 */
	getStats: protectedProcedure.query(async ({ ctx }) => {
		// Get user's affiliate record
		const affiliateResult = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.userId, ctx.user.id))
			.limit(1);

		if (affiliateResult.length === 0) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Affiliate account not found'
			});
		}

		return AffiliateService.getAffiliateStats(affiliateResult[0].id);
	}),

	/**
	 * Create affiliate link for a product
	 */
	createLink: protectedProcedure
		.input(
			z.object({
				productId: z.number(),
				customCode: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Get user's affiliate record
			const affiliateResult = await db
				.select()
				.from(table.affiliate)
				.where(eq(table.affiliate.userId, ctx.user.id))
				.limit(1);

			if (affiliateResult.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Affiliate account not found. Please create one first.'
				});
			}

			try {
				const link = await AffiliateService.createAffiliateLink({
					affiliateId: affiliateResult[0].id,
					productId: input.productId,
					customCode: input.customCode
				});

				return link;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create affiliate link'
				});
			}
		}),

	/**
	 * Get all affiliate links for current user
	 */
	getLinks: protectedProcedure.query(async ({ ctx }) => {
		// Get user's affiliate record
		const affiliateResult = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.userId, ctx.user.id))
			.limit(1);

		if (affiliateResult.length === 0) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Affiliate account not found'
			});
		}

		const links = await db
			.select({
				id: table.affiliateLink.id,
				linkCode: table.affiliateLink.linkCode,
				originalUrl: table.affiliateLink.originalUrl,
				affiliateUrl: table.affiliateLink.affiliateUrl,
				clicks: table.affiliateLink.clicks,
				conversions: table.affiliateLink.conversions,
				earnings: table.affiliateLink.earnings,
				isActive: table.affiliateLink.isActive,
				createdAt: table.affiliateLink.createdAt,
				product: {
					id: table.product.id,
					name: table.product.name,
					slug: table.product.slug,
					price: table.product.price,
					stockQuantity: table.product.stockQuantity
				}
			})
			.from(table.affiliateLink)
			.innerJoin(table.product, eq(table.affiliateLink.productId, table.product.id))
			.where(eq(table.affiliateLink.affiliateId, affiliateResult[0].id));

		return links;
	}),

	/**
	 * Track affiliate link click (public endpoint)
	 */
	trackClick: publicProcedure
		.input(
			z.object({
				linkCode: z.string(),
				clickData: z.object({
					ipAddress: z.string().optional(),
					userAgent: z.string().optional(),
					referer: z.string().optional(),
					sessionId: z.string().optional(),
					userId: z.string().optional()
				})
			})
		)
		.mutation(async ({ input }) => {
			const success = await AffiliateService.trackClick(input.linkCode, input.clickData);
			
			if (!success) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Affiliate link not found'
				});
			}

			return { success: true };
		}),

	/**
	 * Get affiliate link details by code (public endpoint for redirects)
	 */
	getLinkByCode: publicProcedure
		.input(z.object({ linkCode: z.string() }))
		.query(async ({ input }) => {
			const link = await AffiliateService.getLinkByCode(input.linkCode);
			
			if (!link) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Affiliate link not found'
				});
			}

			// Get product details
			const productResult = await db
				.select()
				.from(table.product)
				.where(eq(table.product.id, link.productId))
				.limit(1);

			if (productResult.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found'
				});
			}

			return {
				...link,
				product: productResult[0]
			};
		}),

	/**
	 * Toggle affiliate link status
	 */
	toggleLinkStatus: protectedProcedure
		.input(
			z.object({
				linkId: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Verify user owns this link
			const linkResult = await db
				.select({
					link: table.affiliateLink,
					affiliate: table.affiliate
				})
				.from(table.affiliateLink)
				.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
				.where(
					and(
						eq(table.affiliateLink.id, input.linkId),
						eq(table.affiliate.userId, ctx.user.id)
					)
				)
				.limit(1);

			if (linkResult.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Affiliate link not found or access denied'
				});
			}

			const newStatus = !linkResult[0].link.isActive;
			
			await db
				.update(table.affiliateLink)
				.set({ 
					isActive: newStatus,
					updatedAt: new Date()
				})
				.where(eq(table.affiliateLink.id, input.linkId));

			return { success: true, isActive: newStatus };
		})
});

export type AffiliateRouter = typeof affiliateRouter;
