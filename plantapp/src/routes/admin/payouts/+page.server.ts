import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { getStripeClient } from '$lib/server/stripe';
import { requireAdminUser } from '$lib/server/adminGuard';
import { runAffiliateBatch, runSellerTransfers } from '$lib/server/services/payoutJobs';
import { affiliateBatchGate, sellerTransferGate } from '$lib/server/services/payoutExecution';
import { runHoldRelease } from '$lib/server/services/sellerEarningLedger';

function stripeIfReady(ready: boolean) {
	if (!ready) return null;
	try {
		return getStripeClient();
	} catch {
		return null;
	}
}

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
	},
	transfers: async ({ locals }) => {
		requireAdminUser(locals.user);
		const ready = sellerTransferGate(env) === 'ready';
		const result = await runSellerTransfers(env, stripeIfReady(ready));
		if (result.skipped) return { summary: 'Seller transfers did not run.' };
		return { summary: `Seller transfers created: ${result.transferred}.` };
	},
	batch: async ({ locals }) => {
		requireAdminUser(locals.user);
		const ready = affiliateBatchGate(env).action === 'pay';
		const result = await runAffiliateBatch(env, stripeIfReady(ready));
		if (result.skipped) return { summary: 'Affiliate batch did not run.' };
		return { summary: `Affiliate batches recorded: ${result.batches}.` };
	}
};
