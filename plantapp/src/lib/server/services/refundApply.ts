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

/** Record a refund or dispute. Stripe is called only when a reversal client is passed. */
export async function applyMoneyEvent(
	type: string,
	object: unknown,
	client: ReversalClient | null,
	now = new Date()
): Promise<'processed' | 'ignored'> {
	const facts = moneyEventFacts(type, object);
	if (!facts?.chargeId) return 'ignored';
	const [order] = await db
		.select()
		.from(table.order)
		.where(eq(table.order.stripeChargeId, facts.chargeId))
		.limit(1);
	if (!order) return 'ignored';

	const holdId = `hold:${facts.objectId}`;
	if (facts.action === 'close') {
		await db
			.update(table.orderBalanceHold)
			.set({ status: 'closed', closedAt: now })
			.where(eq(table.orderBalanceHold.stripeObjectId, facts.objectId));
		return 'processed';
	}

	await db
		.insert(table.orderBalanceHold)
		.values({
			id: holdId,
			orderId: order.id,
			kind: facts.kind,
			status: 'open',
			stripeObjectId: facts.objectId,
			createdAt: now
		})
		.onConflictDoNothing();
	if (facts.action !== 'reverse') return 'processed';

	const orderTotalMinor = decimalToMinorUnits(order.totalAmount);
	// Refunds are cumulative per charge, so the reference carries the running total; a dispute is keyed by its id.
	const sourceKey = facts.cumulative ? `${facts.objectId}:${facts.amountMinor}` : facts.objectId;
	const earnings = await db
		.select()
		.from(table.sellerEarning)
		.where(eq(table.sellerEarning.orderId, order.id));
	for (const earning of earnings) {
		const events = await db
			.select({
				eventType: table.sellerEarningEvent.eventType,
				amount: table.sellerEarningEvent.amountDeltaMinor,
				reasonCode: table.sellerEarningEvent.reasonCode,
				eventReference: table.sellerEarningEvent.eventReference,
				stripeReversalId: table.sellerEarningEvent.stripeReversalId
			})
			.from(table.sellerEarningEvent)
			.where(eq(table.sellerEarningEvent.earningId, earning.id));
		// Only clawbacks count: 'reversed', and 'debt' recorded for a refund or chargeback (not fee debt or settlements).
		const clawbacks = events
			.filter(
				(row) =>
					row.eventType === 'reversed' ||
					(row.eventType === 'debt' &&
						(row.reasonCode === 'refund' || row.reasonCode === 'chargeback'))
			)
			.map((row) => ({ ...row, taken: Math.abs(row.amount) }));
		const alreadyAllMinor = clawbacks.reduce((sum, row) => sum + row.taken, 0);
		const alreadyForSourceMinor = clawbacks
			.filter((row) =>
				facts.cumulative
					? row.reasonCode === 'refund'
					: row.eventReference.endsWith(`:${facts.objectId}`)
			)
			.reduce((sum, row) => sum + row.taken, 0);
		const clawback = clawbackDelta({
			baseMinor: earning.netMinor,
			refundedMinor: facts.amountMinor,
			totalMinor: orderTotalMinor,
			alreadyForSourceMinor,
			alreadyAllMinor
		});
		const feeDebt = facts.sellerPaysFee
			? proportionalShare(
					facts.feeMinor,
					earning.lineTotalMinor,
					orderTotalMinor || earning.lineTotalMinor
				)
			: 0;
		const [transfer] = await db
			.select()
			.from(table.payoutTransfer)
			.where(
				and(
					eq(table.payoutTransfer.earningId, earning.id),
					eq(table.payoutTransfer.status, 'succeeded')
				)
			)
			.limit(1);

		let remaining = clawback;
		if (transfer?.stripeTransferId && client && remaining > 0) {
			// A reversal cannot exceed what the transfer actually sent (debt may have shrunk it).
			const alreadyReversedAtStripe = events
				.filter((row) => row.eventType === 'reversed' && row.stripeReversalId)
				.reduce((sum, row) => sum + Math.abs(row.amount), 0);
			const reversible = Math.max(transfer.amountMinor - alreadyReversedAtStripe, 0);
			const reverseMinor = Math.min(remaining, reversible);
			if (reverseMinor > 0) {
				const reference = `seller-earning:${earning.id}:reversed:${sourceKey}`;
				const reversal = await client.transfers.createReversal(
					transfer.stripeTransferId,
					{
						amount: reverseMinor,
						metadata: { earning_id: earning.id, object_id: facts.objectId }
					},
					{ idempotencyKey: reference }
				);
				await db
					.insert(table.sellerEarningEvent)
					.values({
						id: crypto.randomUUID(),
						earningId: earning.id,
						eventType: 'reversed',
						amountDeltaMinor: -reverseMinor,
						currency: earning.currency,
						eventReference: reference,
						reasonCode: facts.reasonCode,
						stripeReversalId: reversal.id,
						createdAt: now
					})
					.onConflictDoNothing();
				remaining -= reverseMinor;
			}
		}
		if (remaining > 0 && transfer) {
			// Already paid out and not reversed at Stripe: record debt, netted from the seller's next transfer.
			await db
				.insert(table.sellerEarningEvent)
				.values({
					id: crypto.randomUUID(),
					earningId: earning.id,
					eventType: 'debt',
					amountDeltaMinor: remaining,
					currency: earning.currency,
					eventReference: `seller-earning:${earning.id}:debt:${sourceKey}`,
					reasonCode: facts.reasonCode,
					createdAt: now
				})
				.onConflictDoNothing();
		} else if (remaining > 0) {
			await db
				.insert(table.sellerEarningEvent)
				.values({
					id: crypto.randomUUID(),
					earningId: earning.id,
					eventType: 'reversed',
					amountDeltaMinor: -remaining,
					currency: earning.currency,
					eventReference: `seller-earning:${earning.id}:reversed:${sourceKey}`,
					reasonCode: facts.reasonCode,
					createdAt: now
				})
				.onConflictDoNothing();
		}
		if (feeDebt > 0) {
			await db
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

	const commissions = await db
		.select()
		.from(table.affiliateCommissionLedger)
		.where(eq(table.affiliateCommissionLedger.sourceOrderId, order.id));
	await db.transaction(async (tx) => {
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
			await AffiliateCommissionService.recordReversal(tx, {
				commissionId: commission.id,
				amountMinor: portion,
				eventReference: `commission:${commission.id}:reversal:${facts.reasonCode}:${sourceKey}`,
				reasonCode: facts.reasonCode,
				causationReference: facts.objectId,
				now
			});
		}
	});
	if (facts.action === 'reverse') {
		await db
			.update(table.orderBalanceHold)
			.set({ status: 'closed', closedAt: now })
			.where(eq(table.orderBalanceHold.stripeObjectId, facts.objectId));
	}
	return 'processed';
}
