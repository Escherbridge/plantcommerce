import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import {
	addBuckets,
	affiliateCommissionBuckets,
	emptyBuckets,
	reconcileLedgers,
	sellerEarningBuckets,
	type MoneyBuckets
} from './ledgerBuckets';

export type PayoutConsole = {
	buckets: MoneyBuckets;
	debtMinor: number;
	accountsNeedingSetup: { id: string; ownerType: string; transfersActive: boolean }[];
	failedTransfers: {
		id: string;
		kind: string;
		amountMinor: number;
		failureReason: string | null;
	}[];
	pendingBatches: { id: string; totalMinor: number; currency: string }[];
	reconciliation: { ok: boolean; mismatches: string[] };
};

function groupEvents<T extends { id: string; eventType: string; amountDeltaMinor: number }>(
	rows: T[]
): Map<string, { eventType: string; amountDeltaMinor: number }[]> {
	const grouped = new Map<string, { eventType: string; amountDeltaMinor: number }[]>();
	for (const row of rows) {
		const list = grouped.get(row.id) ?? [];
		list.push({ eventType: row.eventType, amountDeltaMinor: row.amountDeltaMinor });
		grouped.set(row.id, list);
	}
	return grouped;
}

export async function loadPayoutConsole(): Promise<PayoutConsole> {
	const sellerRows = await db
		.select({
			id: table.sellerEarning.id,
			eventType: table.sellerEarningEvent.eventType,
			amountDeltaMinor: table.sellerEarningEvent.amountDeltaMinor,
			stripeReversalId: table.sellerEarningEvent.stripeReversalId
		})
		.from(table.sellerEarningEvent)
		.innerJoin(table.sellerEarning, eq(table.sellerEarningEvent.earningId, table.sellerEarning.id));
	let buckets = emptyBuckets();
	let debtMinor = 0;
	const transferredEarningIds: string[] = [];
	const reversedWithStripeIds: string[] = [];
	const byEarning = groupEvents(
		sellerRows.map((row) => ({
			id: row.id,
			eventType: row.eventType,
			amountDeltaMinor: row.amountDeltaMinor
		}))
	);
	for (const [earningId, events] of byEarning) {
		buckets = addBuckets(buckets, sellerEarningBuckets(events));
		for (const event of events) {
			if (event.eventType === 'debt') debtMinor += event.amountDeltaMinor;
			if (event.eventType === 'transferred') transferredEarningIds.push(earningId);
		}
	}
	for (const row of sellerRows) {
		if (row.eventType === 'reversed' && row.stripeReversalId) {
			reversedWithStripeIds.push(row.stripeReversalId);
		}
	}

	const affiliateRows = await db
		.select({
			id: table.affiliateCommissionLedger.id,
			eventType: table.affiliateCommissionLedgerEvent.eventType,
			amountDeltaMinor: table.affiliateCommissionLedgerEvent.amountDeltaMinor
		})
		.from(table.affiliateCommissionLedgerEvent)
		.innerJoin(
			table.affiliateCommissionLedger,
			eq(table.affiliateCommissionLedgerEvent.commissionId, table.affiliateCommissionLedger.id)
		);
	for (const events of groupEvents(affiliateRows).values()) {
		buckets = addBuckets(buckets, affiliateCommissionBuckets(events));
	}

	const accounts = await db
		.select({
			id: table.payoutAccount.id,
			ownerType: table.payoutAccount.ownerType,
			transfersActive: table.payoutAccount.transfersActive,
			stripeAccountId: table.payoutAccount.stripeAccountId
		})
		.from(table.payoutAccount);
	const transfers = await db
		.select({
			id: table.payoutTransfer.id,
			earningId: table.payoutTransfer.earningId,
			kind: table.payoutTransfer.kind,
			amountMinor: table.payoutTransfer.amountMinor,
			status: table.payoutTransfer.status,
			failureReason: table.payoutTransfer.failureReason
		})
		.from(table.payoutTransfer);
	const batches = await db
		.select({
			id: table.affiliatePayoutBatch.id,
			totalMinor: table.affiliatePayoutBatch.totalMinor,
			currency: table.affiliatePayoutBatch.currency,
			status: table.affiliatePayoutBatch.status
		})
		.from(table.affiliatePayoutBatch);

	const succeededEarningIds = transfers
		.filter((row) => row.kind === 'seller' && row.status === 'succeeded' && row.earningId)
		.map((row) => row.earningId as string);

	return {
		buckets,
		debtMinor,
		accountsNeedingSetup: accounts
			.filter((row) => !row.stripeAccountId || !row.transfersActive)
			.map((row) => ({
				id: row.id,
				ownerType: row.ownerType,
				transfersActive: row.transfersActive
			})),
		failedTransfers: transfers
			.filter((row) => row.status === 'failed' || row.status === 'skipped')
			.map((row) => ({
				id: row.id,
				kind: row.kind,
				amountMinor: row.amountMinor,
				failureReason: row.failureReason
			})),
		pendingBatches: batches
			.filter((row) => row.status === 'pending_approval')
			.map((row) => ({ id: row.id, totalMinor: row.totalMinor, currency: row.currency })),
		reconciliation: reconcileLedgers({
			transferredEarningIds,
			succeededEarningIds,
			reversedWithStripeIds,
			recordedReversalIds: reversedWithStripeIds
		})
	};
}

export async function loadSellerBuckets(userId: string): Promise<MoneyBuckets | null> {
	const [seller] = await db
		.select({ id: table.seller.id })
		.from(table.seller)
		.where(eq(table.seller.userId, userId))
		.limit(1);
	if (!seller) return emptyBuckets();
	const rows = await db
		.select({
			id: table.sellerEarning.id,
			eventType: table.sellerEarningEvent.eventType,
			amountDeltaMinor: table.sellerEarningEvent.amountDeltaMinor
		})
		.from(table.sellerEarningEvent)
		.innerJoin(table.sellerEarning, eq(table.sellerEarningEvent.earningId, table.sellerEarning.id))
		.where(eq(table.sellerEarning.sellerId, seller.id));
	let buckets = emptyBuckets();
	for (const events of groupEvents(rows).values()) {
		buckets = addBuckets(buckets, sellerEarningBuckets(events));
	}
	return buckets;
}

export async function loadAffiliateBuckets(affiliateId: number): Promise<MoneyBuckets> {
	const rows = await db
		.select({
			id: table.affiliateCommissionLedger.id,
			eventType: table.affiliateCommissionLedgerEvent.eventType,
			amountDeltaMinor: table.affiliateCommissionLedgerEvent.amountDeltaMinor
		})
		.from(table.affiliateCommissionLedgerEvent)
		.innerJoin(
			table.affiliateCommissionLedger,
			eq(table.affiliateCommissionLedgerEvent.commissionId, table.affiliateCommissionLedger.id)
		)
		.where(eq(table.affiliateCommissionLedger.affiliateId, affiliateId));
	let buckets = emptyBuckets();
	for (const events of groupEvents(rows).values()) {
		buckets = addBuckets(buckets, affiliateCommissionBuckets(events));
	}
	return buckets;
}

export function consoleCsv(consoleData: PayoutConsole): string {
	const lines = [
		'section,id,detail,amount_minor',
		`buckets,pending,,${consoleData.buckets.pendingMinor}`,
		`buckets,held,,${consoleData.buckets.heldMinor}`,
		`buckets,released,,${consoleData.buckets.releasedMinor}`,
		`buckets,paid,,${consoleData.buckets.paidMinor}`,
		`debt,seller,,${consoleData.debtMinor}`
	];
	for (const account of consoleData.accountsNeedingSetup) {
		lines.push(`account,${account.id},${account.ownerType},`);
	}
	for (const transfer of consoleData.failedTransfers) {
		lines.push(
			`transfer,${transfer.id},${transfer.failureReason ?? transfer.kind},${transfer.amountMinor}`
		);
	}
	for (const batch of consoleData.pendingBatches) {
		lines.push(`batch,${batch.id},pending_approval,${batch.totalMinor}`);
	}
	for (const mismatch of consoleData.reconciliation.mismatches) {
		lines.push(`reconciliation,,${mismatch.replaceAll(',', ';')},`);
	}
	return `${lines.join('\n')}\n`;
}
