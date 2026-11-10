import { json, type RequestHandler } from '@sveltejs/kit';
import {
	PublicCatalogCursorError,
	publicCatalogHeaders,
	readPublicPlantGeoCatalog
} from '$lib/server/plantgeo/publicCatalog';

/** Public allowlisted catalog. No auth. The machine-gated PlantGeo route is unchanged. */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const catalog = await readPublicPlantGeoCatalog(url.searchParams.get('cursor'));
		return json(catalog, { headers: publicCatalogHeaders('public') });
	} catch (error) {
		const headers = publicCatalogHeaders('no-store');
		if (error instanceof PublicCatalogCursorError) {
			return json({ error: 'invalid_cursor' }, { status: 400, headers });
		}
		console.error('Public catalog read failed');
		return json({ error: 'unavailable' }, { status: 503, headers });
	}
};

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, { status: 204, headers: publicCatalogHeaders('no-store') });
};
