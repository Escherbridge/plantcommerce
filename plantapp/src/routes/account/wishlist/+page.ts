import type { PageLoad } from './$types';
import { requireAuth } from '$lib/loaders/protected';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	await requireAuth(event);

	try {
		const wishlist = await trpc(event).users.getWishlist.query();

		// Get product recommendations
		let recommendations = [];
		try {
			recommendations = await trpc(event).products.getProducts.query({
				featured: true,
				limit: 4
			});
		} catch (e) {
			console.error('Error loading recommendations:', e);
		}

		return {
			wishlist: wishlist || [],
			recommendations: Array.isArray(recommendations) ? recommendations : []
		};
	} catch (error) {
		console.error('Error loading wishlist:', error);
		return {
			wishlist: [],
			recommendations: []
		};
	}
};
