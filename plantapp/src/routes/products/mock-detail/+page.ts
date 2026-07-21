import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Retire the legacy mock detail URL without treating a query parameter as catalog evidence.
export const load: PageLoad = async () => {
	throw redirect(307, '/products');
};
