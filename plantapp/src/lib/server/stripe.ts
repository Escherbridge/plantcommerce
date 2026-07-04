import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.startsWith('sk_test_placeholder')) {
	console.warn('[Stripe] Warning: Using placeholder Stripe key. Replace with real test key in .env');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2026-03-25.dahlia',
	typescript: true
});

export default stripe;
