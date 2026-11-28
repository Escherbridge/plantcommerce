import type { PageLoad } from './$types';
import { getUser } from '$lib/loaders/protected';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const verificationEmailAvailable = event.data.verificationEmailAvailable;
	const user = await getUser(event);
	if (!user) {
		return { user: null, affiliate: null, verificationEmailAvailable };
	}

	try {
		const affiliate = await createCallerClient(event.fetch).affiliate.getMyAffiliate.query();
		return { user, affiliate, verificationEmailAvailable };
	} catch {
		return { user, affiliate: null, verificationEmailAvailable };
	}
};
