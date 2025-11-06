import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from './trpc';
import { ProductService } from '../services/product';
import { OrderService } from '../services/order';
import { UserService } from '../services/user';
import { ContentService } from '../services/content';
import { db } from '../db';
import { product, order, user as userTable } from '../db/schema';
import { sql } from 'drizzle-orm';

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
			return {
				totalRevenue: 0,
				totalOrders: 0,
				totalUsers: 0,
				totalProducts: 0,
				recentOrders: 0,
				lowStockProducts: 0
			};
		}
	}),

	/**
	 * Get recent orders
	 */
	getRecentOrders: adminProcedure
		.input(z.object({ limit: z.number().min(1).max(100).default(10) }))
		.query(async ({ input }) => {
			try {
				return await OrderService.getRecentOrders(input.limit);
			} catch (error) {
				console.error('Error getting recent orders:', error);
				return [];
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
				return await OrderService.getAllOrders(input);
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
				role: z.enum(['admin', 'customer', 'affiliate']).optional()
			})
		)
		.query(async ({ input }) => {
			try {
				return await UserService.getAllUsers(input);
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
				return await ContentService.getAllContent(input);
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
				conversionRate: 2.5, // Placeholder
				topProducts: [],
				topCategories: [],
				revenueByMonth: []
			};
		} catch (error) {
			console.error('Error getting analytics:', error);
			return {
				totalRevenue: 0,
				totalOrders: 0,
				averageOrderValue: 0,
				conversionRate: 0,
				topProducts: [],
				topCategories: [],
				revenueByMonth: []
			};
		}
	})
});

export type AdminRouter = typeof adminRouter;
