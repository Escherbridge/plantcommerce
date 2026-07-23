import { describe, beforeEach, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { demoCategories, demoProducts, searchDemoProducts } from './fixtures';
import {
	addDemoCartItem,
	getDemoCart,
	getDemoCheckoutReview,
	getDemoOrder,
	resetDemoCommerceStoreForTests,
	submitDemoCheckout
} from './store';

class TestCookies {
	private readonly values = new Map<string, string>();
	get(name: string) {
		return this.values.get(name);
	}
	set(name: string, value: string) {
		this.values.set(name, value);
	}
}

function scope(cookies = new TestCookies()) {
	return {
		cookies,
		url: new URL('http://localhost:5173/products')
	} as unknown as Pick<RequestEvent, 'cookies' | 'url'>;
}

describe('demo commerce fixtures', () => {
	it('transforms exactly 35 launch concepts into unmistakable mock/test records', () => {
		expect(demoProducts).toHaveLength(35);
		expect(demoCategories).toHaveLength(5);
		for (const product of demoProducts) {
			expect(product.id).toMatch(/^demo-product:/);
			expect(product.dataClass).toBe('mock_test');
			expect(product.sku).toMatch(/^TEST-/);
			expect(product.shortDescription).toContain('Mock/test');
			expect(product.price.amountMinor).toBeGreaterThan(0);
			expect(Number.isSafeInteger(product.price.amountMinor)).toBe(true);
		}
	});

	it('supports category, search, and deterministic price sorting', () => {
		const hydroponics = searchDemoProducts({
			categorySlug: 'hydroponics',
			search: 'test',
			sortBy: 'price',
			sortOrder: 'asc',
			limit: 50
		});
		expect(hydroponics.length).toBeGreaterThan(0);
		expect(hydroponics.every((product) => product.category.slug === 'hydroponics')).toBe(true);
		expect(hydroponics.map((product) => product.price.amountMinor)).toEqual(
			[...hydroponics].map((product) => product.price.amountMinor).sort((a, b) => a - b)
		);
	});
});

describe('demo commerce session store', () => {
	beforeEach(() => resetDemoCommerceStoreForTests());

	it('keeps carts and orders session-bound and checkout idempotent', () => {
		const first = scope();
		const second = scope();
		const product = demoProducts[0];
		addDemoCartItem(first, product.id, 2);
		expect(getDemoCart(first).totalItems).toBe(2);
		expect(getDemoCart(second).totalItems).toBe(0);

		const review = getDemoCheckoutReview(first);
		const order = submitDemoCheckout(first, review.idempotencyKey);
		const replay = submitDemoCheckout(first, review.idempotencyKey);
		expect(replay.reference).toBe(order.reference);
		expect(order.reference).toMatch(/^TEST-/);
		expect(order.dataClass).toBe('mock_test');
		expect(getDemoCart(first).totalItems).toBe(0);
		expect(getDemoOrder(first, order.reference)?.reference).toBe(order.reference);
		expect(getDemoOrder(second, order.reference)).toBeNull();
	});

	it('rejects a checkout key that was not issued by a test review', () => {
		const event = scope();
		addDemoCartItem(event, demoProducts[0].id, 1);
		expect(() => submitDemoCheckout(event, `demo-checkout-${'a'.repeat(32)}`)).toThrow(
			'missing or expired'
		);
	});

	it('enforces simulated availability for cumulative cart changes', () => {
		const event = scope();
		const product = demoProducts.reduce((lowest, candidate) =>
			candidate.availableQuantity < lowest.availableQuantity ? candidate : lowest
		);
		addDemoCartItem(event, product.id, product.availableQuantity);
		expect(() => addDemoCartItem(event, product.id, 1)).toThrow('simulated units');
	});
});
