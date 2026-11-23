import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';
import { decimalToMinorUnits } from './checkoutDraft';
import { moneyEventFacts, proportionalShare } from './refundClawback';

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
	const earnings = await db
		.select()
		.from(table.sellerEarning)
		.where(eq(table.sellerEarning.orderId, order.id));
	for (const earning of earnings) {
		const clawback = proportionalShare(earning.netMinor, facts.amountMinor, orderTotalMinor);
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
		if (transfer?.stripeTransferId && client && clawback > 0) {
			const reversal = await client.transfers.createReversal(
				transfer.stripeTransferId,
				{
					amount: clawback,
					metadata: { earning_id: earning.id, object_id: facts.objectId }
				},
				{ idempotencyKey: `reversal:${earning.id}:${facts.objectId}` }
			);
			await db
				.insert(table.sellerEarningEvent)
				.values({
					id: crypto.randomUUID(),
					earningId: earning.id,
					eventType: 'reversed',
					amountDeltaMinor: -clawback,
					currency: earning.currency,
					eventReference: `seller-earning:${earning.id}:reversed:${facts.objectId}`,
					reasonCode: facts.reasonCode,
					stripeReversalId: reversal.id,
					createdAt: now
				})
				.onConflictDoNothing();
		} else if (transfer && clawback + feeDebt > 0) {
			await db
				.insert(table.sellerEarningEvent)
				.values({
					id: crypto.randomUUID(),
					earningId: earning.id,
					eventType: 'debt',
					amountDeltaMinor: clawback + feeDebt,
					currency: earning.currency,
					eventReference: `seller-earning:${earning.id}:debt:${facts.objectId}`,
					reasonCode: facts.reasonCode,
					createdAt: now
				})
				.onConflictDoNothing();
		} else if (clawback > 0) {
			await db
				.insert(table.sellerEarningEvent)
				.values({
					id: crypto.randomUUID(),
					earningId: earning.id,
					eventType: 'reversed',
					amountDeltaMinor: -clawback,
					currency: earning.currency,
					eventReference: `seller-earning:${earning.id}:reversed:${facts.objectId}`,
					reasonCode: facts.reasonCode,
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
			const portion = proportionalShare(
				commission.quotedAmountMinor,
				facts.amountMinor,
				orderTotalMinor
			);
			if (portion <= 0) continue;
			await AffiliateCommissionService.recordReversal(tx, {
				commissionId: commission.id,
				amountMinor: portion,
				eventReference: `commission:${commission.id}:reversal:${facts.reasonCode}:${facts.objectId}`,
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
