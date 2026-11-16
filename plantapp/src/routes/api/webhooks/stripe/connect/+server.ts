import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { connectWebhookSecret } from '$lib/server/services/connectOnboarding';
import { StripeCheckoutService } from '$lib/server/services/stripeCheckout';
import { StripeWebhookService } from '$lib/server/services/stripeWebhook';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
	const webhookSecret = connectWebhookSecret(env);
	const signature = request.headers.get('stripe-signature');
	if (!webhookSecret) {
		throw error(503, 'Connect webhook is not configured');
	}
	if (!signature) {
		throw error(400, 'Missing stripe-signature header');
	}

	const body = Buffer.from(await request.arrayBuffer());
	let event: Stripe.Event;
	try {
		event = StripeCheckoutService.constructWebhookEvent(body, signature, webhookSecret);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'invalid signature';
		throw error(400, `Webhook signature verification failed: ${message}`);
	}

	let result: Awaited<ReturnType<typeof StripeWebhookService.processConnectEvent>>;
	try {
		result = await StripeWebhookService.processConnectEvent(event, body);
	} catch {
		throw error(500, 'Unable to process Connect event');
	}
	if (result === 'in_progress') {
		throw error(503, 'Webhook event is still being processed');
	}
	return json({ received: true });
};
