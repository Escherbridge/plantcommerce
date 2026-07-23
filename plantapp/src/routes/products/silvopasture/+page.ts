import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { normalizeCatalogProduct, buildParentSlugMap, type CatalogProduct } from '../catalog';

// Silvopasture system landing page — real, indexable, filtered to this system.
// Reuses the catalogue normalizer (image map + system grouping). See design-spec §6.
const SYSTEM = 'silvopasture';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const categories = await trpc.products.getCategories.query();
		const cats = Array.isArray(categories) ? categories : [];
		const sys = cats.find((c: any) => c.slug === SYSTEM);
		if (!sys) return { products: [] as CatalogProduct[] };

		const ids = [sys.id, ...cats.filter((c: any) => c.parentId === sys.id).map((c: any) => c.id)];
		const rows = await trpc.products.getProducts.query({
			categoryIds: ids,
			limit: 50,
			sortBy: 'created',
			sortOrder: 'desc'
		});

		const parentSlugMap = buildParentSlugMap(cats);
		const products = (Array.isArray(rows) ? rows : [])
			.map((row) => normalizeCatalogProduct(row, parentSlugMap))
			.sort((a, b) => {
				if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
				return a.name.localeCompare(b.name);
			});

		return { products };
	} catch (error) {
		console.error(`Error loading ${SYSTEM} products:`, error);
		return { products: [] as CatalogProduct[] };
	}
};
