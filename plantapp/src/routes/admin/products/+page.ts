import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	try {
		const products = await trpc(event).admin.getAllProducts.query();
		return { products };
	} catch (error) {
		return { products: [] };
	}
};
