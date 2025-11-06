import type { PageLoad } from './$types';
import { loadProductsByCategory } from '$lib/loaders/productCategory';

export const load: PageLoad = async (event) => {
	return await loadProductsByCategory(event, 'hydroponics');
};
