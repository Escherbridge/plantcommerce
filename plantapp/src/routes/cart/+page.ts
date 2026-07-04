import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { browser } from '$app/environment';

const GUEST_SESSION_KEY = 'aevani_guest_session';

function getGuestSessionId(): string | undefined {
	if (!browser) return undefined;
	return localStorage.getItem(GUEST_SESSION_KEY) || undefined;
}

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const sessionId = getGuestSessionId();
		const cart = await trpc.cart.getCart.query({ sessionId });

		// Get recently viewed products (using featured as placeholder)
		let recentlyViewed: any[] = [];
		try {
			const recentProducts = await trpc.products.getProducts.query({
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
