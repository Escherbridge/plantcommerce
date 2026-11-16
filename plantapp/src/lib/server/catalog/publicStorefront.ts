import { error } from '@sveltejs/kit';
import { ProductService } from '$lib/server/services/product';
import { getPublicCatalogAvailability } from '$lib/server/catalogTruth/publicCatalog';
import { sanitizePlaceholderRow } from '$lib/catalog/placeholderListing';
import {
	buildParentSlugMap,
	normalizeCatalogProduct,
	type CatalogProduct
} from '../../../routes/products/catalog';
import { normalizeProduct } from '../../../routes/products/detail';

const CHIP_IDS = new Set([
	'all',
	'hydroponics',
	'aquaponics',
	'silvopasture',
	'agroforestry',
	'kits-collections',
	'seeds-supplies'
]);

const FEATURED_SLUGS = [
	'vertical-tower-garden-system',
	'ibc-aquaponics-fish-tank',
	'permaculture-starter-kit'
];

function catalogueFromRows(rows: unknown[], categories: unknown[]) {
	const parentSlugMap = buildParentSlugMap(Array.isArray(categories) ? categories : []);
	return (Array.isArray(rows) ? rows : [])
		.map((row) => normalizeCatalogProduct(sanitizePlaceholderRow(row), parentSlugMap))
		.sort((a, b) => {
			if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
}

export async function loadCatalogue(url: URL) {
	const rawCategory = url.searchParams.get('category');
	const selectedCategory = rawCategory && CHIP_IDS.has(rawCategory) ? rawCategory : 'all';
	const searchQuery = url.searchParams.get('search');

	try {
		const [rows, categories] = await Promise.all([
			ProductService.getProducts({
				search: searchQuery || undefined,
				limit: 50,
				sortBy: 'created',
				sortOrder: 'desc'
			}),
			ProductService.getCategories()
		]);
		const products = catalogueFromRows(rows, categories);
		const featured: CatalogProduct[] = [];
		for (const slug of FEATURED_SLUGS) {
			const found = products.find((product) => product.slug === slug);
			if (found) featured.push(found);
		}
		if (featured.length < 3) {
			for (const product of products) {
				if (featured.length >= 3) break;
				if (product.isFeatured && !featured.some((item) => item.id === product.id)) {
					featured.push(product);
				}
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
}

export async function loadSystemProducts(system: string) {
	try {
		const categories = await ProductService.getCategories();
		const cats = Array.isArray(categories) ? categories : [];
		const sys = cats.find((category) => category.slug === system);
		if (!sys) return { products: [] as CatalogProduct[] };
		const ids = [
			sys.id,
			...cats.filter((category) => category.parentId === sys.id).map((category) => category.id)
		];
		const rows = await ProductService.getProducts({
			categoryIds: ids,
			limit: 50,
			sortBy: 'created',
			sortOrder: 'desc'
		});
		return { products: catalogueFromRows(rows, cats) };
	} catch (error) {
		console.error(`Error loading ${system} products:`, error);
		return { products: [] as CatalogProduct[] };
	}
}

export async function loadProductDetail(slug: string, categorySlug: string) {
	const catalogAvailability = getPublicCatalogAvailability();
	if (catalogAvailability.status !== 'available') {
		error(503, catalogAvailability.reason ?? 'Catalogue unavailable');
	}
	const product = await ProductService.getProductBySlug(slug);
	if (!product) error(404, 'Product not found');
	const normalized = normalizeProduct(sanitizePlaceholderRow(product));
	const relatedProducts = await loadRelated(normalized);
	return { product: normalized, relatedProducts, categorySlug };
}

async function loadRelated(current: ReturnType<typeof normalizeProduct>) {
	try {
		const relatedIds = Array.isArray(current.relatedProductIds) ? current.relatedProductIds : [];
		if (relatedIds.length > 0) {
			const pool = await ProductService.getProducts({
				limit: 50,
				sortBy: 'created',
				sortOrder: 'desc'
			});
			const byId = new Map<number, ReturnType<typeof normalizeProduct>>();
			for (const row of pool) {
				const normalized = normalizeProduct(sanitizePlaceholderRow(row));
				byId.set(normalized.id, normalized);
			}
			const resolved = relatedIds
				.map((id) => byId.get(id))
				.filter(
					(item): item is ReturnType<typeof normalizeProduct> => !!item && item.id !== current.id
				)
				.slice(0, 3);
			if (resolved.length > 0) return resolved;
		}
		if (current.category?.id) {
			const results = await ProductService.getProducts({
				categoryId: current.category.id,
				limit: 6,
				sortBy: 'created',
				sortOrder: 'desc'
			});
			return results
				.map((row) => normalizeProduct(sanitizePlaceholderRow(row)))
				.filter((item) => item.id !== current.id)
				.slice(0, 3);
		}
	} catch {
		// The page still renders without related products.
	}
	return [];
}

export async function loadSearchProducts(query: string) {
	if (!query) return [];
	const rows = await ProductService.getProducts({ search: query, limit: 20 });
	return rows.map((row) => sanitizePlaceholderRow(row));
}
