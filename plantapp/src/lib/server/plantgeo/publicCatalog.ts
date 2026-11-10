import { and, asc, eq, gt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { publicSiteUrl } from '$lib/config/site';
import { productIsPurchasable } from '$lib/server/commerce/purchasable';
import { product, productCategory } from '$lib/server/db/schema';
import {
	projectPlantGeoCatalog,
	projectPlantGeoCatalogProduct,
	type PlantGeoAvailability,
	type PlantGeoCatalogProjection,
	type PlantGeoCatalogSource
} from './contracts';

/** Browser origin allowed to read this catalog. Server-side fetches do not need CORS. */
export const plantGeoCatalogOrigin = 'https://plantgeo.aevani.com';
export const publicCatalogPageSize = 50;
const publicCatalogMerchantId = 'aevani';
const publicSlugPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const parentCategory = alias(productCategory, 'parent_category');

export class PublicCatalogCursorError extends Error {
	constructor() {
		super('Invalid catalog cursor');
		this.name = 'PublicCatalogCursorError';
	}
}

export function publicCatalogHeaders(cache: 'public' | 'no-store' = 'public'): Headers {
	const headers = new Headers();
	headers.set('Cache-Control', cache === 'public' ? 'public, max-age=60' : 'no-store');
	headers.set('Vary', 'Origin');
	headers.set('Access-Control-Allow-Origin', plantGeoCatalogOrigin);
	headers.set('Access-Control-Allow-Methods', 'GET');
	headers.set('Allow', 'GET');
	return headers;
}

/** Accept only an opaque `product_{id}` cursor. Blank means the first page. */
export function parsePublicCatalogCursor(cursor: string | null): number | null {
	if (cursor === null) return null;
	const trimmed = cursor.trim();
	if (!trimmed) return null;
	const match = /^product_([1-9]\d*)$/.exec(trimmed);
	if (!match) throw new PublicCatalogCursorError();
	const id = Number(match[1]);
	if (!Number.isSafeInteger(id) || id <= 0) throw new PublicCatalogCursorError();
	return id;
}

function readString(row: Record<string, unknown>, key: string): string | null {
	const value = row[key];
	return typeof value === 'string' ? value : null;
}

function readId(value: unknown): number | null {
	if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return value;
	if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
		const id = Number(value);
		return Number.isSafeInteger(id) ? id : null;
	}
	return null;
}

function readCount(value: unknown): number | null {
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function readDate(value: unknown): Date | null {
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
	if (typeof value === 'string') {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) return date;
	}
	return null;
}

/** Pass through only real booleans and null. Anything else stays not purchasable. */
function readComingSoon(row: Record<string, unknown>): boolean | null | undefined {
	if (!Object.prototype.hasOwnProperty.call(row, 'comingSoon')) return undefined;
	const value = row.comingSoon;
	if (value === true || value === false || value === null) return value;
	return undefined;
}

function priceToMinorUnits(value: string): number | null {
	const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
	if (!match) return null;
	const minor = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
	return Number.isSafeInteger(minor) ? minor : null;
}

function publicCurrency(value: string | null): string | null {
	if (value === null || value.trim() === '') return 'USD';
	const currency = value.trim().toUpperCase();
	return /^[A-Z]{3}$/.test(currency) ? currency : null;
}

function publicSummary(value: string | null): string | null {
	if (value === null) return null;
	const summary = value.trim();
	if (!summary || summary.length > 512) return null;
	return summary;
}

function publicSlug(value: string | null): string | null {
	if (value === null) return null;
	const slug = value.trim();
	return publicSlugPattern.test(slug) ? slug : null;
}

/**
 * Coming soon (anything other than coming_soon === false) is unavailable.
 * Purchasable rows use stock only to choose in_stock or out_of_stock.
 */
function catalogAvailability(row: Record<string, unknown>): PlantGeoAvailability {
	if (!productIsPurchasable({ comingSoon: readComingSoon(row) })) return 'unavailable';
	if (row.trackInventory === false) return 'in_stock';
	const stock = readCount(row.stockQuantity);
	if (stock === null) return 'unavailable';
	const reserved = readCount(row.reservedQuantity) ?? 0;
	return stock - reserved > 0 ? 'in_stock' : 'out_of_stock';
}

/** Copy the allowlisted source fields. Raw rows may contain secrets; they are not copied. */
function toCatalogSource(
	row: Record<string, unknown>,
	checkedAt: Date
): PlantGeoCatalogSource | null {
	if (row.isActive === false || row.categoryIsActive === false) return null;

	const productId = readId(row.id);
	const categoryId = readId(row.categoryId);
	const title = readString(row, 'name')?.trim() ?? '';
	const productSlug = publicSlug(readString(row, 'slug'));
	const categorySlug = publicSlug(readString(row, 'categorySlug'));
	const categoryName = readString(row, 'categoryName')?.trim() ?? '';
	const urlSlug = publicSlug(readString(row, 'parentSlug')) ?? categorySlug;
	const amountMinor = priceToMinorUnits(readString(row, 'price') ?? '');
	const currency = publicCurrency(readString(row, 'currency'));
	const updatedAt = readDate(row.updatedAt);

	if (
		productId === null ||
		categoryId === null ||
		!title ||
		title.length > 512 ||
		!productSlug ||
		!categorySlug ||
		!urlSlug ||
		!categoryName ||
		categoryName.length > 512 ||
		amountMinor === null ||
		currency === null ||
		updatedAt === null
	) {
		return null;
	}

	const source: PlantGeoCatalogSource = {
		productId,
		canonicalUrl: publicSiteUrl(`/products/${urlSlug}/${productSlug}`),
		title,
		summary: publicSummary(readString(row, 'shortDescription')),
		price: { amountMinor, currency },
		availability: catalogAvailability(row),
		availabilityCheckedAt: checkedAt,
		category: { id: categoryId, name: categoryName, slug: categorySlug },
		merchant: { id: publicCatalogMerchantId, fulfillment: 'merchant_fulfilled' },
		suitability: { geography: [], climate: [], evidence: [] },
		claims: [],
		images: [],
		updatedAt
	};

	try {
		projectPlantGeoCatalogProduct(source);
	} catch {
		return null;
	}
	return source;
}

export function projectPublicCatalog(input: {
	rows: readonly Record<string, unknown>[];
	cursor: string | null;
	generatedAt: Date;
	limit?: number;
}): PlantGeoCatalogProjection {
	const limit = input.limit ?? publicCatalogPageSize;
	const page = input.rows.slice(0, limit);
	const sources: PlantGeoCatalogSource[] = [];
	for (const row of page) {
		const source = toCatalogSource(row, input.generatedAt);
		if (source) sources.push(source);
	}
	const lastId = page.length > 0 ? readId(page[page.length - 1]?.id) : null;
	return projectPlantGeoCatalog({
		generatedAt: input.generatedAt,
		cursor: input.cursor,
		nextCursor: input.rows.length > limit && lastId !== null ? `product_${lastId}` : null,
		products: sources
	});
}

async function loadActiveCatalogRows(
	afterId: number | null,
	limit: number
): Promise<Record<string, unknown>[]> {
	const { db } = await import('$lib/server/db');
	const filters = [eq(product.isActive, true), eq(productCategory.isActive, true)];
	if (afterId !== null) filters.push(gt(product.id, afterId));

	const rows = await db
		.select({
			id: product.id,
			name: product.name,
			slug: product.slug,
			shortDescription: product.shortDescription,
			price: product.price,
			currency: product.currency,
			updatedAt: product.updatedAt,
			comingSoon: product.comingSoon,
			trackInventory: product.trackInventory,
			stockQuantity: product.stockQuantity,
			reservedQuantity: product.reservedQuantity,
			categoryId: productCategory.id,
			categoryName: productCategory.name,
			categorySlug: productCategory.slug,
			parentSlug: parentCategory.slug
		})
		.from(product)
		.innerJoin(productCategory, eq(product.categoryId, productCategory.id))
		.leftJoin(parentCategory, eq(productCategory.parentId, parentCategory.id))
		.where(and(...filters))
		.orderBy(asc(product.id))
		.limit(limit);

	return rows;
}

/** Read active products and return only the PlantGeo catalog contract. */
export async function readPublicPlantGeoCatalog(
	cursor: string | null,
	now = new Date()
): Promise<PlantGeoCatalogProjection> {
	const afterId = parsePublicCatalogCursor(cursor);
	const rows = await loadActiveCatalogRows(afterId, publicCatalogPageSize + 1);
	return projectPublicCatalog({
		rows,
		cursor: afterId === null ? null : `product_${afterId}`,
		generatedAt: now,
		limit: publicCatalogPageSize
	});
}
