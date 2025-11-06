import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	try {
		const stats = await trpc(event).admin.getDashboardStats.query();
		const recentOrders = await trpc(event).admin.getRecentOrders.query({ limit: 10 });

		return {
			stats,
			recentOrders,
			pendingReviews: 0 // Placeholder
		};
	} catch (error) {
		console.error('Error loading admin dashboard:', error);
		return {
			stats: {
				totalRevenue: 0,
				totalOrders: 0,
				totalUsers: 0,
				totalProducts: 0,
				recentOrders: 0,
				lowStockProducts: 0
			},
			recentOrders: [],
			pendingReviews: 0
		};
	}
};
