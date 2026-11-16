import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { runHoldRelease } from '$lib/server/services/sellerEarningLedger';

export const load: PageServerLoad = async () => {
	return { summary: null as string | null };
};

export const actions: Actions = {
	default: async () => {
		const result = await runHoldRelease(env);
		if (result.skipped) {
			return { summary: 'Hold check did nothing. The return window is not set.' };
		}
		return {
			summary: `Hold check finished. Orders marked delivered: ${result.delivered}. Earnings released: ${result.released}.`
		};
	}
};
