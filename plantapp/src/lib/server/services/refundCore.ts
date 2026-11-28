import { and, eq, inArray, like, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';
import { clawbackDelta, proportionalShare } from './refundClawback';

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
export type PendingReversal = {
	earningId: string;
	sellerId: number;
	currency: string;
	transferId: string;
	transferAmountMinor: number;
	reservedMinor: number;
	sourceKey: string;
};

export type ClawbackContext = {
	refundedMinor: number;
	/** What `refundedMinor` is a share of: the order total, or one seller's line total for an allocation. */
	totalMinor: number;
	/** Order total, used to size a dispute fee. */
	orderTotalMinor: number;
	sourceKey: string;
	objectId: string;
	/** True when refundedMinor is a running total (refunds, allocations) rather than one dispute's amount. */
	cumulative: boolean;
	reasonCode: 'refund' | 'chargeback';
	feeMinor: number;
	sellerPaysFee: boolean;
	/** A dispute fee already assigned to this earning (line allocation); overrides the order-share split. */
	feeForEarningMinor?: number;
	client: ReversalClient | null;
	now: Date;
};

/**
 * Claw back one earning inside the caller's transaction. Locks the earning row first (lock order: order ->
 * earning -> commission -> payout account), so a transfer success transaction and this handler serialize.
 * An in-flight (pending) transfer counts as paid: the refund becomes debt, never a silent pre-transfer reduction.
 */
export async function clawbackEarning(
	tx: any,
	earning: typeof table.sellerEarning.$inferSelect,
	ctx: ClawbackContext
): Promise<PendingReversal | null> {
	await tx
		.select({ id: table.sellerEarning.id })
		.from(table.sellerEarning)
		.where(eq(table.sellerEarning.id, earning.id))
		.for('update');
	const events: {
		eventType: string;
		amount: number;
		reasonCode: string | null;
		eventReference: string;
		stripeReversalId: string | null;
	}[] = await tx
		.select({
			eventType: table.sellerEarningEvent.eventType,
			amount: table.sellerEarningEvent.amountDeltaMinor,
			reasonCode: table.sellerEarningEvent.reasonCode,
			eventReference: table.sellerEarningEvent.eventReference,
			stripeReversalId: table.sellerEarningEvent.stripeReversalId
		})
		.from(table.sellerEarningEvent)
		.where(eq(table.sellerEarningEvent.earningId, earning.id));
	// Only clawbacks count: 'reversed' for a refund or chargeback, and 'debt' recorded for one. A credit from a
	// dispute that was later won ('dispute_won') takes its amount back out. Fee debt, settlements and the Stripe
	// reversal of a debt carry other reason codes.
	const clawbacks = events
		.filter(
			(row) =>
				(row.eventType === 'reversed' || row.eventType === 'debt') &&
				(row.reasonCode === 'refund' ||
					row.reasonCode === 'chargeback' ||
					row.reasonCode === 'dispute_won')
		)
		.map((row) => ({ ...row, taken: row.eventType === 'reversed' ? -row.amount : row.amount }));
	const clawback = clawbackDelta({
		baseMinor: earning.netMinor,
		refundedMinor: ctx.refundedMinor,
		totalMinor: ctx.totalMinor,
		alreadyAllMinor: clawbacks.reduce((sum, row) => sum + row.taken, 0),
		alreadyForSourceMinor: clawbacks
			.filter((row) =>
				ctx.cumulative
					? row.reasonCode === ctx.reasonCode
					: row.eventReference.endsWith(`:${ctx.objectId}`)
			)
			.reduce((sum, row) => sum + row.taken, 0)
	});
	const transfers = await tx
		.select()
		.from(table.payoutTransfer)
		.where(
			and(
				eq(table.payoutTransfer.earningId, earning.id),
				inArray(table.payoutTransfer.status, ['succeeded', 'pending'])
			)
		);
	const transfer =
		transfers.find((row: { status: string }) => row.status === 'succeeded') ?? transfers[0];

	// Reserved for a Stripe reversal only when there is a Stripe transfer to reverse; otherwise plain nettable debt.
	const reservable = Boolean(ctx.client && transfer?.stripeTransferId);
	const reservedReference = `seller-earning:${earning.id}:debt-reserved:${ctx.sourceKey}`;
	const plainReference = `seller-earning:${earning.id}:debt:${ctx.sourceKey}`;
	if (clawback > 0 && transfer) {
		await tx
			.insert(table.sellerEarningEvent)
			.values({
				id: crypto.randomUUID(),
				earningId: earning.id,
				eventType: 'debt',
				amountDeltaMinor: clawback,
				currency: earning.currency,
				eventReference: reservable ? reservedReference : plainReference,
				reasonCode: ctx.reasonCode,
				createdAt: ctx.now
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
				eventReference: `seller-earning:${earning.id}:reversed:${ctx.sourceKey}`,
				reasonCode: ctx.reasonCode,
				createdAt: ctx.now
			})
			.onConflictDoNothing();
	}

	const feeDebt = ctx.sellerPaysFee
		? (ctx.feeForEarningMinor ??
			proportionalShare(
				ctx.feeMinor,
				earning.lineTotalMinor,
				ctx.orderTotalMinor || earning.lineTotalMinor
			))
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
				eventReference: `seller-earning:${earning.id}:debt-fee:${ctx.objectId}`,
				reasonCode: 'dispute_fee',
				createdAt: ctx.now
			})
			.onConflictDoNothing();
	}

	// A reservation (this delivery's or an earlier one's) without an outcome still needs one.
	const reservation = events.find((row) => row.eventReference === reservedReference);
	const reservedMinor = reservation ? reservation.amount : reservable ? clawback : 0;
	const hasOutcome = events.some(
		(row) =>
			row.eventReference === `seller-earning:${earning.id}:reversed-at-stripe:${ctx.sourceKey}` ||
			row.eventReference === `seller-earning:${earning.id}:debt-released:${ctx.sourceKey}`
	);
	if (transfer?.stripeTransferId && reservedMinor > 0 && !hasOutcome) {
		return {
			earningId: earning.id,
			sellerId: earning.sellerId,
			currency: earning.currency,
			transferId: transfer.stripeTransferId,
			transferAmountMinor: transfer.amountMinor,
			reservedMinor,
			sourceKey: ctx.sourceKey
		};
	}
	return null;
}

/** Reverse affiliate commission on an order by the same cumulative-delta rule. */
export async function reverseCommissions(
	tx: any,
	orderId: number,
	ctx: Pick<
		ClawbackContext,
		'refundedMinor' | 'sourceKey' | 'objectId' | 'cumulative' | 'reasonCode' | 'now'
	> & { orderTotalMinor: number }
): Promise<void> {
	const commissions = await tx
		.select()
		.from(table.affiliateCommissionLedger)
		.where(eq(table.affiliateCommissionLedger.sourceOrderId, orderId));
	for (const commission of commissions) {
		const reversals: { amount: number; reasonCode: string; eventReference: string }[] = await tx
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
			refundedMinor: ctx.refundedMinor,
			totalMinor: ctx.orderTotalMinor,
			alreadyForSourceMinor: reversals
				.filter((row) =>
					ctx.cumulative
						? row.reasonCode === ctx.reasonCode
						: row.eventReference.endsWith(`:${ctx.objectId}`)
				)
				.reduce((sum, row) => sum + Math.abs(row.amount), 0),
			alreadyAllMinor: reversals.reduce((sum, row) => sum + Math.abs(row.amount), 0)
		});
		if (portion <= 0) continue;
		// recordReversal takes its own row lock on the commission.
		await AffiliateCommissionService.recordReversal(tx, {
			commissionId: commission.id,
			amountMinor: portion,
			eventReference: `commission:${commission.id}:reversal:${ctx.reasonCode}:${ctx.sourceKey}`,
			reasonCode: ctx.reasonCode,
			causationReference: ctx.objectId,
			now: ctx.now
		});
	}
}

/**
 * Phase 2 for one reservation. Holds the seller's payout-account lock, so a payout run cannot net this debt
 * meanwhile. Every path to Stripe looks first, then creates, then records: a reversal Stripe already holds (from a
 * timed-out earlier attempt, even past the 24h idempotency window) is adopted, never repeated.
 */
export async function settleReservedDebt(
	client: ReversalClient | null,
	work: PendingReversal,
	now: Date
): Promise<void> {
	const { sourceKey } = work;
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
			// 1. Find first. If Stripe cannot be read, nothing is created and the reservation stays (webhook retries).
			recovered = await findReversal(client, work.transferId, work.earningId, sourceKey);
			if (!recovered) {
				const key = `reversal:${work.earningId}:${sourceKey}`;
				try {
					// 2. Create under a stable key.
					const created = await client.transfers.createReversal(
						work.transferId,
						{ amount: reverseMinor, metadata: { earning_id: work.earningId, source: sourceKey } },
						{ idempotencyKey: key }
					);
					recovered = { id: created.id, amount: reverseMinor };
				} catch (error) {
					// 3. Only a definitive refusal, re-confirmed by a second look, proves no reversal exists. Anything
					// else (connection, timeout, rate limit, unknown) may have succeeded: stay reserved and retry.
					const existing = await findReversal(client, work.transferId, work.earningId, sourceKey);
					if (existing) recovered = existing;
					else if (!isDefinitiveStripeRefusal(error)) throw error;
				}
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

/** A 4xx invalid-request error (insufficient funds, already fully reversed): Stripe did not create the reversal. */
export function isDefinitiveStripeRefusal(error: unknown): boolean {
	if (typeof error !== 'object' || error === null) return false;
	const { type, statusCode } = error as { type?: unknown; statusCode?: unknown };
	return (
		type === 'StripeInvalidRequestError' &&
		typeof statusCode === 'number' &&
		statusCode >= 400 &&
		statusCode < 500
	);
}

export async function findReversal(
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

export type ReservedDebt = {
	earningId: string;
	sellerId: number;
	currency: string;
	sourceKey: string;
	reservedMinor: number;
	createdAt: Date;
};

/** Reservations with no recorded outcome: waiting on Stripe. Shown apart from collectable debt. */
export async function listReservedDebt(): Promise<ReservedDebt[]> {
	const reserved = await db
		.select({
			earningId: table.sellerEarningEvent.earningId,
			sellerId: table.sellerEarning.sellerId,
			currency: table.sellerEarningEvent.currency,
			reference: table.sellerEarningEvent.eventReference,
			amount: table.sellerEarningEvent.amountDeltaMinor,
			createdAt: table.sellerEarningEvent.createdAt
		})
		.from(table.sellerEarningEvent)
		.innerJoin(table.sellerEarning, eq(table.sellerEarningEvent.earningId, table.sellerEarning.id))
		.where(like(table.sellerEarningEvent.eventReference, '%:debt-reserved:%'));
	if (reserved.length === 0) return [];
	const outcomes = await db
		.select({ reference: table.sellerEarningEvent.eventReference })
		.from(table.sellerEarningEvent)
		.where(
			sql`${table.sellerEarningEvent.eventReference} LIKE '%:reversed-at-stripe:%' OR ${table.sellerEarningEvent.eventReference} LIKE '%:debt-released:%'`
		);
	const done = new Set(outcomes.map((row) => row.reference));
	return reserved
		.map((row) => {
			const sourceKey = row.reference.split(':debt-reserved:')[1];
			return { row, sourceKey };
		})
		.filter(
			({ row, sourceKey }) =>
				!done.has(`seller-earning:${row.earningId}:reversed-at-stripe:${sourceKey}`) &&
				!done.has(`seller-earning:${row.earningId}:debt-released:${sourceKey}`)
		)
		.map(({ row, sourceKey }) => ({
			earningId: row.earningId,
			sellerId: row.sellerId,
			currency: row.currency,
			sourceKey,
			reservedMinor: row.amount,
			createdAt: row.createdAt
		}));
}

/** Re-drive reservations that no webhook retry will reach. Find-first inside, so it is safe to run repeatedly. */
export async function sweepReservedDebt(
	client: ReversalClient | null,
	now = new Date()
): Promise<{ settled: number; stillReserved: number }> {
	const reservations = await listReservedDebt();
	// Without a Stripe client a sweep would release every reservation as nettable debt; it only runs with one.
	if (!client) return { settled: 0, stillReserved: reservations.length };
	let settled = 0;
	let stillReserved = 0;
	for (const reservation of reservations) {
		const [transfer] = await db
			.select()
			.from(table.payoutTransfer)
			.where(
				and(
					eq(table.payoutTransfer.earningId, reservation.earningId),
					eq(table.payoutTransfer.status, 'succeeded')
				)
			)
			.limit(1);
		if (!transfer?.stripeTransferId) {
			stillReserved += 1;
			continue;
		}
		try {
			await settleReservedDebt(
				client,
				{
					earningId: reservation.earningId,
					sellerId: reservation.sellerId,
					currency: reservation.currency,
					transferId: transfer.stripeTransferId,
					transferAmountMinor: transfer.amountMinor,
					reservedMinor: reservation.reservedMinor,
					sourceKey: reservation.sourceKey
				},
				now
			);
			settled += 1;
		} catch {
			stillReserved += 1;
		}
	}
	return { settled, stillReserved };
}
