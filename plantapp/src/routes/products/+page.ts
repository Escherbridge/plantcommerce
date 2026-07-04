import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

function normalizeProduct(row: any, parentSlugMap: Map<number, string>) {
	const p = row.product ?? row;
	const cat = row.category ?? p.category;
	const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags ?? []);

	function resolveImageUrl(img: any): string {
		if (img?.url) return img.url;
		const path = img?.bucketPath || 'AI-MockAssets/MAINHERO.png';
		return `/api/files/serve?path=${encodeURIComponent(path)}`;
	}

	// Resolve the parent category slug for URL routing
	const categorySlug = cat ? (parentSlugMap.get(cat.id) || cat.slug) : 'all';

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
		categorySlug,
		images: p.images?.length
			? p.images.map((img: any) => ({
				url: resolveImageUrl(img),
				altText: img.altText || p.shortDescription
			}))
			: []
	};
}

/** Build a map from category ID → parent category slug for URL routing */
function buildParentSlugMap(categories: any[]): Map<number, string> {
	const map = new Map<number, string>();
	const byId = new Map(categories.map((c: any) => [c.id, c]));

	for (const cat of categories) {
		if (cat.parentId) {
			// Child categories map to their parent's slug
			const parent = byId.get(cat.parentId);
			if (parent) {
				map.set(cat.id, parent.slug);
			}
		} else {
			// Parent categories map to themselves
			map.set(cat.id, cat.slug);
		}
	}
	return map;
}

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const search = url.searchParams.get('search');
	const category = url.searchParams.get('category');

	try {
		const categories = await trpc.products.getCategories.query();
		const parentSlugMap = buildParentSlugMap(categories);

		const results = await trpc.products.getProducts.query({
			search: search || undefined,
			categoryId: category ? parseInt(category) : undefined,
			limit: 50
		});

		const products = (Array.isArray(results) ? results : []).map(
			(row: any) => normalizeProduct(row, parentSlugMap)
		);

		return {
			products,
			categories: categories || [],
			selectedCategory: category,
			searchQuery: search
		};
	} catch (error) {
		console.error('Error loading products:', error);
		return {
			products: [],
			categories: [],
			selectedCategory: category,
			searchQuery: search
		};
	}
};
