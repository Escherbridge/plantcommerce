import { readOptionalWholeDays } from './sellerEarnings';

function enabled(source: Record<string, string | undefined>, name: string): boolean {
	return source[name]?.trim() === 'true';
}

/** Blank or non-numeric values stay unset. Unset means do not pay. */
export function readOptionalMinor(
	source: Record<string, string | undefined>,
	name: string
): number | null {
	const raw = source[name];
	if (raw === undefined || raw.trim() === '') return null;
	if (!/^\d+$/.test(raw.trim())) return null;
	const value = Number(raw.trim());
	if (!Number.isSafeInteger(value)) return null;
	return value;
}

export function sellerTransferGate(source: Record<string, string | undefined>): 'disabled' | 'timing_unset' | 'ready' {
	if (!enabled(source, 'SELLER_TRANSFERS_ENABLED')) return 'disabled';
	if (readOptionalWholeDays(source, 'PAYOUT_HOLD_DAYS_AFTER_DELIVERY') === null) return 'timing_unset';
	return 'ready';
}

export type AffiliateBatchGate =
	| { action: 'skip'; reason: 'disabled' | 'rate_unset' | 'window_unset' | 'minimum_unset' | 'float_unset' }
	| { action: 'pay'; minimumMinor: number; needsApproval: (totalMinor: number) => boolean };

export function affiliateBatchGate(source: Record<string, string | undefined>): AffiliateBatchGate {
	if (!enabled(source, 'AFFILIATE_PAYOUTS_ENABLED')) return { action: 'skip', reason: 'disabled' };
	const rate = readOptionalMinor(source, 'AFFILIATE_COMMISSION_BPS');
	if (rate === null || rate === 0) return { action: 'skip', reason: 'rate_unset' };
	if (readOptionalWholeDays(source, 'AFFILIATE_ATTRIBUTION_WINDOW_DAYS') === null) {
		return { action: 'skip', reason: 'window_unset' };
	}
	const minimumMinor =
		readOptionalMinor(source, 'AFFILIATE_PAYOUT_MINIMUM_MINOR') ??
		readOptionalMinor(source, 'AFFILIATE_PAYOUT_MINIMUM_CENTS');
	if (minimumMinor === null) return { action: 'skip', reason: 'minimum_unset' };
	if (readOptionalMinor(source, 'AFFILIATE_PAYOUT_FLOAT_MINOR') === null) {
		return { action: 'skip', reason: 'float_unset' };
	}
	const threshold = readOptionalMinor(source, 'AFFILIATE_BATCH_APPROVAL_THRESHOLD_MINOR');
	return {
		action: 'pay',
		minimumMinor,
		needsApproval: (totalMinor) => threshold === null || totalMinor > threshold
	};
}

/** Approved commission that is not yet payable or paid. Null when it should not be batched. */
export function payableBalance(
	events: { eventType: string; amountDeltaMinor: number }[]
): number | null {
	if (!events.some((event) => event.eventType === 'approved')) return null;
	if (events.some((event) => event.eventType === 'paid' || event.eventType === 'payable')) return null;
	const net = events.reduce((sum, event) => sum + event.amountDeltaMinor, 0);
	return net > 0 ? net : null;
}

export function netAfterDebt(netMinor: number, debtMinor: number): { payMinor: number; debtAppliedMinor: number } {
	const debtAppliedMinor = Math.min(Math.max(debtMinor, 0), Math.max(netMinor, 0));
	return { payMinor: Math.max(netMinor, 0) - debtAppliedMinor, debtAppliedMinor };
}
