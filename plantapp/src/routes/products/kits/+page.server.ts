import { redirect } from '@sveltejs/kit';
import { legacyCatalogueIndexRedirect } from '../catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const target = legacyCatalogueIndexRedirect(url.pathname);
	redirect(301, target ?? '/products');
};
