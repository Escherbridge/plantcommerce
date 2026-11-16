import { getPublicProductImages } from '$lib/utils/productMedia';
import {
	isPlaceholderListing,
	presentPlaceholderListing,
	sanitizePlaceholderProduct
} from '$lib/catalog/placeholderListing';

export function normalizeProduct(row: any) {
	const raw = row.product ?? row;
	const cat = row.category ?? raw.category;
	const placeholder = isPlaceholderListing(raw);
	const p = placeholder ? sanitizePlaceholderProduct(raw) : raw;
	const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags ?? []);
	const copy = placeholder ? presentPlaceholderListing(p) : null;

	const images = getPublicProductImages(p.images, copy?.shortDescription ?? p.shortDescription);

	return {
		id: p.id as number,
		name: p.name as string,
		slug: p.slug as string,
		description: (copy ? copy.description : (p.description ?? null)) as string | null,
		shortDescription: (copy ? copy.shortDescription : (p.shortDescription ?? null)) as
			| string
			| null,
		metaDescription: (placeholder ? (p.metaDescription ?? null) : (p.metaDescription ?? null)) as
			| string
			| null,
		price: (placeholder ? null : p.price) as string | null,
		comparePrice: (placeholder ? null : (p.comparePrice ?? null)) as string | null,
		sku: (p.sku ?? null) as string | null,
		stockQuantity: (placeholder ? null : (p.stockQuantity ?? 0)) as number | null,
		inStock: placeholder ? false : (p.stockQuantity ?? 0) > 0,
		comingSoon: placeholder,
		isFeatured: !!p.isFeatured,
		tags,
		descriptionHtml: (copy ? copy.descriptionHtml : (p.descriptionHtml ?? null)) as string | null,
		keyFeatures: (copy
			? copy.keyFeatures
			: Array.isArray(p.keyFeatures)
				? p.keyFeatures
				: []) as string[],
		stats: (copy ? copy.stats : Array.isArray(p.stats) ? p.stats : []) as {
			value: string;
			label: string;
		}[],
		specs: (copy ? copy.specs : Array.isArray(p.specs) ? p.specs : []) as {
			label: string;
			value: string;
		}[],
		inTheBox: (copy ? copy.inTheBox : Array.isArray(p.inTheBox) ? p.inTheBox : []) as string[],
		faqs: (copy ? copy.faqs : Array.isArray(p.faqs) ? p.faqs : []) as { q: string; a: string }[],
		badges: (copy ? copy.badges : Array.isArray(p.badges) ? p.badges : []) as string[],
		testBedNote: (copy ? copy.testBedNote : (p.testBedNote ?? null)) as string | null,
		warranty: null,
		shippingNote: null,
		bundleOffer: placeholder
			? null
			: ((p.bundleOffer ?? null) as {
					title: string;
					price: string;
					compareAt: string;
					blurb: string;
				} | null),
		relatedProductIds: (Array.isArray(p.relatedProductIds) ? p.relatedProductIds : []) as number[],
		currency: (p.currency ?? 'USD') as string,
		category: cat
			? { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? null }
			: null,
		images
	};
}
