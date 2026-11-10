import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productIsPurchasable } from '$lib/server/commerce/purchasable';
import { db } from '$lib/server/db';
import { GET, OPTIONS } from '../../../routes/api/catalog/products/+server';
import { projectPublicCatalog, publicCatalogPageSize } from './publicCatalog';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn()
	}
}));

vi.mock('$lib/server/commerce/purchasable', async () => {
	const actual = await vi.importActual<typeof import('$lib/server/commerce/purchasable')>(
		'$lib/server/commerce/purchasable'
	);
	return {
		...actual,
		productIsPurchasable: vi.fn(actual.productIsPurchasable)
	};
});

const generatedAt = new Date('2026-11-10T12:00:00.000Z');
const forbidden = {
	sku: 'SKU-FORBIDDEN-88421',
	cost: 'COST-FORBIDDEN-77310',
	costPrice: 'COSTPRICE-FORBIDDEN-77311',
	inventory: 'INVENTORY-FORBIDDEN-88011',
	stockQuantity: 55198,
	reservedQuantity: 44187,
	supplier: 'SUPPLIER-FORBIDDEN-66209',
	supplierNotes: 'SUPPLIERNOTES-FORBIDDEN-55190',
	description: 'DESCRIPTION-FORBIDDEN-33076',
	descriptionHtml: 'HTML-FORBIDDEN-22065',
	email: 'secret-buyer@supplier.example',
	passwordHash: 'PASSWORDHASH-FORBIDDEN-11054',
	weight: 'WEIGHT-FORBIDDEN-99043',
	dimensions: 'DIMENSIONS-FORBIDDEN-88032',
	notes: 'NOTES-FORBIDDEN-77021'
};

const sentinels = [
	forbidden.sku,
	forbidden.cost,
	forbidden.costPrice,
	forbidden.inventory,
	String(forbidden.stockQuantity),
	String(forbidden.reservedQuantity),
	forbidden.supplier,
	forbidden.supplierNotes,
	forbidden.description,
	forbidden.descriptionHtml,
	forbidden.email,
	forbidden.passwordHash,
	forbidden.weight,
	forbidden.dimensions,
	forbidden.notes
];

const productKeys = [
	'id',
	'canonicalUrl',
	'title',
	'summary',
	'price',
	'availability',
	'availabilityCheckedAt',
	'category',
	'merchant',
	'suitability',
	'claims',
	'images',
	'updatedAt'
];

function catalogRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		id: 12,
		name: 'Soil Mix',
		slug: 'soil-mix',
		shortDescription: 'A publishable summary.',
		price: '24.50',
		currency: 'usd',
		updatedAt: new Date('2026-07-20T11:00:00.000Z'),
		comingSoon: null,
		trackInventory: true,
		categoryId: 3,
		categoryName: 'Soil',
		categorySlug: 'soil',
		parentSlug: 'hydroponics',
		...forbidden,
		...overrides
	};
}

function project(rows: Record<string, unknown>[], cursor: string | null = null, limit?: number) {
	return projectPublicCatalog({ rows, cursor, generatedAt, limit });
}

function assertAllowlist(body: unknown) {
	const record = body as {
		contractVersion: string;
		generatedAt: string;
		cursor: unknown;
		products: Record<string, unknown>[];
		[key: string]: unknown;
	};
	expect(record.contractVersion).toBe('v1');
	expect(record.cursor).toBeNull();
	expect(record.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
	expect(Object.keys(record).sort()).toEqual(
		['contractVersion', 'cursor', 'generatedAt', 'nextCursor', 'products'].sort()
	);
	for (const product of record.products) {
		expect(Object.keys(product).sort()).toEqual([...productKeys].sort());
		expect(Object.keys(product.price as object).sort()).toEqual(['amountMinor', 'currency']);
		expect(Object.keys(product.category as object).sort()).toEqual(['id', 'name', 'slug']);
		expect(Object.keys(product.merchant as object).sort()).toEqual(['fulfillment', 'id']);
		expect(Object.keys(product.suitability as object).sort()).toEqual([
			'climate',
			'evidence',
			'geography'
		]);
	}
	const json = JSON.stringify(body);
	for (const sentinel of sentinels) {
		expect(json).not.toContain(sentinel);
	}
	expect(json).not.toContain('"comingSoon"');
	expect(json).not.toContain('"sku"');
	expect(json).not.toContain('"supplier"');
}

function mockRows(rows: Record<string, unknown>[]) {
	const limit = vi.fn().mockResolvedValue(rows);
	const chain = {
		from: vi.fn(),
		innerJoin: vi.fn(),
		leftJoin: vi.fn(),
		where: vi.fn(),
		orderBy: vi.fn(),
		limit
	};
	chain.from.mockReturnValue(chain);
	chain.innerJoin.mockReturnValue(chain);
	chain.leftJoin.mockReturnValue(chain);
	chain.where.mockReturnValue(chain);
	chain.orderBy.mockReturnValue(chain);
	(db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue(chain);
	return { limit };
}

function event(path: string, origin?: string) {
	const headers = new Headers();
	if (origin) headers.set('origin', origin);
	const url = new URL(path, 'https://aevani.com');
	return {
		request: new Request(url, { headers }),
		url
	} as Parameters<typeof GET>[0];
}

describe('public PlantGeo catalog projection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('never includes forbidden fields in the output', () => {
		const body = project([catalogRow()]);

		assertAllowlist(body);
		expect(body.generatedAt).toBe(generatedAt.toISOString());
		expect(body.products).toEqual([
			{
				id: 'product_12',
				canonicalUrl: 'https://aevani.com/products/hydroponics/soil-mix',
				title: 'Soil Mix',
				summary: 'A publishable summary.',
				price: { amountMinor: 2450, currency: 'USD' },
				availability: 'unavailable',
				availabilityCheckedAt: generatedAt.toISOString(),
				category: { id: 'category_3', name: 'Soil', slug: 'soil' },
				merchant: { id: 'aevani', fulfillment: 'merchant_fulfilled' },
				suitability: { geography: [], climate: [], evidence: [] },
				claims: [],
				images: [],
				updatedAt: '2026-07-20T11:00:00.000Z'
			}
		]);
		expect(productIsPurchasable).toHaveBeenCalledWith({ comingSoon: null });
		expect(Object.keys(vi.mocked(productIsPurchasable).mock.calls[0][0])).toEqual(['comingSoon']);
	});

	it('marks coming soon products unavailable only when comingSoon is not false', () => {
		const rows = [
			catalogRow({ id: 1, comingSoon: null }),
			catalogRow({ id: 2, comingSoon: true }),
			catalogRow({ id: 3, comingSoon: 'false' }),
			catalogRow({ id: 4 }),
			catalogRow({ id: 5, comingSoon: false }),
			catalogRow({ id: 6, comingSoon: false, stockQuantity: 0, reservedQuantity: 0 }),
			catalogRow({
				id: 7,
				comingSoon: false,
				trackInventory: false,
				stockQuantity: 0,
				reservedQuantity: 0
			})
		];
		delete rows[3].comingSoon;

		const body = project(rows);
		expect(body.products.map((product) => [product.id, product.availability])).toEqual([
			['product_1', 'unavailable'],
			['product_2', 'unavailable'],
			['product_3', 'unavailable'],
			['product_4', 'unavailable'],
			['product_5', 'in_stock'],
			['product_6', 'out_of_stock'],
			['product_7', 'in_stock']
		]);
		assertAllowlist(body);
		expect(productIsPurchasable).toHaveBeenCalledWith({ comingSoon: null });
		expect(productIsPurchasable).toHaveBeenCalledWith({ comingSoon: true });
		expect(productIsPurchasable).toHaveBeenCalledWith({ comingSoon: undefined });
		expect(productIsPurchasable).toHaveBeenCalledWith({ comingSoon: false });
	});

	it('uses the short summary and drops rows that cannot be published', () => {
		const body = project([
			catalogRow({ shortDescription: '   ' }),
			catalogRow({ id: 13, price: '24.999', sku: forbidden.sku }),
			catalogRow({ id: 14, isActive: false }),
			catalogRow({ id: 15, description: forbidden.description, shortDescription: null })
		]);

		expect(body.products.map((product) => product.id)).toEqual(['product_12', 'product_15']);
		expect(body.products[0]?.summary).toBeNull();
		expect(body.products[1]?.summary).toBeNull();
		assertAllowlist(body);
	});

	it('pages with an opaque product cursor and does not echo raw row fields', () => {
		const rows = [catalogRow({ id: 8 }), catalogRow({ id: 9 }), catalogRow({ id: 10 })];
		const first = project(rows, null, 2);
		expect(first.cursor).toBeNull();
		expect(first.nextCursor).toBe('product_9');
		expect(first.products.map((product) => product.id)).toEqual(['product_8', 'product_9']);

		const second = project(rows.slice(2), 'product_9', 2);
		expect(second.cursor).toBe('product_9');
		expect(second.nextCursor).toBeNull();
		expect(second.products).toHaveLength(1);
	});
});

describe('GET /api/catalog/products', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the allowlist with public caching and PlantGeo GET CORS', async () => {
		mockRows([catalogRow({ comingSoon: false })]);
		const response = await GET(event('/api/catalog/products', 'https://evil.example'));
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
		expect(response.headers.get('Vary')).toBe('Origin');
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://plantgeo.aevani.com');
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
		expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();
		expect(response.headers.get('Allow')).toBe('GET');
		expect(body.products[0]?.availability).toBe('in_stock');
		assertAllowlist(body);

		const selection = (db.select as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<
			string,
			{ name?: string }
		>;
		const columnNames = Object.values(selection).map((column) => column.name);
		expect(columnNames).not.toContain('sku');
		expect(columnNames).not.toContain('cost_price');
		expect(columnNames).not.toContain('description');
		expect(columnNames).toContain('coming_soon');
	});

	it('echoes a valid cursor and treats a blank cursor as the first page', async () => {
		mockRows([]);
		const paged = await GET(event('/api/catalog/products?cursor=product_9'));
		expect(paged.status).toBe(200);
		expect(await paged.json()).toMatchObject({
			contractVersion: 'v1',
			cursor: 'product_9',
			nextCursor: null,
			products: []
		});

		mockRows([]);
		const first = await GET(event('/api/catalog/products?cursor='));
		expect(first.status).toBe(200);
		expect(await first.json()).toMatchObject({ cursor: null, products: [] });
	});

	it('rejects a bad cursor without reading the catalog', async () => {
		const { limit } = mockRows([]);
		const response = await GET(event('/api/catalog/products?cursor=sku_88421'));

		expect(response.status).toBe(400);
		expect(response.headers.get('Cache-Control')).toBe('no-store');
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://plantgeo.aevani.com');
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
		expect(await response.json()).toEqual({ error: 'invalid_cursor' });
		expect(limit).not.toHaveBeenCalled();
	});

	it('hides database failures and still allows only the PlantGeo origin', async () => {
		const { limit } = mockRows([]);
		limit.mockRejectedValue(new Error(`database exploded near ${forbidden.sku}`));
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const response = await GET(event('/api/catalog/products', 'https://plantgeo.aevani.com'));
		const body = await response.json();

		expect(errorSpy).toHaveBeenCalledWith('Public catalog read failed');
		expect(errorSpy.mock.calls.flat().join(' ')).not.toContain(forbidden.sku);
		errorSpy.mockRestore();
		expect(response.status).toBe(503);
		expect(response.headers.get('Cache-Control')).toBe('no-store');
		expect(body).toEqual({ error: 'unavailable' });
		expect(JSON.stringify(body)).not.toContain(forbidden.sku);
	});

	it('answers CORS preflight for GET only', async () => {
		const response = await OPTIONS(event('/api/catalog/products', 'https://plantgeo.aevani.com'));

		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://plantgeo.aevani.com');
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
		expect(response.headers.get('Access-Control-Allow-Methods')).not.toContain('POST');
		expect(response.headers.get('Allow')).toBe('GET');
		expect(await response.text()).toBe('');
	});

	it('uses the configured page size when reading', () => {
		expect(publicCatalogPageSize).toBe(50);
	});
});
