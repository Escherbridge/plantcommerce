import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { requireAdminUser } from '$lib/server/adminGuard';
import { runHoldRelease } from '$lib/server/services/sellerEarningLedger';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdminUser(locals.user);
	return { summary: null as string | null };
};

export const actions: Actions = {
	default: async ({ locals }) => {
		requireAdminUser(locals.user);
		const result = await runHoldRelease(env);
		if (result.skipped) {
			return { summary: 'Hold check did nothing. The return window is not set.' };
		}
		return {
			summary: `Hold check finished. Orders marked delivered: ${result.delivered}. Earnings released: ${result.released}.`
		};
	}
};
