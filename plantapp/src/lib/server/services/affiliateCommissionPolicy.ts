import { env } from '$env/dynamic/private';

/**
 * Referral commission policy. Rates, payout minimums, and attribution windows
 * come from the process environment. Unset values stay at zero or null.
 * The seller platform fee is a flat 8% and is not a referral rate.
 */

/** Flat seller platform fee retained on a sale, as a 4-decimal rate. */
export const PLATFORM_FEE_RATE = '0.0800';

/** Seller platform fee as a whole-number percent. */
export const PLATFORM_FEE_PERCENT = 8;

/** Seller platform fee in basis points. */
export const PLATFORM_FEE_BPS = 800;

/**
 * Stored on new affiliate rows. Zero means "use the policy at quote time".
 * The column is non-null, so this stands in for an unset policy default.
 */
export const UNCONFIGURED_AFFILIATE_COMMISSION_RATE = '0.0000';

/** Checkout snapshot marker used while no referral tier ladder exists. */
export const UNSET_AFFILIATE_TIER_CODE = 'unset';

/** Tier version 0 means the quote did not come from a tier ladder. */
export const UNSET_AFFILIATE_TIER_VERSION = 0;

const MAX_COMMISSION_BPS = 10_000;
const MAX_ATTRIBUTION_WINDOW_DAYS = 3_660;
const BASIS_POINTS_DENOMINATOR = 10_000n;
const MAX_SAFE_MINOR = BigInt(Number.MAX_SAFE_INTEGER);

export interface AffiliateCommissionPolicy {
	/** Whole basis points applied to an order subtotal. Zero when no rate is configured. */
	commissionRateBps: number;
	/** Cleared-balance minimum in cents, or null when no minimum is configured. */
	payoutMinimumCents: number | null;
	/** Attribution window in days, or null when no window is configured. */
	attributionWindowDays: number | null;
}

type EnvSource = Record<string, string | undefined>;

function readOptionalInteger(name: string, raw: string | undefined, max: number): number | null {
	if (raw === undefined || raw.trim() === '') return null;
	if (!/^\d+$/.test(raw.trim())) {
		throw new Error(`${name} must be a non-negative integer`);
	}
	const value = Number(raw.trim());
	if (!Number.isSafeInteger(value) || value > max) {
		throw new Error(`${name} is outside the supported range`);
	}
	return value;
}

/** Read the referral policy. Missing values do not fall back to a placeholder rate, minimum, or window. */
export function readAffiliateCommissionPolicy(source: EnvSource = env): AffiliateCommissionPolicy {
	return {
		commissionRateBps:
			readOptionalInteger(
				'AFFILIATE_COMMISSION_BPS',
				source.AFFILIATE_COMMISSION_BPS,
				MAX_COMMISSION_BPS
			) ?? 0,
		payoutMinimumCents: readOptionalInteger(
			'AFFILIATE_PAYOUT_MINIMUM_CENTS',
			source.AFFILIATE_PAYOUT_MINIMUM_CENTS,
			Number.MAX_SAFE_INTEGER
		),
		attributionWindowDays: readOptionalInteger(
			'AFFILIATE_ATTRIBUTION_WINDOW_DAYS',
			source.AFFILIATE_ATTRIBUTION_WINDOW_DAYS,
			MAX_ATTRIBUTION_WINDOW_DAYS
		)
	};
}

function divideRoundedHalfUp(numerator: bigint, denominator: bigint): bigint {
	return (numerator + denominator / 2n) / denominator;
}

/**
 * Quote a referral commission in currency minor units from the order subtotal.
 * Uses the configured basis points, which are 0 when the rate is unset.
 */
export function quoteAffiliateCommissionMinor(
	subtotalMinor: number,
	commissionRateBps: number = readAffiliateCommissionPolicy().commissionRateBps
): number {
	if (!Number.isSafeInteger(subtotalMinor) || subtotalMinor < 0) {
		throw new Error('Checkout subtotal must be a non-negative safe integer');
	}
	if (
		!Number.isSafeInteger(commissionRateBps) ||
		commissionRateBps < 0 ||
		commissionRateBps > MAX_COMMISSION_BPS
	) {
		throw new Error('Affiliate commission rate must be between 0 and 10000 basis points');
	}

	const amount = divideRoundedHalfUp(
		BigInt(subtotalMinor) * BigInt(commissionRateBps),
		BASIS_POINTS_DENOMINATOR
	);
	if (amount < 0n || amount > MAX_SAFE_MINOR) {
		throw new Error('Affiliate commission is outside the supported checkout amount range');
	}
	return Number(amount);
}

/**
 * Cookie lifetime for a configured attribution window.
 * Null when no window is configured, so callers must not invent one.
 */
export function attributionLifetimeSeconds(
	policy: AffiliateCommissionPolicy = readAffiliateCommissionPolicy()
): number | null {
	const days = policy.attributionWindowDays;
	if (days === null || days <= 0) return null;
	const seconds = days * 24 * 60 * 60;
	if (!Number.isSafeInteger(seconds) || seconds <= 0) return null;
	return seconds;
}
