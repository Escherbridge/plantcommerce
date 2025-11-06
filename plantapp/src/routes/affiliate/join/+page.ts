import type { PageLoad } from './$types';
import { getUser } from '$lib/loaders/protected';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const user = await getUser(event);

	if (!user) {
		return {
			user: null,
			isAffiliate: false
		};
	}

	try {
		// Check if user is already an affiliate
		const affiliateData = await trpc(event).affiliate.getMyAffiliate.query();

		return {
			user,
			isAffiliate: !!affiliateData
		};
	} catch (error) {
		return {
			user,
			isAffiliate: false
		};
	}
};
