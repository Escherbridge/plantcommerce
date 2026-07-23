import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

// Loads the visitor's cart (guest session or signed-in user) via the tRPC caller
// so the page has real content on first paint. A visitor with no cart yet resolves
// to `null` (empty state) — never a 500. See src/routes/cart for section notes.
export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);

	try {
		const cart = await trpc.cart.getCart.query();
		return { cart };
	} catch (error) {
		console.error('Error loading cart:', error);
		return { cart: null };
	}
};
