import type { LoadEvent } from '@sveltejs/kit';
import { trpc } from '$lib/trpc/client';

function normalizeProduct(row: any) {
	const p = row.product ?? row;
	const cat = row.category ?? p.category;

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
		category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
		image: p.images?.[0] ? resolveImageUrl(p.images[0]) : '/api/files/serve?path=AI-MockAssets%2FMAINHERO.png',
		images: p.images?.length
			? p.images.map((img: any) => ({
				url: resolveImageUrl(img),
				altText: img.altText || p.shortDescription
			}))
			: []
	};
}

export async function loadProductsByCategory(event: LoadEvent, categorySlug: string) {
	const { url } = event;
	const search = url.searchParams.get('filter');

	try {
		const catalogAvailability = await trpc.products.getCatalogAvailability.query();
		if (catalogAvailability.status !== 'available') {
			return { products: [], category: null, catalogAvailability };
		}
		const categories = await trpc.products.getCategories.query();
		const category = categories.find((c: any) => c.slug === categorySlug);

		if (!category) {
			console.warn(`[productCategory] No category found for slug: "${categorySlug}"`);
			return { products: [], category: null };
		}

		// Collect this category ID plus all child category IDs
		const childIds = categories
			.filter((c: any) => c.parentId === category.id)
			.map((c: any) => c.id);
		const allCategoryIds = [category.id, ...childIds];

		console.log(`[productCategory] slug="${categorySlug}" → category id=${category.id} name="${category.name}", childIds=[${childIds}], allCategoryIds=[${allCategoryIds}]`);

		const result = await trpc.products.getProducts.query({
			categoryIds: allCategoryIds,
			search: search || undefined,
			limit: 50
		});

		const products = (Array.isArray(result) ? result : []).map(normalizeProduct);

		console.log(`[productCategory] slug="${categorySlug}" → ${products.length} products:`, products.map((p: any) => p.name));

		return { products, category, catalogAvailability };
	} catch (error) {
		console.error(`Error loading ${categorySlug} products:`, error);
		return {
			products: [],
			category: null,
			catalogAvailability: {
				status: 'unavailable' as const,
				reason: 'The catalog could not be checked. Please try again later or contact support.'
			}
		};
	}
}
