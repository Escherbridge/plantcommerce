import type { PageServerLoad } from './$types';
import { loadPayoutConsole } from '$lib/server/services/payoutConsole';

export const load: PageServerLoad = async () => {
	const data = await loadPayoutConsole();
	return {
		ok: data.reconciliation.ok,
		mismatches: data.reconciliation.mismatches
	};
};
