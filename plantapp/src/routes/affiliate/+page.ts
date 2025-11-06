import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/loaders/protected';

export const load: PageLoad = async (event) => {
	const user = await getUser(event);

	if (user && (user.role === 'affiliate' || user.role === 'admin')) {
		// User is already an affiliate, redirect to dashboard
		throw redirect(303, '/affiliate/dashboard');
	}

	// User is not an affiliate, redirect to join page
	throw redirect(303, '/affiliate/join');
};
