import { describe, expect, it } from 'vitest';
import { PlantGeoClient, type PlantGeoFetch } from './client';
import { readPlantGeoConfiguration } from './config';
import {
	hashPlantGeoSubject,
	plantGeoProductId,
	projectPlantGeoCatalogProduct,
	type PlantGeoCommerceEvent
} from './contracts';

const hashSecret = 'plantgeo-subject-secret-that-is-at-least-32-bytes';
const configuredEnvironment = {
	PLANTGEO_INTEGRATION_ENABLED: 'true',
	PLANTGEO_EVENTS_ENDPOINT: 'https://events.plantgeo.test/v1/commerce-events',
	PLANTGEO_SERVICE_IDENTITY: 'plantgeo-publisher',
	PLANTGEO_API_TOKEN: 'plantgeo-api-token-that-is-at-least-32-bytes',
	PLANTGEO_IDENTIFIER_HASH_SECRET: hashSecret
};

function recommendationEvent(): PlantGeoCommerceEvent {
	return {
		type: 'recommendation.recorded',
		eventId: 'event_20260720_001',
		occurredAt: '2026-07-20T12:00:00.000Z',
		subject: { kind: 'account', id: hashPlantGeoSubject('account_12345678', hashSecret) },
		recommendation: {
			id: 'recommendation_001',
			candidateProductIds: [plantGeoProductId(1), plantGeoProductId(2)],
			selectedProductIds: [plantGeoProductId(1)],
			rationaleCodes: ['climate_match'],
			constraintCodes: ['budget_standard'],
			confidence: 0.86,
			sourceEvidence: [
				{
					id: 'evidence_001',
					sourceUrl: 'https://evidence.example.org/catalog/1',
					retrievedAt: '2026-07-20T10:00:00.000Z',
					revision: 'revision_1'
				}
			],
			agent: { id: 'agent_plantgeo', modelVersion: 'model-2026-07' },
			contentContextId: 'content_001',
			disclosureVersion: 'disclosure_2026_07'
		}
	};
}

describe('PlantGeo configuration boundary', () => {
	it('is disabled by default and refuses incomplete configuration', () => {
		expect(readPlantGeoConfiguration({})).toEqual({
			status: 'disabled',
			reason: 'feature-disabled'
		});
		expect(
			readPlantGeoConfiguration({
				PLANTGEO_INTEGRATION_ENABLED: 'true',
				PLANTGEO_EVENTS_ENDPOINT: 'https://events.plantgeo.test/v1/commerce-events'
			})
		).toEqual({ status: 'disabled', reason: 'missing-service-identity' });
	});

	it('requires a scoped identity, HTTPS endpoint, and real secret values', () => {
		expect(
			readPlantGeoConfiguration({
				...configuredEnvironment,
				PLANTGEO_SERVICE_IDENTITY: 'publisher'
			})
		).toEqual({ status: 'disabled', reason: 'invalid-service-identity' });
		expect(
			readPlantGeoConfiguration({
				...configuredEnvironment,
				PLANTGEO_EVENTS_ENDPOINT: 'http://events.plantgeo.test'
			})
		).toEqual({ status: 'disabled', reason: 'invalid-events-endpoint' });
		expect(readPlantGeoConfiguration(configuredEnvironment).status).toBe('enabled');
	});
});

describe('PlantGeo data minimization', () => {
	it('hashes only opaque stable identifiers and rejects email and IP input', () => {
		const subjectHash = hashPlantGeoSubject('account_12345678', hashSecret);
		expect(subjectHash).toMatch(/^pgh1_[a-f0-9]{64}$/);
		expect(subjectHash).not.toContain('account_12345678');
		expect(() => hashPlantGeoSubject('person@example.com', hashSecret)).toThrow(
			'opaque internal identifier'
		);
		expect(() => hashPlantGeoSubject('127.0.0.1', hashSecret)).toThrow(
			'opaque internal identifier'
		);
	});

	it('projects only the explicit catalog allowlist', () => {
		const product = projectPlantGeoCatalogProduct({
			productId: 7,
			canonicalUrl: 'https://aevani.example/products/soil-mix',
			title: 'Soil Mix',
			summary: 'A publishable summary.',
			price: { amountMinor: 2499, currency: 'usd' },
			availability: 'in_stock',
			availabilityCheckedAt: new Date('2026-07-20T11:00:00.000Z'),
			category: { id: 3, name: 'Soil', slug: 'soil' },
			merchant: { id: 'merchant_aevani', fulfillment: 'merchant_fulfilled' },
			suitability: { geography: ['region_temperate'], climate: ['climate_cool'], evidence: [] },
			claims: [],
			images: [],
			updatedAt: new Date('2026-07-20T11:00:00.000Z'),
			sku: 'must-not-project',
			costPrice: 1200,
			stockQuantity: 99
		} as Parameters<typeof projectPlantGeoCatalogProduct>[0]);

		expect(product).toMatchObject({
			id: 'product_7',
			price: { amountMinor: 2499, currency: 'USD' }
		});
		expect(product).not.toHaveProperty('sku');
		expect(product).not.toHaveProperty('costPrice');
		expect(product).not.toHaveProperty('stockQuantity');
	});
});

describe('PlantGeo outbound client', () => {
	it('does not invoke transport when the feature is disabled', async () => {
		let transportCalls = 0;
		const transport: PlantGeoFetch = async () => {
			transportCalls += 1;
			return { ok: true, status: 202 };
		};
		const client = new PlantGeoClient(
			() => ({ status: 'disabled', reason: 'feature-disabled' }),
			transport
		);

		await expect(client.sendCommerceEvent(recommendationEvent())).resolves.toEqual({
			status: 'skipped',
			reason: 'feature-disabled'
		});
		expect(transportCalls).toBe(0);
	});

	it('sends only the serialized allowlist with credentials omitted', async () => {
		const configuration = readPlantGeoConfiguration(configuredEnvironment);
		if (configuration.status !== 'enabled') {
			throw new Error('test configuration should be enabled');
		}
		let sentInput: URL | undefined;
		let sentInit: RequestInit | undefined;
		const transport: PlantGeoFetch = async (input, init) => {
			sentInput = input;
			sentInit = init;
			return { ok: true, status: 202 };
		};
		const client = new PlantGeoClient(() => configuration, transport);
		const event = { ...recommendationEvent(), email: 'person@example.com', session: 'raw-session' };

		await expect(client.sendCommerceEvent(event)).resolves.toEqual({
			status: 'sent',
			responseStatus: 202
		});
		expect(sentInput).toBe(configuration.eventsEndpoint);
		expect(sentInit).toEqual(expect.objectContaining({ credentials: 'omit', redirect: 'error' }));
		const sentBody = JSON.parse(sentInit?.body as string) as Record<string, unknown>;
		expect(JSON.stringify(sentBody)).not.toContain('person@example.com');
		expect(JSON.stringify(sentBody)).not.toContain('raw-session');
	});

	it('contains transport failure in a result instead of throwing', async () => {
		const configuration = readPlantGeoConfiguration(configuredEnvironment);
		if (configuration.status !== 'enabled') {
			throw new Error('test configuration should be enabled');
		}
		const transport: PlantGeoFetch = async () => {
			throw new Error('transport unavailable');
		};
		const client = new PlantGeoClient(() => configuration, transport);

		await expect(client.sendCommerceEvent(recommendationEvent())).resolves.toEqual({
			status: 'failed',
			reason: 'transport-error'
		});
	});
});
