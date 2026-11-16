import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({ db: {}, sqlClient: null }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/stripe', () => ({
	getStripeClient: () => {
		throw new Error('Stripe must not be called while onboarding is off');
	}
}));

import {
	beginRecipientOnboarding,
	connectOnboardingEnabled,
	connectWebhookSecret,
	recipientAccountCreateParams,
	recipientOnboardingLinkParams
} from './connectOnboarding';

describe('hosted Connect onboarding', () => {
	it('is off unless the owner turns it on', () => {
		expect(connectOnboardingEnabled({})).toBe(false);
		expect(connectOnboardingEnabled({ CONNECT_ONBOARDING_ENABLED: 'false' })).toBe(false);
		expect(connectOnboardingEnabled({ CONNECT_ONBOARDING_ENABLED: 'true' })).toBe(true);
		expect(connectWebhookSecret({})).toBeNull();
		expect(connectWebhookSecret({ STRIPE_CONNECT_WEBHOOK_SECRET: 'whsec_replace_me' })).toBeNull();
	});

	it('asks Stripe for an Express recipient account in the US', () => {
		const params = recipientAccountCreateParams({
			contactEmail: 'seller@example.com',
			displayName: 'North Glasshouse',
			metadata: { payout_account_id: 'row_1', owner_type: 'seller' }
		});
		expect(params.dashboard).toBe('express');
		expect(params.identity).toEqual({ country: 'us' });
		expect(params.defaults?.responsibilities).toEqual({
			fees_collector: 'application',
			losses_collector: 'application'
		});
		expect(params.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers).toEqual({
			requested: true
		});
		expect(params).not.toHaveProperty('configuration.merchant');
	});

	it('builds a recipient onboarding link', () => {
		const params = recipientOnboardingLinkParams({
			stripeAccountId: 'acct_123',
			refreshUrl: 'https://aevani.com/seller/payouts/refresh',
			returnUrl: 'https://aevani.com/seller/payouts/return'
		});
		expect(params.use_case.type).toBe('account_onboarding');
		expect(params.use_case.account_onboarding?.configurations).toEqual(['recipient']);
	});

	it('does not call Stripe when onboarding is off', async () => {
		await expect(
			beginRecipientOnboarding({
				enabled: false,
				userId: 'user_1',
				email: 'seller@example.com',
				role: 'seller',
				owner: 'seller',
				refreshUrl: 'https://aevani.com/seller/payouts/refresh',
				returnUrl: 'https://aevani.com/seller/payouts/return'
			})
		).resolves.toEqual({ kind: 'disabled' });
	});
});
