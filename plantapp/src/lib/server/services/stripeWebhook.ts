import { encodeBase64url } from '@oslojs/encoding';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import type Stripe from 'stripe';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import {
	CheckoutDraftService,
	hashGuestCheckoutSubject,
	minorUnitsToDecimal
} from './checkoutDraft';
import { AffiliateCommissionService } from './affiliateCommission';
import { StripeCheckoutService } from './stripeCheckout';

const STALE_WEBHOOK_PROCESSING_MS = 5 * 60 * 1000;

type MatchedPayment = {
	draft: typeof table.checkoutDraft.$inferSelect;
	attempt: typeof table.checkoutPaymentAttempt.$inferSelect;
};

type ClaimResult =
	| { kind: 'claimed' }
	| { kind: 'complete' }
	| { kind: 'in_progress' };

export type StripeWebhookProcessResult = 'processed' | 'ignored' | 'already_complete' | 'in_progress';

function payloadDigest(payload: Buffer): string {
	return createHash('sha256').update(payload).digest('hex');
}

function newOrderNumber(): string {
	return `ORD-${encodeBase64url(crypto.getRandomValues(new Uint8Array(18))).toUpperCase()}`;
}

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
	return typeof session.payment_intent === 'string'
		? session.payment_intent
		: session.payment_intent?.id ?? null;
}

function isUniqueViolation(error: unknown): boolean {
	if (typeof error !== 'object' || error === null) {
		return false;
	}

	const candidate = error as { code?: unknown; cause?: { code?: unknown } };
	return candidate.code === '23505' || candidate.cause?.code === '23505';
}

function webhookSessionId(event: Stripe.Event): string | null {
	const object = event.data.object as { id?: unknown };
	return typeof object.id === 'string' && object.id.length > 0 ? object.id : null;
}

function sessionIdentityMatchesPayment(session: Stripe.Checkout.Session, payment: MatchedPayment): boolean {
	return session.mode === 'payment'
		&& session.metadata?.checkout_draft_reference === payment.draft.reference
		&& session.amount_total === payment.attempt.amountMinor
		&& session.currency === payment.attempt.currency;
}

function sessionMatchesPayment(session: Stripe.Checkout.Session, payment: MatchedPayment): boolean {
	return sessionIdentityMatchesPayment(session, payment)
		&& session.expires_at * 1000 <= payment.draft.expiresAt.getTime();
}

function providerCustomerData(session: Stripe.Checkout.Session) {
	const customerDetails = session.customer_details;
	const email = customerDetails?.email ?? session.customer_email;
	const shippingDetails = session.collected_information?.shipping_details ?? null;
	const shippingAddress = shippingDetails?.address ?? customerDetails?.address ?? null;
	const billingAddress = customerDetails?.address ?? shippingAddress;

	if (!email || !shippingAddress || !billingAddress) {
		throw new Error('Paid Checkout Session is missing required customer fulfillment details');
	}

	return {
		email,
		phone: customerDetails?.phone ?? null,
		shippingAddress: JSON.stringify({ name: shippingDetails?.name ?? customerDetails?.name ?? null, address: shippingAddress }),
		billingAddress: JSON.stringify({ name: customerDetails?.name ?? null, address: billingAddress })
	};
}

async function clearUnchangedSourceCart(
	tx: any,
	draft: typeof table.checkoutDraft.$inferSelect,
	now: Date
): Promise<void> {
	if (!draft.sourceCartId || !draft.sourceCartUpdatedAt) {
		return;
	}

	await tx
		.select({ id: table.cartItem.id })
		.from(table.cartItem)
		.where(eq(table.cartItem.cartId, draft.sourceCartId))
		.for('update');
	const [cart] = await tx
		.select()
		.from(table.cart)
		.where(eq(table.cart.id, draft.sourceCartId))
		.for('update');
	if (!cart || cart.updatedAt.getTime() !== draft.sourceCartUpdatedAt.getTime()) {
		return;
	}

	const buyerStillOwnsCart = draft.userId
		? cart.userId === draft.userId
		: cart.userId === null
			&& cart.sessionId !== null
			&& draft.guestSubjectHash === hashGuestCheckoutSubject(cart.sessionId);
	if (!buyerStillOwnsCart) {
		return;
	}

	await tx.delete(table.cartItem).where(eq(table.cartItem.cartId, cart.id));
	await tx.update(table.cart).set({ updatedAt: now }).where(eq(table.cart.id, cart.id));
}

export class StripeWebhookService {
	/** Process a signature-verified raw Stripe event through a durable idempotency record. */
	static async processVerifiedEvent(event: Stripe.Event, rawPayload: Buffer): Promise<StripeWebhookProcessResult> {
		const claim = await this.claimEvent(event.id, event.type, payloadDigest(rawPayload));
		if (claim.kind === 'complete') {
			return 'already_complete';
		}
		if (claim.kind === 'in_progress') {
			return 'in_progress';
		}

		try {
			if (event.type !== 'checkout.session.completed'
				&& event.type !== 'checkout.session.async_payment_succeeded'
				&& event.type !== 'checkout.session.expired') {
				await this.finishEvent(event.id, 'ignored');
				return 'ignored';
			}

			const sessionId = webhookSessionId(event);
			if (!sessionId) {
				throw new Error('Stripe checkout webhook is missing a Checkout Session ID');
			}
			const session = await StripeCheckoutService.getCheckoutSession(sessionId);
			const payment = await this.findPaymentBySession(session.id);
			if (!payment) {
				if (session.metadata?.checkout_draft_reference) {
					throw new Error('Stripe Checkout Session references an unknown checkout draft');
				}
				await this.finishEvent(event.id, 'ignored');
				return 'ignored';
			}
			if (!sessionIdentityMatchesPayment(session, payment)
				|| (event.type !== 'checkout.session.expired' && !sessionMatchesPayment(session, payment))) {
				throw new Error('Stripe Checkout Session does not match its immutable payment attempt');
			}

			await this.attachPayment(event.id, payment);
			if (event.type === 'checkout.session.expired') {
				await this.expireSession(event.id, session, payment);
				return 'processed';
			}
			if (session.payment_status !== 'paid') {
				await this.finishEvent(event.id, 'ignored');
				return 'ignored';
			}

			await this.fulfillPaidSession(event.id, session, payment);
			return 'processed';
		} catch (error) {
			await this.failEvent(event.id, error);
			throw error;
		}
	}

	private static async claimEvent(eventId: string, eventType: string, digest: string): Promise<ClaimResult> {
		try {
			await db.insert(table.stripeWebhookEvent).values({
				id: eventId,
				eventType,
				payloadDigest: digest
			});
		} catch (error) {
			if (!isUniqueViolation(error)) {
				throw error;
			}
		}

		return await db.transaction(async (tx) => {
			const [storedEvent] = await tx
				.select()
				.from(table.stripeWebhookEvent)
				.where(eq(table.stripeWebhookEvent.id, eventId))
				.for('update');
			if (!storedEvent) {
				throw new Error('Stripe webhook event record was not created');
			}
			if (storedEvent.payloadDigest !== digest || storedEvent.eventType !== eventType) {
				throw new Error('Stripe webhook event ID was reused with a different payload');
			}
			if (storedEvent.status === 'processed' || storedEvent.status === 'ignored') {
				return { kind: 'complete' };
			}
			if (storedEvent.status === 'processing') {
				if (!storedEvent.processingAt || Date.now() - storedEvent.processingAt.getTime() < STALE_WEBHOOK_PROCESSING_MS) {
					return { kind: 'in_progress' };
				}
				await tx
					.update(table.stripeWebhookEvent)
					.set({
						status: 'failed',
						lastErrorCode: 'webhook_processing_stale',
						lastErrorMessage: 'Webhook processing lease expired'
					})
					.where(eq(table.stripeWebhookEvent.id, storedEvent.id));
			}

			const now = new Date();
			await tx
				.update(table.stripeWebhookEvent)
				.set({
					status: 'processing',
					attemptCount: storedEvent.attemptCount + 1,
					processingAt: now,
					lastErrorCode: null,
					lastErrorMessage: null
				})
				.where(eq(table.stripeWebhookEvent.id, storedEvent.id));
			return { kind: 'claimed' };
		});
	}

	private static async findPaymentBySession(sessionId: string): Promise<MatchedPayment | null> {
		const [payment] = await db
			.select({ draft: table.checkoutDraft, attempt: table.checkoutPaymentAttempt })
			.from(table.checkoutPaymentAttempt)
			.innerJoin(table.checkoutDraft, eq(table.checkoutPaymentAttempt.draftId, table.checkoutDraft.id))
			.where(eq(table.checkoutPaymentAttempt.stripeSessionId, sessionId))
			.limit(1);
		return payment ?? null;
	}

	private static async attachPayment(eventId: string, payment: MatchedPayment): Promise<void> {
		await db.transaction(async (tx) => {
			const [storedEvent] = await tx
				.select()
				.from(table.stripeWebhookEvent)
				.where(eq(table.stripeWebhookEvent.id, eventId))
				.for('update');
			if (!storedEvent || storedEvent.status !== 'processing') {
				throw new Error('Stripe webhook event is not available for payment linkage');
			}
			if (storedEvent.paymentAttemptId) {
				if (storedEvent.paymentAttemptId !== payment.attempt.id || storedEvent.draftId !== payment.draft.id) {
					throw new Error('Stripe webhook event is linked to a different payment attempt');
				}
				return;
			}

			await tx
				.update(table.stripeWebhookEvent)
				.set({ draftId: payment.draft.id, paymentAttemptId: payment.attempt.id })
				.where(eq(table.stripeWebhookEvent.id, storedEvent.id));
		});
	}

	private static async fulfillPaidSession(
		eventId: string,
		session: Stripe.Checkout.Session,
		payment: MatchedPayment
	): Promise<void> {
		const intentId = paymentIntentId(session);
		if (!intentId) {
			throw new Error('Paid Checkout Session is missing a PaymentIntent ID');
		}

		await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, payment.draft.id))
				.for('update');
			const [attempt] = await tx
				.select()
				.from(table.checkoutPaymentAttempt)
				.where(and(
					eq(table.checkoutPaymentAttempt.id, payment.attempt.id),
					eq(table.checkoutPaymentAttempt.draftId, payment.draft.id)
				))
				.for('update');
			const [storedEvent] = await tx
				.select()
				.from(table.stripeWebhookEvent)
				.where(eq(table.stripeWebhookEvent.id, eventId))
				.for('update');

			if (!draft || !attempt || !storedEvent || storedEvent.status !== 'processing') {
				throw new Error('Stripe webhook fulfillment state is unavailable');
			}
			if (storedEvent.paymentAttemptId !== attempt.id || storedEvent.draftId !== draft.id || !sessionMatchesPayment(session, { draft, attempt })) {
				throw new Error('Stripe webhook fulfillment state does not match the immutable payment attempt');
			}
			const now = new Date();

			const [existingOrder] = await tx
				.select()
				.from(table.order)
				.where(eq(table.order.checkoutDraftId, draft.id))
				.for('update');
			if (existingOrder) {
				if (attempt.status !== 'paid' || draft.status !== 'fulfilled') {
					throw new Error('Existing order does not match the payment attempt lifecycle');
				}
				await AffiliateCommissionService.recordPaidCommission(tx, {
					draft,
					order: existingOrder,
					stripeWebhookEventId: storedEvent.id,
					now
				});
				await this.finishLockedEvent(tx, storedEvent.id, 'processed');
				return;
			}

			if (attempt.status !== 'checkout_created' || draft.status !== 'checkout_created') {
				throw new Error('Checkout payment attempt is not eligible for fulfillment');
			}
			if (attempt.stripePaymentIntentId && attempt.stripePaymentIntentId !== intentId) {
				throw new Error('Stripe PaymentIntent does not match its immutable payment attempt');
			}

			const customer = providerCustomerData(session);
			const items = await tx
				.select()
				.from(table.checkoutDraftItem)
				.where(eq(table.checkoutDraftItem.draftId, draft.id))
				.orderBy(asc(table.checkoutDraftItem.productId));
			if (items.length === 0) {
				throw new Error('Checkout draft has no immutable order items');
			}

			const reservations = await tx
				.select()
				.from(table.checkoutInventoryReservation)
				.where(and(
					eq(table.checkoutInventoryReservation.draftId, draft.id),
					eq(table.checkoutInventoryReservation.status, 'active')
				))
				.orderBy(asc(table.checkoutInventoryReservation.productId))
				.for('update');
			const trackedItems = items.filter((item) => item.trackInventory);
			if (reservations.length !== trackedItems.length) {
				throw new Error('Checkout inventory reservations do not match the immutable draft items');
			}

			const products = reservations.length === 0
				? []
				: await tx
					.select()
					.from(table.product)
					.where(inArray(table.product.id, reservations.map((reservation) => reservation.productId)))
					.orderBy(asc(table.product.id))
					.for('update');
			for (const reservation of reservations) {
				const product = products.find((candidate: typeof table.product.$inferSelect) => candidate.id === reservation.productId);
				if (!product || !product.trackInventory || product.reservedQuantity < reservation.quantity || product.stockQuantity < reservation.quantity) {
					throw new Error('Reserved inventory cannot be consumed safely');
				}
			}

			await tx
				.update(table.checkoutPaymentAttempt)
				.set({
					stripePaymentIntentId: intentId,
					status: 'paid',
					updatedAt: now
				})
				.where(eq(table.checkoutPaymentAttempt.id, attempt.id));
			await tx
				.update(table.checkoutDraft)
				.set({
					status: 'paid',
					customerEmail: customer.email,
					customerPhone: customer.phone,
					shippingAddress: customer.shippingAddress,
					billingAddress: customer.billingAddress,
					updatedAt: now
				})
				.where(eq(table.checkoutDraft.id, draft.id));

			const [order] = await tx
				.insert(table.order)
				.values({
					orderNumber: newOrderNumber(),
					checkoutDraftId: draft.id,
					userId: draft.userId,
					affiliateLinkId: draft.affiliateLinkId,
					status: 'confirmed',
					totalAmount: minorUnitsToDecimal(draft.totalMinor),
					subtotalAmount: minorUnitsToDecimal(draft.subtotalMinor),
					taxAmount: minorUnitsToDecimal(draft.taxMinor),
					shippingAmount: minorUnitsToDecimal(draft.shippingMinor),
					discountAmount: minorUnitsToDecimal(draft.discountMinor),
					affiliateCommission: minorUnitsToDecimal(draft.affiliateCommissionMinor),
					shippingAddress: customer.shippingAddress,
					billingAddress: customer.billingAddress,
					customerEmail: customer.email,
					customerPhone: customer.phone,
					stripeSessionId: session.id,
					stripePaymentIntentId: intentId,
					createdAt: now,
					updatedAt: now
				})
				.returning();
			await AffiliateCommissionService.recordPaidCommission(tx, {
				draft,
				order,
				stripeWebhookEventId: storedEvent.id,
				now
			});
			await tx.insert(table.orderItem).values(items.map((item) => ({
				orderId: order.id,
				productId: item.productId,
				productName: item.productName,
				productSku: item.productSku,
				quantity: item.quantity,
				unitPrice: minorUnitsToDecimal(item.unitPriceMinor),
				totalPrice: minorUnitsToDecimal(item.totalPriceMinor),
				createdAt: now
			})));

			for (const reservation of reservations) {
				const product = products.find((candidate: typeof table.product.$inferSelect) => candidate.id === reservation.productId);
				if (!product) {
					throw new Error('Reserved product disappeared during fulfillment');
				}
				await tx
					.update(table.product)
					.set({
						stockQuantity: product.stockQuantity - reservation.quantity,
						reservedQuantity: product.reservedQuantity - reservation.quantity,
						updatedAt: now
					})
					.where(eq(table.product.id, product.id));
				await tx
					.update(table.checkoutInventoryReservation)
					.set({ status: 'consumed', consumedAt: now, updatedAt: now })
					.where(eq(table.checkoutInventoryReservation.id, reservation.id));
			}

			await tx
				.update(table.checkoutDraft)
				.set({ status: 'fulfilled', updatedAt: now })
				.where(eq(table.checkoutDraft.id, draft.id));
			await clearUnchangedSourceCart(tx, draft, now);
			await this.finishLockedEvent(tx, storedEvent.id, 'processed');
		});
	}

	private static async expireSession(
		eventId: string,
		session: Stripe.Checkout.Session,
		payment: MatchedPayment
	): Promise<void> {
		await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, payment.draft.id))
				.for('update');
			const [attempt] = await tx
				.select()
				.from(table.checkoutPaymentAttempt)
				.where(and(
					eq(table.checkoutPaymentAttempt.id, payment.attempt.id),
					eq(table.checkoutPaymentAttempt.draftId, payment.draft.id)
				))
				.for('update');
			const [storedEvent] = await tx
				.select()
				.from(table.stripeWebhookEvent)
				.where(eq(table.stripeWebhookEvent.id, eventId))
				.for('update');

			if (!draft || !attempt || !storedEvent || storedEvent.status !== 'processing') {
				throw new Error('Stripe webhook expiry state is unavailable');
			}
			if (storedEvent.paymentAttemptId !== attempt.id
				|| storedEvent.draftId !== draft.id
				|| !sessionIdentityMatchesPayment(session, { draft, attempt })
				|| session.status !== 'expired') {
				throw new Error('Stripe webhook expiry state does not match the immutable payment attempt');
			}
			if (attempt.status === 'paid' || draft.status === 'paid' || draft.status === 'fulfilled') {
				await this.finishLockedEvent(tx, storedEvent.id, 'ignored');
				return;
			}
			const attemptIsExpirable = attempt.status === 'checkout_created' || attempt.status === 'quarantined';
			const draftIsExpirable = draft.status === 'checkout_created' || draft.status === 'quarantined';
			if (!attemptIsExpirable || !draftIsExpirable || attempt.status !== draft.status) {
				throw new Error('Checkout payment attempt is not eligible for expiry release');
			}

			const now = new Date();
			await tx
				.update(table.checkoutPaymentAttempt)
				.set({ status: 'expired', updatedAt: now })
				.where(eq(table.checkoutPaymentAttempt.id, attempt.id));
			await CheckoutDraftService.releaseLockedDraftReservations(
				tx,
				draft,
				'expired',
				now,
				draft.status === 'quarantined'
			);
			await this.finishLockedEvent(tx, storedEvent.id, 'processed');
		});
	}

	private static async finishEvent(eventId: string, status: 'processed' | 'ignored'): Promise<void> {
		await db.transaction(async (tx) => {
			const [storedEvent] = await tx
				.select()
				.from(table.stripeWebhookEvent)
				.where(eq(table.stripeWebhookEvent.id, eventId))
				.for('update');
			if (!storedEvent || storedEvent.status !== 'processing') {
				throw new Error('Stripe webhook event is not available for completion');
			}
			await this.finishLockedEvent(tx, storedEvent.id, status);
		});
	}

	private static async finishLockedEvent(tx: any, eventId: string, status: 'processed' | 'ignored'): Promise<void> {
		await tx
			.update(table.stripeWebhookEvent)
			.set({
				status,
				processedAt: new Date(),
				lastErrorCode: null,
				lastErrorMessage: null
			})
			.where(eq(table.stripeWebhookEvent.id, eventId));
	}

	private static async failEvent(eventId: string, error: unknown): Promise<void> {
		const errorCode = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
			? error.code
			: 'stripe_webhook_processing_failed';
		await db.transaction(async (tx) => {
			const [storedEvent] = await tx
				.select()
				.from(table.stripeWebhookEvent)
				.where(eq(table.stripeWebhookEvent.id, eventId))
				.for('update');
			if (!storedEvent || storedEvent.status !== 'processing') {
				return;
			}
			await tx
				.update(table.stripeWebhookEvent)
				.set({
					status: 'failed',
					lastErrorCode: errorCode,
					lastErrorMessage: 'Stripe webhook processing failed'
				})
				.where(eq(table.stripeWebhookEvent.id, storedEvent.id));
		});
	}
}

export default StripeWebhookService;
