import { describe, expect, it } from 'vitest';
import {
	assertCatalogTruthRecord,
	catalogOfferingKinds,
	customerFacingCatalogRecords,
	type CatalogTruthRecord
} from './contracts';
import { researchOnlyCatalogCandidates } from './researchCandidates';

describe('catalog truth research candidates', () => {
	it('covers every commerce model without creating customer-facing or sellable inventory', () => {
		expect(new Set(researchOnlyCatalogCandidates.map((candidate) => candidate.offeringKind))).toEqual(
			new Set(catalogOfferingKinds)
		);
		expect(customerFacingCatalogRecords(researchOnlyCatalogCandidates)).toEqual([]);

		for (const candidate of researchOnlyCatalogCandidates) {
			expect(candidate.lifecycle).toBe('research_only');
			expect(candidate.customerVisibility).toBe('not_customer_facing');
			expect(candidate.sellability).toBe('not_sellable');
			expect(candidate.sourceEvidence.length).toBeGreaterThan(0);
			for (const source of candidate.sourceEvidence) {
				expect(source.source.file).toBeTruthy();
				expect(source.source.lineEnd).toBeGreaterThanOrEqual(source.source.lineStart);
			}
		}
	});

	it('keeps every required operational fact unverified and valueless', () => {
		for (const candidate of researchOnlyCatalogCandidates) {
			for (const fact of Object.values(candidate.operationalTruth)) {
				expect(fact.status).toBe('unverified');
				expect(fact.value).toBeNull();
				expect(fact.verifiedAt).toBeNull();
				expect(fact.evidence.length).toBeGreaterThan(0);
			}
		}
	});
});

describe('catalog truth publication guards', () => {
	it('rejects a research lead that is marked customer-facing or sellable', () => {
		const candidate = researchOnlyCatalogCandidates[0] as CatalogTruthRecord;
		expect(() =>
			assertCatalogTruthRecord({
				...candidate,
				customerVisibility: 'customer_facing',
				sellability: 'sellable'
			})
		).toThrow('not customer-facing and not sellable');
	});

	it('rejects an unverified supplier fact that exposes a value', () => {
		const candidate = researchOnlyCatalogCandidates[0] as CatalogTruthRecord;
		expect(() =>
			assertCatalogTruthRecord({
				...candidate,
				operationalTruth: {
					...candidate.operationalTruth,
					supplier: {
						...candidate.operationalTruth.supplier,
						value: { name: 'unreviewed', relationship: 'merchant' }
					}
				}
			})
		).toThrow('may not expose a value before it is verified');
	});

	it('rejects not-applicable facts without reviewed evidence', () => {
		const candidate = researchOnlyCatalogCandidates[0] as CatalogTruthRecord;
		expect(() =>
			assertCatalogTruthRecord({
				...candidate,
				operationalTruth: {
					...candidate.operationalTruth,
					supplier: {
						...candidate.operationalTruth.supplier,
						status: 'not_applicable'
					}
				}
			})
		).toThrow('requires verified evidence before it can be marked not applicable');
	});
});
