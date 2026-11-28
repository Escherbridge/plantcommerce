import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';
import { decimalToMinorUnits } from './checkoutDraft';
import {
	clawbackEarning,
	reverseCommissions,
	settleReservedDebt,
	type ClawbackContext,
	type PendingReversal,
	type ReversalClient
} from './refundCore';
import { moneyEventFacts } from './refundClawback';
import {
	cancelAllocationForDispute,
	isAmbiguousRefund,
	recordAllocationNeed,
	refundSourceKey,
	resolveAllocationOnFullRefund
} from './refundAllocation';
import { readOptionalWholeDays } from './sellerEarnings';

export type { ReversalClient } from './refundCore';
export { isDefinitiveStripeRefusal } from './refundCore';

/**
 * Record a refund or dispute. Stripe is called only when a reversal client is passed.
 * Phase 1, one transaction under a row lock on the order: concurrent webhooks for the charge serialize, and money
 * owed back by an already-paid seller is written as RESERVED debt (`:debt-reserved:`), which payout netting skips.
 * Phase 2, per reservation (see refundCore.settleReservedDebt): find at Stripe, create if absent, record the
 * outcome under the seller's payout-account lock.
 * A partial refund on an order with more than one seller (house lines count as one) is not allocated here: it is
 * recorded, the order's earnings are held, and an admin assigns it to order lines (refundAllocation.ts).
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
		await db.transaction(async (tx) => {
			const [order] = await tx
				.select({ status: table.order.status })
				.from(table.order)
				.where(eq(table.order.id, found.id))
				.for('update');
			await tx
				.update(table.orderBalanceHold)
				.set({ status: 'closed', closedAt: now })
				.where(eq(table.orderBalanceHold.stripeObjectId, facts.objectId));
			// A dispute that closed in our favour cancels what it left behind (a waiting allocation, or a clawback).
			if (facts.kind === 'dispute') {
				await cancelAllocationForDispute(tx, found.id, facts.objectId, now);
			}
			// While the return window is unset, shipped/delivered approve commission; a hold that blocked that
			// approval releases it here once it closes.
			if (
				(order?.status === 'shipped' || order?.status === 'delivered') &&
				readOptionalWholeDays(env, 'PAYOUT_HOLD_DAYS_AFTER_DELIVERY') === null
			) {
				await AffiliateCommissionService.clearCommissionsForOrder(
					tx,
					found.id,
					`order:${found.id}:hold-closed`,
					now
				);
			}
		});
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
		const closeEventHold = () =>
			tx
				.update(table.orderBalanceHold)
				.set({ status: 'closed', closedAt: now })
				.where(eq(table.orderBalanceHold.stripeObjectId, facts.objectId));

		const items = await tx
			.select({ sellerId: table.orderItem.sellerId })
			.from(table.orderItem)
			.where(eq(table.orderItem.orderId, order.id));
		if (
			isAmbiguousRefund({
				sellerKeys: items.map((item) => item.sellerId ?? 0),
				refundedMinor: facts.amountMinor,
				orderTotalMinor
			})
		) {
			// No allocation policy is invented: hold the earnings, claw back nothing, and ask an admin.
			await recordAllocationNeed(tx, {
				orderId: order.id,
				chargeId: facts.chargeId as string,
				sourceKey: facts.cumulative ? refundSourceKey(facts.chargeId as string) : facts.objectId,
				refundedMinor: facts.amountMinor,
				reasonCode: facts.reasonCode,
				feeMinor: facts.feeMinor,
				sellerPaysFee: facts.sellerPaysFee,
				now
			});
			await closeEventHold();
			return;
		}

		const context: ClawbackContext = {
			refundedMinor: facts.amountMinor,
			totalMinor: orderTotalMinor,
			orderTotalMinor,
			sourceKey,
			objectId: facts.objectId,
			cumulative: facts.cumulative,
			reasonCode: facts.reasonCode,
			feeMinor: facts.feeMinor,
			sellerPaysFee: facts.sellerPaysFee,
			client,
			now
		};
		const earnings = await tx
			.select()
			.from(table.sellerEarning)
			.where(eq(table.sellerEarning.orderId, order.id));
		for (const earning of earnings) {
			const pending = await clawbackEarning(tx, earning, context);
			if (pending) pendingReversals.push(pending);
		}
		await reverseCommissions(tx, order.id, context);
		if (facts.amountMinor >= orderTotalMinor) {
			// A full refund settles any partial refund still waiting for an admin to allocate it.
			await resolveAllocationOnFullRefund(
				tx,
				order.id,
				facts.chargeId as string,
				facts.amountMinor,
				now
			);
		}
		await closeEventHold();
	});

	for (const work of pendingReversals) await settleReservedDebt(client, work, now);
	return 'processed';
}
