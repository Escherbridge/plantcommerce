import type { PageLoad } from './$types';
import { requireAuth } from '$lib/loaders/protected';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const user = await requireAuth(event);

	// Get account stats
	const stats = {
		totalOrders: 0,
		wishlistItems: 0
	};

	try {
		const orders = await trpc(event).orders.getMyOrders.query({ limit: 1000 });
		stats.totalOrders = orders?.length || 0;
	} catch (e) {
		console.error('Error loading orders:', e);
	}

	try {
		const wishlist = await trpc(event).users.getWishlist.query();
		stats.wishlistItems = wishlist?.length || 0;
	} catch (e) {
		console.error('Error loading wishlist:', e);
	}

	return {
		user,
		stats
	};
};
