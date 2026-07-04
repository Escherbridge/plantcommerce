import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const products = await trpc.admin.getAllProducts.query({
			limit: 50,
			offset: 0
		});
		return { products };
	} catch (error) {
		console.error('Error loading products:', error);
		return { products: [] };
	}
};
