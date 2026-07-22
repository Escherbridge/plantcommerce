import { describe, expect, it } from 'vitest';
import {
	assertLaunchCatalogManifest,
	launchCatalogCandidates,
	launchCatalogCollections,
	launchCatalogManifestHash
} from './launchManifest';

describe('launch catalog manifest', () => {
	it('contains the reviewed candidate and collection counts with an immutable hash', () => {
		expect(launchCatalogCandidates).toHaveLength(35);
		expect(launchCatalogCollections).toHaveLength(1);
		expect(launchCatalogManifestHash).toMatch(/^[0-9a-f]{64}$/);
		expect(assertLaunchCatalogManifest).not.toThrow();
	});

	it('keeps every candidate unpriced and unavailable until operational evidence exists', () => {
		for (const candidate of launchCatalogCandidates) {
			expect(candidate.isActive).toBe(false);
			expect(candidate.customerFacing).toBe(false);
			expect(candidate.sellable).toBe(false);
			expect(candidate.price).toEqual({
				currency: 'USD',
				semantics: 'unpriced',
				amountMinor: null
			});
			expect(candidate.media.primaryImageObjectKey).toBeNull();
		}
	});
});
