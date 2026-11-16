import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '$env/dynamic/private';
import {
	PLATFORM_FEE_BPS,
	PLATFORM_FEE_PERCENT,
	PLATFORM_FEE_RATE,
	attributionLifetimeSeconds,
	quoteAffiliateCommissionMinor,
	readAffiliateCommissionPolicy
} from './affiliateCommissionPolicy';

vi.mock('$env/dynamic/private', () => ({
	env: {}
}));

describe('affiliate commission policy', () => {
	beforeEach(() => {
		delete env.AFFILIATE_COMMISSION_BPS;
		delete env.AFFILIATE_PAYOUT_MINIMUM_CENTS;
		delete env.AFFILIATE_ATTRIBUTION_WINDOW_DAYS;
	});

	it('quotes zero commission when no rate is configured', () => {
		const policy = readAffiliateCommissionPolicy();
		expect(policy.commissionRateBps).toBe(0);
		expect(policy.payoutMinimumCents).toBeNull();
		expect(policy.attributionWindowDays).toBeNull();
		expect(attributionLifetimeSeconds(policy)).toBeNull();
		expect(quoteAffiliateCommissionMinor(25_000)).toBe(0);
		expect(quoteAffiliateCommissionMinor(25_000, policy.commissionRateBps)).toBe(0);
	});

	it('applies a configured basis-point rate to the order subtotal', () => {
		env.AFFILIATE_COMMISSION_BPS = '250';
		env.AFFILIATE_PAYOUT_MINIMUM_CENTS = '5000';
		env.AFFILIATE_ATTRIBUTION_WINDOW_DAYS = '30';

		const policy = readAffiliateCommissionPolicy();
		expect(policy).toEqual({
			commissionRateBps: 250,
			payoutMinimumCents: 5000,
			attributionWindowDays: 30
		});
		expect(quoteAffiliateCommissionMinor(10_000)).toBe(250);
		expect(quoteAffiliateCommissionMinor(1, 5000)).toBe(1);
		expect(attributionLifetimeSeconds(policy)).toBe(30 * 24 * 60 * 60);
	});

	it('keeps the seller platform fee at 8%', () => {
		expect(PLATFORM_FEE_RATE).toBe('0.0800');
		expect(PLATFORM_FEE_PERCENT).toBe(8);
		expect(PLATFORM_FEE_BPS).toBe(800);
	});

	it('treats a blank override as unset and rejects a non-integer rate', () => {
		env.AFFILIATE_COMMISSION_BPS = '   ';
		expect(readAffiliateCommissionPolicy().commissionRateBps).toBe(0);
		expect(quoteAffiliateCommissionMinor(10_000)).toBe(0);

		env.AFFILIATE_COMMISSION_BPS = '2%';
		expect(() => readAffiliateCommissionPolicy()).toThrow(/AFFILIATE_COMMISSION_BPS/);
	});
});
