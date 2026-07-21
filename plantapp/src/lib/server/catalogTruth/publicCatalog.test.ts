import { describe, expect, it } from 'vitest';
import { assertPublicCatalogAvailable, getPublicCatalogAvailability } from './publicCatalog';

describe('public catalog boundary', () => {
	it('fails closed while the reviewed catalog ingestion path is absent', () => {
		expect(getPublicCatalogAvailability()).toEqual({
			status: 'unavailable',
			reason:
				'Product listings are unavailable while supplier, offer, fulfillment, and claim evidence are being verified.'
		});
	});

	it('rejects public cart, checkout, and affiliate operations while unavailable', () => {
		expect(assertPublicCatalogAvailable).toThrow('Product listings are unavailable');
	});
});
