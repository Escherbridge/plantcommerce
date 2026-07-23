import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { buildParentSlugMap, normalizeCatalogProduct, type CatalogProduct } from './catalog';

// Shop / catalogue loader. The catalog gate is OPEN, so this reads real products
// + categories via tRPC and returns them for client-side chip filtering.
// Shared normalization helpers live in ./catalog. See design-spec §6.

/** Valid category chip ids (see +page.svelte CHIPS). 'all' means no filter. */
const CHIP_IDS = new Set([
	'all',
	'hydroponics',
	'aquaponics',
	'silvopasture',
	'agroforestry',
	'kits-collections',
	'seeds-supplies'
]);

/** Featured hero tiles for the catalogue's featured row (design-spec §6). */
const FEATURED_SLUGS = [
	'vertical-tower-garden-system',
	'ibc-aquaponics-fish-tank',
	'permaculture-starter-kit'
];

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const rawCategory = event.url.searchParams.get('category');
	const selectedCategory = rawCategory && CHIP_IDS.has(rawCategory) ? rawCategory : 'all';
	const searchQuery = event.url.searchParams.get('search');

	try {
		const [rows, categories] = await Promise.all([
			trpc.products.getProducts.query({
				search: searchQuery || undefined,
				limit: 50,
				sortBy: 'created',
				sortOrder: 'desc'
			}),
			trpc.products.getCategories.query()
		]);

		const parentSlugMap = buildParentSlugMap(Array.isArray(categories) ? categories : []);
		const products = (Array.isArray(rows) ? rows : [])
			.map((row) => normalizeCatalogProduct(row, parentSlugMap))
			// Sort: featured first, then alphabetically — "our honest recommendation".
			.sort((a, b) => {
				if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
				return a.name.localeCompare(b.name);
			});

		// Featured hero row: the design's 3 spotlight products, topped up with any
		// other featured items if a spotlight slug is missing from the catalog.
		const featured: CatalogProduct[] = [];
		for (const slug of FEATURED_SLUGS) {
			const found = products.find((p) => p.slug === slug);
			if (found) featured.push(found);
		}
		if (featured.length < 3) {
			for (const p of products) {
				if (featured.length >= 3) break;
				if (p.isFeatured && !featured.some((f) => f.id === p.id)) featured.push(p);
			}
		}

		return {
			products,
			featured: featured.slice(0, 3),
			selectedCategory,
			searchQuery
		};
	} catch (error) {
		console.error('Error loading catalogue:', error);
		return {
			products: [] as CatalogProduct[],
			featured: [] as CatalogProduct[],
			selectedCategory,
			searchQuery
		};
	}
};
