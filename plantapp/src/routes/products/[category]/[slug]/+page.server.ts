import { loadProductDetail } from '$lib/server/catalog/publicStorefront';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => loadProductDetail(params.slug, params.category);
