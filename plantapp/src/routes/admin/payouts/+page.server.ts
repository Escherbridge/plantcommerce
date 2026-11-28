import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { getStripeClient } from '$lib/server/stripe';
import { requireAdminUser } from '$lib/server/adminGuard';
import {
	approveAffiliateBatch,
	runAffiliateBatch,
	runSellerTransfers
} from '$lib/server/services/payoutJobs';
import { affiliateBatchGate, sellerTransferGate } from '$lib/server/services/payoutExecution';
import { loadPayoutConsole } from '$lib/server/services/payoutConsole';
import { formatMinor } from '$lib/server/services/ledgerBuckets';
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
	const consoleData = await loadPayoutConsole();
	return {
		summary: null as string | null,
		pending: formatMinor(consoleData.buckets.pendingMinor),
		held: formatMinor(consoleData.buckets.heldMinor),
		released: formatMinor(consoleData.buckets.releasedMinor),
		paid: formatMinor(consoleData.buckets.paidMinor),
		debt: formatMinor(consoleData.debtMinor),
		accountsNeedingSetup: consoleData.accountsNeedingSetup,
		failedTransfers: consoleData.failedTransfers.map((row) => ({
			...row,
			amount: formatMinor(row.amountMinor)
		})),
		pendingBatches: consoleData.pendingBatches.map((row) => ({
			...row,
			amount: formatMinor(row.totalMinor)
		})),
		reconciliationOk: consoleData.reconciliation.ok,
		mismatches: consoleData.reconciliation.mismatches
	};
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
	},
	approve: async ({ request, locals }) => {
		requireAdminUser(locals.user);
		const batchId = (await request.formData()).get('batchId');
		if (typeof batchId !== 'string' || batchId.length === 0) {
			return { summary: 'No batch was selected.' };
		}
		const ready = affiliateBatchGate(env).action === 'pay';
		const result = await approveAffiliateBatch(batchId, env, stripeIfReady(ready));
		if (!result.paid) return { summary: 'Batch recorded. No transfer was sent.' };
		return { summary: 'Batch approved and a transfer was sent.' };
	}
};
