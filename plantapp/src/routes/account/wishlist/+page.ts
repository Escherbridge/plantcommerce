import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	// Auth is handled by the account layout

	try {
		const wishlist = await trpc(event).users.getWishlist.query();

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
