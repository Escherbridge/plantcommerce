import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	try {
		const cart = await trpc(event).cart.getCart.query();

		// Get recently viewed products
		let recentlyViewed = [];
		try {
			const recentProducts = await trpc(event).products.getProducts.query({
				limit: 4,
				featured: true
			});
			recentlyViewed = Array.isArray(recentProducts) ? recentProducts : [];
		} catch (e) {
			console.error('Error loading recently viewed:', e);
		}

		return {
			cart: cart || { items: [] },
			recentlyViewed
		};
	} catch (error) {
		console.error('Error loading cart:', error);
		return {
			cart: { items: [] },
			recentlyViewed: []
		};
	}
};
