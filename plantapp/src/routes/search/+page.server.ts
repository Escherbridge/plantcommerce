import { loadSearchProducts } from '$lib/server/catalog/publicStorefront';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	try {
		return { products: await loadSearchProducts(q) };
	} catch (error) {
		console.error('Error loading search products:', error);
		return { products: [] };
	}
};
