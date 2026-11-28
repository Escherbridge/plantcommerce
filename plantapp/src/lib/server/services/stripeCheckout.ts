import { getStripeClient } from '$lib/server/stripe';
import Stripe from 'stripe';

type CheckoutSessionCreateParams = NonNullable<
	Parameters<InstanceType<typeof Stripe>['checkout']['sessions']['create']>[0]
>;

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

/**
 * Checkout Session body for a platform charge.
 * `transfer_group` is the checkout draft reference so a later seller transfer
 * can be tied to this charge. The shopper still pays Aevani. There is no
 * destination, `on_behalf_of`, or application fee.
 */
export function buildCheckoutSessionCreateParams(
	params: CreateCheckoutParams,
	expiresAtSeconds: number
): CheckoutSessionCreateParams {
	const { lineItems, currency, successUrl, cancelUrl, draftReference } = params;
	return {
		mode: 'payment',
		// Card only, exactly as before this PR: do not fall back to Dashboard payment-method settings.
		payment_method_types: ['card'],
		line_items: lineItems.map((item) => ({
			price_data: {
				currency,
				product_data: {
					name: item.name
				},
				unit_amount: item.unitPriceMinor
			},
			quantity: item.quantity
		})),
		success_url: successUrl,
		cancel_url: cancelUrl,
		expires_at: expiresAtSeconds,
		metadata: { checkout_draft_reference: draftReference },
		payment_intent_data: {
			transfer_group: draftReference
		},
		shipping_address_collection: {
			allowed_countries: ['US', 'CA', 'GB', 'AU']
		}
	};
}

export class StripeCheckoutService {
	/**
	 * Create a Stripe Checkout Session from an immutable server-priced draft.
	 */
	static async createCheckoutSession(
		params: CreateCheckoutParams
	): Promise<Stripe.Checkout.Session> {
		const stripe = getStripeClient();
		const { lineItems, currency, draftReference, idempotencyKey, expiresAt } = params;
		if (!/^[a-z]{3}$/.test(currency)) {
			throw new Error('Checkout currency must be a lowercase ISO currency code');
		}
		if (!draftReference || draftReference.length > 255 || lineItems.length === 0) {
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

		const session = await stripe.checkout.sessions.create(
			buildCheckoutSessionCreateParams(params, expiresAtSeconds),
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
