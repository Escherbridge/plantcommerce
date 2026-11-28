import type { Actions, PageServerLoad } from './$types';
import { runPayoutSetup } from '$lib/server/services/payoutSetupPage';

/** Stripe sends people here (a GET) when an onboarding link expired. Starting setup is a POST, never a GET side effect. */
export const load: PageServerLoad = async () => ({ notice: null as string | null });

export const actions: Actions = {
	setup: async ({ locals, url }) =>
		runPayoutSetup({ url, user: locals.user, owner: 'affiliate', action: 'setup' })
};
