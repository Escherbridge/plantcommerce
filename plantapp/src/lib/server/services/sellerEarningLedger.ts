import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';
import { holdReleasePlan, readOptionalWholeDays, sellerShare } from './sellerEarnings';

export type EarningLine = { sellerId: number | null; totalPriceMinor: number };

export async function recordSellerEarnings(
	tx: any,
	input: { orderId: number; currency: string; lines: EarningLine[]; now?: Date }
): Promise<number> {
	const now = input.now ?? new Date();
	const bySeller = new Map<number, number>();
	for (const line of input.lines) {
		if (line.sellerId === null) continue;
		bySeller.set(line.sellerId, (bySeller.get(line.sellerId) ?? 0) + line.totalPriceMinor);
	}
	let written = 0;
	for (const [sellerId, lineTotalMinor] of bySeller) {
		const share = sellerShare(lineTotalMinor, 0);
		const earningId = crypto.randomUUID();
		const inserted = await tx
			.insert(table.sellerEarning)
			.values({
				id: earningId,
				orderId: input.orderId,
				sellerId,
				currency: input.currency,
				lineTotalMinor: share.lineTotalMinor,
				shippingPassthroughMinor: share.shippingPassthroughMinor,
				feeBps: share.feeBps,
				feeMinor: share.feeMinor,
				netMinor: share.netMinor,
				createdAt: now
			})
			.onConflictDoNothing()
			.returning();
		if (inserted.length === 0) continue;
		await tx.insert(table.sellerEarningEvent).values({
			id: crypto.randomUUID(),
			earningId,
			eventType: 'pending',
			amountDeltaMinor: share.netMinor,
			currency: input.currency,
			eventReference: `seller-earning:${earningId}:pending`,
			reasonCode: 'initial_accrual',
			createdAt: now
		});
		written += 1;
	}
	return written;
}

export async function runHoldRelease(
	source: Record<string, string | undefined>,
	now = new Date()
): Promise<{ delivered: number; released: number; skipped: boolean }> {
	const holdDays = readOptionalWholeDays(source, 'PAYOUT_HOLD_DAYS_AFTER_DELIVERY');
	const autoDeliverDays = readOptionalWholeDays(source, 'PAYOUT_AUTO_DELIVER_DAYS_AFTER_SHIPMENT');
	if (holdDays === null && autoDeliverDays === null) {
		return { delivered: 0, released: 0, skipped: true };
	}

	const orders = await db
		.select({
			id: table.order.id,
			status: table.order.status,
			shippedAt: table.order.shippedAt,
			deliveredAt: table.order.deliveredAt
		})
		.from(table.order)
		.where(eq(table.order.status, 'shipped'));
	const deliveredOrders = await db
		.select({
			id: table.order.id,
			status: table.order.status,
			shippedAt: table.order.shippedAt,
			deliveredAt: table.order.deliveredAt
		})
		.from(table.order)
		.where(eq(table.order.status, 'delivered'));

	let delivered = 0;
	let released = 0;
	for (const order of [...orders, ...deliveredOrders]) {
		const holds = await db
			.select({ id: table.orderBalanceHold.id })
			.from(table.orderBalanceHold)
			.where(
				and(eq(table.orderBalanceHold.orderId, order.id), eq(table.orderBalanceHold.status, 'open'))
			);
		const openHold = holds.length > 0;
		const plan = holdReleasePlan({ ...order, openHold }, now, { holdDays, autoDeliverDays });
		if (!plan.deliver && !plan.release) continue;
		await db.transaction(async (tx) => {
			if (plan.deliver) {
				await tx
					.update(table.order)
					.set({
						status: 'delivered',
						deliveredAt: new Date(
							(order.shippedAt ?? now).getTime() + (autoDeliverDays ?? 0) * 86400000
						),
						updatedAt: now
					})
					.where(eq(table.order.id, order.id));
				delivered += 1;
			}
			if (plan.release) {
				const earnings = await tx
					.select({ id: table.sellerEarning.id, currency: table.sellerEarning.currency })
					.from(table.sellerEarning)
					.where(eq(table.sellerEarning.orderId, order.id));
				for (const earning of earnings) {
					await tx
						.insert(table.sellerEarningEvent)
						.values({
							id: crypto.randomUUID(),
							earningId: earning.id,
							eventType: 'released',
							amountDeltaMinor: 0,
							currency: earning.currency,
							eventReference: `seller-earning:${earning.id}:released`,
							reasonCode: 'hold_elapsed',
							createdAt: now
						})
						.onConflictDoNothing();
				}
				await AffiliateCommissionService.clearCommissionsForOrder(
					tx,
					order.id,
					`order:${order.id}:hold-release`,
					now
				);
				released += 1;
			}
		});
	}
	return { delivered, released, skipped: false };
}
