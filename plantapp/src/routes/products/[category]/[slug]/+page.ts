import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { error } from '@sveltejs/kit';
import { getPublicProductImages } from '$lib/utils/productMedia';

export const load: PageLoad = async (event) => {
	const { params } = event;
	const { category: categorySlug, slug } = params;

	const trpc = createCallerClient(event.fetch);

	// Catalog gate is OPEN now — this passes (available) but we keep the check.
	const catalogAvailability = await trpc.products.getCatalogAvailability.query();
	if (catalogAvailability.status !== 'available') {
		throw error(503, catalogAvailability.reason);
	}

	const product = await trpc.products.getProduct.query({ slug });
	if (!product) {
		throw error(404, 'Product not found');
	}

	const normalized = normalizeProduct(product);

	// Related products: prefer explicit relatedProductIds, else same category.
	const relatedProducts = await loadRelatedProducts(trpc, normalized);

	return {
		product: normalized,
		relatedProducts,
		categorySlug
	};
};

/**
 * Resolve up to 3 related products. Uses `relatedProductIds` when present
 * (resolved from the public product list, which is the only list endpoint,
 * capped at 50), otherwise falls back to the same category. Self is excluded.
 */
async function loadRelatedProducts(
	trpc: ReturnType<typeof createCallerClient>,
	current: ReturnType<typeof normalizeProduct>
) {
	try {
		const relatedIds = Array.isArray(current.relatedProductIds) ? current.relatedProductIds : [];

		if (relatedIds.length > 0) {
			const pool = await trpc.products.getProducts.query({
				limit: 50,
				sortBy: 'created',
				sortOrder: 'desc'
			});
			const byId = new Map<number, ReturnType<typeof normalizeProduct>>();
			for (const row of Array.isArray(pool) ? pool : []) {
				const n = normalizeProduct(row);
				byId.set(n.id, n);
			}
			const resolved = relatedIds
				.map((id) => byId.get(id))
				.filter((p): p is ReturnType<typeof normalizeProduct> => !!p && p.id !== current.id)
				.slice(0, 3);
			if (resolved.length > 0) {
				return resolved;
			}
		}

		if (current.category?.id) {
			const results = await trpc.products.getProducts.query({
				categoryId: current.category.id,
				limit: 6,
				sortBy: 'created',
				sortOrder: 'desc'
			});
			return (Array.isArray(results) ? results : [])
				.map(normalizeProduct)
				.filter((p) => p.id !== current.id)
				.slice(0, 3);
		}
	} catch {
		// Non-critical — the page still renders without related products.
	}
	return [];
}

function normalizeProduct(row: any) {
	const p = row.product ?? row;
	const cat = row.category ?? p.category;
	const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags ?? []);

	const images = getPublicProductImages(p.images, p.shortDescription);

	return {
		id: p.id as number,
		name: p.name as string,
		slug: p.slug as string,
		description: (p.description ?? null) as string | null,
		shortDescription: (p.shortDescription ?? null) as string | null,
		price: p.price as string,
		comparePrice: (p.comparePrice ?? null) as string | null,
		sku: (p.sku ?? null) as string | null,
		stockQuantity: (p.stockQuantity ?? 0) as number,
		inStock: (p.stockQuantity ?? 0) > 0,
		isFeatured: !!p.isFeatured,
		tags,
		// Rich product-detail fields (design-spec §5).
		descriptionHtml: (p.descriptionHtml ?? null) as string | null,
		keyFeatures: (Array.isArray(p.keyFeatures) ? p.keyFeatures : []) as string[],
		stats: (Array.isArray(p.stats) ? p.stats : []) as { value: string; label: string }[],
		specs: (Array.isArray(p.specs) ? p.specs : []) as { label: string; value: string }[],
		inTheBox: (Array.isArray(p.inTheBox) ? p.inTheBox : []) as string[],
		faqs: (Array.isArray(p.faqs) ? p.faqs : []) as { q: string; a: string }[],
		badges: (Array.isArray(p.badges) ? p.badges : []) as string[],
		testBedNote: (p.testBedNote ?? null) as string | null,
		warranty: (p.warranty ?? null) as string | null,
		shippingNote: (p.shippingNote ?? null) as string | null,
		bundleOffer: (p.bundleOffer ?? null) as {
			title: string;
			price: string;
			compareAt: string;
			blurb: string;
		} | null,
		relatedProductIds: (Array.isArray(p.relatedProductIds) ? p.relatedProductIds : []) as number[],
		currency: (p.currency ?? 'USD') as string,
		ratingAverage: (p.ratingAverage ?? null) as string | null,
		reviewCount: (p.reviewCount ?? 0) as number,
		reviews: (Array.isArray(p.reviews) ? p.reviews : []) as Array<{
			id: number;
			authorName: string;
			rating: number;
			title: string | null;
			body: string;
			isVerifiedPurchase: boolean;
			createdAt: string | Date;
		}>,
		category: cat
			? { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? null }
			: null,
		images
	};
}
