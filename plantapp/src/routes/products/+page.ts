import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';
import { getMockProducts, getMockCategories } from '$lib/utils/mockProducts';

/** Normalize DB product shape to flat shape templates expect */
function normalizeProduct(row: any) {
	const p = row.product ?? row;
	const cat = row.category ?? p.category;
	const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags ?? []);

	return {
		id: p.id,
		name: p.name,
		slug: p.slug,
		description: p.description,
		shortDescription: p.shortDescription,
		price: p.price,
		comparePrice: p.comparePrice,
		sku: p.sku,
		stockQuantity: p.stockQuantity ?? 0,
		inStock: (p.stockQuantity ?? 0) > 0,
		isFeatured: p.isFeatured,
		tags,
		category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
		images: p.images?.length
			? p.images.map((img: any) => ({
				url: img.url || `/src/lib/images/${img.bucketPath || 'AI-MockAssets/MAINHERO.png'}`,
				altText: img.altText || p.shortDescription
			}))
			: []
	};
}

export const load: PageLoad = async (event) => {
	const { url } = event;
	const search = url.searchParams.get('search');
	const category = url.searchParams.get('category');

	try {
		const categories = await trpc(event).products.getCategories.query();

		const results = await trpc(event).products.getProducts.query({
			search: search || undefined,
			categoryId: category ? parseInt(category) : undefined,
			limit: 50
		});

		const products = (Array.isArray(results) ? results : []).map(normalizeProduct);

		return {
			products,
			categories: categories || [],
			selectedCategory: category,
			searchQuery: search
		};
	} catch (error) {
		console.error('Error loading products from database, using mock data:', error);

		return {
			products: getMockProducts({
				search: search || undefined,
				categoryId: category ? parseInt(category) : undefined,
				limit: 50
			}),
			categories: getMockCategories(),
			selectedCategory: category,
			searchQuery: search
		};
	}
};
