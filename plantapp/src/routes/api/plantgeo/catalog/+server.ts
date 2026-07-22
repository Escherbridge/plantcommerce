import { json, type RequestHandler } from '@sveltejs/kit';
import {
	readPublishedPlantGeoCatalog,
	isPlantGeoCatalogRequestAuthorized
} from '$lib/server/plantgeo/catalog';
import { getPlantGeoCatalogReadConfiguration } from '$lib/server/plantgeo/config';
import { plantGeoContractVersion } from '$lib/server/plantgeo/contracts';

export const GET: RequestHandler = async ({ request }) => {
	const configuration = getPlantGeoCatalogReadConfiguration();
	if (configuration.status !== 'enabled') {
		return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
	}

	if (!isPlantGeoCatalogRequestAuthorized(request.headers, configuration)) {
		return json(
			{ error: 'unauthorized' },
			{
				status: 401,
				headers: {
					'Cache-Control': 'no-store',
					Vary: 'Authorization, X-Aevani-Service-Identity',
					'WWW-Authenticate': 'Bearer realm="aevani-plantgeo"'
				}
			}
		);
	}

	const catalog = readPublishedPlantGeoCatalog();
	if (catalog.status !== 'ready') {
		return json(
			{ contractVersion: plantGeoContractVersion, status: 'unavailable', reason: catalog.reason },
			{
				status: 503,
				headers: {
					'Cache-Control': 'no-store',
					Vary: 'Authorization, X-Aevani-Service-Identity'
				}
			}
		);
	}

	return json(catalog.catalog, {
		headers: {
			'Cache-Control': 'private, no-store',
			Vary: 'Authorization, X-Aevani-Service-Identity'
		}
	});
};
