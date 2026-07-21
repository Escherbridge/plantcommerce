import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Component fixtures are not a production-facing workflow. */
export const load: PageServerLoad = () => {
	throw error(404, 'Not found');
};
