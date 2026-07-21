import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const stats = await trpc.admin.getDashboardStats.query();
		const recentOrders = await trpc.admin.getRecentOrders.query({ limit: 10 });

		return {
			stats,
			recentOrders
		};
	} catch (error) {
		console.error('Error loading admin dashboard:', error);
		return {
			stats: null,
			recentOrders: [],
			error: 'Dashboard data could not be loaded. No zero-value fallback is being shown as a report.'
		};
	}
};
