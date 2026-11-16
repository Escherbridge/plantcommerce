import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';
import { chargeIdFromCheckoutSession, orderProviderChargeFields } from './stripeCharge';

function session(paymentIntent: Stripe.Checkout.Session['payment_intent']): Stripe.Checkout.Session {
	return { payment_intent: paymentIntent } as Stripe.Checkout.Session;
}

describe('order charge snapshot', () => {
	it('reads a charge id from an expanded PaymentIntent', () => {
		expect(
			chargeIdFromCheckoutSession(
				session({ id: 'pi_1', latest_charge: 'ch_1' } as Stripe.PaymentIntent)
			)
		).toBe('ch_1');
		expect(
			chargeIdFromCheckoutSession(
				session({ id: 'pi_1', latest_charge: { id: 'ch_2' } } as Stripe.PaymentIntent)
			)
		).toBe('ch_2');
	});

	it('leaves the charge id empty when the PaymentIntent is not expanded', () => {
		expect(chargeIdFromCheckoutSession(session('pi_1'))).toBeNull();
		expect(chargeIdFromCheckoutSession(session(null))).toBeNull();
	});

	it('stores the draft reference as the transfer group', () => {
		expect(
			orderProviderChargeFields(
				session({ id: 'pi_1', latest_charge: 'ch_1' } as Stripe.PaymentIntent),
				'cd_order_reference'
			)
		).toEqual({ stripeChargeId: 'ch_1', transferGroup: 'cd_order_reference' });
	});
});
