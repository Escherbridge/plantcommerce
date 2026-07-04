import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Checkout is now handled by Stripe — redirect to cart where the checkout button lives
export const load: PageServerLoad = async () => {
	throw redirect(303, '/cart');
};
