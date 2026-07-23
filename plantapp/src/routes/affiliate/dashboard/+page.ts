import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { redirect, isRedirect } from '@sveltejs/kit';
import { getUser } from '$lib/loaders/protected';

/** Require an active affiliate (or admin); send non-affiliates to the join landing. */
export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const user = await getUser(event);
		const affiliate = await trpc.affiliate.getMyAffiliate.query();

		if (!affiliate && user?.role !== 'admin') {
			throw redirect(303, '/affiliate/join');
		}

		return { affiliate, isAdmin: user?.role === 'admin' };
	} catch (error) {
		if (isRedirect(error)) throw error;
		console.error('Error loading affiliate dashboard:', error);
		throw redirect(303, '/affiliate/join');
	}
};
