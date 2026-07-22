import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { databaseCommerceAdapter } from './databaseAdapter';
import { ProductService } from '$lib/server/services/product';
import { CartService } from '$lib/server/services/cart';

vi.mock('$lib/server/services/product', () => ({
	ProductService: {
		getCategories: vi.fn(),
		getProducts: vi.fn(),
		getProductBySlug: vi.fn()
	}
}));

vi.mock('$lib/server/services/cart', () => ({
	CartService: {
		getCart: vi.fn(),
		addItem: vi.fn(),
		updateItemQuantity: vi.fn(),
		clearCart: vi.fn()
	}
}));

function product(overrides: Record<string, unknown> = {}) {
	return {
		id: 12,
		slug: 'circulation-pump',
		name: 'Circulation Pump',
		description: 'Test database product',
		shortDescription: 'Database product summary',
		sku: 'DB-12',
		price: '42.50',
		comparePrice: '50.00',
		stockQuantity: 8,
		reservedQuantity: 5,
		trackInventory: true,
		isFeatured: true,
		category: {
			id: 2,
			slug: 'aquaponics',
			name: 'Aquaponics',
			description: 'Water-based systems'
		},
		images: [
			{ url: '/api/files/serve?path=AI-MockAssets%2Fpump.png', altText: 'Mock pump' },
			{ url: '/media/pump.webp', altText: 'Circulation pump' }
		],
		...overrides
	};
}

function event(): RequestEvent {
	return {
		locals: { user: { id: 'user-1' } },
		url: new URL('http://127.0.0.1:5173/products'),
		getClientAddress: () => '127.0.0.1'
	} as unknown as RequestEvent;
}

describe('database commerce adapter', () => {
	beforeEach(() => vi.clearAllMocks());
	afterEach(() => vi.unstubAllEnvs());

	it('maps money, category, approved media, and unreserved stock', async () => {
		vi.mocked(ProductService.getProducts).mockResolvedValue([
			{
				product: product(),
				category: { id: 2, slug: 'aquaponics', name: 'Aquaponics' }
			}
		] as never);

		const [mapped] = await databaseCommerceAdapter.getProducts({ limit: 10 });

		expect(mapped.price).toEqual({ amountMinor: 4250, currency: 'USD' });
		expect(mapped.comparePrice).toEqual({ amountMinor: 5000, currency: 'USD' });
		expect(mapped.category.slug).toBe('aquaponics');
		expect(mapped.availableQuantity).toBe(3);
		expect(mapped.inStock).toBe(true);
		expect(mapped.images).toEqual([{ url: '/media/pump.webp', altText: 'Circulation pump' }]);
	});

	it('exposes disabled secure checkout before rendering a payment action', async () => {
		vi.stubEnv('SECURE_CHECKOUT_ENABLED', 'false');
		vi.mocked(CartService.getCart).mockResolvedValue({
			id: 7,
			userId: 'user-1',
			sessionId: null,
			affiliateLinkId: null,
			totalAmount: 42.5,
			totalItems: 1,
			items: [
				{
					id: 3,
					productId: 12,
					quantity: 1,
					unitPrice: '42.50',
					product: product()
				}
			]
		} as never);

		const review = await databaseCommerceAdapter.getCheckoutReview(event());

		expect(review.canSubmit).toBe(false);
		expect(review.unavailableReason).toMatch(/temporarily unavailable/i);
		expect(review.contactLabel).not.toContain('Stripe');
	}, 15_000);
});
