import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { StripeCheckoutService } from '$lib/server/services/stripeCheckout';
import { OrderService } from '$lib/server/services/order';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		throw error(400, 'Missing stripe-signature header');
	}

	if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET.startsWith('whsec_placeholder')) {
		console.error('[Stripe Webhook] Webhook secret not configured');
		throw error(500, 'Webhook secret not configured');
	}

	// Read raw body as text for signature verification
	const body = await request.text();

	let event: Stripe.Event;
	try {
		event = StripeCheckoutService.constructWebhookEvent(body, signature, STRIPE_WEBHOOK_SECRET);
	} catch (err: any) {
		console.error('[Stripe Webhook] Signature verification failed:', err.message);
		throw error(400, `Webhook signature verification failed: ${err.message}`);
	}

	// Handle the event
	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			await handleCheckoutCompleted(session);
			break;
		}

		case 'checkout.session.expired': {
			const session = event.data.object as Stripe.Checkout.Session;
			console.log(`[Stripe Webhook] Checkout session expired: ${session.id}`);
			break;
		}

		default:
			console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
	}

	return json({ received: true });
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
	console.log(`[Stripe Webhook] Processing checkout.session.completed: ${session.id}`);

	// Extract metadata
	const cartId = session.metadata?.cartId ? parseInt(session.metadata.cartId, 10) : null;
	const userId = session.metadata?.userId || null;
	const sessionId = session.metadata?.sessionId || null;

	if (!cartId) {
		console.error('[Stripe Webhook] No cartId in session metadata');
		return;
	}

	// Extract customer email
	const customerEmail = session.customer_details?.email || session.customer_email || '';

	// Extract shipping address from Stripe
	let shippingAddress: any = undefined;
	const stripeShipping = session.shipping_details?.address;
	if (stripeShipping) {
		// Parse name into first/last
		const fullName = session.shipping_details?.name || '';
		const nameParts = fullName.split(' ');
		const firstName = nameParts[0] || '';
		const lastName = nameParts.slice(1).join(' ') || '';

		shippingAddress = {
			firstName,
			lastName,
			address1: stripeShipping.line1 || '',
			address2: stripeShipping.line2 || undefined,
			city: stripeShipping.city || '',
			state: stripeShipping.state || '',
			postalCode: stripeShipping.postal_code || '',
			country: stripeShipping.country || 'US'
		};
	}

	// Extract payment intent ID
	const paymentIntentId =
		typeof session.payment_intent === 'string'
			? session.payment_intent
			: session.payment_intent?.id || undefined;

	try {
		const order = await OrderService.createOrderFromStripe({
			stripeSessionId: session.id,
			stripePaymentIntentId: paymentIntentId,
			cartId,
			userId,
			sessionId,
			customerEmail,
			shippingAddress
		});

		console.log(
			`[Stripe Webhook] Order created: ${order.orderNumber} (total: $${order.totalAmount})`
		);

		// Log order confirmation (placeholder for future email integration)
		console.log(`[Email] Order confirmation would be sent to: ${customerEmail}`);
		console.log(`[Email] Order: ${order.orderNumber}, Items: ${order.items.length}`);
	} catch (err: any) {
		console.error('[Stripe Webhook] Failed to create order:', err.message);
		// Don't throw - return 200 to prevent Stripe from retrying
		// The error is logged for manual investigation
	}
}
