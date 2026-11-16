import { describe, expect, it } from 'vitest';
import {
	commissionActionForOrderStatus,
	holdReleasePlan,
	readOptionalWholeDays,
	sellerShare,
	SELLER_PLATFORM_FEE_BPS
} from './sellerEarnings';

const day = 24 * 60 * 60 * 1000;

describe('seller earnings and hold', () => {
	it('keeps 8% of the item total and passes no platform shipping', () => {
		expect(SELLER_PLATFORM_FEE_BPS).toBe(800);
		expect(sellerShare(10_000)).toEqual({
			lineTotalMinor: 10_000,
			shippingPassthroughMinor: 0,
			feeBps: 800,
			feeMinor: 800,
			netMinor: 9_200
		});
	});

	it('does nothing when the return window and auto-delivery days are unset', () => {
		expect(readOptionalWholeDays({}, 'PAYOUT_HOLD_DAYS_AFTER_DELIVERY')).toBeNull();
		expect(readOptionalWholeDays({ PAYOUT_HOLD_DAYS_AFTER_DELIVERY: 'soon' }, 'PAYOUT_HOLD_DAYS_AFTER_DELIVERY')).toBeNull();
		const delivered = new Date('2026-01-01T00:00:00Z');
		expect(
			holdReleasePlan(
				{ status: 'delivered', shippedAt: delivered, deliveredAt: delivered, openHold: false },
				new Date('2026-06-01T00:00:00Z'),
				{ holdDays: null, autoDeliverDays: null }
			)
		).toEqual({ deliver: false, release: false });
	});

	it('releases only after delivery plus the configured window, with no open hold', () => {
		const deliveredAt = new Date('2026-01-01T00:00:00Z');
		const order = { status: 'delivered', shippedAt: deliveredAt, deliveredAt, openHold: false };
		expect(
			holdReleasePlan(order, new Date(deliveredAt.getTime() + 6 * day), { holdDays: 7, autoDeliverDays: null })
		).toEqual({ deliver: false, release: false });
		expect(
			holdReleasePlan(order, new Date(deliveredAt.getTime() + 7 * day), { holdDays: 7, autoDeliverDays: null })
		).toEqual({ deliver: false, release: true });
		expect(
			holdReleasePlan(
				{ ...order, openHold: true },
				new Date(deliveredAt.getTime() + 30 * day),
				{ holdDays: 7, autoDeliverDays: null }
			).release
		).toBe(false);
	});

	it('does not approve commission when an order is only marked shipped or delivered', () => {
		expect(commissionActionForOrderStatus('shipped')).toBe('none');
		expect(commissionActionForOrderStatus('delivered')).toBe('none');
		expect(commissionActionForOrderStatus('refunded')).toBe('reverse');
	});
});
