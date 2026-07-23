import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { redirect, isRedirect } from '@sveltejs/kit';

/** Require an active affiliate; send non-affiliates to the join landing. */
export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const affiliate = await trpc.affiliate.getMyAffiliate.query();
		if (!affiliate) throw redirect(303, '/affiliate/join');
		return {};
	} catch (error) {
		if (isRedirect(error)) throw error;
		console.error('Error loading affiliate links page:', error);
		throw redirect(303, '/affiliate/join');
	}
};
