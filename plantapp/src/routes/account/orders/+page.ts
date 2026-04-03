import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const status = url.searchParams.get('status');

	// Auth is handled by the account layout

	try {
		const orders = await trpc(event).orders.getUserOrders.query({
			limit: 50,
			offset: 0
		});

		return {
			orders: orders || [],
			selectedStatus: status
		};
	} catch (error) {
		console.error('Error loading orders:', error);
		return {
			orders: [],
			selectedStatus: status
		};
	}
};
