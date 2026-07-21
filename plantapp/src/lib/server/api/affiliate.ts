import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from './trpc';
import AffiliateService, {
	AffiliateAccessError,
	isActiveApprovedAffiliate
} from '../services/affiliate';
import { getPublicCatalogAvailability } from '../catalogTruth/publicCatalog';

const activeAffiliateRequiredMessage = 'Your affiliate application must be active and approved';

function withoutAffiliateOperations<T extends {
	affiliateCode: string;
	commissionRate: string;
	totalEarnings: string;
	totalClicks: number;
	totalConversions: number;
	isActive: boolean;
}>(affiliate: T) {
	return {
		...affiliate,
		affiliateCode: '',
		commissionRate: '0.00',
		totalEarnings: '0.00',
		totalClicks: 0,
		totalConversions: 0,
		isActive: false
	};
}

async function getPortalAffiliate(userId: string, isAdmin: boolean) {
	try {
		return await AffiliateService.requireActiveAffiliateByUserId(userId);
	} catch (error) {
		if (error instanceof AffiliateAccessError) {
			// Admins can enter the portal without a personal affiliate record, but
			// cannot access an inactive applicant's data or links.
			if (isAdmin) return null;
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: activeAffiliateRequiredMessage
			});
		}

		throw error;
	}
}

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

				return ctx.user.role === 'admin' || isActiveApprovedAffiliate(affiliate)
					? affiliate
					: withoutAffiliateOperations(affiliate);
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create affiliate account'
				});
			}
		}),

	/**
	 * Apply to become an affiliate (public-facing onboarding endpoint)
	 */
	submitApplication: protectedProcedure
		.input(
			z.object({
				website: z.string().optional(),
				socialMedia: z.string().optional(),
				audience: z.string(),
				promotionMethod: z.string(),
				monthlyTraffic: z.string(),
				whyJoin: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await AffiliateService.createOrGetAffiliate(ctx.user.id, undefined, {
					website: input.website,
					socialMedia: input.socialMedia,
					audience: input.audience,
					promotionMethod: input.promotionMethod,
					monthlyTraffic: input.monthlyTraffic,
					whyJoin: input.whyJoin
				});
				if (!result.created) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'You already have an affiliate account.'
					});
				}
				const affiliate = result.affiliate;

				return {
					...(ctx.user.role === 'admin' || isActiveApprovedAffiliate(affiliate)
						? affiliate
						: withoutAffiliateOperations(affiliate)),
					applicationDetails: {
						website: input.website,
						socialMedia: input.socialMedia,
						audience: input.audience,
						promotionMethod: input.promotionMethod,
						monthlyTraffic: input.monthlyTraffic,
						whyJoin: input.whyJoin
					}
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to submit application'
				});
			}
		}),

	/**
	 * Get current user's affiliate account
	 */
	getMyAffiliate: protectedProcedure.query(async ({ ctx }) => {
		try {
			const affiliate = await AffiliateService.getAffiliateByUserId(ctx.user.id);
			if (!affiliate || ctx.user.role === 'admin' || isActiveApprovedAffiliate(affiliate)) {
				return affiliate;
			}

			// Applicants may check their status, but legacy pending/rejected records
			// must not reveal accumulated affiliate operations before approval.
			return withoutAffiliateOperations(affiliate);
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
			const affiliate = await getPortalAffiliate(ctx.user.id, ctx.user.role === 'admin');
			if (!affiliate) {
				return {
					totalEarnings: 0,
					totalClicks: 0,
					totalConversions: 0,
					conversionRate: 0,
					recentLinks: []
				};
			}

			return await AffiliateService.getAffiliateStats(affiliate.id);
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			if (error instanceof AffiliateAccessError) {
				throw new TRPCError({ code: 'FORBIDDEN', message: activeAffiliateRequiredMessage });
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
				const affiliate = await getPortalAffiliate(ctx.user.id, ctx.user.role === 'admin');
				if (!affiliate) return [];

				return await AffiliateService.getTopPerformingLinks(affiliate.id, input.limit || 10);
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				if (error instanceof AffiliateAccessError) {
					throw new TRPCError({ code: 'FORBIDDEN', message: activeAffiliateRequiredMessage });
				}
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
			const affiliate = await getPortalAffiliate(ctx.user.id, ctx.user.role === 'admin');

			if (!affiliate) {
				return {
					totalEarnings: 0,
					pendingPayout: 0,
					currentMonthEarnings: 0,
					lastMonthEarnings: 0,
					history: [],
					paymentMethod: null
				};
			}

			const earningsData = await AffiliateService.getEarningsData(affiliate.id);

			return {
				...earningsData,
				paymentMethod: null // Payment method system not yet implemented
			};
		} catch (error) {
			if (error instanceof TRPCError) throw error;
			if (error instanceof AffiliateAccessError) {
				throw new TRPCError({ code: 'FORBIDDEN', message: activeAffiliateRequiredMessage });
			}
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
			const affiliate = await getPortalAffiliate(ctx.user.id, ctx.user.role === 'admin');
			if (!affiliate) return [];

			const links = await AffiliateService.getAffiliateLinks(ctx.user.id);
			const baseUrl = ctx.event.url.origin;
			// Return links with full shareable URLs
			return links.map((link: any) => ({
				...link,
				affiliateUrl: `${baseUrl}/aff/${link.linkCode}`
			}));
		} catch (error) {
			if (error instanceof TRPCError) throw error;
			if (error instanceof AffiliateAccessError) {
				throw new TRPCError({ code: 'FORBIDDEN', message: activeAffiliateRequiredMessage });
			}
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
				customCode: z.string().optional(),
				affiliateId: z.number().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				if (input.affiliateId !== undefined && ctx.user.role !== 'admin') {
					throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
				}

				const affiliate = input.affiliateId !== undefined
					? await AffiliateService.requireActiveAffiliateById(input.affiliateId)
					: await getPortalAffiliate(ctx.user.id, ctx.user.role === 'admin');

				if (!affiliate) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Select an active affiliate account before creating a link'
					});
				}

				const link = await AffiliateService.createAffiliateLink({
					affiliateId: affiliate.id,
					productId: input.productId,
					customCode: input.customCode
				});

				// Return the link with a full shareable URL
				const baseUrl = ctx.event.url.origin;
				return {
					...link,
					affiliateUrl: `${baseUrl}/aff/${link.linkCode}`
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				if (error instanceof AffiliateAccessError) {
					throw new TRPCError({ code: 'FORBIDDEN', message: activeAffiliateRequiredMessage });
				}
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create affiliate link'
				});
			}
		}),

	/**
	 * Get all affiliate links for current user (alias for getMyLinks)
	 */
	getLinks: protectedProcedure.query(async ({ ctx }) => {
		try {
			const affiliate = await getPortalAffiliate(ctx.user.id, ctx.user.role === 'admin');
			if (!affiliate) return [];

			const links = await AffiliateService.getAffiliateLinks(ctx.user.id);
			const baseUrl = ctx.event.url.origin;
			return links.map((link: any) => ({
				...link,
				affiliateUrl: `${baseUrl}/aff/${link.linkCode}`
			}));
		} catch (error) {
			if (error instanceof TRPCError) throw error;
			if (error instanceof AffiliateAccessError) {
				throw new TRPCError({ code: 'FORBIDDEN', message: activeAffiliateRequiredMessage });
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: error instanceof Error ? error.message : 'Failed to retrieve affiliate links'
			});
		}
	}),

	/**
	 * Get affiliate link details by code (public endpoint for redirects)
	 */
	getLinkByCode: publicProcedure
		.input(z.object({ linkCode: z.string() }))
		.query(async ({ input }) => {
			try {
				if (getPublicCatalogAvailability().status !== 'available') {
					throw new TRPCError({ code: 'NOT_FOUND', message: 'Affiliate link not found' });
				}
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
				if (ctx.user.role !== 'admin') {
					await getPortalAffiliate(ctx.user.id, false);
				}

				return await AffiliateService.toggleLinkStatus(
					input.linkId,
					ctx.user.id,
					ctx.user.role === 'admin'
				);
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				if (error instanceof AffiliateAccessError) {
					throw new TRPCError({ code: 'FORBIDDEN', message: activeAffiliateRequiredMessage });
				}
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to toggle link status'
				});
			}
		})
});

export type AffiliateRouter = typeof affiliateRouter;
