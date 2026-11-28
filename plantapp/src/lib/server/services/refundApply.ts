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
		listReversals: (
			transferId: string,
			params: { limit?: number; starting_after?: string }
		) => Promise<{
			data: { id: string; amount: number; metadata?: Record<string, string> | null }[];
			has_more: boolean;
		}>;
	};
};

/** Refund debt reserved for a Stripe reversal. Payout netting skips it until the outcome is recorded. */
type PendingReversal = {
	earningId: string;
	sellerId: number;
	currency: string;
	transferId: string;
	transferAmountMinor: number;
	reservedMinor: number;
};

/**
 * Record a refund or dispute. Stripe is called only when a reversal client is passed.
 * Phase 1, one transaction under a row lock on the order: concurrent webhooks for the charge serialize, and money
 * owed back by an already-paid seller is written as RESERVED debt (`:debt-reserved:`), which payout netting skips.
 * Phase 2, per reservation, under the seller's payout-account lock (the one runSellerTransfers takes): reverse at
 * Stripe and record the outcome. Success settles the reservation; confirmed failure releases it as ordinary
 * nettable debt exactly once; an unknown outcome leaves it reserved and fails the webhook so it is retried.
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

			// With a Stripe client the debt is reserved for reversal; without one it is plain nettable debt.
			const reservedReference = `seller-earning:${earning.id}:debt-reserved:${sourceKey}`;
			const plainReference = `seller-earning:${earning.id}:debt:${sourceKey}`;
			if (clawback > 0 && transfer) {
				await tx
					.insert(table.sellerEarningEvent)
					.values({
						id: crypto.randomUUID(),
						earningId: earning.id,
						eventType: 'debt',
						amountDeltaMinor: clawback,
						currency: earning.currency,
						eventReference: client ? reservedReference : plainReference,
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

			// A reservation (this delivery's or an earlier one's) without an outcome still needs one.
			const reservation = events.find((row) => row.eventReference === reservedReference);
			const reservedMinor = reservation ? reservation.amount : client && transfer ? clawback : 0;
			const hasOutcome = events.some(
				(row) =>
					row.eventReference === `seller-earning:${earning.id}:reversed-at-stripe:${sourceKey}` ||
					row.eventReference === `seller-earning:${earning.id}:debt-released:${sourceKey}`
			);
			if (transfer?.stripeTransferId && reservedMinor > 0 && !hasOutcome) {
				pendingReversals.push({
					earningId: earning.id,
					sellerId: earning.sellerId,
					currency: earning.currency,
					transferId: transfer.stripeTransferId,
					transferAmountMinor: transfer.amountMinor,
					reservedMinor
				});
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

	for (const work of pendingReversals) await settleReservedDebt(client, work, sourceKey, now);
	return 'processed';
}

/** Phase 2 for one reservation. Holds the seller's payout-account lock, so a payout run cannot net this debt meanwhile. */
async function settleReservedDebt(
	client: ReversalClient | null,
	work: PendingReversal,
	sourceKey: string,
	now: Date
): Promise<void> {
	const reservedReference = `seller-earning:${work.earningId}:debt-reserved:${sourceKey}`;
	await db.transaction(async (tx) => {
		await tx
			.select({ id: table.payoutAccount.id })
			.from(table.payoutAccount)
			.where(eq(table.payoutAccount.sellerId, work.sellerId))
			.for('update');
		const events = await tx
			.select({
				eventType: table.sellerEarningEvent.eventType,
				amount: table.sellerEarningEvent.amountDeltaMinor,
				eventReference: table.sellerEarningEvent.eventReference,
				stripeReversalId: table.sellerEarningEvent.stripeReversalId
			})
			.from(table.sellerEarningEvent)
			.where(eq(table.sellerEarningEvent.earningId, work.earningId));
		const settledReference = `seller-earning:${work.earningId}:reversed-at-stripe:${sourceKey}`;
		const releasedReference = `seller-earning:${work.earningId}:debt-released:${sourceKey}`;
		if (
			events.some(
				(row) => row.eventReference === settledReference || row.eventReference === releasedReference
			) ||
			!events.some((row) => row.eventReference === reservedReference)
		) {
			return;
		}

		const reversedAtStripe = events
			.filter((row) => row.eventType === 'reversed' && row.stripeReversalId)
			.reduce((sum, row) => sum + Math.abs(row.amount), 0);
		const reverseMinor = client
			? Math.min(work.reservedMinor, Math.max(work.transferAmountMinor - reversedAtStripe, 0))
			: 0;

		let recovered: { id: string; amount: number } | null = null;
		if (client && reverseMinor > 0) {
			const key = `reversal:${work.earningId}:${sourceKey}`;
			try {
				const created = await client.transfers.createReversal(
					work.transferId,
					{ amount: reverseMinor, metadata: { earning_id: work.earningId, source: sourceKey } },
					{ idempotencyKey: key }
				);
				recovered = { id: created.id, amount: reverseMinor };
			} catch (error) {
				// Unknown outcome: ask Stripe. If it cannot answer, stay reserved and let the webhook retry.
				const existing = await findReversal(
					client,
					work.transferId,
					work.earningId,
					sourceKey
				).catch(() => {
					throw error;
				});
				recovered = existing;
			}
		}

		if (recovered) {
			await tx.insert(table.sellerEarningEvent).values({
				id: crypto.randomUUID(),
				earningId: work.earningId,
				eventType: 'reversed',
				amountDeltaMinor: -recovered.amount,
				currency: work.currency,
				eventReference: settledReference,
				reasonCode: 'reversal_of_debt',
				stripeReversalId: recovered.id,
				createdAt: now
			});
		}
		const remainder = work.reservedMinor - (recovered?.amount ?? 0);
		if (remainder > 0) {
			// Not recovered at Stripe: from here it is ordinary debt, netted from the next transfer, once.
			await tx.insert(table.sellerEarningEvent).values({
				id: crypto.randomUUID(),
				earningId: work.earningId,
				eventType: 'debt',
				amountDeltaMinor: remainder,
				currency: work.currency,
				eventReference: releasedReference,
				reasonCode: 'debt_released',
				createdAt: now
			});
		}
	});
}

async function findReversal(
	client: ReversalClient,
	transferId: string,
	earningId: string,
	sourceKey: string
): Promise<{ id: string; amount: number } | null> {
	let startingAfter: string | undefined;
	for (;;) {
		const page = await client.transfers.listReversals(transferId, {
			limit: 100,
			...(startingAfter ? { starting_after: startingAfter } : {})
		});
		const hit = page.data.find(
			(reversal) =>
				reversal.metadata?.earning_id === earningId && reversal.metadata?.source === sourceKey
		);
		if (hit) return { id: hit.id, amount: hit.amount };
		if (!page.has_more || page.data.length === 0) return null;
		startingAfter = page.data[page.data.length - 1].id;
	}
}
