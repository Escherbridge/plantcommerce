import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';
import { payableBalance } from './payoutExecution';
import { affiliateBatchGate, netAfterDebt, sellerTransferGate } from './payoutExecution';

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
		const [existing] = await db
			.select({ id: table.payoutTransfer.id, status: table.payoutTransfer.status })
			.from(table.payoutTransfer)
			.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey))
			.limit(1);
		if (existing) continue;

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
			.where(
				and(
					eq(table.payoutAccount.sellerId, earning.sellerId),
					eq(table.payoutAccount.transfersActive, true)
				)
			)
			.limit(1);
		const adjustments = await db
			.select({
				eventType: table.sellerEarningEvent.eventType,
				amount: table.sellerEarningEvent.amountDeltaMinor
			})
			.from(table.sellerEarningEvent)
			.where(eq(table.sellerEarningEvent.earningId, earning.earningId));
		const debtMinor = adjustments.reduce((sum, row) => {
			if (row.eventType === 'debt') return sum + row.amount;
			if (row.eventType === 'reversed') return sum + Math.abs(row.amount);
			return sum;
		}, 0);
		const { payMinor } = netAfterDebt(earning.netMinor, debtMinor);
		if (
			!account?.stripeAccountId ||
			!account.transfersActive ||
			!order?.stripeChargeId ||
			payMinor <= 0
		) {
			await db.insert(table.payoutTransfer).values({
				id: crypto.randomUUID(),
				kind: 'seller',
				earningId: earning.earningId,
				amountMinor: payMinor,
				currency: earning.currency,
				status: 'skipped',
				failureReason: !account?.transfersActive ? 'transfers_inactive' : 'not_payable',
				idempotencyKey,
				sourceTransaction: order?.stripeChargeId ?? null,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			continue;
		}

		try {
			const transfer = await client.transfers.create(
				{
					amount: payMinor,
					currency: earning.currency,
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
			await db.insert(table.payoutTransfer).values({
				id: crypto.randomUUID(),
				kind: 'seller',
				earningId: earning.earningId,
				stripeAccountId: account.stripeAccountId,
				amountMinor: payMinor,
				currency: earning.currency,
				status: 'succeeded',
				idempotencyKey,
				stripeTransferId: transfer.id,
				sourceTransaction: order.stripeChargeId,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			await db.insert(table.sellerEarningEvent).values({
				id: crypto.randomUUID(),
				earningId: earning.earningId,
				eventType: 'transferred',
				amountDeltaMinor: 0,
				currency: earning.currency,
				eventReference: `seller-earning:${earning.earningId}:transferred`,
				reasonCode: 'payout',
				stripeTransferId: transfer.id,
				createdAt: new Date()
			});
			transferred += 1;
		} catch {
			await db.insert(table.payoutTransfer).values({
				id: crypto.randomUUID(),
				kind: 'seller',
				earningId: earning.earningId,
				stripeAccountId: account.stripeAccountId,
				amountMinor: payMinor,
				currency: earning.currency,
				status: 'failed',
				failureReason: 'transfer_failed',
				idempotencyKey: `${idempotencyKey}:failed:${crypto.randomUUID()}`,
				sourceTransaction: order.stripeChargeId,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}
	}
	return { skipped: false, reason: 'ready', transferred };
}

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
		await db.insert(table.affiliatePayoutBatch).values({
			id: batchId,
			currency: total.currency,
			totalMinor: total.total,
			status: needsApproval ? 'pending_approval' : 'approved',
			commissionIds: total.ids.join(','),
			createdAt: now,
			approvedAt: needsApproval ? null : now
		});
		batches += 1;
		if (needsApproval || !client) continue;
		await payAffiliateBatch(client, batchId, total, now);
	}
	return { skipped: false, reason: 'ready', batches };
}

async function payAffiliateBatch(
	client: TransferClient,
	batchId: string,
	total: { affiliateId: number; currency: string; total: number; ids: string[] },
	now: Date
): Promise<void> {
	const [account] = await db
		.select({
			stripeAccountId: table.payoutAccount.stripeAccountId,
			transfersActive: table.payoutAccount.transfersActive
		})
		.from(table.payoutAccount)
		.where(
			and(
				eq(table.payoutAccount.affiliateId, total.affiliateId),
				eq(table.payoutAccount.transfersActive, true)
			)
		)
		.limit(1);
	if (!account?.stripeAccountId) return;
	const idempotencyKey = `affiliate-batch:${batchId}`;
	const transfer = await client.transfers.create(
		{
			amount: total.total,
			currency: total.currency,
			destination: account.stripeAccountId,
			metadata: { batch_id: batchId, affiliate_id: String(total.affiliateId) }
		},
		{ idempotencyKey }
	);
	await db.transaction(async (tx) => {
		const payout = await AffiliateCommissionService.createPayoutInstruction(tx, {
			affiliateId: total.affiliateId,
			payoutReference: `batch:${batchId}`,
			currency: total.currency,
			amountMinor: total.total,
			now
		});
		for (const commissionId of total.ids) {
			await tx.insert(table.affiliateCommissionLedgerEvent).values({
				id: crypto.randomUUID(),
				commissionId,
				eventType: 'payable',
				amountDeltaMinor: 0,
				currency: total.currency,
				payoutId: payout.id,
				eventReference: `commission:${commissionId}:payable`,
				reasonCode: 'payout',
				createdAt: now
			});
			await tx.insert(table.affiliateCommissionLedgerEvent).values({
				id: crypto.randomUUID(),
				commissionId,
				eventType: 'paid',
				amountDeltaMinor: 0,
				currency: total.currency,
				payoutId: payout.id,
				eventReference: `commission:${commissionId}:paid`,
				reasonCode: 'payout',
				createdAt: now
			});
		}
		await tx.insert(table.payoutTransfer).values({
			id: crypto.randomUUID(),
			kind: 'affiliate',
			batchId,
			payoutId: payout.id,
			stripeAccountId: account.stripeAccountId,
			amountMinor: total.total,
			currency: total.currency,
			status: 'succeeded',
			idempotencyKey,
			stripeTransferId: transfer.id,
			createdAt: now,
			updatedAt: now
		});
		await tx
			.update(table.affiliatePayoutBatch)
			.set({ status: 'paid' })
			.where(eq(table.affiliatePayoutBatch.id, batchId));
	});
}

/** Mark a waiting batch approved. Stripe is called only when the payout gate is open and a client is passed. */
export async function approveAffiliateBatch(
	batchId: string,
	source: Record<string, string | undefined>,
	client: TransferClient | null,
	now = new Date()
): Promise<{ paid: boolean; reason: string }> {
	const [batch] = await db
		.select()
		.from(table.affiliatePayoutBatch)
		.where(eq(table.affiliatePayoutBatch.id, batchId))
		.limit(1);
	if (!batch || batch.status !== 'pending_approval') return { paid: false, reason: 'not_pending' };
	await db
		.update(table.affiliatePayoutBatch)
		.set({ status: 'approved', approvedAt: now })
		.where(eq(table.affiliatePayoutBatch.id, batchId));
	const gate = affiliateBatchGate(source);
	const ids = (batch.commissionIds ?? '').split(',').filter((id) => id.length > 0);
	if (gate.action !== 'pay' || !client || ids.length === 0)
		return { paid: false, reason: 'not_ready' };
	const [commission] = await db
		.select({ affiliateId: table.affiliateCommissionLedger.affiliateId })
		.from(table.affiliateCommissionLedger)
		.where(eq(table.affiliateCommissionLedger.id, ids[0]))
		.limit(1);
	if (!commission) return { paid: false, reason: 'not_ready' };
	await payAffiliateBatch(
		client,
		batchId,
		{
			affiliateId: commission.affiliateId,
			currency: batch.currency,
			total: batch.totalMinor,
			ids
		},
		now
	);
	return { paid: true, reason: 'paid' };
}

export { payableBalance };
