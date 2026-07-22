import { describe, expect, it } from 'vitest';
import { assertPublicCatalogAvailable, getPublicCatalogAvailability } from './publicCatalog';

describe('public catalog boundary', () => {
	it('uses the database catalogue as the production-capable default', () => {
		expect(getPublicCatalogAvailability()).toEqual({
			status: 'available',
			reason: null
		});
	});

	it('retains a compatibility assertion without globally closing commerce', () => {
		expect(assertPublicCatalogAvailable).not.toThrow();
	});
});
