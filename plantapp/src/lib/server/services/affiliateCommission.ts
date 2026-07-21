import { eq, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import * as table from '$lib/server/db/schema';

const MAX_SAFE_MINOR = Number.MAX_SAFE_INTEGER;

type Transaction = any;

export type CommissionLifecycleEvent = 'approved' | 'payable' | 'paid';
export type CommissionReversalReason = 'refund' | 'chargeback' | 'manual_adjustment';

export interface RecordPaidCommissionInput {
	draft: typeof table.checkoutDraft.$inferSelect;
	order: typeof table.order.$inferSelect;
	stripeWebhookEventId: string;
	now?: Date;
}

export interface CreatePayoutInstructionInput {
	affiliateId: number;
	payoutReference: string;
	currency: string;
	amountMinor: number;
	periodStart?: Date | null;
	periodEnd?: Date | null;
	now?: Date;
}

function newLedgerId(): string {
	return crypto.randomUUID();
}

function assertPositiveMinor(value: number, field: string): void {
	if (!Number.isSafeInteger(value) || value <= 0 || value > MAX_SAFE_MINOR) {
		throw new Error(`${field} must be a positive safe minor-unit amount`);
	}
}

function assertCurrency(value: string): void {
	if (!/^[a-z]{3}$/.test(value)) {
		throw new Error('Commission currency must be a lowercase ISO-like three-letter code');
	}
}

function sourceReference(orderId: number): string {
	return `order:${orderId}:commission`;
}

function pendingEventReference(orderId: number): string {
	return `order:${orderId}:commission:pending`;
}

function assertExistingCommissionMatches(
	commission: typeof table.affiliateCommissionLedger.$inferSelect,
	input: RecordPaidCommissionInput,
	affiliateId: number
): void {
	if (
		commission.affiliateId !== affiliateId
		|| commission.affiliateLinkId !== input.draft.affiliateLinkId
		|| commission.sourceOrderId !== input.order.id
		|| commission.sourceCheckoutDraftId !== input.draft.id
		|| commission.sourceReference !== sourceReference(input.order.id)
		|| commission.currency !== input.draft.currency
		|| commission.quotedAmountMinor !== input.draft.affiliateCommissionMinor
		|| commission.commissionRateBps !== input.draft.affiliateCommissionRateBps
		|| commission.draftSnapshotHash !== input.draft.snapshotHash
		|| commission.tierCode !== input.draft.affiliateTierCode
		|| commission.tierVersion !== input.draft.affiliateTierVersion
		|| commission.termsVersion !== input.draft.affiliateTermsVersion
		|| commission.disclosureVersion !== input.draft.affiliateDisclosureVersion
		|| commission.termsAcceptanceId !== input.draft.affiliateTermsAcceptanceId
	) {
		throw new Error('Immutable affiliate commission does not match its paid checkout draft');
	}
}

/** Append-only affiliate accounting sourced exclusively from immutable checkout drafts. */
export class AffiliateCommissionService {
	static isEnabled(): boolean {
		return env.AFFILIATE_LEDGER_ENABLED === 'true';
	}

	/** Record the single pending accrual for a fulfilled attributed draft in its enclosing transaction. */
	static async recordPaidCommission(
		tx: Transaction,
		input: RecordPaidCommissionInput
	): Promise<typeof table.affiliateCommissionLedger.$inferSelect | null> {
		const { draft, order } = input;
		if (!draft.affiliateLinkId) {
			if (draft.affiliateCommissionMinor === 0) {
				return null;
			}
			throw new Error('Attributed checkout draft has an invalid frozen commission quote');
		}
		if (draft.affiliateCommissionMinor === 0) {
			return null;
		}
		if (draft.affiliateCommissionMinor < 0) {
			throw new Error('Attributed checkout draft has an invalid frozen commission quote');
		}
		if (!this.isEnabled()) {
			throw new Error('Affiliate ledger is disabled for an attributed paid checkout');
		}
		if (order.checkoutDraftId !== draft.id || order.affiliateLinkId !== draft.affiliateLinkId) {
			throw new Error('Order does not match the attributed checkout draft');
		}
		assertPositiveMinor(draft.affiliateCommissionMinor, 'Frozen affiliate commission');
		assertCurrency(draft.currency);

		if (draft.affiliateId === null || draft.affiliateCommissionRateBps === null) {
			throw new Error('Attributed checkout draft is missing its immutable affiliate policy snapshot');
		}
		const [linkOwner] = await tx
			.select({ affiliateId: table.affiliateLink.affiliateId })
			.from(table.affiliateLink)
			.where(eq(table.affiliateLink.id, draft.affiliateLinkId))
			.limit(1);
		if (!linkOwner || linkOwner.affiliateId !== draft.affiliateId) {
			throw new Error('The immutable checkout attribution link no longer exists');
		}

		const [existing] = await tx
			.select()
			.from(table.affiliateCommissionLedger)
			.where(eq(table.affiliateCommissionLedger.sourceCheckoutDraftId, draft.id))
			.limit(1);
		if (existing) {
			assertExistingCommissionMatches(existing, input, draft.affiliateId);
			await this.assertPendingEvent(tx, existing, draft, order);
			return existing;
		}

		const now = input.now ?? new Date();
		const [commission] = await tx
			.insert(table.affiliateCommissionLedger)
			.values({
				id: newLedgerId(),
				affiliateId: draft.affiliateId,
				affiliateLinkId: draft.affiliateLinkId,
				sourceOrderId: order.id,
				sourceCheckoutDraftId: draft.id,
				sourceStripeWebhookEventId: input.stripeWebhookEventId,
				sourceReference: sourceReference(order.id),
				currency: draft.currency,
				quotedAmountMinor: draft.affiliateCommissionMinor,
				commissionRateBps: draft.affiliateCommissionRateBps,
				draftSnapshotHash: draft.snapshotHash,
				tierCode: draft.affiliateTierCode,
				tierVersion: draft.affiliateTierVersion,
				termsVersion: draft.affiliateTermsVersion,
				disclosureVersion: draft.affiliateDisclosureVersion,
				termsAcceptanceId: draft.affiliateTermsAcceptanceId,
				createdAt: now
			})
			.returning();

		await tx.insert(table.affiliateCommissionLedgerEvent).values({
			id: newLedgerId(),
			commissionId: commission.id,
			eventType: 'pending',
			amountDeltaMinor: draft.affiliateCommissionMinor,
			currency: draft.currency,
			eventReference: pendingEventReference(order.id),
			causationReference: input.stripeWebhookEventId,
			reasonCode: 'initial_accrual',
			createdAt: now
		});

		// These legacy dashboard counters are projections only; the immutable ledger is the source of truth.
		await tx
			.update(table.affiliateLink)
			.set({
				conversions: sql`${table.affiliateLink.conversions} + 1`,
				earnings: sql`${table.affiliateLink.earnings} + (${draft.affiliateCommissionMinor}::numeric / 100)`,
				updatedAt: now
			})
			.where(eq(table.affiliateLink.id, draft.affiliateLinkId));
		await tx
			.update(table.affiliate)
			.set({
				totalConversions: sql`${table.affiliate.totalConversions} + 1`,
				totalEarnings: sql`${table.affiliate.totalEarnings} + (${draft.affiliateCommissionMinor}::numeric / 100)`,
				updatedAt: now
			})
			.where(eq(table.affiliate.id, draft.affiliateId));

		return commission;
	}

	/** Append one idempotent refund, chargeback, or manual-clawback event without changing the commission fact. */
	static async recordReversal(
		tx: Transaction,
		input: {
			commissionId: string;
			amountMinor: number;
			eventReference: string;
			reasonCode: CommissionReversalReason;
			causationReference?: string;
			now?: Date;
		}
	): Promise<typeof table.affiliateCommissionLedgerEvent.$inferSelect> {
		assertPositiveMinor(input.amountMinor, 'Commission reversal');
		const [commission] = await tx
			.select()
			.from(table.affiliateCommissionLedger)
			.where(eq(table.affiliateCommissionLedger.id, input.commissionId))
			.for('update');
		if (!commission) {
			throw new Error('Affiliate commission not found');
		}

		const [existing] = await tx
			.select()
			.from(table.affiliateCommissionLedgerEvent)
			.where(eq(table.affiliateCommissionLedgerEvent.eventReference, input.eventReference))
			.limit(1);
		if (existing) {
			if (
				existing.commissionId !== commission.id
				|| existing.eventType !== 'reversed'
				|| existing.amountDeltaMinor !== -input.amountMinor
				|| existing.currency !== commission.currency
				|| existing.reasonCode !== input.reasonCode
			) {
				throw new Error('Commission reversal idempotency reference was reused with different data');
			}
			return existing;
		}

		const reversalEvents = await tx
			.select({
				eventType: table.affiliateCommissionLedgerEvent.eventType,
				amountDeltaMinor: table.affiliateCommissionLedgerEvent.amountDeltaMinor
			})
			.from(table.affiliateCommissionLedgerEvent)
			.where(eq(table.affiliateCommissionLedgerEvent.commissionId, commission.id));
		const reversedMinor = reversalEvents
			.filter((event: { eventType: string }) => event.eventType === 'reversed')
			.reduce((total: number, event: { amountDeltaMinor: number }) => total + Math.abs(event.amountDeltaMinor), 0);
		if (reversedMinor + input.amountMinor > commission.quotedAmountMinor) {
			throw new Error('Commission reversal exceeds the immutable quoted commission');
		}

		const [event] = await tx
			.insert(table.affiliateCommissionLedgerEvent)
			.values({
				id: newLedgerId(),
				commissionId: commission.id,
				eventType: 'reversed',
				amountDeltaMinor: -input.amountMinor,
				currency: commission.currency,
				eventReference: input.eventReference,
				causationReference: input.causationReference,
				reasonCode: input.reasonCode,
				createdAt: input.now ?? new Date()
			})
			.onConflictDoNothing()
			.returning();
		if (event) {
			return event;
		}
		const [winner] = await tx
			.select()
			.from(table.affiliateCommissionLedgerEvent)
			.where(eq(table.affiliateCommissionLedgerEvent.eventReference, input.eventReference))
			.limit(1);
		if (
			!winner
			|| winner.commissionId !== commission.id
			|| winner.eventType !== 'reversed'
			|| winner.amountDeltaMinor !== -input.amountMinor
			|| winner.currency !== commission.currency
			|| winner.reasonCode !== input.reasonCode
		) {
			throw new Error('Commission reversal idempotency reference was reused with different data');
		}
		return winner;
	}

	/** Append an approval or payout lifecycle event; this does not call a payment provider. */
	static async recordLifecycleEvent(
		tx: Transaction,
		input: {
			commissionId: string;
			eventType: CommissionLifecycleEvent;
			eventReference: string;
			payoutId?: string;
			causationReference?: string;
			now?: Date;
		}
	): Promise<typeof table.affiliateCommissionLedgerEvent.$inferSelect> {
		if ((input.eventType === 'payable' || input.eventType === 'paid') !== Boolean(input.payoutId)) {
			throw new Error('Payable and paid commission events require a payout reference');
		}
		const [commission] = await tx
			.select()
			.from(table.affiliateCommissionLedger)
			.where(eq(table.affiliateCommissionLedger.id, input.commissionId))
			.for('update');
		if (!commission) {
			throw new Error('Affiliate commission not found');
		}
		const [existing] = await tx
			.select()
			.from(table.affiliateCommissionLedgerEvent)
			.where(eq(table.affiliateCommissionLedgerEvent.eventReference, input.eventReference))
			.limit(1);
		if (existing) {
			if (
				existing.commissionId !== commission.id
				|| existing.eventType !== input.eventType
				|| existing.amountDeltaMinor !== 0
				|| existing.payoutId !== (input.payoutId ?? null)
				|| existing.currency !== commission.currency
			) {
				throw new Error('Commission lifecycle idempotency reference was reused with different data');
			}
			return existing;
		}
		const events = await tx
			.select({
				eventType: table.affiliateCommissionLedgerEvent.eventType,
				amountDeltaMinor: table.affiliateCommissionLedgerEvent.amountDeltaMinor
			})
			.from(table.affiliateCommissionLedgerEvent)
			.where(eq(table.affiliateCommissionLedgerEvent.commissionId, commission.id));
		const hasEvent = (eventType: string) => events.some((event: { eventType: string }) => event.eventType === eventType);
		const netAmountMinor = events.reduce(
			(total: number, event: { amountDeltaMinor: number }) => total + event.amountDeltaMinor,
			0
		);
		if (!hasEvent('pending') || netAmountMinor <= 0) {
			throw new Error('Commission is not eligible for a lifecycle transition');
		}
		if (input.eventType === 'approved' && (hasEvent('approved') || hasEvent('payable') || hasEvent('paid'))) {
			throw new Error('Commission has already advanced beyond pending approval');
		}
		if (input.eventType === 'payable' && (!hasEvent('approved') || hasEvent('payable') || hasEvent('paid'))) {
			throw new Error('Commission must be approved exactly once before it becomes payable');
		}
		if (input.eventType === 'paid' && (!hasEvent('payable') || hasEvent('paid'))) {
			throw new Error('Commission must be payable exactly once before it is marked paid');
		}

		if (input.payoutId) {
			const [payout] = await tx
				.select()
				.from(table.affiliatePayout)
				.where(eq(table.affiliatePayout.id, input.payoutId))
				.limit(1);
			if (!payout || payout.affiliateId !== commission.affiliateId || payout.currency !== commission.currency) {
				throw new Error('Commission payout does not match the affiliate or currency');
			}
		}

		const [event] = await tx
			.insert(table.affiliateCommissionLedgerEvent)
			.values({
				id: newLedgerId(),
				commissionId: commission.id,
				eventType: input.eventType,
				amountDeltaMinor: 0,
				currency: commission.currency,
				payoutId: input.payoutId,
				eventReference: input.eventReference,
				causationReference: input.causationReference,
				reasonCode: input.eventType === 'approved' ? 'manual_adjustment' : 'payout',
				createdAt: input.now ?? new Date()
			})
			.onConflictDoNothing()
			.returning();
		if (event) {
			return event;
		}
		const [winner] = await tx
			.select()
			.from(table.affiliateCommissionLedgerEvent)
			.where(eq(table.affiliateCommissionLedgerEvent.eventReference, input.eventReference))
			.limit(1);
		if (
			!winner
			|| winner.commissionId !== commission.id
			|| winner.eventType !== input.eventType
			|| winner.amountDeltaMinor !== 0
			|| winner.payoutId !== (input.payoutId ?? null)
			|| winner.currency !== commission.currency
		) {
			throw new Error('Commission lifecycle idempotency reference was reused with different data');
		}
		return winner;
	}

	/** Create or retrieve an immutable payout instruction; provider disbursement remains a separate workflow. */
	static async createPayoutInstruction(
		tx: Transaction,
		input: CreatePayoutInstructionInput
	): Promise<typeof table.affiliatePayout.$inferSelect> {
		assertPositiveMinor(input.amountMinor, 'Payout');
		assertCurrency(input.currency);
		if (input.periodStart && input.periodEnd && input.periodStart > input.periodEnd) {
			throw new Error('Payout period must end on or after its start');
		}
		const [existing] = await tx
			.select()
			.from(table.affiliatePayout)
			.where(eq(table.affiliatePayout.payoutReference, input.payoutReference))
			.limit(1);
		if (existing) {
			if (
				existing.affiliateId !== input.affiliateId
				|| existing.currency !== input.currency
				|| existing.amountMinor !== input.amountMinor
			) {
				throw new Error('Payout reference was reused with different data');
			}
			return existing;
		}
		const [payout] = await tx
			.insert(table.affiliatePayout)
			.values({
				id: newLedgerId(),
				affiliateId: input.affiliateId,
				payoutReference: input.payoutReference,
				currency: input.currency,
				amountMinor: input.amountMinor,
				periodStart: input.periodStart ?? null,
				periodEnd: input.periodEnd ?? null,
				createdAt: input.now ?? new Date()
			})
			.onConflictDoNothing()
			.returning();
		if (payout) {
			return payout;
		}
		const [winner] = await tx
			.select()
			.from(table.affiliatePayout)
			.where(eq(table.affiliatePayout.payoutReference, input.payoutReference))
			.limit(1);
		if (
			!winner
			|| winner.affiliateId !== input.affiliateId
			|| winner.currency !== input.currency
			|| winner.amountMinor !== input.amountMinor
		) {
			throw new Error('Payout reference was reused with different data');
		}
		return winner;
	}

	/** Persist one idempotent terms/disclosure acceptance record for later commission snapshots. */
	static async recordTermsAcceptance(
		tx: Transaction,
		input: {
			affiliateId: number;
			termsVersion: string;
			disclosureVersion: string;
			acceptanceReference: string;
			acceptedAt?: Date;
			now?: Date;
		}
	): Promise<typeof table.affiliateTermsAcceptance.$inferSelect> {
		if (!input.termsVersion || !input.disclosureVersion || !input.acceptanceReference) {
			throw new Error('Affiliate terms acceptance requires non-empty version and reference values');
		}
		const [byReference] = await tx
			.select()
			.from(table.affiliateTermsAcceptance)
			.where(eq(table.affiliateTermsAcceptance.acceptanceReference, input.acceptanceReference))
			.limit(1);
		if (byReference) {
			if (
				byReference.affiliateId !== input.affiliateId
				|| byReference.termsVersion !== input.termsVersion
				|| byReference.disclosureVersion !== input.disclosureVersion
			) {
				throw new Error('Terms acceptance reference was reused with different data');
			}
			return byReference;
		}

		const [byVersion] = await tx
			.select()
			.from(table.affiliateTermsAcceptance)
			.where(sql`${table.affiliateTermsAcceptance.affiliateId} = ${input.affiliateId} AND ${table.affiliateTermsAcceptance.termsVersion} = ${input.termsVersion} AND ${table.affiliateTermsAcceptance.disclosureVersion} = ${input.disclosureVersion}`)
			.limit(1);
		if (byVersion) {
			return byVersion;
		}

		const [acceptance] = await tx
			.insert(table.affiliateTermsAcceptance)
			.values({
				id: newLedgerId(),
				affiliateId: input.affiliateId,
				termsVersion: input.termsVersion,
				disclosureVersion: input.disclosureVersion,
				acceptanceReference: input.acceptanceReference,
				acceptedAt: input.acceptedAt ?? new Date(),
				createdAt: input.now ?? new Date()
			})
			.onConflictDoNothing()
			.returning();
		if (acceptance) {
			return acceptance;
		}
		const [winnerByReference] = await tx
			.select()
			.from(table.affiliateTermsAcceptance)
			.where(eq(table.affiliateTermsAcceptance.acceptanceReference, input.acceptanceReference))
			.limit(1);
		if (winnerByReference) {
			if (
				winnerByReference.affiliateId !== input.affiliateId
				|| winnerByReference.termsVersion !== input.termsVersion
				|| winnerByReference.disclosureVersion !== input.disclosureVersion
			) {
				throw new Error('Terms acceptance reference was reused with different data');
			}
			return winnerByReference;
		}

		const [winner] = await tx
			.select()
			.from(table.affiliateTermsAcceptance)
			.where(sql`${table.affiliateTermsAcceptance.affiliateId} = ${input.affiliateId} AND ${table.affiliateTermsAcceptance.termsVersion} = ${input.termsVersion} AND ${table.affiliateTermsAcceptance.disclosureVersion} = ${input.disclosureVersion}`)
			.limit(1);
		if (!winner) {
			throw new Error('Unable to create or retrieve affiliate terms acceptance');
		}
		return winner;
	}

	private static async assertPendingEvent(
		tx: Transaction,
		commission: typeof table.affiliateCommissionLedger.$inferSelect,
		draft: typeof table.checkoutDraft.$inferSelect,
		order: typeof table.order.$inferSelect
	): Promise<void> {
		const [pending] = await tx
			.select()
			.from(table.affiliateCommissionLedgerEvent)
			.where(eq(table.affiliateCommissionLedgerEvent.eventReference, pendingEventReference(order.id)))
			.limit(1);
		if (
			!pending
			|| pending.commissionId !== commission.id
			|| pending.eventType !== 'pending'
			|| pending.amountDeltaMinor !== draft.affiliateCommissionMinor
			|| pending.currency !== draft.currency
		) {
			throw new Error('Immutable affiliate commission is missing its pending accrual event');
		}
	}
}

export default AffiliateCommissionService;
