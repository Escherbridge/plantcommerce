import type Stripe from 'stripe';

/** Charge id on an expanded Checkout Session PaymentIntent, or null when Stripe has not attached one. */
export function chargeIdFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
	const intent = session.payment_intent;
	if (!intent || typeof intent === 'string') return null;
	const charge = intent.latest_charge;
	if (!charge) return null;
	return typeof charge === 'string' ? charge : charge.id;
}

/**
 * Fields persisted on the order at fulfilment. The transfer group is the draft
 * reference sent on the PaymentIntent, not a second identifier.
 */
export function orderProviderChargeFields(
	session: Stripe.Checkout.Session,
	draftReference: string
): { stripeChargeId: string | null; transferGroup: string } {
	if (!draftReference) {
		throw new Error('Paid Checkout Session is missing its draft reference');
	}
	return {
		stripeChargeId: chargeIdFromCheckoutSession(session),
		transferGroup: draftReference
	};
}
