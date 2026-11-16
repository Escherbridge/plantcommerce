import { loadSystemProducts } from '$lib/server/catalog/publicStorefront';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => loadSystemProducts('agroforestry');
