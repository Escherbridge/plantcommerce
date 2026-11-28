import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { decimalToMinorUnits } from './checkoutDraft';
import {
	clawbackEarning,
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

const allocationHoldObject = (orderId: number) => `alloc:${orderId}`;

async function openAllocationHold(tx: any, orderId: number, now: Date): Promise<void> {
	await tx
		.insert(table.orderBalanceHold)
		.values({
			id: `hold:alloc:${orderId}`,
			orderId,
			kind: 'refund',
			status: 'open',
			stripeObjectId: allocationHoldObject(orderId),
			createdAt: now
		})
		.onConflictDoUpdate({
			target: table.orderBalanceHold.stripeObjectId,
			set: { status: 'open', closedAt: null }
		});
}

async function closeAllocationHold(tx: any, orderId: number, now: Date): Promise<void> {
	await tx
		.update(table.orderBalanceHold)
		.set({ status: 'closed', closedAt: now })
		.where(eq(table.orderBalanceHold.stripeObjectId, allocationHoldObject(orderId)));
}

/** Record that a partial refund needs line allocation and hold the order's earnings. Runs inside the order lock. */
export async function recordAllocationNeed(
	tx: any,
	input: {
		orderId: number;
		chargeId: string;
		refundedMinor: number;
		reasonCode: 'refund' | 'chargeback';
		now: Date;
	}
): Promise<void> {
	const [existing] = await tx
		.select()
		.from(table.refundAllocation)
		.where(eq(table.refundAllocation.orderId, input.orderId))
		.for('update');
	if (!existing) {
		await tx.insert(table.refundAllocation).values({
			id: crypto.randomUUID(),
			orderId: input.orderId,
			chargeId: input.chargeId,
			refundedMinor: input.refundedMinor,
			allocatedMinor: 0,
			status: 'needs_allocation',
			reasonCode: input.reasonCode,
			createdAt: input.now
		});
		await openAllocationHold(tx, input.orderId, input.now);
		return;
	}
	const refundedMinor = Math.max(existing.refundedMinor, input.refundedMinor);
	const needs = refundedMinor > existing.allocatedMinor;
	await tx
		.update(table.refundAllocation)
		.set({ refundedMinor, status: needs ? 'needs_allocation' : existing.status })
		.where(eq(table.refundAllocation.id, existing.id));
	if (needs) await openAllocationHold(tx, input.orderId, input.now);
}

/** A full refund covers everything; any partial refund still waiting for allocation is settled by it. */
export async function resolveAllocationOnFullRefund(
	tx: any,
	orderId: number,
	refundedMinor: number,
	now: Date
): Promise<void> {
	const [existing] = await tx
		.select()
		.from(table.refundAllocation)
		.where(eq(table.refundAllocation.orderId, orderId))
		.for('update');
	if (!existing || existing.status === 'allocated') return;
	await tx
		.update(table.refundAllocation)
		.set({
			status: 'allocated',
			refundedMinor: Math.max(existing.refundedMinor, refundedMinor),
			allocatedMinor: Math.max(existing.refundedMinor, refundedMinor),
			resolvedAt: now
		})
		.where(eq(table.refundAllocation.id, existing.id));
	await closeAllocationHold(tx, orderId, now);
}

export type AllocationRow = {
	allocationId: string;
	orderId: number;
	orderNumber: string;
	unallocatedMinor: number;
	items: { id: number; name: string; sellerId: number | null; remainingMinor: number }[];
};

/** Refunds waiting for an admin, with each order line and how much of it can still be assigned. */
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
			unallocatedMinor: allocation.refundedMinor - allocation.allocatedMinor,
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
 * Assign the unallocated part of a partial refund to order lines. The normal clawback then runs for just the
 * sellers who own those lines, sized by what was assigned to their lines. House lines absorb their share.
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
			return { ok: false, message: 'This refund was already allocated.' };
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
		const perItem = new Map<number, number>();
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
			perItem.set(item.id, line.amountMinor);
			newTotal += line.amountMinor;
		}
		const expected = allocation.refundedMinor - allocation.allocatedMinor;
		if (newTotal !== expected) {
			return {
				ok: false,
				message: `The lines must add up to the refund that is waiting (${expected} cents); they add up to ${newTotal}.`
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
				sourceKey: `alloc:${allocation.id}:${assignedMinor}`,
				objectId: `alloc:${allocation.id}`,
				cumulative: true,
				reasonCode,
				feeMinor: 0,
				sellerPaysFee: false,
				client: input.client,
				now
			};
			const pending = await clawbackEarning(tx, earning, context);
			if (pending) pendingReversals.push(pending);
		}
		await reverseCommissions(tx, order.id, {
			refundedMinor: allocation.refundedMinor,
			orderTotalMinor,
			sourceKey: `alloc:${allocation.id}:${allocation.refundedMinor}`,
			objectId: `alloc:${allocation.id}`,
			cumulative: true,
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
		await closeAllocationHold(tx, order.id, now);
		return { ok: true };
	});
	for (const work of pendingReversals) await settleReservedDebt(input.client, work, now);
	return outcome;
}
