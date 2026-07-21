import { describe, expect, it } from 'vitest';
import { isPlantGeoCatalogRequestAuthorized, readPublishedPlantGeoCatalog } from './catalog';
import { readPlantGeoCatalogReadConfiguration } from './config';

const catalogEnvironment = {
	PLANTGEO_CATALOG_READ_ENABLED: 'true',
	PLANTGEO_SERVICE_IDENTITY: 'plantgeo-catalog-reader',
	PLANTGEO_CATALOG_READ_TOKEN: 'plantgeo-catalog-reader-token-that-is-at-least-32-bytes'
};

describe('PlantGeo read-only catalog boundary', () => {
	it('defaults to disabled and requires a separate machine credential', () => {
		expect(readPlantGeoCatalogReadConfiguration({})).toEqual({
			status: 'disabled',
			reason: 'catalog-read-disabled'
		});
		expect(
			readPlantGeoCatalogReadConfiguration({
				...catalogEnvironment,
				PLANTGEO_CATALOG_READ_TOKEN: 'short'
			})
		).toEqual({ status: 'disabled', reason: 'missing-catalog-read-token' });
	});

	it('requires both the configured identity and bearer credential', () => {
		const configuration = readPlantGeoCatalogReadConfiguration(catalogEnvironment);
		if (configuration.status !== 'enabled') {
			throw new Error('test catalog configuration should be enabled');
		}

		expect(
			isPlantGeoCatalogRequestAuthorized(
				new Headers({
					authorization: `Bearer ${catalogEnvironment.PLANTGEO_CATALOG_READ_TOKEN}`,
					'X-Aevani-Service-Identity': catalogEnvironment.PLANTGEO_SERVICE_IDENTITY
				}),
				configuration
			)
		).toBe(true);
		expect(
			isPlantGeoCatalogRequestAuthorized(
				new Headers({
					authorization: 'Bearer wrong-token',
					'X-Aevani-Service-Identity': catalogEnvironment.PLANTGEO_SERVICE_IDENTITY
				}),
				configuration
			)
		).toBe(false);
	});

	it('reports unavailable instead of representing the research catalog as empty', () => {
		expect(readPublishedPlantGeoCatalog()).toMatchObject({ status: 'unavailable' });
	});
});
