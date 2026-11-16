import { describe, expect, it, vi } from 'vitest';

const create = vi.fn();

vi.mock('$lib/server/stripe', () => ({
	getStripeClient: () => ({
		checkout: { sessions: { create } }
	})
}));

import { buildCheckoutSessionCreateParams, StripeCheckoutService } from './stripeCheckout';

const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

const params = {
	lineItems: [{ name: 'Nursery tray', unitPriceMinor: 2400, quantity: 1 }],
	currency: 'usd',
	successUrl: 'https://aevani.com/checkout/success',
	cancelUrl: 'https://aevani.com/checkout/cancel',
	draftReference: 'cd_order_reference',
	idempotencyKey: 'checkout_attempt_1',
	expiresAt
};

describe('checkout transfer group', () => {
	it('puts the draft reference on the PaymentIntent and does not choose a payment method', () => {
		const body = buildCheckoutSessionCreateParams(params, 1_800_000_000);
		expect(body.mode).toBe('payment');
		expect(body.payment_intent_data).toEqual({ transfer_group: 'cd_order_reference' });
		expect(body.metadata).toEqual({ checkout_draft_reference: 'cd_order_reference' });
		expect(body).not.toHaveProperty('payment_method_types');
		expect(body).not.toHaveProperty('transfer_data');
		expect(body.payment_intent_data).not.toHaveProperty('on_behalf_of');
		expect(body.payment_intent_data).not.toHaveProperty('application_fee_amount');
		expect(body.payment_intent_data).not.toHaveProperty('transfer_data');
	});

	it('sends that body to Stripe with the attempt idempotency key', async () => {
		create.mockResolvedValueOnce({ id: 'cs_test_1' });
		await StripeCheckoutService.createCheckoutSession(params);
		expect(create).toHaveBeenCalledTimes(1);
		const [body, options] = create.mock.calls[0];
		expect(body.payment_intent_data.transfer_group).toBe('cd_order_reference');
		expect(body).not.toHaveProperty('payment_method_types');
		expect(options).toEqual({ idempotencyKey: 'checkout_attempt_1' });
	});
});
