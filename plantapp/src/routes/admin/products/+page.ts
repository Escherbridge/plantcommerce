import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const productRows = await trpc.admin.getAllProducts.query({
			limit: 50,
			offset: 0
		});
		const products = productRows.map(({ product, category }) => ({
			id: product.id,
			name: product.name,
			sku: product.sku,
			price: product.price,
			stockQuantity: product.stockQuantity,
			isActive: product.isActive,
			category
		}));
		return { products };
	} catch (error) {
		console.error('Error loading products:', error);
		return { products: [] };
	}
};
