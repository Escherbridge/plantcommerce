import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { decimalToMinorUnits } from './checkoutDraft';
import { proportionalShare } from './refundClawback';
import { earningBalance, loadEarningEvents } from './sellerLedgerBalance';
import {
	clawbackEarning,
	findReversal,
	reverseCommissions,
	settleReservedDebt,
	type ClawbackContext,
	type PendingReversal,
	type ReversalClient
} from './refundCore';

/**
 * A partial refund cannot be attributed to a seller from the order total alone when the order has several
 * sellers (house lines count as one). Full refunds and single-seller orders keep the proportional rule.
 */
export function isAmbiguousRefund(input: {
	sellerKeys: number[];
	refundedMinor: number;
	orderTotalMinor: number;
}): boolean {
	return new Set(input.sellerKeys).size > 1 && input.refundedMinor < input.orderTotalMinor;
}

/** One allocation per money source: the charge's running refund total, or a single dispute. Never merged. */
export const refundSourceKey = (chargeId: string) => `refund:${chargeId}`;

const allocationHoldObject = (allocationId: string) => `alloc:${allocationId}`;

async function openAllocationHold(
	tx: any,
	allocationId: string,
	orderId: number,
	now: Date
): Promise<void> {
	await tx
		.insert(table.orderBalanceHold)
		.values({
			id: `hold:alloc:${allocationId}`,
			orderId,
			kind: 'refund',
			status: 'open',
			stripeObjectId: allocationHoldObject(allocationId),
			createdAt: now
		})
		.onConflictDoUpdate({
			target: table.orderBalanceHold.stripeObjectId,
			set: { status: 'open', closedAt: null }
		});
}

async function closeAllocationHold(tx: any, allocationId: string, now: Date): Promise<void> {
	await tx
		.update(table.orderBalanceHold)
		.set({ status: 'closed', closedAt: now })
		.where(eq(table.orderBalanceHold.stripeObjectId, allocationHoldObject(allocationId)));
}

/** Record that a partial refund or dispute needs line allocation and hold the order. Runs inside the order lock. */
export async function recordAllocationNeed(
	tx: any,
	input: {
		orderId: number;
		chargeId: string;
		/** `refund:<charge>` for the cumulative refund total, or the dispute id. */
		sourceKey: string;
		refundedMinor: number;
		reasonCode: 'refund' | 'chargeback';
		feeMinor: number;
		sellerPaysFee: boolean;
		now: Date;
	}
): Promise<void> {
	const [existing] = await tx
		.select()
		.from(table.refundAllocation)
		.where(
			and(
				eq(table.refundAllocation.orderId, input.orderId),
				eq(table.refundAllocation.sourceKey, input.sourceKey)
			)
		)
		.for('update');
	if (!existing) {
		const id = crypto.randomUUID();
		await tx.insert(table.refundAllocation).values({
			id,
			orderId: input.orderId,
			chargeId: input.chargeId,
			sourceKey: input.sourceKey,
			refundedMinor: input.refundedMinor,
			allocatedMinor: 0,
			feeMinor: input.feeMinor,
			sellerPaysFee: input.sellerPaysFee,
			status: 'needs_allocation',
			reasonCode: input.reasonCode,
			createdAt: input.now
		});
		await openAllocationHold(tx, id, input.orderId, input.now);
		return;
	}
	// A cancelled dispute stays cancelled; a late duplicate event must not resurrect it.
	if (existing.status === 'cancelled') return;
	// Within one source the figure is a running total (refunds) or constant (one dispute), so max is right.
	const refundedMinor = Math.max(existing.refundedMinor, input.refundedMinor);
	const needs = refundedMinor > existing.allocatedMinor;
	await tx
		.update(table.refundAllocation)
		.set({
			refundedMinor,
			feeMinor: Math.max(existing.feeMinor, input.feeMinor),
			sellerPaysFee: existing.sellerPaysFee || input.sellerPaysFee,
			status: needs ? 'needs_allocation' : existing.status
		})
		.where(eq(table.refundAllocation.id, existing.id));
	if (needs) await openAllocationHold(tx, existing.id, input.orderId, input.now);
}

/** A full refund covers everything; the partial refund still waiting for allocation is settled by it. */
export async function resolveAllocationOnFullRefund(
	tx: any,
	orderId: number,
	chargeId: string,
	refundedMinor: number,
	now: Date
): Promise<void> {
	const [existing] = await tx
		.select()
		.from(table.refundAllocation)
		.where(
			and(
				eq(table.refundAllocation.orderId, orderId),
				eq(table.refundAllocation.sourceKey, refundSourceKey(chargeId))
			)
		)
		.for('update');
	if (!existing || existing.status !== 'needs_allocation') return;
	await tx
		.update(table.refundAllocation)
		.set({
			status: 'allocated',
			refundedMinor: Math.max(existing.refundedMinor, refundedMinor),
			allocatedMinor: Math.max(existing.refundedMinor, refundedMinor),
			resolvedAt: now
		})
		.where(eq(table.refundAllocation.id, existing.id));
	await closeAllocationHold(tx, existing.id, now);
}

/**
 * A dispute that closed in the platform's favour (won, warning closed, funds reinstated). Anything it left behind
 * is undone through the ledger, never by editing rows: a waiting allocation is cancelled and its hold closed; an
 * assigned clawback, Stripe recovery and dispute fee are credited with explicit credit events that name the row they
 * undo. A credit does not move money by itself.
 * Lock order is order (held by the caller) -> earning -> payout account. Under the payout-account lock, a reservation
 * still waiting on Stripe is looked up at Stripe first: a reversal that was already made is recorded and credited
 * back; if Stripe cannot be read the webhook fails and is retried.
 */
export async function cancelAllocationForDispute(
	tx: any,
	orderId: number,
	disputeId: string,
	now: Date,
	client: ReversalClient | null
): Promise<void> {
	const [allocation] = await tx
		.select()
		.from(table.refundAllocation)
		.where(
			and(
				eq(table.refundAllocation.orderId, orderId),
				eq(table.refundAllocation.sourceKey, disputeId)
			)
		)
		.for('update');
	if (allocation?.status === 'cancelled') return;
	// What this dispute left behind: rows assigned through an allocation, or written directly under its id.
	const belongsToDispute = (reference: string | undefined) =>
		Boolean(reference) &&
		((allocation && reference!.includes(`:alloc:${allocation.id}`)) ||
			reference!.endsWith(`:${disputeId}`));
	if (!allocation || allocation.status === 'allocated') {
		const earnings = await tx
			.select()
			.from(table.sellerEarning)
			.where(eq(table.sellerEarning.orderId, orderId));
		for (const earning of earnings) {
			await tx
				.select({ id: table.sellerEarning.id })
				.from(table.sellerEarning)
				.where(eq(table.sellerEarning.id, earning.id))
				.for('update');
			await tx
				.select({ id: table.payoutAccount.id })
				.from(table.payoutAccount)
				.where(eq(table.payoutAccount.sellerId, earning.sellerId))
				.for('update');
			const credit = async (
				original: { eventReference?: string; amountDeltaMinor: number; reasonCode?: string | null },
				eventType: 'reversal_credited' | 'debt_credited' | 'fee_credited',
				currency: string
			) => {
				await tx
					.insert(table.sellerEarningEvent)
					.values({
						id: crypto.randomUUID(),
						earningId: earning.id,
						eventType,
						amountDeltaMinor: -original.amountDeltaMinor,
						currency,
						eventReference: `${original.eventReference}:credit`,
						creditsReference: original.eventReference,
						reasonCode: 'dispute_won',
						createdAt: now
					})
					.onConflictDoNothing();
			};

			let events = await loadEarningEvents(tx, earning.id);
			const reservations = earningBalance(events).reservations.filter((row) =>
				belongsToDispute(row.reference)
			);
			for (const reservation of reservations) {
				if (!reservation.active) continue;
				if (!client) {
					throw new Error(
						'A Stripe reversal is reserved for this dispute; retry with Stripe available'
					);
				}
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
				const found = transfer?.stripeTransferId
					? await findReversal(client, transfer.stripeTransferId, earning.id, reservation.sourceKey)
					: null;
				if (found) {
					// The reversal reached Stripe after all: record it, so the credit below undoes a real row.
					await tx
						.insert(table.sellerEarningEvent)
						.values({
							id: crypto.randomUUID(),
							earningId: earning.id,
							eventType: 'reversed',
							amountDeltaMinor: -found.amount,
							currency: earning.currency,
							eventReference: `seller-earning:${earning.id}:reversed-at-stripe:${reservation.sourceKey}`,
							reasonCode: 'reversal_of_debt',
							stripeReversalId: found.id,
							createdAt: now
						})
						.onConflictDoNothing();
				}
			}

			events = await loadEarningEvents(tx, earning.id);
			const credited = new Set(events.map((event) => event.creditsReference).filter(Boolean));
			const undo = events.filter(
				(event) =>
					belongsToDispute(event.eventReference) &&
					!credited.has(event.eventReference) &&
					!event.creditsReference &&
					event.amountDeltaMinor !== 0 &&
					(event.eventType === 'reversed' || event.eventType === 'debt')
			);
			for (const row of undo) {
				if (row.eventType === 'reversed') await credit(row, 'reversal_credited', earning.currency);
				else if (row.reasonCode === 'dispute_fee')
					await credit(row, 'fee_credited', earning.currency);
				else await credit(row, 'debt_credited', earning.currency);
			}
		}
	}
	if (!allocation) return;
	await tx
		.update(table.refundAllocation)
		.set({ status: 'cancelled', resolvedAt: now })
		.where(eq(table.refundAllocation.id, allocation.id));
	await closeAllocationHold(tx, allocation.id, now);
}

export type AllocationRow = {
	allocationId: string;
	orderId: number;
	orderNumber: string;
	source: string;
	unallocatedMinor: number;
	feeMinor: number;
	items: { id: number; name: string; sellerId: number | null; remainingMinor: number }[];
};

/** Refunds and disputes waiting for an admin, with each order line and how much of it can still be assigned. */
export async function listAllocationsNeedingAction(): Promise<AllocationRow[]> {
	const waiting = await db
		.select()
		.from(table.refundAllocation)
		.where(eq(table.refundAllocation.status, 'needs_allocation'));
	const rows: AllocationRow[] = [];
	for (const allocation of waiting) {
		const [order] = await db
			.select({ orderNumber: table.order.orderNumber })
			.from(table.order)
			.where(eq(table.order.id, allocation.orderId));
		const items = await db
			.select()
			.from(table.orderItem)
			.where(eq(table.orderItem.orderId, allocation.orderId));
		const assigned = await db
			.select()
			.from(table.refundAllocationLine)
			.where(eq(table.refundAllocationLine.allocationId, allocation.id));
		rows.push({
			allocationId: allocation.id,
			orderId: allocation.orderId,
			orderNumber: order?.orderNumber ?? String(allocation.orderId),
			source: allocation.reasonCode === 'chargeback' ? 'Dispute' : 'Refund',
			unallocatedMinor: allocation.refundedMinor - allocation.allocatedMinor,
			feeMinor: allocation.sellerPaysFee ? allocation.feeMinor : 0,
			items: items.map((item) => ({
				id: item.id,
				name: item.productName,
				sellerId: item.sellerId,
				remainingMinor:
					decimalToMinorUnits(item.totalPrice) -
					assigned
						.filter((line) => line.orderItemId === item.id)
						.reduce((sum, line) => sum + line.amountMinor, 0)
			}))
		});
	}
	return rows;
}

export type AllocateResult = { ok: true } | { ok: false; message: string };

/**
 * Assign the unallocated part of a refund or dispute to order lines. The normal clawback then runs for just the
 * sellers who own those lines, sized by what was assigned to their lines; a dispute fee follows the assignment.
 * House lines absorb their share.
 */
export async function allocateRefund(input: {
	allocationId: string;
	lines: { orderItemId: number; amountMinor: number }[];
	actorId: string;
	client: ReversalClient | null;
	now?: Date;
}): Promise<AllocateResult> {
	const now = input.now ?? new Date();
	const pendingReversals: PendingReversal[] = [];
	const outcome = await db.transaction(async (tx): Promise<AllocateResult> => {
		const [allocationRef] = await tx
			.select({ orderId: table.refundAllocation.orderId })
			.from(table.refundAllocation)
			.where(eq(table.refundAllocation.id, input.allocationId));
		if (!allocationRef) return { ok: false, message: 'That refund was not found.' };
		// Lock order: order first, like the webhook handler.
		const [order] = await tx
			.select()
			.from(table.order)
			.where(eq(table.order.id, allocationRef.orderId))
			.for('update');
		const [allocation] = await tx
			.select()
			.from(table.refundAllocation)
			.where(eq(table.refundAllocation.id, input.allocationId))
			.for('update');
		if (!allocation || allocation.status !== 'needs_allocation') {
			return { ok: false, message: 'This refund was already allocated or cancelled.' };
		}
		const items = await tx
			.select()
			.from(table.orderItem)
			.where(eq(table.orderItem.orderId, order.id));
		const earlier = await tx
			.select()
			.from(table.refundAllocationLine)
			.where(eq(table.refundAllocationLine.allocationId, allocation.id));

		const lines = input.lines.filter((line) => line.amountMinor !== 0);
		let newTotal = 0;
		const perItem = new Set<number>();
		for (const line of lines) {
			const item = items.find((candidate) => candidate.id === line.orderItemId);
			if (!item) return { ok: false, message: 'A selected line is not on this order.' };
			if (!Number.isSafeInteger(line.amountMinor) || line.amountMinor <= 0) {
				return { ok: false, message: 'Each amount must be a positive number of cents.' };
			}
			if (perItem.has(item.id)) return { ok: false, message: 'Each line can appear once.' };
			const assigned = earlier
				.filter((row) => row.orderItemId === item.id)
				.reduce((sum, row) => sum + row.amountMinor, 0);
			if (assigned + line.amountMinor > decimalToMinorUnits(item.totalPrice)) {
				return { ok: false, message: `${item.productName} cannot take more than its line total.` };
			}
			perItem.add(item.id);
			newTotal += line.amountMinor;
		}
		const expected = allocation.refundedMinor - allocation.allocatedMinor;
		if (newTotal !== expected) {
			return {
				ok: false,
				message: `The lines must add up to the amount that is waiting (${expected} cents); they add up to ${newTotal}.`
			};
		}

		// Cumulative amount assigned to each seller's lines, including earlier allocations.
		const bySeller = new Map<number, number>();
		for (const row of [
			...earlier.map((line) => ({ orderItemId: line.orderItemId, amountMinor: line.amountMinor })),
			...lines
		]) {
			const item = items.find((candidate) => candidate.id === row.orderItemId);
			if (item?.sellerId == null) continue;
			bySeller.set(item.sellerId, (bySeller.get(item.sellerId) ?? 0) + row.amountMinor);
		}
		const orderTotalMinor = decimalToMinorUnits(order.totalAmount);
		const reasonCode = allocation.reasonCode;
		const cumulative = reasonCode === 'refund';
		const earnings = await tx
			.select()
			.from(table.sellerEarning)
			.where(eq(table.sellerEarning.orderId, order.id));
		for (const earning of earnings) {
			const assignedMinor = bySeller.get(earning.sellerId);
			if (!assignedMinor) continue;
			const context: ClawbackContext = {
				refundedMinor: assignedMinor,
				totalMinor: earning.lineTotalMinor,
				orderTotalMinor,
				// A refund allocation is a running total per seller; a dispute allocation happens once.
				sourceKey: cumulative
					? `alloc:${allocation.id}:${assignedMinor}`
					: `alloc:${allocation.id}`,
				objectId: `alloc:${allocation.id}`,
				cumulative,
				reasonCode,
				feeMinor: 0,
				sellerPaysFee: allocation.sellerPaysFee,
				// The dispute fee follows the assignment: this seller's share of what was assigned in total.
				feeForEarningMinor: allocation.sellerPaysFee
					? proportionalShare(allocation.feeMinor, assignedMinor, allocation.refundedMinor)
					: 0,
				client: input.client,
				now
			};
			const pending = await clawbackEarning(tx, earning, context);
			if (pending) pendingReversals.push(pending);
		}
		await reverseCommissions(tx, order.id, {
			refundedMinor: allocation.refundedMinor,
			orderTotalMinor,
			sourceKey: cumulative
				? `alloc:${allocation.id}:${allocation.refundedMinor}`
				: `alloc:${allocation.id}`,
			objectId: `alloc:${allocation.id}`,
			cumulative,
			reasonCode,
			now
		});

		for (const line of lines) {
			await tx.insert(table.refundAllocationLine).values({
				id: crypto.randomUUID(),
				allocationId: allocation.id,
				orderItemId: line.orderItemId,
				amountMinor: line.amountMinor,
				createdAt: now
			});
		}
		await tx
			.update(table.refundAllocation)
			.set({
				allocatedMinor: allocation.refundedMinor,
				status: 'allocated',
				resolvedAt: now,
				resolvedBy: input.actorId
			})
			.where(
				and(
					eq(table.refundAllocation.id, allocation.id),
					eq(table.refundAllocation.status, 'needs_allocation')
				)
			);
		await closeAllocationHold(tx, allocation.id, now);
		return { ok: true };
	});
	for (const work of pendingReversals) await settleReservedDebt(input.client, work, now);
	return outcome;
}
