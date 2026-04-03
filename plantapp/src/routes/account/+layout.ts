import type { LayoutLoad } from './$types';
import { requireAuth } from '$lib/loaders/protected';

export const load: LayoutLoad = async (event) => {
	const user = await requireAuth(event);

	return {
		user
	};
};
