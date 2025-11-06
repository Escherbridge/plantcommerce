import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const status = url.searchParams.get('status');

	try {
		const orders = await trpc(event).admin.getAllOrders.query({ status: status || undefined });
		return { orders };
	} catch (error) {
		return { orders: [] };
	}
};
