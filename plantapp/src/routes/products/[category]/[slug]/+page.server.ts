import { rewriteProductPageData } from '$lib/catalog/categoryGuides';
import { loadProductDetail } from '$lib/server/catalog/publicStorefront';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) =>
	rewriteProductPageData(await loadProductDetail(params.slug, params.category));
