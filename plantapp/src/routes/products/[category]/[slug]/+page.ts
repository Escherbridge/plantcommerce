import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	const { params } = event;
	const { category: categorySlug, slug } = params;

	const trpc = createCallerClient(event.fetch);
	const product = await trpc.products.getProduct.query({ slug });

	if (!product) {
		throw error(404, 'Product not found');
	}

	// Normalize the product shape for the template
	const normalized = normalizeProduct(product);

	// Get related products from same category
	let relatedProducts: any[] = [];
	try {
		const results = await trpc.products.getProducts.query({
			categoryId: normalized.category?.id,
			limit: 5,
			sortBy: 'created',
			sortOrder: 'desc'
		});
		relatedProducts = (Array.isArray(results) ? results : [])
			.map(normalizeProduct)
			.filter((p: any) => p.id !== normalized.id)
			.slice(0, 4);
	} catch {
		// Non-critical - page still works without related products
	}

	return {
		product: normalized,
		relatedProducts,
		categorySlug
	};
};

function normalizeProduct(row: any) {
	const p = row.product ?? row;
	const cat = row.category ?? p.category;
	const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags ?? []);

	function resolveImageUrl(img: any): string {
		if (img?.url) return img.url;
		const path = img?.bucketPath || 'AI-MockAssets/MAINHERO.png';
		return `/api/files/serve?path=${encodeURIComponent(path)}`;
	}

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
		category: cat ? { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? null } : null,
		images: p.images?.length
			? p.images.map((img: any) => ({
				url: resolveImageUrl(img),
				altText: img.altText || p.shortDescription
			}))
			: []
	};
}
