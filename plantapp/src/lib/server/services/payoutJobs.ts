import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';
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

/**
 * A claim younger than two minutes belongs to a live worker; older means it crashed and may be resumed.
 * Always judged and stamped with the database clock (`now()`), never a caller's run-wide timestamp.
 */
const STALE_CLAIM_SQL = sql`now() - interval '2 minutes'`;

/**
 * What an affiliate still owes back: for each commission already sent, what was sent minus what remains of it
 * after reversals, minus the debt earlier batches already netted. Measured against the amount recorded when the
 * batch was sent (affiliate_payout_batch_line), never against event timestamps. Recovery is by netting from later
 * batches only; there is no Stripe reversal for affiliates and no forfeiture policy (owner decision, AGENTS.md).
 */
async function affiliateDebtMinor(
	executor: any,
	affiliateId: number,
	currency: string
): Promise<number> {
	const lines: { commissionId: string; sentMinor: number; net: string }[] = await executor
		.select({
			commissionId: table.affiliatePayoutBatchLine.commissionId,
			sentMinor: table.affiliatePayoutBatchLine.sentMinor,
			net: sql<string>`COALESCE((SELECT SUM(e.amount_delta_minor) FROM affiliate_commission_ledger_event e WHERE e.commission_id = ${table.affiliatePayoutBatchLine.commissionId}), 0)`
		})
		.from(table.affiliatePayoutBatchLine)
		.innerJoin(
			table.affiliatePayoutBatch,
			eq(table.affiliatePayoutBatchLine.batchId, table.affiliatePayoutBatch.id)
		)
		.innerJoin(
			table.affiliatePayout,
			sql`${table.affiliatePayout.payoutReference} = 'batch:' || ${table.affiliatePayoutBatch.id}`
		)
		.where(
			and(
				eq(table.affiliatePayout.affiliateId, affiliateId),
				eq(table.affiliatePayoutBatch.currency, currency),
				inArray(table.affiliatePayoutBatch.status, ['sending', 'paid'])
			)
		);
	let owedMinor = 0;
	for (const line of lines) {
		owedMinor += Math.max(line.sentMinor - Math.max(Number(line.net), 0), 0);
	}
	const [applied] = await executor
		.select({
			total: sql<string>`COALESCE(SUM(${table.affiliatePayoutBatch.debtAppliedMinor}), 0)`
		})
		.from(table.affiliatePayoutBatch)
		.innerJoin(
			table.affiliatePayout,
			sql`${table.affiliatePayout.payoutReference} = 'batch:' || ${table.affiliatePayoutBatch.id}`
		)
		.where(
			and(
				eq(table.affiliatePayout.affiliateId, affiliateId),
				eq(table.affiliatePayoutBatch.currency, currency),
				inArray(table.affiliatePayoutBatch.status, ['sending', 'paid'])
			)
		);
	return Math.max(owedMinor - Number(applied?.total ?? 0), 0);
}

/** Hold a transfer for a person: a prior send cannot be proven absent, so nothing is created. */
async function flagForManualReview(input: {
	key: string;
	kind: 'seller' | 'affiliate';
	reason: string;
	earningId?: string;
	batchId?: string;
	amountMinor: number;
	currency: string;
}): Promise<void> {
	await db
		.insert(table.payoutTransfer)
		.values({
			id: crypto.randomUUID(),
			kind: input.kind,
			earningId: input.earningId ?? null,
			batchId: input.batchId ?? null,
			amountMinor: input.amountMinor,
			currency: input.currency,
			status: 'failed',
			failureReason: input.reason,
			idempotencyKey: `${input.key}:review`
		})
		.onConflictDoUpdate({
			target: table.payoutTransfer.idempotencyKey,
			set: { failureReason: input.reason, updatedAt: sql`now()` }
		});
}

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
async function resumablePayMinor(
	earning: { earningId: string; netMinor: number },
	executor: any = db
): Promise<{ maxPayMinor: number; debtSettledMinor: number }> {
	const events: { eventType: string; amount: number; reasonCode: string | null }[] = await executor
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
					updatedAt: sql`now()`
				})
				.onConflictDoUpdate({
					target: table.payoutTransfer.idempotencyKey,
					set: { failureReason, updatedAt: sql`now()` }
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
				// Take over only a claim stale by the database clock, atomically under the account lock.
				const takenOver = await tx
					.update(table.payoutTransfer)
					.set({ updatedAt: sql`now()` })
					.where(
						and(
							eq(table.payoutTransfer.idempotencyKey, idempotencyKey),
							eq(table.payoutTransfer.status, 'pending'),
							sql`${table.payoutTransfer.updatedAt} < ${STALE_CLAIM_SQL}`
						)
					)
					.returning({ id: table.payoutTransfer.id });
				if (takenOver.length === 0) return { kind: 'done' as const };
				return {
					kind: 'resume' as const,
					amountMinor: existing.amountMinor,
					destination: existing.stripeAccountId
				};
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
						eq(table.sellerEarningEvent.currency, earning.currency),
						// Refund debt reserved for a Stripe reversal is not nettable until that outcome is recorded.
						sql`${table.sellerEarningEvent.eventReference} NOT LIKE '%:debt-reserved:%'`
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
				createdAt: sql`now()`,
				updatedAt: sql`now()`
			});
			return plan.permanent
				? { kind: 'done' as const }
				: { kind: 'send' as const, amountMinor: plan.payMinor };
		});
		if (claim.kind === 'done') continue;

		// Every transfer carries a group (the order's, else one per earning) so a resumed row can always be looked up.
		const transferGroup = order.transferGroup ?? `earning:${earning.earningId}`;
		let amountMinor = claim.amountMinor;
		let sentMinor = claim.amountMinor;
		let stripeTransferId: string | null = null;
		// The destination fixed at claim time, not the seller's current account, is what a prior send used.
		const sentTo =
			claim.kind === 'resume' ? (claim.destination ?? stripeAccountId) : stripeAccountId;
		if (claim.kind === 'resume') {
			// A crash may have left Stripe holding a transfer that was never recorded. Read every page first.
			// If Stripe cannot be read, the row stays pending: never create what might already exist.
			let found: FoundTransfer | null;
			try {
				found = await findTransferByMetadata(client, {
					group: transferGroup,
					destination: sentTo,
					key: 'earning_id',
					value: earning.earningId
				});
			} catch {
				continue;
			}
			const limits = await resumablePayMinor(earning);
			if (found) {
				stripeTransferId = found.id;
				sentMinor = found.amount;
			} else if (sentTo !== stripeAccountId) {
				// The account changed since the claim and the earlier send cannot be proven absent: never re-send.
				await flagForManualReview({
					key: idempotencyKey,
					kind: 'seller',
					reason: 'destination_changed_manual_review',
					earningId: earning.earningId,
					amountMinor: claim.amountMinor,
					currency: earning.currency
				});
				continue;
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
								updatedAt: sql`now()`
							})
							.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey));
					});
					continue;
				}
				sentMinor = amountMinor;
				if (amountMinor !== claim.amountMinor) {
					await db
						.update(table.payoutTransfer)
						.set({ amountMinor, updatedAt: sql`now()` })
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
					.set({ failureReason: 'transfer_failed', updatedAt: sql`now()` })
					.where(eq(table.payoutTransfer.idempotencyKey, idempotencyKey));
				continue;
			}
		}

		await db.transaction(async (tx) => {
			// Lock order is order -> earning -> payout account. Refund handling takes the same earning lock before it
			// decides whether this transfer is pending or paid, so a refund cannot slip between the read and the update.
			await tx
				.select({ id: table.sellerEarning.id })
				.from(table.sellerEarning)
				.where(eq(table.sellerEarning.id, earning.earningId))
				.for('update');
			// Re-check after the send: a refund that landed while Stripe was working shrank what was owed, and the
			// excess already sent becomes debt against the seller (netted from a later transfer).
			const limits = await resumablePayMinor(earning, tx);
			if (sentMinor > Math.max(limits.maxPayMinor, 0)) {
				await tx
					.insert(table.sellerEarningEvent)
					.values({
						id: crypto.randomUUID(),
						earningId: earning.earningId,
						eventType: 'debt',
						amountDeltaMinor: sentMinor - Math.max(limits.maxPayMinor, 0),
						currency: earning.currency,
						eventReference: `seller-earning:${earning.earningId}:debt:send-overpay`,
						reasonCode: 'overpay',
						createdAt: sql`now()`
					})
					.onConflictDoNothing();
			}
			await tx
				.update(table.payoutTransfer)
				.set({ status: 'succeeded', stripeTransferId, failureReason: null, updatedAt: sql`now()` })
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
): Promise<'paid' | 'not_approved' | 'no_account' | 'nothing_due' | 'manual_review'> {
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
	// Every claimed commission gets a line, including ones whose net fell to zero or below after the claim.
	const batchLines: { commissionId: string; sentMinor: number }[] = [];
	let dueMinor = 0;
	for (const commissionId of claimed) {
		const own = events.filter((event) => event.commissionId === commissionId);
		if (own.some((event) => event.eventType === 'paid')) continue;
		const net = own.reduce((sum, event) => sum + event.amountDeltaMinor, 0);
		batchLines.push({ commissionId, sentMinor: Math.max(net, 0) });
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
	// The destination fixed at claim time, not the affiliate's current account, is what a prior send used.
	let sentTo: string | null = account?.stripeAccountId ?? null;
	if (batch.status === 'approved') {
		const dueCappedMinor = Math.min(dueMinor, batch.totalMinor);
		if (dueCappedMinor <= 0) {
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
		const stripeAccountId = account.stripeAccountId;
		// Claim under the affiliate's payout-account lock so two batches cannot net the same debt twice.
		const claimed = await db.transaction(async (tx) => {
			await tx
				.select({ id: table.payoutAccount.id })
				.from(table.payoutAccount)
				.where(eq(table.payoutAccount.affiliateId, payout.affiliateId))
				.for('update');
			const debtMinor = await affiliateDebtMinor(tx, payout.affiliateId, batch.currency);
			const debtAppliedMinor = Math.min(debtMinor, dueCappedMinor);
			// Fix what each commission contributes before any money moves; debt is measured against these rows.
			const lineRows = await tx
				.insert(table.affiliatePayoutBatchLine)
				.values(batchLines.map((line) => ({ batchId, ...line })))
				.onConflictDoNothing()
				.returning({ commissionId: table.affiliatePayoutBatchLine.commissionId });
			if (batchLines.length > 0 && lineRows.length === 0) return null;
			const rows = await tx
				.update(table.affiliatePayoutBatch)
				.set({
					status: 'sending',
					sendAmountMinor: dueCappedMinor - debtAppliedMinor,
					debtAppliedMinor,
					sendStartedAt: sql`now()`,
					sendStripeAccountId: stripeAccountId
				})
				.where(
					and(
						eq(table.affiliatePayoutBatch.id, batchId),
						eq(table.affiliatePayoutBatch.status, 'approved')
					)
				)
				.returning({ id: table.affiliatePayoutBatch.id });
			return rows.length === 0 ? null : { amountMinor: dueCappedMinor - debtAppliedMinor };
		});
		if (!claimed) return 'not_approved';
		amountMinor = claimed.amountMinor;
		if (amountMinor <= 0) {
			// The affiliate's debt absorbed this whole batch: close the commissions, send nothing.
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
					.update(table.affiliatePayoutBatch)
					.set({ status: 'paid' })
					.where(eq(table.affiliatePayoutBatch.id, batchId));
			});
			return 'paid';
		}
	} else {
		if (batch.sendAmountMinor === null || !account?.stripeAccountId) return 'no_account';
		// Take over only a stale claim; the conditional UPDATE lets exactly one resumer through.
		const takenOver = await db
			.update(table.affiliatePayoutBatch)
			.set({ sendStartedAt: sql`now()` })
			.where(
				and(
					eq(table.affiliatePayoutBatch.id, batchId),
					eq(table.affiliatePayoutBatch.status, 'sending'),
					or(
						isNull(table.affiliatePayoutBatch.sendStartedAt),
						sql`${table.affiliatePayoutBatch.sendStartedAt} < ${STALE_CLAIM_SQL}`
					)
				)
			)
			.returning({ id: table.affiliatePayoutBatch.id });
		if (takenOver.length === 0) return 'not_approved';
		amountMinor = batch.sendAmountMinor;
		sentTo = batch.sendStripeAccountId;
	}

	const idempotencyKey = `affiliate-batch:${batchId}`;
	let stripeTransferId: string | null = null;
	if (batch.status === 'sending') {
		try {
			stripeTransferId =
				(
					await findTransferByMetadata(client, {
						group: idempotencyKey,
						destination: sentTo ?? account.stripeAccountId,
						key: 'batch_id',
						value: batchId
					})
				)?.id ?? null;
		} catch {
			return 'no_account';
		}
	}
	if (!stripeTransferId && batch.status === 'sending' && sentTo !== account.stripeAccountId) {
		// The account changed since the claim (or was never recorded) and the earlier send cannot be proven absent.
		await flagForManualReview({
			key: `affiliate-batch:${batchId}`,
			kind: 'affiliate',
			reason: 'destination_changed_manual_review',
			batchId,
			amountMinor,
			currency: batch.currency
		});
		return 'manual_review';
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
				stripeAccountId: sentTo ?? account.stripeAccountId,
				amountMinor,
				currency: batch.currency,
				status: 'succeeded',
				idempotencyKey,
				stripeTransferId,
				createdAt: now,
				updatedAt: sql`now()`
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

/** Approve a waiting batch (one conditional UPDATE, so a double click approves once) and send it when the gate is open. */
export async function approveAffiliateBatch(
	batchId: string,
	source: Record<string, string | undefined>,
	client: TransferClient | null,
	now = new Date()
): Promise<{ paid: boolean; reason: string }> {
	const approved = await db
		.update(table.affiliatePayoutBatch)
		.set({ status: 'approved', approvedAt: sql`now()` })
		.where(
			and(
				eq(table.affiliatePayoutBatch.id, batchId),
				eq(table.affiliatePayoutBatch.status, 'pending_approval')
			)
		)
		.returning({ id: table.affiliatePayoutBatch.id });
	if (approved.length === 0) return { paid: false, reason: 'not_pending' };
	if (affiliateBatchGate(source).action !== 'pay' || !client) {
		return { paid: false, reason: 'not_ready' };
	}
	const outcome = await payApprovedAffiliateBatch(client, batchId, now);
	return { paid: outcome === 'paid', reason: outcome };
}
