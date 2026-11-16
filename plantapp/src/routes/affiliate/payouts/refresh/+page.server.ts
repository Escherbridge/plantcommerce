import type { PageServerLoad } from './$types';
import { runPayoutSetup } from '$lib/server/services/payoutSetupPage';

export const load: PageServerLoad = async ({ locals, url }) => {
	return runPayoutSetup({
		url,
		user: locals.user,
		owner: 'affiliate',
		action: 'setup'
	});
};
