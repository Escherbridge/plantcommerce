/**
 * Canonical Aevani affiliate commission policy — the single source of truth for
 * the tier ladder, platform fee, attribution window, and payout minimum.
 * See `src/lib/server/services/AGENTS.md` §affiliate-policy for the rationale.
 */

/** Flat platform fee retained on every attributed sale, independent of affiliate tier. */
export const PLATFORM_FEE_RATE = '0.0200'; // 2%

/** Platform fee expressed as a whole-number percent for display copy. */
export const PLATFORM_FEE_PERCENT = 2;

/** Monotonic version of this tier ladder; bump on any threshold or rate change. */
export const AFFILIATE_TIER_VERSION = 1;

/** Last-click attribution cookie window, in days. */
export const AFFILIATE_COOKIE_WINDOW_DAYS = 60;

/** Minimum cleared balance (USD) before a monthly payout is issued. */
export const AFFILIATE_MIN_PAYOUT_USD = 50;

export type AffiliateTierCode = 'sprout' | 'grower' | 'steward';

export interface AffiliateTier {
	code: AffiliateTierCode;
	name: string;
	/** Commission rate as a 4-decimal string usable directly as `affiliate.commissionRate`. */
	rate: string;
	/** Commission rate in basis points. */
	rateBps: number;
	/** Human-readable percent for display copy. */
	percent: number;
	/** Inclusive lower bound of lifetime attributed sales (USD). */
	minSalesUsd: number;
	/** Exclusive upper bound of lifetime attributed sales (USD); null on the top tier. */
	maxSalesUsd: number | null;
}

/** Sprout → Grower → Steward, ordered by ascending lifetime attributed sales. */
export const AFFILIATE_TIERS: readonly AffiliateTier[] = Object.freeze([
	{
		code: 'sprout',
		name: 'Sprout',
		rate: '0.0200',
		rateBps: 200,
		percent: 2,
		minSalesUsd: 0,
		maxSalesUsd: 5000
	},
	{
		code: 'grower',
		name: 'Grower',
		rate: '0.0350',
		rateBps: 350,
		percent: 3.5,
		minSalesUsd: 5000,
		maxSalesUsd: 25000
	},
	{
		code: 'steward',
		name: 'Steward',
		rate: '0.0500',
		rateBps: 500,
		percent: 5,
		minSalesUsd: 25000,
		maxSalesUsd: null
	}
]);

/** The tier every self-serve affiliate starts in on join. */
export const DEFAULT_AFFILIATE_TIER: AffiliateTier = AFFILIATE_TIERS[0];

/** The highest commission rate any affiliate can reach (for "up to N%" copy). */
export const AFFILIATE_MAX_TIER: AffiliateTier = AFFILIATE_TIERS[AFFILIATE_TIERS.length - 1];

/**
 * Resolve the affiliate tier for a lifetime attributed-sales total (USD).
 * A sales value on a boundary (e.g. exactly 5000) promotes to the higher tier.
 */
export function resolveAffiliateTier(lifetimeAttributedSalesUsd: number): AffiliateTier {
	const sales = Number.isFinite(lifetimeAttributedSalesUsd)
		? Math.max(0, lifetimeAttributedSalesUsd)
		: 0;

	for (let i = AFFILIATE_TIERS.length - 1; i >= 0; i -= 1) {
		if (sales >= AFFILIATE_TIERS[i].minSalesUsd) {
			return AFFILIATE_TIERS[i];
		}
	}

	return DEFAULT_AFFILIATE_TIER;
}
