import stripe from '$lib/server/stripe';
import type Stripe from 'stripe';

export interface CheckoutLineItem {
	productId: number;
	name: string;
	description?: string;
	unitPrice: number; // in dollars (e.g., 29.99)
	quantity: number;
	imageUrl?: string;
}

export interface CreateCheckoutParams {
	lineItems: CheckoutLineItem[];
	cartId: number;
	userId?: string | null;
	sessionId?: string | null;
	customerEmail?: string;
	successUrl: string;
	cancelUrl: string;
	metadata?: Record<string, string>;
}

export class StripeCheckoutService {
	/**
	 * Create a Stripe Checkout Session from cart contents
	 */
	static async createCheckoutSession(params: CreateCheckoutParams): Promise<Stripe.Checkout.Session> {
		const {
			lineItems,
			cartId,
			userId,
			sessionId,
			customerEmail,
			successUrl,
			cancelUrl,
			metadata = {}
		} = params;

		// Map cart items to Stripe line items format
		const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lineItems.map((item) => ({
			price_data: {
				currency: 'usd',
				product_data: {
					name: item.name,
					...(item.description ? { description: item.description } : {}),
					...(item.imageUrl ? { images: [item.imageUrl] } : {})
				},
				unit_amount: Math.round(item.unitPrice * 100) // Convert to cents
			},
			quantity: item.quantity
		}));

		// Create the Stripe Checkout Session
		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: stripeLineItems,
			success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: cancelUrl,
			...(customerEmail ? { customer_email: customerEmail } : {}),
			metadata: {
				cartId: String(cartId),
				...(userId ? { userId } : {}),
				...(sessionId ? { sessionId } : {}),
				...metadata
			},
			// Collect shipping address during checkout
			shipping_address_collection: {
				allowed_countries: ['US', 'CA', 'GB', 'AU']
			},
			// Automatically calculate tax if needed (optional, requires Stripe Tax)
			// automatic_tax: { enabled: true },
		});

		return session;
	}

	/**
	 * Retrieve a checkout session by its ID
	 */
	static async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
		return await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ['line_items', 'payment_intent']
		});
	}

	/**
	 * Verify a webhook signature and construct the event
	 */
	static constructWebhookEvent(
		payload: string | Buffer,
		signature: string,
		webhookSecret: string
	): Stripe.Event {
		return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	}
}

export default StripeCheckoutService;
