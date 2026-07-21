import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

let stripeClient: Stripe | null = null;
let stripeClientKey: string | null = null;

function configuredStripeKey(): string {
	const key = env.STRIPE_SECRET_KEY?.trim();
	if (!key || key.startsWith('sk_test_placeholder') || key.startsWith('sk_test_replace')) {
		throw new Error('Stripe is unavailable because STRIPE_SECRET_KEY is not configured');
	}

	return key;
}

/** Create the Stripe client only when a configured payment path actually uses it. */
export function getStripeClient(): Stripe {
	const key = configuredStripeKey();
	if (!stripeClient || stripeClientKey !== key) {
		stripeClient = new Stripe(key, {
			apiVersion: '2026-03-25.dahlia',
			typescript: true
		});
		stripeClientKey = key;
	}

	return stripeClient;
}
