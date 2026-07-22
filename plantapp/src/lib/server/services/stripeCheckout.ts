import { getStripeClient } from '$lib/server/stripe';
import type Stripe from 'stripe';

export interface CheckoutLineItem {
	name: string;
	unitPriceMinor: number;
	quantity: number;
}

export interface CreateCheckoutParams {
	lineItems: CheckoutLineItem[];
	currency: string;
	successUrl: string;
	cancelUrl: string;
	draftReference: string;
	idempotencyKey: string;
	expiresAt: Date;
}

export class StripeCheckoutService {
	/**
	 * Create a Stripe Checkout Session from an immutable server-priced draft.
	 */
	static async createCheckoutSession(
		params: CreateCheckoutParams
	): Promise<Stripe.Checkout.Session> {
		const stripe = getStripeClient();
		const {
			lineItems,
			currency,
			successUrl,
			cancelUrl,
			draftReference,
			idempotencyKey,
			expiresAt
		} = params;
		if (!/^[a-z]{3}$/.test(currency)) {
			throw new Error('Checkout currency must be a lowercase ISO currency code');
		}
		if (!draftReference || lineItems.length === 0) {
			throw new Error('Checkout requires a draft reference and at least one immutable line item');
		}
		if (!idempotencyKey) {
			throw new Error('Checkout requires a stable provider idempotency key');
		}
		const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000);
		if (
			!Number.isFinite(expiresAtSeconds) ||
			expiresAtSeconds * 1000 - Date.now() < 30 * 60 * 1000
		) {
			throw new Error(
				'Stripe Checkout sessions require at least 30 minutes of remaining draft lifetime'
			);
		}
		for (const item of lineItems) {
			if (
				!Number.isSafeInteger(item.unitPriceMinor) ||
				item.unitPriceMinor < 0 ||
				!Number.isSafeInteger(item.quantity) ||
				item.quantity <= 0
			) {
				throw new Error(
					'Checkout line items must use positive safe-integer quantities and minor-unit prices'
				);
			}
		}

		const stripeLineItems: NonNullable<
			NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>['line_items']
		> = lineItems.map((item) => ({
			price_data: {
				currency,
				product_data: {
					name: item.name
				},
				unit_amount: item.unitPriceMinor
			},
			quantity: item.quantity
		}));

		const session = await stripe.checkout.sessions.create(
			{
				mode: 'payment',
				payment_method_types: ['card'],
				line_items: stripeLineItems,
				success_url: successUrl,
				cancel_url: cancelUrl,
				expires_at: expiresAtSeconds,
				metadata: { checkout_draft_reference: draftReference },
				shipping_address_collection: {
					allowed_countries: ['US', 'CA', 'GB', 'AU']
				}
			},
			{ idempotencyKey }
		);

		return session;
	}

	/**
	 * Retrieve a checkout session by its ID
	 */
	static async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
		const stripe = getStripeClient();
		return await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ['line_items', 'payment_intent']
		});
	}

	/** Expire a hosted Checkout Session only after a server-side integrity failure. */
	static async expireCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
		const stripe = getStripeClient();
		return await stripe.checkout.sessions.expire(sessionId);
	}

	/**
	 * Verify a webhook signature and construct the event
	 */
	static constructWebhookEvent(
		payload: string | Buffer,
		signature: string,
		webhookSecret: string
	): Stripe.Event {
		const stripe = getStripeClient();
		return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	}
}

export default StripeCheckoutService;
