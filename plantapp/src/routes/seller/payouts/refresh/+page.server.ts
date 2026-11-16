import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { runPayoutSetup } from '$lib/server/services/payoutSetupPage';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
	if (locals.user.role !== 'seller') throw redirect(303, '/');
	return runPayoutSetup({ url, user: locals.user, owner: 'seller', action: 'setup' });
};
