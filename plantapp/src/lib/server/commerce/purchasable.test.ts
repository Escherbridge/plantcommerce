import { describe, expect, it } from 'vitest';
import { comingSoonPurchaseError, productIsPurchasable } from './purchasable';

describe('product purchase gate', () => {
	it('treats null, true, and a missing flag as coming soon', () => {
		expect(productIsPurchasable({ comingSoon: null })).toBe(false);
		expect(productIsPurchasable({ comingSoon: true })).toBe(false);
		expect(productIsPurchasable({})).toBe(false);
	});

	it('allows purchase only when coming soon is explicitly false', () => {
		expect(productIsPurchasable({ comingSoon: false })).toBe(true);
	});

	it('names the product in the refusal', () => {
		expect(comingSoonPurchaseError('Tower')).toBe(
			'Tower is coming soon and is not available for purchase.'
		);
	});
});
