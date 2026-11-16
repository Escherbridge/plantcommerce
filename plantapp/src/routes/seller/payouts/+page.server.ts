import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { runPayoutSetup } from '$lib/server/services/payoutSetupPage';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
	if (locals.user.role !== 'seller') throw redirect(303, '/');
	return { notice: null as string | null };
};

export const actions: Actions = {
	setup: async ({ locals, url }) =>
		runPayoutSetup({ url, user: locals.user, owner: 'seller', action: 'setup' }),
	dashboard: async ({ locals, url }) =>
		runPayoutSetup({ url, user: locals.user, owner: 'seller', action: 'dashboard' })
};
