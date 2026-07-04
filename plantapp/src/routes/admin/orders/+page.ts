import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const status = url.searchParams.get('status');

	try {
		const orders = await trpc.admin.getAllOrders.query({
			status: status && status !== 'all' ? status : undefined,
			limit: 50,
			offset: 0
		});
		return { orders };
	} catch (error) {
		console.error('Error loading orders:', error);
		return { orders: [] };
	}
};
