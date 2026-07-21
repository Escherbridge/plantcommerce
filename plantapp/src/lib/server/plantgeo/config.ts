import { env } from '$env/dynamic/private';

export type PlantGeoEnvironment = Readonly<{
	PLANTGEO_INTEGRATION_ENABLED?: string;
	PLANTGEO_EVENTS_ENDPOINT?: string;
	PLANTGEO_SERVICE_IDENTITY?: string;
	PLANTGEO_API_TOKEN?: string;
	PLANTGEO_IDENTIFIER_HASH_SECRET?: string;
}>;

export type PlantGeoCatalogReadEnvironment = Readonly<{
	PLANTGEO_CATALOG_READ_ENABLED?: string;
	PLANTGEO_SERVICE_IDENTITY?: string;
	PLANTGEO_CATALOG_READ_TOKEN?: string;
}>;

export type PlantGeoDisabledReason =
	| 'feature-disabled'
	| 'missing-events-endpoint'
	| 'invalid-events-endpoint'
	| 'missing-service-identity'
	| 'invalid-service-identity'
	| 'missing-api-token'
	| 'missing-identifier-hash-secret';

export type PlantGeoConfiguration =
	| Readonly<{ status: 'disabled'; reason: PlantGeoDisabledReason }>
	| Readonly<{
			status: 'enabled';
			eventsEndpoint: URL;
			serviceIdentity: string;
			apiToken: string;
			identifierHashSecret: string;
		}>;

export type PlantGeoCatalogReadDisabledReason =
	| 'catalog-read-disabled'
	| 'missing-service-identity'
	| 'invalid-service-identity'
	| 'missing-catalog-read-token';

export type PlantGeoCatalogReadConfiguration =
	| Readonly<{ status: 'disabled'; reason: PlantGeoCatalogReadDisabledReason }>
	| Readonly<{ status: 'enabled'; serviceIdentity: string; accessToken: string }>;

const placeholderValue = /^(?:replace(?:[-_ ]with)?|your[-_ ]|example|changeme|todo)/i;
const serviceIdentityPattern = /^plantgeo-[a-z0-9][a-z0-9-]{1,62}$/;

function configuredValue(value: string | undefined): string | null {
	const normalized = value?.trim();
	return normalized && !placeholderValue.test(normalized) ? normalized : null;
}

function configuredSecret(value: string | undefined): string | null {
	const normalized = configuredValue(value);
	return normalized && Buffer.byteLength(normalized) >= 32 ? normalized : null;
}

function parseEventsEndpoint(value: string): URL | null {
	try {
		const endpoint = new URL(value);
		const hostname = endpoint.hostname.toLowerCase();
		if (
			endpoint.protocol !== 'https:' ||
			endpoint.username ||
			endpoint.password ||
			endpoint.search ||
			endpoint.hash ||
			hostname === 'example.com' ||
			hostname.endsWith('.example.com')
		) {
			return null;
		}
		return endpoint;
	} catch {
		return null;
	}
}

/** Read the feature gate without introducing a runtime dependency on PlantGeo. */
export function readPlantGeoConfiguration(environment: PlantGeoEnvironment): PlantGeoConfiguration {
	if (environment.PLANTGEO_INTEGRATION_ENABLED !== 'true') {
		return { status: 'disabled', reason: 'feature-disabled' };
	}

	const endpointValue = configuredValue(environment.PLANTGEO_EVENTS_ENDPOINT);
	if (!endpointValue) {
		return { status: 'disabled', reason: 'missing-events-endpoint' };
	}

	const eventsEndpoint = parseEventsEndpoint(endpointValue);
	if (!eventsEndpoint) {
		return { status: 'disabled', reason: 'invalid-events-endpoint' };
	}

	const serviceIdentity = configuredValue(environment.PLANTGEO_SERVICE_IDENTITY);
	if (!serviceIdentity) {
		return { status: 'disabled', reason: 'missing-service-identity' };
	}
	if (!serviceIdentityPattern.test(serviceIdentity)) {
		return { status: 'disabled', reason: 'invalid-service-identity' };
	}

	const apiToken = configuredSecret(environment.PLANTGEO_API_TOKEN);
	if (!apiToken) {
		return { status: 'disabled', reason: 'missing-api-token' };
	}

	const identifierHashSecret = configuredSecret(environment.PLANTGEO_IDENTIFIER_HASH_SECRET);
	if (!identifierHashSecret) {
		return { status: 'disabled', reason: 'missing-identifier-hash-secret' };
	}

	return { status: 'enabled', eventsEndpoint, serviceIdentity, apiToken, identifierHashSecret };
}

/** Read the inbound catalog gate separately from the outbound event integration. */
export function readPlantGeoCatalogReadConfiguration(
	environment: PlantGeoCatalogReadEnvironment
): PlantGeoCatalogReadConfiguration {
	if (environment.PLANTGEO_CATALOG_READ_ENABLED !== 'true') {
		return { status: 'disabled', reason: 'catalog-read-disabled' };
	}

	const serviceIdentity = configuredValue(environment.PLANTGEO_SERVICE_IDENTITY);
	if (!serviceIdentity) {
		return { status: 'disabled', reason: 'missing-service-identity' };
	}
	if (!serviceIdentityPattern.test(serviceIdentity)) {
		return { status: 'disabled', reason: 'invalid-service-identity' };
	}

	const accessToken = configuredSecret(environment.PLANTGEO_CATALOG_READ_TOKEN);
	if (!accessToken) {
		return { status: 'disabled', reason: 'missing-catalog-read-token' };
	}

	return { status: 'enabled', serviceIdentity, accessToken };
}

export function getPlantGeoConfiguration(): PlantGeoConfiguration {
	return readPlantGeoConfiguration(env);
}

export function getPlantGeoCatalogReadConfiguration(): PlantGeoCatalogReadConfiguration {
	return readPlantGeoCatalogReadConfiguration(env);
}

export function isPlantGeoIntegrationEnabled(): boolean {
	return getPlantGeoConfiguration().status === 'enabled';
}
