/** Owner decision: sellers pay a flat 8%. Card processing stays with Aevani. */
export const SELLER_PLATFORM_FEE_BPS = 800;

const DAY_MS = 24 * 60 * 60 * 1000;

export function readOptionalWholeDays(
	source: Record<string, string | undefined>,
	name: string
): number | null {
	const raw = source[name];
	if (raw === undefined || raw.trim() === '') return null;
	if (!/^\d+$/.test(raw.trim())) return null;
	const value = Number(raw.trim());
	if (!Number.isSafeInteger(value) || value > 3660) return null;
	return value;
}

export function sellerShare(
	lineTotalMinor: number,
	shippingPassthroughMinor = 0
): {
	lineTotalMinor: number;
	shippingPassthroughMinor: number;
	feeBps: number;
	feeMinor: number;
	netMinor: number;
} {
	if (!Number.isSafeInteger(lineTotalMinor) || lineTotalMinor < 0) {
		throw new Error('Seller line total must be a non-negative safe integer');
	}
	if (!Number.isSafeInteger(shippingPassthroughMinor) || shippingPassthroughMinor < 0) {
		throw new Error('Seller shipping passthrough must be a non-negative safe integer');
	}
	const feeMinor = Number(
		(BigInt(lineTotalMinor) * BigInt(SELLER_PLATFORM_FEE_BPS) + 5000n) / 10000n
	);
	return {
		lineTotalMinor,
		shippingPassthroughMinor,
		feeBps: SELLER_PLATFORM_FEE_BPS,
		feeMinor,
		netMinor: lineTotalMinor + shippingPassthroughMinor - feeMinor
	};
}

export type HoldOrder = {
	status: string;
	shippedAt: Date | null;
	deliveredAt: Date | null;
	openHold: boolean;
};

export function holdReleasePlan(
	order: HoldOrder,
	now: Date,
	policy: { holdDays: number | null; autoDeliverDays: number | null }
): { deliver: boolean; release: boolean } {
	if (policy.holdDays === null && policy.autoDeliverDays === null) {
		return { deliver: false, release: false };
	}
	let deliveredAt = order.deliveredAt;
	let deliver = false;
	if (
		!deliveredAt &&
		order.status === 'shipped' &&
		order.shippedAt &&
		policy.autoDeliverDays !== null &&
		now.getTime() >= order.shippedAt.getTime() + policy.autoDeliverDays * DAY_MS
	) {
		deliver = true;
		deliveredAt = new Date(order.shippedAt.getTime() + policy.autoDeliverDays * DAY_MS);
	}
	const release =
		policy.holdDays !== null &&
		deliveredAt !== null &&
		!order.openHold &&
		(order.status === 'delivered' || deliver) &&
		now.getTime() >= deliveredAt.getTime() + policy.holdDays * DAY_MS;
	return { deliver, release };
}

/**
 * Referral commission on a status change. While the return window (PAYOUT_HOLD_DAYS_AFTER_DELIVERY) is unset the
 * hold job does nothing, so shipment and delivery approve commission as they always did. Once the window is set,
 * only the hold job approves it.
 */
export function commissionActionForOrderStatus(
	status: string,
	holdDaysAfterDelivery: number | null
): 'none' | 'clear' | 'reverse' {
	if (status === 'refunded' || status === 'cancelled') return 'reverse';
	if ((status === 'shipped' || status === 'delivered') && holdDaysAfterDelivery === null) {
		return 'clear';
	}
	return 'none';
}
