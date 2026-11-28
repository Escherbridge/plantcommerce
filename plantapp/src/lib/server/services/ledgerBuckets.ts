import { earningBalance, type LedgerEvent } from './sellerLedgerBalance';

export type MoneyBuckets = {
	pendingMinor: number;
	heldMinor: number;
	releasedMinor: number;
	paidMinor: number;
};

export function emptyBuckets(): MoneyBuckets {
	return { pendingMinor: 0, heldMinor: 0, releasedMinor: 0, paidMinor: 0 };
}

export function addBuckets(left: MoneyBuckets, right: MoneyBuckets): MoneyBuckets {
	return {
		pendingMinor: left.pendingMinor + right.pendingMinor,
		heldMinor: left.heldMinor + right.heldMinor,
		releasedMinor: left.releasedMinor + right.releasedMinor,
		paidMinor: left.paidMinor + right.paidMinor
	};
}

function netOf(events: { eventType: string; amountDeltaMinor: number }[]): number {
	return events.reduce((sum, event) => {
		if (event.eventType === 'pending' || event.eventType === 'reversed') {
			return sum + event.amountDeltaMinor;
		}
		return sum;
	}, 0);
}

/** Seller earning display buckets, read through the single seller ledger reader. A transferred earning is paid. */
export function sellerEarningBuckets(events: LedgerEvent[]): MoneyBuckets {
	const buckets = emptyBuckets();
	const balance = earningBalance(events);
	const net = balance.netMinor - balance.preTransferReversalMinor - balance.stripeRecoveredMinor;
	if (net <= 0) return buckets;
	const types = new Set(events.map((event) => event.eventType));
	if (types.has('transferred')) buckets.paidMinor = net;
	else if (types.has('released')) buckets.releasedMinor = net;
	else if (types.has('held')) buckets.heldMinor = net;
	else buckets.pendingMinor = net;
	return buckets;
}

/** Affiliate commission display buckets. Approved and not yet payable is held. */
export function affiliateCommissionBuckets(
	events: { eventType: string; amountDeltaMinor: number }[]
): MoneyBuckets {
	const buckets = emptyBuckets();
	const net = netOf(events);
	if (net <= 0) return buckets;
	const types = new Set(events.map((event) => event.eventType));
	if (types.has('paid')) buckets.paidMinor = net;
	else if (types.has('payable')) buckets.releasedMinor = net;
	else if (types.has('approved')) buckets.heldMinor = net;
	else buckets.pendingMinor = net;
	return buckets;
}

export function formatMinor(minor: number): string {
	const sign = minor < 0 ? '-' : '';
	const abs = Math.abs(minor);
	const dollars = Math.floor(abs / 100);
	const cents = String(abs % 100).padStart(2, '0');
	return `${sign}$${dollars}.${cents}`;
}

/** Compare stored ledger ids with stored transfer rows. Does not call Stripe. */
export function reconcileLedgers(input: {
	transferredEarningIds: string[];
	succeededEarningIds: string[];
	reversedWithStripeIds: string[];
	recordedReversalIds: string[];
}): { ok: boolean; mismatches: string[] } {
	const mismatches: string[] = [];
	const missingTransfer = input.transferredEarningIds.filter(
		(id) => !input.succeededEarningIds.includes(id)
	);
	const extraTransfer = input.succeededEarningIds.filter(
		(id) => !input.transferredEarningIds.includes(id)
	);
	if (missingTransfer.length > 0 || extraTransfer.length > 0) {
		mismatches.push('Seller transfers do not match the earnings ledger.');
	}
	const missingReversal = input.reversedWithStripeIds.filter(
		(id) => !input.recordedReversalIds.includes(id)
	);
	if (missingReversal.length > 0) {
		mismatches.push('Recorded reversals do not match the earnings ledger.');
	}
	return { ok: mismatches.length === 0, mismatches };
}

/** Strict dollars to cents: "12", "12.5", "12.50". Anything else is refused. */
export function dollarsToMinor(value: string): number | null {
	const match = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(value.trim());
	if (!match) return null;
	return Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0') || '0');
}
