import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from './trpc';
import AffiliateService from '../services/affiliate';
import { UserService } from '../services/user';

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
					await UserService.updateUserRole(ctx.user.id, 'affiliate');
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
	 * Get current user's affiliate account
	 */
	getMyAffiliate: protectedProcedure.query(async ({ ctx }) => {
		try {
			const affiliate = await AffiliateService.getAffiliateByUserId(ctx.user.id);
			return affiliate;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve affiliate account'
			});
		}
	}),

	/**
	 * Get affiliate stats for current user
	 */
	getStats: protectedProcedure.query(async ({ ctx }) => {
		try {
			const affiliate = await AffiliateService.getAffiliateByUserId(ctx.user.id);

			if (!affiliate) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Affiliate account not found'
				});
			}

			return await AffiliateService.getAffiliateStats(affiliate.id);
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve affiliate stats'
			});
		}
	}),

	/**
	 * Get recent clicks for current user's affiliate account
	 */
	getRecentClicks: protectedProcedure
		.input(z.object({ limit: z.number().optional() }))
		.query(async ({ ctx, input }) => {
			try {
				const affiliate = await AffiliateService.getAffiliateByUserId(ctx.user.id);

				if (!affiliate) {
					return [];
				}

				// This would need to be implemented in AffiliateService
				// For now, return empty array as placeholder
				return [];
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve recent clicks'
				});
			}
		}),

	/**
	 * Get earnings data for current user's affiliate account
	 */
	getEarnings: protectedProcedure.query(async ({ ctx }) => {
		try {
			const affiliate = await AffiliateService.getAffiliateByUserId(ctx.user.id);

			if (!affiliate) {
				return {
					totalEarnings: 0,
					pendingPayout: 0,
					currentMonthEarnings: 0,
					history: [],
					paymentMethod: null
				};
			}

			// Return basic structure with affiliate's total earnings
			// pendingPayout and paymentMethod would need to be added to the schema
			return {
				totalEarnings: parseFloat(affiliate.totalEarnings || '0'),
				pendingPayout: 0,
				currentMonthEarnings: 0,
				history: [],
				paymentMethod: null
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve earnings data'
			});
		}
	}),

	/**
	 * Get all affiliate links for current user (alias for getLinks)
	 */
	getMyLinks: protectedProcedure.query(async ({ ctx }) => {
		try {
			return await AffiliateService.getAffiliateLinks(ctx.user.id);
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: error instanceof Error ? error.message : 'Failed to retrieve affiliate links'
			});
		}
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
			try {
				const affiliate = await AffiliateService.getAffiliateByUserId(ctx.user.id);
				
				if (!affiliate) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Affiliate account not found. Please create one first.'
					});
				}

				const link = await AffiliateService.createAffiliateLink({
					affiliateId: affiliate.id,
					productId: input.productId,
					customCode: input.customCode
				});

				return link;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
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
		try {
			return await AffiliateService.getAffiliateLinks(ctx.user.id);
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: error instanceof Error ? error.message : 'Failed to retrieve affiliate links'
			});
		}
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
			try {
				const linkWithProduct = await AffiliateService.getLinkWithProductByCode(input.linkCode);
				
				if (!linkWithProduct) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Affiliate link not found'
					});
				}

				return linkWithProduct;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve affiliate link'
				});
			}
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
			try {
				return await AffiliateService.toggleLinkStatus(input.linkId, ctx.user.id);
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to toggle link status'
				});
			}
		})
});

export type AffiliateRouter = typeof affiliateRouter;
