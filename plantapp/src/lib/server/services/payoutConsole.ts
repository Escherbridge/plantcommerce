import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { listAllocationsNeedingAction, type AllocationRow } from './refundAllocation';
import { AffiliateCommissionService } from './affiliateCommission';
import { listReservedDebt } from './refundCore';
import { earningBalance } from './sellerLedgerBalance';
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
	/** Debt a payout run can net. Reserved refund debt waiting on Stripe is counted separately. */
	debtMinor: number;
	reservedDebt: { count: number; totalMinor: number; oldestAt: Date | null };
	allocations: AllocationRow[];
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
			earningId: table.sellerEarningEvent.earningId,
			eventType: table.sellerEarningEvent.eventType,
			amountDeltaMinor: table.sellerEarningEvent.amountDeltaMinor,
			reasonCode: table.sellerEarningEvent.reasonCode,
			eventReference: table.sellerEarningEvent.eventReference,
			creditsReference: table.sellerEarningEvent.creditsReference,
			stripeReversalId: table.sellerEarningEvent.stripeReversalId
		})
		.from(table.sellerEarningEvent);
	let buckets = emptyBuckets();
	let debtMinor = 0;
	const transferredEarningIds: string[] = [];
	const reversedWithStripeIds: string[] = [];
	const byEarning = new Map<string, typeof sellerRows>();
	for (const row of sellerRows) {
		const list = byEarning.get(row.earningId) ?? [];
		list.push(row);
		byEarning.set(row.earningId, list);
	}
	for (const [earningId, events] of byEarning) {
		buckets = addBuckets(buckets, sellerEarningBuckets(events));
		// Collectable debt only: reserved refund debt waiting on Stripe is reported separately.
		debtMinor += earningBalance(events).nettableDebtMinor;
		if (events.some((event) => event.eventType === 'transferred'))
			transferredEarningIds.push(earningId);
	}
	for (const row of sellerRows) {
		if (row.eventType === 'reversed' && row.stripeReversalId) {
			reversedWithStripeIds.push(row.stripeReversalId);
		}
	}

	// The commission tables come from a source-only artifact; with the ledger off they may not exist, so do not read them.
	const affiliateRows = !AffiliateCommissionService.isEnabled()
		? []
		: await db
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

	const reserved = await listReservedDebt();
	const reconciliation = reconcileLedgers({
		transferredEarningIds,
		succeededEarningIds,
		reversedWithStripeIds,
		recordedReversalIds: reversedWithStripeIds
	});
	if (reserved.length > 0) {
		reconciliation.mismatches.push(
			`${reserved.length} refund reversal(s) are reserved and waiting on Stripe.`
		);
		reconciliation.ok = false;
	}
	const allocations = await listAllocationsNeedingAction();
	if (allocations.length > 0) {
		reconciliation.mismatches.push(
			`${allocations.length} partial refund(s) need line allocation; their orders are held.`
		);
		reconciliation.ok = false;
	}

	return {
		buckets,
		debtMinor,
		reservedDebt: {
			count: reserved.length,
			totalMinor: reserved.reduce((sum, row) => sum + row.reservedMinor, 0),
			oldestAt: reserved.length
				? new Date(Math.min(...reserved.map((row) => row.createdAt.getTime())))
				: null
		},
		allocations,
		accountsNeedingSetup: accounts
			.filter((row) => !row.stripeAccountId || !row.transfersActive)
			.map((row) => ({
				id: row.id,
				ownerType: row.ownerType,
				transfersActive: row.transfersActive
			})),
		failedTransfers: transfers
			.filter(
				(row) =>
					row.status === 'failed' ||
					row.status === 'skipped' ||
					(row.status === 'pending' && row.failureReason !== null)
			)
			.map((row) => ({
				id: row.id,
				kind: row.kind,
				amountMinor: row.amountMinor,
				failureReason: row.failureReason
			})),
		pendingBatches: batches
			.filter((row) => row.status === 'pending_approval')
			.map((row) => ({ id: row.id, totalMinor: row.totalMinor, currency: row.currency })),
		reconciliation
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
			earningId: table.sellerEarningEvent.earningId,
			eventType: table.sellerEarningEvent.eventType,
			amountDeltaMinor: table.sellerEarningEvent.amountDeltaMinor,
			reasonCode: table.sellerEarningEvent.reasonCode,
			eventReference: table.sellerEarningEvent.eventReference,
			creditsReference: table.sellerEarningEvent.creditsReference
		})
		.from(table.sellerEarningEvent)
		.innerJoin(table.sellerEarning, eq(table.sellerEarningEvent.earningId, table.sellerEarning.id))
		.where(eq(table.sellerEarning.sellerId, seller.id));
	let buckets = emptyBuckets();
	const grouped = new Map<string, typeof rows>();
	for (const row of rows) {
		const list = grouped.get(row.earningId) ?? [];
		list.push(row);
		grouped.set(row.earningId, list);
	}
	for (const events of grouped.values()) {
		buckets = addBuckets(buckets, sellerEarningBuckets(events));
	}
	return buckets;
}

export async function loadAffiliateBuckets(affiliateId: number): Promise<MoneyBuckets> {
	// Ledger off (the live default): the commission tables may not exist, and there is nothing to show.
	if (!AffiliateCommissionService.isEnabled()) return emptyBuckets();
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
		`debt,seller,,${consoleData.debtMinor}`,
		`reserved_debt,seller,${consoleData.reservedDebt.count} waiting on Stripe,${consoleData.reservedDebt.totalMinor}`
	];
	for (const allocation of consoleData.allocations) {
		lines.push(
			`needs_allocation,${allocation.orderId},${allocation.orderNumber},${allocation.unallocatedMinor}`
		);
	}
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
