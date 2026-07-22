import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import OrderService from '$lib/server/services/order';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { orderNumber } = params;

	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	let order: Awaited<ReturnType<typeof OrderService.getOrderByNumberForUser>>;
	try {
		order = await OrderService.getOrderByNumberForUser(
			orderNumber,
			locals.user.id,
			locals.user.role === 'admin'
		);
	} catch (err) {
		console.error('Error loading order:', err);
		throw error(500, 'Failed to load order details');
	}

	if (!order) {
		throw error(404, 'Order not found');
	}

	return {
		order
	};
};
