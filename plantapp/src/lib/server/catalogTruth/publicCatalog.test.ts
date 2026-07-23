import { describe, expect, it } from 'vitest';
import { assertPublicCatalogAvailable, getPublicCatalogAvailability } from './publicCatalog';

describe('public catalog boundary', () => {
	it('reports the reviewed catalog as available now that the gate is open', () => {
		expect(getPublicCatalogAvailability()).toEqual({
			status: 'available',
			reason: null
		});
	});

	it('permits public cart, checkout, and affiliate operations while available', () => {
		expect(assertPublicCatalogAvailable).not.toThrow();
	});
});
