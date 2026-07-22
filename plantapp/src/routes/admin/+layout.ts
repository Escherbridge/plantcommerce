import type { LayoutLoad } from './$types';
import { requireAdmin } from '$lib/loaders/protected';

export const load: LayoutLoad = async (event) => {
	const user = await requireAdmin(event);

	return {
		user
	};
};
