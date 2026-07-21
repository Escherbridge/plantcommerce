import { dev } from '$app/environment';
import { env as publicEnv } from '$env/dynamic/public';
import { encodeBase64url } from '@oslojs/encoding';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type Stripe from 'stripe';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { assertPublicCatalogAvailable } from '../catalogTruth/publicCatalog';
import {
	CheckoutDraftService,
	hashGuestCheckoutSubject,
	type CheckoutBuyer
} from './checkoutDraft';
import { StripeCheckoutService } from './stripeCheckout';

const ACTIVE_ATTEMPT_STATUSES = ['pending_session', 'checkout_created', 'quarantined', 'paid'] as const;
const STRIPE_SESSION_SAFETY_MARGIN_MS = 31 * 60 * 1000;

export interface CheckoutSessionResult {
	draftId: string;
	draftReference: string;
	stripeSessionId: string;
	checkoutUrl: string;
}

type PreparedAttempt = {
	draft: typeof table.checkoutDraft.$inferSelect;
	attempt: typeof table.checkoutPaymentAttempt.$inferSelect;
	items: Array<typeof table.checkoutDraftItem.$inferSelect>;
};

function newOpaqueId(prefix: string): string {
	return `${prefix}_${encodeBase64url(crypto.getRandomValues(new Uint8Array(24)))}`;
}

function stableProviderIdempotencyKey(draftId: string, attemptNumber: number): string {
	return `aevani:checkout:${draftId}:${attemptNumber}`;
}

function draftBelongsToBuyer(draft: typeof table.checkoutDraft.$inferSelect, buyer: CheckoutBuyer): boolean {
	return buyer.kind === 'user'
		? draft.userId === buyer.userId && draft.guestSubjectHash === null
		: draft.userId === null && draft.guestSubjectHash === hashGuestCheckoutSubject(buyer.guestCartSessionId);
}

function checkoutUrls(reference: string): { successUrl: string; cancelUrl: string } {
	let baseUrl: URL;
	try {
		baseUrl = new URL(publicEnv.PUBLIC_BASE_URL);
	} catch {
		throw new Error('PUBLIC_BASE_URL must be an absolute checkout URL');
	}

	if (baseUrl.protocol !== 'https:' && !(dev && baseUrl.protocol === 'http:')) {
		throw new Error('PUBLIC_BASE_URL must use HTTPS outside local development');
	}

	const base = baseUrl.toString().replace(/\/$/, '');
	return {
		successUrl: `${base}/checkout/success?draft=${encodeURIComponent(reference)}`,
		cancelUrl: `${base}/cart`
	};
}

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
	if (typeof session.payment_intent === 'string') {
		return session.payment_intent;
	}

	return session.payment_intent?.id ?? null;
}

function providerFailureCode(error: unknown): string {
	if (typeof error === 'object' && error !== null && 'type' in error && typeof error.type === 'string') {
		return error.type;
	}

	return 'stripe_checkout_session_creation_failed';
}

function isConfirmedProviderCreationFailure(error: unknown): boolean {
	const type = providerFailureCode(error);
	return type === 'StripeInvalidRequestError'
		|| type === 'StripeAuthenticationError'
		|| type === 'StripePermissionError';
}

function providerSessionIntegrityError(
	session: Stripe.Checkout.Session,
	draft: typeof table.checkoutDraft.$inferSelect,
	attempt: typeof table.checkoutPaymentAttempt.$inferSelect
): string | null {
	if (session.mode !== 'payment'
		|| session.metadata?.checkout_draft_reference !== draft.reference
		|| session.amount_total !== attempt.amountMinor
		|| session.currency !== attempt.currency
		|| !session.expires_at
		|| session.expires_at * 1000 > draft.expiresAt.getTime()) {
		return 'stripe_session_integrity_mismatch';
	}

	return null;
}

function assertProviderSessionMatches(
	session: Stripe.Checkout.Session,
	draft: typeof table.checkoutDraft.$inferSelect,
	attempt: typeof table.checkoutPaymentAttempt.$inferSelect
): void {
	if (providerSessionIntegrityError(session, draft, attempt)) {
		throw new Error('Stripe checkout session does not match its immutable payment attempt');
	}
}

function immutableStripeLineItems(
	draft: typeof table.checkoutDraft.$inferSelect,
	items: Array<typeof table.checkoutDraftItem.$inferSelect>
) {
	const subtotalFromItems = items.reduce((total, item) => total + BigInt(item.totalPriceMinor), 0n);
	if (subtotalFromItems !== BigInt(draft.subtotalMinor) || draft.discountMinor !== 0) {
		throw new Error('Checkout draft cannot be represented as verified Stripe line items');
	}

	const lineItems = items.map((item) => ({
		name: item.productName,
		unitPriceMinor: item.unitPriceMinor,
		quantity: item.quantity
	}));
	if (draft.taxMinor > 0) {
		lineItems.push({ name: 'Sales tax', unitPriceMinor: draft.taxMinor, quantity: 1 });
	}
	if (draft.shippingMinor > 0) {
		lineItems.push({ name: 'Shipping', unitPriceMinor: draft.shippingMinor, quantity: 1 });
	}

	const totalFromLineItems = lineItems.reduce(
		(total, item) => total + BigInt(item.unitPriceMinor) * BigInt(item.quantity),
		0n
	);
	if (totalFromLineItems !== BigInt(draft.totalMinor)) {
		throw new Error('Checkout draft total does not match its Stripe line items');
	}

	return lineItems;
}

export class CheckoutPaymentService {
	/** Start or return the single Stripe Checkout session associated with an immutable draft. */
	static async createOrReuseSession(
		buyer: CheckoutBuyer,
		allowDraftRefresh = true
	): Promise<CheckoutSessionResult> {
		assertPublicCatalogAvailable();
		const snapshot = await CheckoutDraftService.createFromCart({ buyer });
		if (snapshot.status === 'paid' || snapshot.status === 'fulfilled') {
			throw new Error('This checkout has already been paid and is awaiting fulfillment');
		}
		if (snapshot.status === 'quarantined') {
			throw new Error('This checkout requires payment reconciliation before it can continue');
		}
		if (snapshot.status === 'expired' || snapshot.status === 'failed') {
			throw new Error('This checkout is no longer available');
		}

		const prepared = await this.prepareAttempt(snapshot.id, buyer);
		if (!prepared) {
			if (!allowDraftRefresh) {
				throw new Error('Checkout draft does not have enough remaining lifetime for Stripe Checkout');
			}
			return await this.createOrReuseSession(buyer, false);
		}
		if (prepared.attempt.status === 'checkout_created') {
			return await this.resolveExistingSession(prepared.draft, prepared.attempt);
		}
		if (prepared.attempt.status !== 'pending_session') {
			throw new Error('This checkout cannot start another payment session');
		}

		let lineItems: ReturnType<typeof immutableStripeLineItems>;
		let urls: ReturnType<typeof checkoutUrls>;
		try {
			lineItems = immutableStripeLineItems(prepared.draft, prepared.items);
			urls = checkoutUrls(prepared.draft.reference);
		} catch {
			await this.failPendingAttempt(prepared.attempt.id, 'checkout_draft_provider_configuration_invalid');
			throw new Error('Unable to start secure checkout. Please try again.');
		}

		let providerSession: Stripe.Checkout.Session;
		try {
			providerSession = await StripeCheckoutService.createCheckoutSession({
				lineItems,
				currency: prepared.draft.currency,
				successUrl: urls.successUrl,
				cancelUrl: urls.cancelUrl,
				draftReference: prepared.draft.reference,
				idempotencyKey: prepared.attempt.providerIdempotencyKey,
				expiresAt: prepared.draft.expiresAt
			});
		} catch (providerError) {
			if (isConfirmedProviderCreationFailure(providerError)) {
				await this.failPendingAttempt(prepared.attempt.id, providerFailureCode(providerError));
			}
			throw new Error('Unable to start secure checkout. Please try again.');
		}

		const integrityError = providerSessionIntegrityError(providerSession, prepared.draft, prepared.attempt);
		const persisted = await this.persistProviderSession(prepared.attempt.id, providerSession, integrityError);
		if (integrityError) {
			await this.expireQuarantinedSession(persisted.attempt.id, providerSession.id);
			throw new Error('Unable to start secure checkout. Please contact support if the issue persists.');
		}
		if (persisted.stripeSessionId !== providerSession.id) {
			return await this.resolveExistingSession(persisted.draft, persisted.attempt);
		}

		return this.toSessionResult(persisted.draft, persisted.attempt, providerSession);
	}

	private static async prepareAttempt(draftId: string, buyer: CheckoutBuyer): Promise<PreparedAttempt | null> {
		return await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, draftId))
				.for('update');

			if (!draft || !draftBelongsToBuyer(draft, buyer)) {
				throw new Error('Checkout draft was not found');
			}
			if (draft.status === 'quarantined' || draft.status === 'paid' || draft.status === 'fulfilled' || draft.status === 'expired' || draft.status === 'failed') {
				throw new Error('Checkout draft is not eligible for a payment session');
			}

			const attempts = await tx
				.select()
				.from(table.checkoutPaymentAttempt)
				.where(
					and(
						eq(table.checkoutPaymentAttempt.draftId, draft.id),
						inArray(table.checkoutPaymentAttempt.status, [...ACTIVE_ATTEMPT_STATUSES])
					)
				)
				.orderBy(desc(table.checkoutPaymentAttempt.attemptNumber))
				.for('update');

			const items = await tx
				.select()
				.from(table.checkoutDraftItem)
				.where(eq(table.checkoutDraftItem.draftId, draft.id));

			if (items.length === 0) {
				throw new Error('Checkout draft has no immutable line items');
			}

			const existingAttempt = attempts[0];
			if (existingAttempt) {
				if (existingAttempt.status === 'paid') {
					throw new Error('This checkout has already been paid and is awaiting fulfillment');
				}
				if (existingAttempt.status === 'checkout_created' && !existingAttempt.stripeSessionId) {
					throw new Error('Checkout payment attempt is missing its Stripe session');
				}
				return { draft, attempt: existingAttempt, items };
			}

			if (draft.status !== 'pending_session') {
				throw new Error('Checkout draft state does not permit a new payment attempt');
			}
			if (draft.expiresAt.getTime() - Date.now() < STRIPE_SESSION_SAFETY_MARGIN_MS) {
				await CheckoutDraftService.releaseLockedDraftReservations(tx, draft, 'expired');
				return null;
			}

			const priorAttempts = await tx
				.select({ attemptNumber: table.checkoutPaymentAttempt.attemptNumber })
				.from(table.checkoutPaymentAttempt)
				.where(eq(table.checkoutPaymentAttempt.draftId, draft.id))
				.orderBy(desc(table.checkoutPaymentAttempt.attemptNumber))
				.limit(1);
			const attemptNumber = (priorAttempts[0]?.attemptNumber ?? 0) + 1;
			const [attempt] = await tx
				.insert(table.checkoutPaymentAttempt)
				.values({
					id: newOpaqueId('pay_attempt'),
					draftId: draft.id,
					attemptNumber,
					providerIdempotencyKey: stableProviderIdempotencyKey(draft.id, attemptNumber),
					amountMinor: draft.totalMinor,
					currency: draft.currency
				})
				.returning();

			return { draft, attempt, items };
		});
	}

	private static async persistProviderSession(
		attemptId: string,
		session: Stripe.Checkout.Session,
		integrityError: string | null
	): Promise<Pick<PreparedAttempt, 'draft' | 'attempt'>> {
		const [unlockedAttempt] = await db
			.select({ draftId: table.checkoutPaymentAttempt.draftId })
			.from(table.checkoutPaymentAttempt)
			.where(eq(table.checkoutPaymentAttempt.id, attemptId))
			.limit(1);
		if (!unlockedAttempt) {
			throw new Error('Checkout payment attempt was not found');
		}

		return await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, unlockedAttempt.draftId))
				.for('update');
			const [attempt] = await tx
				.select()
				.from(table.checkoutPaymentAttempt)
				.where(and(
					eq(table.checkoutPaymentAttempt.id, attemptId),
					eq(table.checkoutPaymentAttempt.draftId, unlockedAttempt.draftId)
				))
				.for('update');

			if (!draft || !attempt) {
				throw new Error('Checkout payment attempt was not found');
			}
			if (attempt.status === 'checkout_created' || attempt.status === 'quarantined') {
				if (!attempt.stripeSessionId) {
					throw new Error('Checkout payment attempt is missing its Stripe session');
				}
				return { draft, attempt };
			}
			if (attempt.status !== 'pending_session' || draft.status !== 'pending_session') {
				throw new Error('Checkout payment attempt is no longer pending');
			}

			const now = new Date();
			const nextStatus = integrityError ? 'quarantined' : 'checkout_created';
			const [updatedAttempt] = await tx
				.update(table.checkoutPaymentAttempt)
				.set({
					stripeSessionId: session.id,
					stripePaymentIntentId: paymentIntentId(session),
					status: nextStatus,
					...(integrityError
						? {
							lastErrorCode: integrityError,
							lastErrorMessage: 'Stripe session failed immutable checkout verification'
						}
						: {}),
					updatedAt: now
				})
				.where(eq(table.checkoutPaymentAttempt.id, attempt.id))
				.returning();
			const [updatedDraft] = await tx
				.update(table.checkoutDraft)
				.set({ status: integrityError ? 'quarantined' : 'checkout_created', updatedAt: now })
				.where(eq(table.checkoutDraft.id, draft.id))
				.returning();

			return { draft: updatedDraft, attempt: updatedAttempt };
		});
	}

	private static async failPendingAttempt(attemptId: string, errorCode: string): Promise<boolean> {
		const [unlockedAttempt] = await db
			.select({ draftId: table.checkoutPaymentAttempt.draftId })
			.from(table.checkoutPaymentAttempt)
			.where(eq(table.checkoutPaymentAttempt.id, attemptId))
			.limit(1);
		if (!unlockedAttempt) {
			return false;
		}

		return await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, unlockedAttempt.draftId))
				.for('update');
			const [attempt] = await tx
				.select()
				.from(table.checkoutPaymentAttempt)
				.where(and(
					eq(table.checkoutPaymentAttempt.id, attemptId),
					eq(table.checkoutPaymentAttempt.draftId, unlockedAttempt.draftId)
				))
				.for('update');

			if (!draft || !attempt || attempt.status !== 'pending_session' || draft.status !== 'pending_session') {
				return false;
			}

			const now = new Date();
			await tx
				.update(table.checkoutPaymentAttempt)
				.set({
					status: 'failed',
					lastErrorCode: errorCode,
					lastErrorMessage: 'Stripe Checkout session creation failed',
					updatedAt: now
				})
				.where(eq(table.checkoutPaymentAttempt.id, attempt.id));
			return await CheckoutDraftService.releaseLockedDraftReservations(tx, draft, 'failed', now);
		});
	}

	private static async resolveExistingSession(
		draft: typeof table.checkoutDraft.$inferSelect,
		attempt: typeof table.checkoutPaymentAttempt.$inferSelect
	): Promise<CheckoutSessionResult> {
		if (!attempt.stripeSessionId) {
			throw new Error('Checkout payment attempt is missing its Stripe session');
		}

		const session = await StripeCheckoutService.getCheckoutSession(attempt.stripeSessionId);
		assertProviderSessionMatches(session, draft, attempt);
		if (session.status === 'expired') {
			await this.releaseConfirmedExpiredAttempt(attempt.id);
			throw new Error('The existing checkout session has expired');
		}
		if (session.payment_status === 'paid') {
			throw new Error('This checkout is awaiting payment confirmation');
		}

		return this.toSessionResult(draft, attempt, session);
	}

	private static async expireQuarantinedSession(attemptId: string, stripeSessionId: string): Promise<void> {
		try {
			const expiredSession = await StripeCheckoutService.expireCheckoutSession(stripeSessionId);
			if (expiredSession.status !== 'expired') {
				return;
			}
		} catch {
			try {
				const retrievedSession = await StripeCheckoutService.getCheckoutSession(stripeSessionId);
				if (retrievedSession.status !== 'expired') {
					return;
				}
			} catch {
				return;
			}
		}

		await this.releaseConfirmedExpiredAttempt(attemptId);
	}

	private static async releaseConfirmedExpiredAttempt(attemptId: string): Promise<boolean> {
		const [unlockedAttempt] = await db
			.select({ draftId: table.checkoutPaymentAttempt.draftId })
			.from(table.checkoutPaymentAttempt)
			.where(eq(table.checkoutPaymentAttempt.id, attemptId))
			.limit(1);
		if (!unlockedAttempt) {
			return false;
		}

		return await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, unlockedAttempt.draftId))
				.for('update');
			const [attempt] = await tx
				.select()
				.from(table.checkoutPaymentAttempt)
				.where(and(
					eq(table.checkoutPaymentAttempt.id, attemptId),
					eq(table.checkoutPaymentAttempt.draftId, unlockedAttempt.draftId)
				))
				.for('update');
			const attemptIsExpirable = attempt?.status === 'checkout_created' || attempt?.status === 'quarantined';
			if (!draft || !attempt || !attemptIsExpirable || attempt.status !== draft.status) {
				return false;
			}

			const now = new Date();
			await tx
				.update(table.checkoutPaymentAttempt)
				.set({ status: 'expired', updatedAt: now })
				.where(eq(table.checkoutPaymentAttempt.id, attempt.id));
			return await CheckoutDraftService.releaseLockedDraftReservations(
				tx,
				draft,
				'expired',
				now,
				draft.status === 'quarantined'
			);
		});
	}

	private static toSessionResult(
		draft: typeof table.checkoutDraft.$inferSelect,
		attempt: typeof table.checkoutPaymentAttempt.$inferSelect,
		session: Stripe.Checkout.Session
	): CheckoutSessionResult {
		if (!attempt.stripeSessionId || session.id !== attempt.stripeSessionId || !session.url) {
			throw new Error('Stripe checkout session is incomplete');
		}

		return {
			draftId: draft.id,
			draftReference: draft.reference,
			stripeSessionId: session.id,
			checkoutUrl: session.url
		};
	}
}

export default CheckoutPaymentService;
