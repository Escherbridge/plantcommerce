import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from './trpc';
import { ProductService } from '../services/product';
import { OrderService, type OrderStatus } from '../services/order';
import { UserService } from '../services/user';
import { ContentService, type AdminContentFilter } from '../services/content';
import AffiliateService, { AffiliateNotFoundError } from '../services/affiliate';
import { db } from '../db';
import { product, order, user as userTable, affiliate } from '../db/schema';
import { sql, eq } from 'drizzle-orm';

export const adminRouter = router({
	/**
	 * Get dashboard statistics
	 */
	getDashboardStats: adminProcedure.query(async () => {
		try {
			// Get total revenue
			const revenueResult = await db
				.select({ total: sql<number>`COALESCE(SUM(CAST(${order.totalAmount} AS DECIMAL)), 0)` })
				.from(order);
			const totalRevenue = Number(revenueResult[0]?.total || 0);

			// Get total orders
			const ordersCount = await db.select({ count: sql<number>`COUNT(*)` }).from(order);
			const totalOrders = Number(ordersCount[0]?.count || 0);

			// Get total users
			const usersCount = await db.select({ count: sql<number>`COUNT(*)` }).from(userTable);
			const totalUsers = Number(usersCount[0]?.count || 0);

			// Get total products
			const productsCount = await db.select({ count: sql<number>`COUNT(*)` }).from(product);
			const totalProducts = Number(productsCount[0]?.count || 0);

			// Get recent orders (last 7 days)
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			const recentOrdersCount = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(order)
				.where(sql`${order.createdAt} >= ${sevenDaysAgo}`);
			const recentOrders = Number(recentOrdersCount[0]?.count || 0);

			// Get low stock products
			const lowStockCount = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(product)
				.where(sql`${product.stockQuantity} < 10 AND ${product.trackInventory} = true`);
			const lowStockProducts = Number(lowStockCount[0]?.count || 0);

			return {
				totalRevenue,
				totalOrders,
				totalUsers,
				totalProducts,
				recentOrders,
				lowStockProducts
			};
		} catch (error) {
			console.error('Error getting dashboard stats:', error);
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Dashboard data is unavailable'
			});
		}
	}),

	/**
	 * Get recent orders
	 */
	getRecentOrders: adminProcedure
		.input(z.object({ limit: z.number().min(1).max(100).default(10) }))
		.query(async ({ input }) => {
			try {
				return await OrderService.getAllOrders(input.limit);
			} catch (error) {
				console.error('Error getting recent orders:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Recent orders are unavailable'
				});
			}
		}),

	/**
	 * Get all products for admin
	 */
	getAllProducts: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				search: z.string().optional(),
				categoryId: z.number().optional()
			})
		)
		.query(async ({ input }) => {
			try {
				return await ProductService.getAllProducts(input);
			} catch (error) {
				console.error('Error getting products:', error);
				return [];
			}
		}),

	/**
	 * Get all orders for admin
	 */
	getAllOrders: adminProcedure
		.input(
			z.object({
				status: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0)
			})
		)
		.query(async ({ input }) => {
			try {
				return await OrderService.getAllOrders(
					input.limit,
					input.offset,
					input.status as OrderStatus | undefined
				);
			} catch (error) {
				console.error('Error getting orders:', error);
				return [];
			}
		}),

	/**
	 * Get all users for admin
	 */
	getAllUsers: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				role: z.enum(['admin', 'customer', 'affiliate', 'instructor']).optional()
			})
		)
		.query(async ({ input }) => {
			try {
				return await UserService.getAllUsers(input.limit, input.offset, input.role);
			} catch (error) {
				console.error('Error getting users:', error);
				return [];
			}
		}),

	/**
	 * Get all content for admin
	 */
	getAllContent: adminProcedure
		.input(
			z.object({
				type: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0)
			})
		)
		.query(async ({ input }) => {
			try {
				return await ContentService.getAllPages({
					...input,
					type: input.type as AdminContentFilter['type']
				});
			} catch (error) {
				console.error('Error getting content:', error);
				return [];
			}
		}),

	/**
	 * Get analytics data
	 */
	getAnalytics: adminProcedure.query(async () => {
		try {
			// Calculate analytics
			const revenueResult = await db
				.select({ total: sql<number>`COALESCE(SUM(CAST(${order.totalAmount} AS DECIMAL)), 0)` })
				.from(order);
			const totalRevenue = Number(revenueResult[0]?.total || 0);

			const ordersCount = await db.select({ count: sql<number>`COUNT(*)` }).from(order);
			const totalOrders = Number(ordersCount[0]?.count || 0);

			const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

			return {
				totalRevenue,
				totalOrders,
				averageOrderValue,
				conversionRate: 0,
				topProducts: [],
				topCategories: [],
				revenueByMonth: []
			};
		} catch (error) {
			console.error('Error getting analytics:', error);
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Analytics data is unavailable'
			});
		}
	}),

	/**
	 * Get pending affiliate applications
	 */
	getPendingAffiliates: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0)
			})
		)
		.query(async ({ input }) => {
			try {
				const affiliates = await db
					.select({
						id: affiliate.id,
						affiliateCode: affiliate.affiliateCode,
						status: affiliate.status,
						website: affiliate.website,
						socialMedia: affiliate.socialMedia,
						audience: affiliate.audience,
						promotionMethod: affiliate.promotionMethod,
						monthlyTraffic: affiliate.monthlyTraffic,
						whyJoin: affiliate.whyJoin,
						totalEarnings: affiliate.totalEarnings,
						createdAt: affiliate.createdAt,
						user: {
							id: userTable.id,
							firstName: userTable.firstName,
							lastName: userTable.lastName,
							email: userTable.email
						}
					})
					.from(affiliate)
					.innerJoin(userTable, eq(affiliate.userId, userTable.id))
					.where(eq(affiliate.status, 'pending'))
					.limit(input.limit)
					.offset(input.offset);

				return affiliates;
			} catch (error) {
				console.error('Error getting pending affiliates:', error);
				return [];
			}
		}),

	/**
	 * Get all affiliate applications
	 */
	getAllAffiliates: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				status: z.enum(['pending', 'active', 'rejected', 'suspended']).optional()
			})
		)
		.query(async ({ input }) => {
			try {
				let query = db
					.select({
						id: affiliate.id,
						affiliateCode: affiliate.affiliateCode,
						status: affiliate.status,
						website: affiliate.website,
						socialMedia: affiliate.socialMedia,
						audience: affiliate.audience,
						promotionMethod: affiliate.promotionMethod,
						monthlyTraffic: affiliate.monthlyTraffic,
						whyJoin: affiliate.whyJoin,
						totalEarnings: affiliate.totalEarnings,
						createdAt: affiliate.createdAt,
						user: {
							id: userTable.id,
							firstName: userTable.firstName,
							lastName: userTable.lastName,
							email: userTable.email
						}
					})
					.from(affiliate)
					.innerJoin(userTable, eq(affiliate.userId, userTable.id));

				if (input.status) {
					query = query.where(eq(affiliate.status, input.status)) as any;
				}

				const affiliates = await query.limit(input.limit).offset(input.offset);

				return affiliates;
			} catch (error) {
				console.error('Error getting affiliates:', error);
				return [];
			}
		}),

	/**
	 * Approve an affiliate application
	 */
	approveAffiliate: adminProcedure
		.input(z.object({ affiliateId: z.number() }))
		.mutation(async ({ input }) => {
			try {
				await AffiliateService.approveAffiliate(input.affiliateId);

				return { success: true, affiliateId: input.affiliateId };
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				if (error instanceof AffiliateNotFoundError) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Affiliate not found'
					});
				}
				console.error('Error approving affiliate:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to approve affiliate'
				});
			}
		}),

	/**
	 * Reject an affiliate application
	 */
	rejectAffiliate: adminProcedure
		.input(z.object({ affiliateId: z.number() }))
		.mutation(async ({ input }) => {
			try {
				await AffiliateService.rejectAffiliate(input.affiliateId);

				return { success: true, affiliateId: input.affiliateId };
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				if (error instanceof AffiliateNotFoundError) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Affiliate not found'
					});
				}
				console.error('Error rejecting affiliate:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to reject affiliate'
				});
			}
		})
});

export type AdminRouter = typeof adminRouter;
