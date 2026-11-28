import { and, eq, inArray, isNull, lt, or, sql } from 'drizzle-orm';
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
		list: (params: {
			transfer_group: string;
			destination?: string;
			limit?: number;
			starting_after?: string;
		}) => Promise<{
			data: { id: string; amount: number; metadata?: Record<string, string> | null }[];
			has_more: boolean;
		}>;
	};
};

/** A pending claim younger than this belongs to a live worker; older means it crashed and may be resumed. */
export const STALE_CLAIM_MS = 2 * 60 * 1000;

type FoundTransfer = { id: string; amount: number };

/** Walk every page of transfers in a group. Throws if Stripe cannot be read, so callers leave the row pending. */
async function findTransferByMetadata(
	client: TransferClient,
	input: { group: string; destination: string; key: string; value: string }
): Promise<FoundTransfer | null> {
	let startingAfter: string | undefined;
	for (;;) {
		const page = await client.transfers.list({
			transfer_group: input.group,
			destination: input.destination,
			limit: 100,
			...(startingAfter ? { starting_after: startingAfter } : {})
		});
		const hit = page.data.find((transfer) => transfer.metadata?.[input.key] === input.value);
		if (hit) return { id: hit.id, amount: hit.amount };
		if (!page.has_more || page.data.length === 0) return null;
		startingAfter = page.data[page.data.length - 1].id;
	}
}

/** What a resumed pending row may still send: net minus reversals recorded since, minus the debt reserved at claim. */
async function resumablePayMinor(earning: {
	earningId: string;
	netMinor: number;
}): Promise<{ maxPayMinor: number; debtSettledMinor: number }> {
	const events = await db
		.select({
			eventType: table.sellerEarningEvent.eventType,
			amount: table.sellerEarningEvent.amountDeltaMinor,
			reasonCode: table.sellerEarningEvent.reasonCode
		})
		.from(table.sellerEarningEvent)
		.where(eq(table.sellerEarningEvent.earningId, earning.earningId));
	const reversedMinor = events
		.filter((row) => row.eventType === 'reversed')
		.reduce((sum, row) => sum + Math.abs(row.amount), 0);
	const debtSettledMinor = events
		.filter((row) => row.eventType === 'debt' && row.reasonCode === 'debt_settled')
		.reduce((sum, row) => sum + Math.abs(row.amount), 0);
	return { maxPayMinor: earning.netMinor - reversedMinor - debtSettledMinor, debtSettledMinor };
}

/** Pay released seller earnings. Claim-then-send: a pending row under the idempotency key exists before Stripe is called. */
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
			const [settled] = await db
				.select({ id: table.payoutTransfer.id })
				.from(table.payoutTransfer)
				.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey))
				.limit(1);
			if (settled) continue;
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
		const stripeAccountId = account.stripeAccountId;
		const stripeChargeId = order.stripeChargeId;

		// Claim: one transaction under a row lock on the seller payout account. Debt is reserved here, so two
		// earnings of one seller never spend the same debt, and the pending row exists before Stripe is called.
		const claim = await db.transaction(async (tx) => {
			await tx
				.select({ id: table.payoutAccount.id })
				.from(table.payoutAccount)
				.where(eq(table.payoutAccount.sellerId, earning.sellerId))
				.for('update');
			const [existing] = await tx
				.select()
				.from(table.payoutTransfer)
				.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey))
				.limit(1);
			if (existing?.status === 'pending') {
				// Take over only a stale claim, atomically under the account lock.
				if (now.getTime() - existing.updatedAt.getTime() < STALE_CLAIM_MS) {
					return { kind: 'done' as const };
				}
				await tx
					.update(table.payoutTransfer)
					.set({ updatedAt: now })
					.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey));
				return { kind: 'resume' as const, amountMinor: existing.amountMinor };
			}
			if (existing) return { kind: 'done' as const };

			const reversals = await tx
				.select({ amount: table.sellerEarningEvent.amountDeltaMinor })
				.from(table.sellerEarningEvent)
				.where(
					and(
						eq(table.sellerEarningEvent.earningId, earning.earningId),
						eq(table.sellerEarningEvent.eventType, 'reversed')
					)
				);
			// Debt nets only within this earning currency.
			const [debtRow] = await tx
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
						eq(table.sellerEarningEvent.eventType, 'debt'),
						eq(table.sellerEarningEvent.currency, earning.currency)
					)
				);
			const plan = planSellerTransfer({
				netMinor: earning.netMinor,
				ownReversalsMinor: reversals.reduce((sum, row) => sum + Math.abs(row.amount), 0),
				sellerDebtMinor: Number(debtRow?.total ?? 0)
			});
			if (plan.debtAppliedMinor > 0) {
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
			}
			// Permanent (fully reversed or absorbed by debt) is stored under the main key so it is never retried.
			await tx.insert(table.payoutTransfer).values({
				id: crypto.randomUUID(),
				kind: 'seller',
				earningId: earning.earningId,
				stripeAccountId,
				amountMinor: plan.permanent ? 0 : plan.payMinor,
				currency: earning.currency,
				status: plan.permanent ? 'skipped' : 'pending',
				failureReason: plan.permanent ? 'not_payable' : null,
				idempotencyKey,
				sourceTransaction: stripeChargeId,
				createdAt: now,
				updatedAt: now
			});
			return plan.permanent
				? { kind: 'done' as const }
				: { kind: 'send' as const, amountMinor: plan.payMinor };
		});
		if (claim.kind === 'done') continue;

		// Every transfer carries a group (the order's, else one per earning) so a resumed row can always be looked up.
		const transferGroup = order.transferGroup ?? `earning:${earning.earningId}`;
		let amountMinor = claim.amountMinor;
		let stripeTransferId: string | null = null;
		if (claim.kind === 'resume') {
			// A crash may have left Stripe holding a transfer that was never recorded. Read every page first.
			// If Stripe cannot be read, the row stays pending: never create what might already exist.
			let found: FoundTransfer | null;
			try {
				found = await findTransferByMetadata(client, {
					group: transferGroup,
					destination: stripeAccountId,
					key: 'earning_id',
					value: earning.earningId
				});
			} catch {
				continue;
			}
			const limits = await resumablePayMinor(earning);
			if (found) {
				stripeTransferId = found.id;
				if (found.amount > limits.maxPayMinor) {
					// A refund landed after the money was sent: the excess is debt against the seller.
					await db
						.insert(table.sellerEarningEvent)
						.values({
							id: crypto.randomUUID(),
							earningId: earning.earningId,
							eventType: 'debt',
							amountDeltaMinor: found.amount - Math.max(limits.maxPayMinor, 0),
							currency: earning.currency,
							eventReference: `seller-earning:${earning.earningId}:debt:resume-overpay`,
							reasonCode: 'overpay',
							createdAt: now
						})
						.onConflictDoNothing();
				}
			} else {
				amountMinor = Math.min(claim.amountMinor, limits.maxPayMinor);
				if (amountMinor <= 0) {
					await db.transaction(async (tx) => {
						if (limits.debtSettledMinor > 0) {
							await tx
								.insert(table.sellerEarningEvent)
								.values({
									id: crypto.randomUUID(),
									earningId: earning.earningId,
									eventType: 'debt',
									amountDeltaMinor: limits.debtSettledMinor,
									currency: earning.currency,
									eventReference: `seller-earning:${earning.earningId}:debt-restored`,
									reasonCode: 'debt_restored',
									createdAt: now
								})
								.onConflictDoNothing();
						}
						await tx
							.update(table.payoutTransfer)
							.set({
								status: 'skipped',
								amountMinor: 0,
								failureReason: 'not_payable',
								updatedAt: now
							})
							.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey));
					});
					continue;
				}
				if (amountMinor !== claim.amountMinor) {
					await db
						.update(table.payoutTransfer)
						.set({ amountMinor, updatedAt: now })
						.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey));
				}
			}
		}
		if (!stripeTransferId) {
			try {
				const transfer = await client.transfers.create(
					{
						amount: amountMinor,
						currency: earning.currency.toLowerCase(),
						destination: stripeAccountId,
						source_transaction: stripeChargeId,
						transfer_group: transferGroup,
						metadata: {
							earning_id: earning.earningId,
							order_id: String(earning.orderId)
						}
					},
					{ idempotencyKey }
				);
				stripeTransferId = transfer.id;
			} catch {
				// The row stays pending: the next run reconciles it against Stripe before creating anything.
				await db
					.update(table.payoutTransfer)
					.set({ failureReason: 'transfer_failed', updatedAt: now })
					.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey));
				continue;
			}
		}

		await db.transaction(async (tx) => {
			await tx
				.update(table.payoutTransfer)
				.set({ status: 'succeeded', stripeTransferId, failureReason: null, updatedAt: now })
				.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey));
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
					stripeTransferId,
					createdAt: now
				})
				.onConflictDoNothing();
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
			.where(inArray(table.affiliatePayoutBatch.status, ['approved', 'sending']));
		for (const batch of approved) await payApprovedAffiliateBatch(client, batch.id, now);
	}
	return { skipped: false, reason: 'ready', batches };
}

/**
 * Send one approved batch. Claim-then-send: `approved -> sending` is one conditional UPDATE and only the worker
 * whose update changed a row proceeds; the amount is fixed on the batch at claim time. A batch already in
 * `sending` is a crashed or failed attempt: it reuses the stored amount and looks for the Stripe transfer
 * (transfer_group = batch) before creating one under the same stable key.
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
	if (!batch || (batch.status !== 'approved' && batch.status !== 'sending')) return 'not_approved';
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

	let amountMinor: number;
	if (batch.status === 'approved') {
		amountMinor = Math.min(dueMinor, batch.totalMinor);
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
		if (!account?.stripeAccountId) return 'no_account';
		const claimedRows = await db
			.update(table.affiliatePayoutBatch)
			.set({ status: 'sending', sendAmountMinor: amountMinor, sendStartedAt: now })
			.where(
				and(
					eq(table.affiliatePayoutBatch.id, batchId),
					eq(table.affiliatePayoutBatch.status, 'approved')
				)
			)
			.returning({ id: table.affiliatePayoutBatch.id });
		if (claimedRows.length === 0) return 'not_approved';
	} else {
		if (batch.sendAmountMinor === null || !account?.stripeAccountId) return 'no_account';
		// Take over only a stale claim; the conditional UPDATE lets exactly one resumer through.
		const takenOver = await db
			.update(table.affiliatePayoutBatch)
			.set({ sendStartedAt: now })
			.where(
				and(
					eq(table.affiliatePayoutBatch.id, batchId),
					eq(table.affiliatePayoutBatch.status, 'sending'),
					or(
						isNull(table.affiliatePayoutBatch.sendStartedAt),
						lt(table.affiliatePayoutBatch.sendStartedAt, new Date(now.getTime() - STALE_CLAIM_MS))
					)
				)
			)
			.returning({ id: table.affiliatePayoutBatch.id });
		if (takenOver.length === 0) return 'not_approved';
		amountMinor = batch.sendAmountMinor;
	}

	const idempotencyKey = `affiliate-batch:${batchId}`;
	let stripeTransferId: string | null = null;
	if (batch.status === 'sending') {
		try {
			stripeTransferId =
				(
					await findTransferByMetadata(client, {
						group: idempotencyKey,
						destination: account.stripeAccountId,
						key: 'batch_id',
						value: batchId
					})
				)?.id ?? null;
		} catch {
			return 'no_account';
		}
	}
	if (!stripeTransferId) {
		try {
			const transfer = await client.transfers.create(
				{
					amount: amountMinor,
					currency: batch.currency.toLowerCase(),
					destination: account.stripeAccountId,
					transfer_group: idempotencyKey,
					metadata: { batch_id: batchId, affiliate_id: String(payout.affiliateId) }
				},
				{ idempotencyKey }
			);
			stripeTransferId = transfer.id;
		} catch (error) {
			// The batch stays `sending`; the next run reconciles against Stripe before creating anything.
			console.error('[Affiliate batch] Transfer failed; batch left in sending', batchId, error);
			return 'no_account';
		}
	}
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
				stripeTransferId,
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
