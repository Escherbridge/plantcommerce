import type { Actions, PageServerLoad } from './$types';
import { runPayoutSetup } from '$lib/server/services/payoutSetupPage';

export const load: PageServerLoad = async () => {
	return { notice: null as string | null };
};

export const actions: Actions = {
	setup: async ({ locals, url }) =>
		runPayoutSetup({
			url,
			user: locals.user,
			owner: 'affiliate',
			action: 'setup'
		}),
	dashboard: async ({ locals, url }) =>
		runPayoutSetup({
			url,
			user: locals.user,
			owner: 'affiliate',
			action: 'dashboard'
		})
};
