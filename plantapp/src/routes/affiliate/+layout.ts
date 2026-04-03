import type { LayoutLoad } from './$types';
import { requireAffiliate } from '$lib/loaders/protected';
import { getUser } from '$lib/loaders/protected';

export const load: LayoutLoad = async (event) => {
	const pathname = event.url.pathname;

	// Skip affiliate auth for join page and root redirect page
	if (pathname === '/affiliate/join' || pathname === '/affiliate') {
		const user = await getUser(event);
		return { user };
	}

	const user = await requireAffiliate(event);

	return {
		user
	};
};
