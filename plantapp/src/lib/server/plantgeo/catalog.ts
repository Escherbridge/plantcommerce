import { timingSafeEqual } from 'node:crypto';
import { getPublicCatalogAvailability } from '../catalogTruth/publicCatalog';
import { plantGeoContractVersion, type PlantGeoCatalogProjection } from './contracts';
import type { PlantGeoCatalogReadConfiguration } from './config';

export type PlantGeoCatalogReadResult =
	| Readonly<{ status: 'ready'; catalog: PlantGeoCatalogProjection }>
	| Readonly<{ status: 'unavailable'; reason: string }>;

function constantTimeEquals(left: string, right: string): boolean {
	const leftBytes = Buffer.from(left);
	const rightBytes = Buffer.from(right);
	return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

/** Authenticate only the configured PlantGeo machine identity; browser credentials are never accepted. */
export function isPlantGeoCatalogRequestAuthorized(
	headers: Headers,
	configuration: Extract<PlantGeoCatalogReadConfiguration, { status: 'enabled' }>
): boolean {
	const authorization = headers.get('authorization');
	const serviceIdentity = headers.get('x-aevani-service-identity');
	return (
		authorization !== null &&
		serviceIdentity !== null &&
		constantTimeEquals(authorization, `Bearer ${configuration.accessToken}`) &&
		constantTimeEquals(serviceIdentity, configuration.serviceIdentity)
	);
}

/** Keep the contract observable without ever representing unreviewed data as an empty published catalog. */
export function readPublishedPlantGeoCatalog(): PlantGeoCatalogReadResult {
	const availability = getPublicCatalogAvailability();
	if (availability.status !== 'available') {
		return { status: 'unavailable', reason: availability.reason };
	}

	return {
		status: 'unavailable',
		reason: `No reviewed ${plantGeoContractVersion} catalog provider is configured.`
	};
}
