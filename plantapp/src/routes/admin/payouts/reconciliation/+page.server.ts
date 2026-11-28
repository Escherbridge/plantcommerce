import type { PageServerLoad } from './$types';
import { requireAdminUser } from '$lib/server/adminGuard';
import { loadPayoutConsole } from '$lib/server/services/payoutConsole';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdminUser(locals.user);
	const data = await loadPayoutConsole();
	return {
		ok: data.reconciliation.ok,
		mismatches: data.reconciliation.mismatches
	};
};
