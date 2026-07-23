import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import type { CommerceMode } from '$lib/commerce/contracts';

export const DEMO_COMMERCE_CONFIRMATION = 'mock-test-data-only';

export type CommerceRuntimeEnvironment = Record<string, string | undefined>;

export class CommerceConfigurationError extends Error {}

function isLoopbackHostname(hostname: string): boolean {
	const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
	return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

function isLoopbackAddress(address: string | undefined): boolean {
	if (!address) return false;
	const normalized = address
		.toLowerCase()
		.replace(/^::ffff:/, '')
		.replace(/^\[|\]$/g, '');
	return normalized === '127.0.0.1' || normalized === '::1';
}

function hasRailwayIdentity(environment: CommerceRuntimeEnvironment): boolean {
	return [
		'RAILWAY_ENVIRONMENT',
		'RAILWAY_ENVIRONMENT_ID',
		'RAILWAY_PROJECT_ID',
		'RAILWAY_SERVICE_ID'
	].some((name) => Boolean(environment[name]?.trim()));
}

/** Resolve a server-owned mode; request input can never select the commerce provider. */
export function resolveCommerceModeFrom(
	environment: CommerceRuntimeEnvironment,
	requestUrl: URL,
	clientAddress?: string
): CommerceMode {
	const configuredMode = environment.AEVANI_COMMERCE_MODE?.trim() || 'database';
	if (configuredMode !== 'database' && configuredMode !== 'demo') {
		throw new CommerceConfigurationError('AEVANI_COMMERCE_MODE must be database or demo');
	}
	if (configuredMode === 'database') return configuredMode;

	if (environment.AEVANI_DEMO_COMMERCE_CONFIRM !== DEMO_COMMERCE_CONFIRMATION) {
		throw new CommerceConfigurationError(
			`Demo commerce requires AEVANI_DEMO_COMMERCE_CONFIRM=${DEMO_COMMERCE_CONFIRMATION}`
		);
	}
	if (hasRailwayIdentity(environment)) {
		throw new CommerceConfigurationError('Demo commerce is prohibited in Railway environments');
	}
	if (!isLoopbackHostname(requestUrl.hostname)) {
		throw new CommerceConfigurationError('Demo commerce accepts loopback requests only');
	}
	if (!isLoopbackAddress(clientAddress)) {
		throw new CommerceConfigurationError('Demo commerce accepts loopback clients only');
	}

	return configuredMode;
}

export function resolveCommerceMode(
	event: Pick<RequestEvent, 'url' | 'getClientAddress'>
): CommerceMode {
	return resolveCommerceModeFrom(env, event.url, event.getClientAddress());
}
