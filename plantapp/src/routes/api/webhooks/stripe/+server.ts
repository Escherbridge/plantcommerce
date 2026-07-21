import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { StripeCheckoutService } from '$lib/server/services/stripeCheckout';
import { StripeWebhookService } from '$lib/server/services/stripeWebhook';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
	const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		throw error(400, 'Missing stripe-signature header');
	}

	if (!webhookSecret || webhookSecret.startsWith('whsec_replace')) {
		console.error('[Stripe Webhook] Webhook secret not configured');
		throw error(500, 'Webhook secret not configured');
	}

	const body = Buffer.from(await request.arrayBuffer());

	let event: Stripe.Event;
	try {
		event = StripeCheckoutService.constructWebhookEvent(body, signature, webhookSecret);
	} catch (err: any) {
		console.error('[Stripe Webhook] Signature verification failed:', err.message);
		throw error(400, `Webhook signature verification failed: ${err.message}`);
	}

	let result: Awaited<ReturnType<typeof StripeWebhookService.processVerifiedEvent>>;
	try {
		result = await StripeWebhookService.processVerifiedEvent(event, body);
	} catch {
		console.error(`[Stripe Webhook] Processing failed for verified event ${event.id}`);
		throw error(500, 'Unable to process payment event');
	}
	if (result === 'in_progress') {
		console.warn(`[Stripe Webhook] Event ${event.id} remains leased by another worker`);
		throw error(503, 'Webhook event is still being processed');
	}

	return json({ received: true });
};
