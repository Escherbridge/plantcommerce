import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';
import { decimalToMinorUnits } from './checkoutDraft';
import { clawbackDelta, moneyEventFacts, proportionalShare } from './refundClawback';

export type ReversalClient = {
	transfers: {
		createReversal: (
			transferId: string,
			params: { amount?: number; metadata?: Record<string, string> },
			options?: { idempotencyKey?: string }
		) => Promise<{ id: string }>;
	};
};

type PendingReversal = {
	earningId: string;
	currency: string;
	transferId: string;
	amountMinor: number;
	reference: string;
	reasonCode: string;
};

/**
 * Record a refund or dispute. Stripe is called only when a reversal client is passed.
 * All ledger writes happen in one transaction under a row lock on the order, so concurrent webhooks for the
 * same charge serialize and the second one sees the first one's rows. Stripe reversals run after commit, from
 * the recorded debt, so a failed reversal is retried from the ledger instead of being forgotten.
 */
export async function applyMoneyEvent(
	type: string,
	object: unknown,
	client: ReversalClient | null,
	now = new Date()
): Promise<'processed' | 'ignored'> {
	const facts = moneyEventFacts(type, object);
	if (!facts?.chargeId) return 'ignored';
	const [found] = await db
		.select({ id: table.order.id })
		.from(table.order)
		.where(eq(table.order.stripeChargeId, facts.chargeId))
		.limit(1);
	if (!found) return 'ignored';

	if (facts.action === 'close') {
		await db
			.update(table.orderBalanceHold)
			.set({ status: 'closed', closedAt: now })
			.where(eq(table.orderBalanceHold.stripeObjectId, facts.objectId));
		return 'processed';
	}

	// Refunds are cumulative per charge, so the reference carries the running total; a dispute is keyed by its id.
	const sourceKey = facts.cumulative ? `${facts.objectId}:${facts.amountMinor}` : facts.objectId;
	const pendingReversals: PendingReversal[] = [];

	await db.transaction(async (tx) => {
		const [order] = await tx
			.select()
			.from(table.order)
			.where(eq(table.order.id, found.id))
			.for('update');
		await tx
			.insert(table.orderBalanceHold)
			.values({
				id: `hold:${facts.objectId}`,
				orderId: order.id,
				kind: facts.kind,
				status: 'open',
				stripeObjectId: facts.objectId,
				createdAt: now
			})
			.onConflictDoNothing();
		if (facts.action !== 'reverse') return;

		const orderTotalMinor = decimalToMinorUnits(order.totalAmount);
		const earnings = await tx
			.select()
			.from(table.sellerEarning)
			.where(eq(table.sellerEarning.orderId, order.id));
		for (const earning of earnings) {
			const events = await tx
				.select({
					eventType: table.sellerEarningEvent.eventType,
					amount: table.sellerEarningEvent.amountDeltaMinor,
					reasonCode: table.sellerEarningEvent.reasonCode,
					eventReference: table.sellerEarningEvent.eventReference,
					stripeReversalId: table.sellerEarningEvent.stripeReversalId
				})
				.from(table.sellerEarningEvent)
				.where(eq(table.sellerEarningEvent.earningId, earning.id));
			// Only clawbacks count: 'reversed' for a refund or chargeback, and 'debt' recorded for one.
			// Fee debt, settlements and the Stripe reversal of a debt carry other reason codes.
			const clawbacks = events
				.filter(
					(row) =>
						(row.eventType === 'reversed' || row.eventType === 'debt') &&
						(row.reasonCode === 'refund' || row.reasonCode === 'chargeback')
				)
				.map((row) => ({ ...row, taken: Math.abs(row.amount) }));
			const clawback = clawbackDelta({
				baseMinor: earning.netMinor,
				refundedMinor: facts.amountMinor,
				totalMinor: orderTotalMinor,
				alreadyAllMinor: clawbacks.reduce((sum, row) => sum + row.taken, 0),
				alreadyForSourceMinor: clawbacks
					.filter((row) =>
						facts.cumulative
							? row.reasonCode === 'refund'
							: row.eventReference.endsWith(`:${facts.objectId}`)
					)
					.reduce((sum, row) => sum + row.taken, 0)
			});
			const [transfer] = await tx
				.select()
				.from(table.payoutTransfer)
				.where(
					and(
						eq(table.payoutTransfer.earningId, earning.id),
						eq(table.payoutTransfer.status, 'succeeded')
					)
				)
				.limit(1);

			const debtReference = `seller-earning:${earning.id}:debt:${sourceKey}`;
			if (clawback > 0 && transfer) {
				// Already paid out: record debt now (netted from the next transfer); Stripe reversal follows below.
				await tx
					.insert(table.sellerEarningEvent)
					.values({
						id: crypto.randomUUID(),
						earningId: earning.id,
						eventType: 'debt',
						amountDeltaMinor: clawback,
						currency: earning.currency,
						eventReference: debtReference,
						reasonCode: facts.reasonCode,
						createdAt: now
					})
					.onConflictDoNothing();
			} else if (clawback > 0) {
				await tx
					.insert(table.sellerEarningEvent)
					.values({
						id: crypto.randomUUID(),
						earningId: earning.id,
						eventType: 'reversed',
						amountDeltaMinor: -clawback,
						currency: earning.currency,
						eventReference: `seller-earning:${earning.id}:reversed:${sourceKey}`,
						reasonCode: facts.reasonCode,
						createdAt: now
					})
					.onConflictDoNothing();
			}

			// Reverse at Stripe from the recorded debt of this very event, once, capped at what the transfer sent.
			const recordedDebt = events.find((row) => row.eventReference === debtReference);
			const debtMinor = recordedDebt
				? recordedDebt.amount
				: clawback > 0 && transfer
					? clawback
					: 0;
			const alreadyReversed = events.some(
				(row) => row.eventReference === `seller-earning:${earning.id}:debt-reversed:${sourceKey}`
			);
			if (client && transfer?.stripeTransferId && debtMinor > 0 && !alreadyReversed) {
				const reversedAtStripe = events
					.filter((row) => row.eventType === 'reversed' && row.stripeReversalId)
					.reduce((sum, row) => sum + Math.abs(row.amount), 0);
				const reverseMinor = Math.min(
					debtMinor,
					Math.max(transfer.amountMinor - reversedAtStripe, 0)
				);
				if (reverseMinor > 0) {
					pendingReversals.push({
						earningId: earning.id,
						currency: earning.currency,
						transferId: transfer.stripeTransferId,
						amountMinor: reverseMinor,
						reference: `seller-earning:${earning.id}:${sourceKey}`,
						reasonCode: facts.reasonCode
					});
				}
			}

			const feeDebt = facts.sellerPaysFee
				? proportionalShare(
						facts.feeMinor,
						earning.lineTotalMinor,
						orderTotalMinor || earning.lineTotalMinor
					)
				: 0;
			if (feeDebt > 0) {
				await tx
					.insert(table.sellerEarningEvent)
					.values({
						id: crypto.randomUUID(),
						earningId: earning.id,
						eventType: 'debt',
						amountDeltaMinor: feeDebt,
						currency: earning.currency,
						eventReference: `seller-earning:${earning.id}:debt-fee:${facts.objectId}`,
						reasonCode: 'dispute_fee',
						createdAt: now
					})
					.onConflictDoNothing();
			}
		}

		const commissions = await tx
			.select()
			.from(table.affiliateCommissionLedger)
			.where(eq(table.affiliateCommissionLedger.sourceOrderId, order.id));
		for (const commission of commissions) {
			const reversals = await tx
				.select({
					amount: table.affiliateCommissionLedgerEvent.amountDeltaMinor,
					reasonCode: table.affiliateCommissionLedgerEvent.reasonCode,
					eventReference: table.affiliateCommissionLedgerEvent.eventReference
				})
				.from(table.affiliateCommissionLedgerEvent)
				.where(
					and(
						eq(table.affiliateCommissionLedgerEvent.commissionId, commission.id),
						eq(table.affiliateCommissionLedgerEvent.eventType, 'reversed')
					)
				);
			const portion = clawbackDelta({
				baseMinor: commission.quotedAmountMinor,
				refundedMinor: facts.amountMinor,
				totalMinor: orderTotalMinor,
				alreadyForSourceMinor: reversals
					.filter((row) =>
						facts.cumulative
							? row.reasonCode === 'refund'
							: row.eventReference.endsWith(`:${facts.objectId}`)
					)
					.reduce((sum, row) => sum + Math.abs(row.amount), 0),
				alreadyAllMinor: reversals.reduce((sum, row) => sum + Math.abs(row.amount), 0)
			});
			if (portion <= 0) continue;
			// recordReversal takes its own row lock on the commission.
			await AffiliateCommissionService.recordReversal(tx, {
				commissionId: commission.id,
				amountMinor: portion,
				eventReference: `commission:${commission.id}:reversal:${facts.reasonCode}:${sourceKey}`,
				reasonCode: facts.reasonCode,
				causationReference: facts.objectId,
				now
			});
		}

		await tx
			.update(table.orderBalanceHold)
			.set({ status: 'closed', closedAt: now })
			.where(eq(table.orderBalanceHold.stripeObjectId, facts.objectId));
	});

	if (client) {
		for (const work of pendingReversals) {
			const reversal = await client.transfers.createReversal(
				work.transferId,
				{
					amount: work.amountMinor,
					metadata: { earning_id: work.earningId, source: sourceKey }
				},
				{ idempotencyKey: `reversal:${work.reference}` }
			);
			// The reversal recovered the money at Stripe, so the debt it was recorded as is settled.
			await db.transaction(async (tx) => {
				await tx
					.insert(table.sellerEarningEvent)
					.values([
						{
							id: crypto.randomUUID(),
							earningId: work.earningId,
							eventType: 'reversed' as const,
							amountDeltaMinor: -work.amountMinor,
							currency: work.currency,
							eventReference: `seller-earning:${work.earningId}:reversed-at-stripe:${sourceKey}`,
							reasonCode: 'reversal_of_debt',
							stripeReversalId: reversal.id,
							createdAt: now
						},
						{
							id: crypto.randomUUID(),
							earningId: work.earningId,
							eventType: 'debt' as const,
							amountDeltaMinor: -work.amountMinor,
							currency: work.currency,
							eventReference: `seller-earning:${work.earningId}:debt-reversed:${sourceKey}`,
							reasonCode: 'debt_settled',
							createdAt: now
						}
					])
					.onConflictDoNothing();
			});
		}
	}
	return 'processed';
}
