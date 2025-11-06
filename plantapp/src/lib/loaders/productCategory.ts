import type { LoadEvent } from '@sveltejs/kit';
import { trpc } from '$lib/trpc/client';

export async function loadProductsByCategory(event: LoadEvent, categorySlug: string) {
	const { url } = event;
	const search = url.searchParams.get('filter');

	try {
		// Get categories first to find the category ID
		const categories = await trpc(event).products.getCategories.query();
		const category = categories.find((c: any) => c.slug === categorySlug);

		if (!category) {
			return { products: [], category: null };
		}

		// Get products by category
		const result = await trpc(event).products.getProducts.query({
			categoryId: category.id,
			search: search || undefined,
			limit: 50
		});

		return {
			products: Array.isArray(result) ? result : [],
			category
		};
	} catch (error) {
		console.error(`Error loading ${categorySlug} products:`, error);
		return {
			products: [],
			category: null
		};
	}
}
