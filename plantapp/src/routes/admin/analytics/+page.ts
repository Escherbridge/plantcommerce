import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	try {
		const analytics = await trpc(event).admin.getAnalytics.query();
		return { analytics };
	} catch (error) {
		return {
			analytics: {
				totalRevenue: 0,
				totalOrders: 0,
				averageOrderValue: 0,
				conversionRate: 0,
				topProducts: [],
				topCategories: [],
				revenueByMonth: []
			}
		};
	}
};
