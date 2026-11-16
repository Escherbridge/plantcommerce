import type { PageLoad } from './$types';
import { getUser } from '$lib/loaders/protected';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const user = await getUser(event);
	if (!user) {
		return { user: null, affiliate: null };
	}

	try {
		const affiliate = await createCallerClient(event.fetch).affiliate.getMyAffiliate.query();
		return { user, affiliate };
	} catch {
		return { user, affiliate: null };
	}
};
