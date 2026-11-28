import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';
import {
	affiliateBatchGate,
	payableBalance,
	planSellerTransfer,
	sellerTransferGate
} from './payoutExecution';

export type TransferClient = {
	transfers: {
		create: (
			params: {
				amount: number;
				currency: string;
				destination: string;
				source_transaction?: string;
				transfer_group?: string;
				metadata?: Record<string, string>;
			},
			options?: { idempotencyKey?: string }
		) => Promise<{ id: string }>;
	};
};

/** Pay released seller earnings. Every Stripe call carries a per-earning idempotency key. */
export async function runSellerTransfers(
	source: Record<string, string | undefined>,
	client: TransferClient | null
): Promise<{ skipped: boolean; reason: string; transferred: number }> {
	const gate = sellerTransferGate(source);
	if (gate !== 'ready') return { skipped: true, reason: gate, transferred: 0 };
	if (!client) return { skipped: true, reason: 'no_client', transferred: 0 };

	const released = await db
		.select({
			earningId: table.sellerEarning.id,
			sellerId: table.sellerEarning.sellerId,
			netMinor: table.sellerEarning.netMinor,
			currency: table.sellerEarning.currency,
			orderId: table.sellerEarning.orderId
		})
		.from(table.sellerEarningEvent)
		.innerJoin(table.sellerEarning, eq(table.sellerEarningEvent.earningId, table.sellerEarning.id))
		.where(eq(table.sellerEarningEvent.eventType, 'released'));

	let transferred = 0;
	for (const earning of released) {
		const idempotencyKey = `seller-transfer:${earning.earningId}`;
		const now = new Date();
		const [done] = await db
			.select({ id: table.payoutTransfer.id })
			.from(table.payoutTransfer)
			.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey))
			.limit(1);
		if (done) continue;

		// A dispute or refund opened after release pauses the transfer until it closes.
		const [openHold] = await db
			.select({ id: table.orderBalanceHold.id })
			.from(table.orderBalanceHold)
			.where(
				and(
					eq(table.orderBalanceHold.orderId, earning.orderId),
					eq(table.orderBalanceHold.status, 'open')
				)
			)
			.limit(1);
		if (openHold) continue;

		const [order] = await db
			.select({
				stripeChargeId: table.order.stripeChargeId,
				transferGroup: table.order.transferGroup
			})
			.from(table.order)
			.where(eq(table.order.id, earning.orderId))
			.limit(1);
		const [account] = await db
			.select({
				stripeAccountId: table.payoutAccount.stripeAccountId,
				transfersActive: table.payoutAccount.transfersActive
			})
			.from(table.payoutAccount)
			.where(eq(table.payoutAccount.sellerId, earning.sellerId))
			.limit(1);

		// Retryable skip: the seller can finish onboarding later, so this never blocks a future transfer.
		if (!account?.stripeAccountId || !account.transfersActive || !order?.stripeChargeId) {
			const failureReason = !account?.transfersActive ? 'transfers_inactive' : 'charge_missing';
			await db
				.insert(table.payoutTransfer)
				.values({
					id: crypto.randomUUID(),
					kind: 'seller',
					earningId: earning.earningId,
					amountMinor: earning.netMinor,
					currency: earning.currency,
					status: 'skipped',
					failureReason,
					idempotencyKey: `${idempotencyKey}:skipped`,
					sourceTransaction: order?.stripeChargeId ?? null,
					createdAt: now,
					updatedAt: now
				})
				.onConflictDoUpdate({
					target: table.payoutTransfer.idempotencyKey,
					set: { failureReason, updatedAt: now }
				});
			continue;
		}

		const reversals = await db
			.select({ amount: table.sellerEarningEvent.amountDeltaMinor })
			.from(table.sellerEarningEvent)
			.where(
				and(
					eq(table.sellerEarningEvent.earningId, earning.earningId),
					eq(table.sellerEarningEvent.eventType, 'reversed')
				)
			);
		const [debtRow] = await db
			.select({
				total: sql<string>`COALESCE(SUM(${table.sellerEarningEvent.amountDeltaMinor}), 0)`
			})
			.from(table.sellerEarningEvent)
			.innerJoin(
				table.sellerEarning,
				eq(table.sellerEarningEvent.earningId, table.sellerEarning.id)
			)
			.where(
				and(
					eq(table.sellerEarning.sellerId, earning.sellerId),
					eq(table.sellerEarningEvent.eventType, 'debt')
				)
			);
		const plan = planSellerTransfer({
			netMinor: earning.netMinor,
			ownReversalsMinor: reversals.reduce((sum, row) => sum + Math.abs(row.amount), 0),
			sellerDebtMinor: Number(debtRow?.total ?? 0)
		});
		const settleDebt = async (tx: any) => {
			if (plan.debtAppliedMinor <= 0) return;
			await tx
				.insert(table.sellerEarningEvent)
				.values({
					id: crypto.randomUUID(),
					earningId: earning.earningId,
					eventType: 'debt',
					amountDeltaMinor: -plan.debtAppliedMinor,
					currency: earning.currency,
					eventReference: `seller-earning:${earning.earningId}:debt-settled`,
					reasonCode: 'debt_settled',
					createdAt: now
				})
				.onConflictDoNothing();
		};

		// Permanent: fully reversed or fully absorbed by debt. Stored under the main key so it is never retried.
		if (plan.permanent) {
			await db.transaction(async (tx) => {
				await settleDebt(tx);
				await tx
					.insert(table.payoutTransfer)
					.values({
						id: crypto.randomUUID(),
						kind: 'seller',
						earningId: earning.earningId,
						amountMinor: 0,
						currency: earning.currency,
						status: 'skipped',
						failureReason: 'not_payable',
						idempotencyKey,
						sourceTransaction: order.stripeChargeId,
						createdAt: now,
						updatedAt: now
					})
					.onConflictDoNothing();
			});
			continue;
		}

		let transfer: { id: string };
		try {
			transfer = await client.transfers.create(
				{
					amount: plan.payMinor,
					currency: earning.currency.toLowerCase(),
					destination: account.stripeAccountId,
					source_transaction: order.stripeChargeId,
					...(order.transferGroup ? { transfer_group: order.transferGroup } : {}),
					metadata: {
						earning_id: earning.earningId,
						order_id: String(earning.orderId)
					}
				},
				{ idempotencyKey }
			);
		} catch {
			await db.insert(table.payoutTransfer).values({
				id: crypto.randomUUID(),
				kind: 'seller',
				earningId: earning.earningId,
				stripeAccountId: account.stripeAccountId,
				amountMinor: plan.payMinor,
				currency: earning.currency,
				status: 'failed',
				failureReason: 'transfer_failed',
				idempotencyKey: `${idempotencyKey}:failed:${crypto.randomUUID()}`,
				sourceTransaction: order.stripeChargeId,
				createdAt: now,
				updatedAt: now
			});
			continue;
		}

		// Stripe holds the money now, so a failure here must be loud rather than recorded as a failed transfer.
		// Re-running inside Stripe's 24h idempotency window returns this same transfer.
		await db.transaction(async (tx) => {
			await tx
				.insert(table.payoutTransfer)
				.values({
					id: crypto.randomUUID(),
					kind: 'seller',
					earningId: earning.earningId,
					stripeAccountId: account.stripeAccountId,
					amountMinor: plan.payMinor,
					currency: earning.currency,
					status: 'succeeded',
					idempotencyKey,
					stripeTransferId: transfer.id,
					sourceTransaction: order.stripeChargeId,
					createdAt: now,
					updatedAt: now
				})
				.onConflictDoNothing();
			await tx
				.insert(table.sellerEarningEvent)
				.values({
					id: crypto.randomUUID(),
					earningId: earning.earningId,
					eventType: 'transferred',
					amountDeltaMinor: 0,
					currency: earning.currency,
					eventReference: `seller-earning:${earning.earningId}:transferred`,
					reasonCode: 'payout',
					stripeTransferId: transfer.id,
					createdAt: now
				})
				.onConflictDoNothing();
			await settleDebt(tx);
		});
		transferred += 1;
	}
	return { skipped: false, reason: 'ready', transferred };
}

/**
 * Group approved, unbatched commission into one batch per affiliate and currency.
 * Claim-then-pay: each commission gets its `payable` event (unique reference, row-locked) in the same
 * transaction as the batch row, so a commission sits in at most one batch however often this runs.
 */
export async function runAffiliateBatch(
	source: Record<string, string | undefined>,
	client: TransferClient | null,
	now = new Date()
): Promise<{ skipped: boolean; reason: string; batches: number }> {
	const gate = affiliateBatchGate(source);
	if (gate.action === 'skip') return { skipped: true, reason: gate.reason, batches: 0 };

	const rows = await db
		.select({
			commissionId: table.affiliateCommissionLedger.id,
			affiliateId: table.affiliateCommissionLedger.affiliateId,
			currency: table.affiliateCommissionLedger.currency,
			eventType: table.affiliateCommissionLedgerEvent.eventType,
			amountDeltaMinor: table.affiliateCommissionLedgerEvent.amountDeltaMinor
		})
		.from(table.affiliateCommissionLedgerEvent)
		.innerJoin(
			table.affiliateCommissionLedger,
			eq(table.affiliateCommissionLedgerEvent.commissionId, table.affiliateCommissionLedger.id)
		);

	const grouped = new Map<string, typeof rows>();
	for (const row of rows) {
		const list = grouped.get(row.commissionId) ?? [];
		list.push(row);
		grouped.set(row.commissionId, list);
	}
	const totals = new Map<
		string,
		{ affiliateId: number; currency: string; total: number; ids: string[] }
	>();
	for (const [commissionId, events] of grouped) {
		const net = payableBalance(
			events.map((event) => ({
				eventType: event.eventType,
				amountDeltaMinor: event.amountDeltaMinor
			}))
		);
		if (net === null) continue;
		const first = events[0];
		const key = `${first.affiliateId}:${first.currency}`;
		const current = totals.get(key) ?? {
			affiliateId: first.affiliateId,
			currency: first.currency,
			total: 0,
			ids: []
		};
		current.total += net;
		current.ids.push(commissionId);
		totals.set(key, current);
	}

	let batches = 0;
	for (const total of totals.values()) {
		if (total.total < gate.minimumMinor) continue;
		const batchId = crypto.randomUUID();
		const needsApproval = gate.needsApproval(total.total);
		try {
			await db.transaction(async (tx) => {
				await tx.insert(table.affiliatePayoutBatch).values({
					id: batchId,
					currency: total.currency,
					totalMinor: total.total,
					status: needsApproval ? 'pending_approval' : 'approved',
					createdAt: now,
					approvedAt: needsApproval ? null : now
				});
				const payout = await AffiliateCommissionService.createPayoutInstruction(tx, {
					affiliateId: total.affiliateId,
					payoutReference: `batch:${batchId}`,
					currency: total.currency,
					amountMinor: total.total,
					now
				});
				for (const commissionId of total.ids) {
					await AffiliateCommissionService.recordLifecycleEvent(tx, {
						commissionId,
						eventType: 'payable',
						eventReference: `commission:${commissionId}:payable`,
						payoutId: payout.id,
						causationReference: `batch:${batchId}`,
						now
					});
				}
			});
		} catch (error) {
			// Another run claimed one of these commissions first. Nothing was written; the next run re-reads.
			console.error('[Affiliate batch] Claim rolled back', error);
			continue;
		}
		batches += 1;
	}

	if (client) {
		const approved = await db
			.select({ id: table.affiliatePayoutBatch.id })
			.from(table.affiliatePayoutBatch)
			.where(eq(table.affiliatePayoutBatch.status, 'approved'));
		for (const batch of approved) await payApprovedAffiliateBatch(client, batch.id, now);
	}
	return { skipped: false, reason: 'ready', batches };
}

/**
 * Send one approved batch. The amount is recomputed from the ledger, so a refund after the claim shrinks
 * the transfer, and it is never above the approved total. Fully reversed commissions are not marked paid.
 */
export async function payApprovedAffiliateBatch(
	client: TransferClient,
	batchId: string,
	now = new Date()
): Promise<'paid' | 'not_approved' | 'no_account' | 'nothing_due'> {
	const [batch] = await db
		.select()
		.from(table.affiliatePayoutBatch)
		.where(eq(table.affiliatePayoutBatch.id, batchId))
		.limit(1);
	if (!batch || batch.status !== 'approved') return 'not_approved';
	const [payout] = await db
		.select()
		.from(table.affiliatePayout)
		.where(eq(table.affiliatePayout.payoutReference, `batch:${batchId}`))
		.limit(1);
	if (!payout) return 'not_approved';

	const events = await db
		.select({
			commissionId: table.affiliateCommissionLedgerEvent.commissionId,
			eventType: table.affiliateCommissionLedgerEvent.eventType,
			amountDeltaMinor: table.affiliateCommissionLedgerEvent.amountDeltaMinor,
			payoutId: table.affiliateCommissionLedgerEvent.payoutId
		})
		.from(table.affiliateCommissionLedgerEvent)
		.innerJoin(
			table.affiliateCommissionLedger,
			eq(table.affiliateCommissionLedgerEvent.commissionId, table.affiliateCommissionLedger.id)
		)
		.where(eq(table.affiliateCommissionLedger.affiliateId, payout.affiliateId));
	const claimed = new Set(
		events
			.filter((event) => event.eventType === 'payable' && event.payoutId === payout.id)
			.map((event) => event.commissionId)
	);
	const dueIds: string[] = [];
	let dueMinor = 0;
	for (const commissionId of claimed) {
		const own = events.filter((event) => event.commissionId === commissionId);
		if (own.some((event) => event.eventType === 'paid')) continue;
		const net = own.reduce((sum, event) => sum + event.amountDeltaMinor, 0);
		if (net <= 0) continue;
		dueIds.push(commissionId);
		dueMinor += net;
	}
	const amountMinor = Math.min(dueMinor, batch.totalMinor);
	if (amountMinor <= 0) {
		await db
			.update(table.affiliatePayoutBatch)
			.set({ status: 'skipped' })
			.where(
				and(
					eq(table.affiliatePayoutBatch.id, batchId),
					eq(table.affiliatePayoutBatch.status, 'approved')
				)
			);
		return 'nothing_due';
	}

	const [account] = await db
		.select({
			stripeAccountId: table.payoutAccount.stripeAccountId,
			transfersActive: table.payoutAccount.transfersActive
		})
		.from(table.payoutAccount)
		.where(
			and(
				eq(table.payoutAccount.affiliateId, payout.affiliateId),
				eq(table.payoutAccount.transfersActive, true)
			)
		)
		.limit(1);
	if (!account?.stripeAccountId) return 'no_account';

	const idempotencyKey = `affiliate-batch:${batchId}:${amountMinor}`;
	const transfer = await client.transfers.create(
		{
			amount: amountMinor,
			currency: batch.currency.toLowerCase(),
			destination: account.stripeAccountId,
			metadata: { batch_id: batchId, affiliate_id: String(payout.affiliateId) }
		},
		{ idempotencyKey }
	);
	// Stripe holds the money now. A failure below is loud; a retry inside 24h returns this same transfer.
	await db.transaction(async (tx) => {
		for (const commissionId of dueIds) {
			await AffiliateCommissionService.recordLifecycleEvent(tx, {
				commissionId,
				eventType: 'paid',
				eventReference: `commission:${commissionId}:paid`,
				payoutId: payout.id,
				causationReference: `batch:${batchId}`,
				now
			});
		}
		await tx
			.insert(table.payoutTransfer)
			.values({
				id: crypto.randomUUID(),
				kind: 'affiliate',
				batchId,
				payoutId: payout.id,
				stripeAccountId: account.stripeAccountId,
				amountMinor,
				currency: batch.currency,
				status: 'succeeded',
				idempotencyKey,
				stripeTransferId: transfer.id,
				createdAt: now,
				updatedAt: now
			})
			.onConflictDoNothing();
		await tx
			.update(table.affiliatePayoutBatch)
			.set({ status: 'paid' })
			.where(eq(table.affiliatePayoutBatch.id, batchId));
	});
	return 'paid';
}

export { payableBalance };
