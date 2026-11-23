import { describe, expect, it } from 'vitest';
import {
	affiliateCommissionBuckets,
	formatMinor,
	reconcileLedgers,
	sellerEarningBuckets
} from './ledgerBuckets';

describe('earnings buckets and reconciliation', () => {
	it('keeps an unreleased seller earning pending', () => {
		expect(
			sellerEarningBuckets([
				{ eventType: 'pending', amountDeltaMinor: 9200 },
				{ eventType: 'reversed', amountDeltaMinor: -200 }
			])
		).toEqual({ pendingMinor: 9000, heldMinor: 0, releasedMinor: 0, paidMinor: 0 });
	});

	it('moves a transferred seller earning to paid', () => {
		expect(
			sellerEarningBuckets([
				{ eventType: 'pending', amountDeltaMinor: 9200 },
				{ eventType: 'released', amountDeltaMinor: 0 },
				{ eventType: 'transferred', amountDeltaMinor: 0 }
			]).paidMinor
		).toBe(9200);
	});

	it('holds approved affiliate commission until it is payable', () => {
		expect(
			affiliateCommissionBuckets([
				{ eventType: 'pending', amountDeltaMinor: 400 },
				{ eventType: 'approved', amountDeltaMinor: 0 }
			])
		).toEqual({ pendingMinor: 0, heldMinor: 400, releasedMinor: 0, paidMinor: 0 });
	});

	it('formats an amount without stating a rate', () => {
		expect(formatMinor(9200)).toBe('$92.00');
		expect(formatMinor(0)).toBe('$0.00');
	});

	it('flags a ledger that does not match recorded transfers', () => {
		expect(
			reconcileLedgers({
				transferredEarningIds: ['earn_1'],
				succeededEarningIds: [],
				reversedWithStripeIds: [],
				recordedReversalIds: []
			}).ok
		).toBe(false);
		expect(
			reconcileLedgers({
				transferredEarningIds: ['earn_1'],
				succeededEarningIds: ['earn_1'],
				reversedWithStripeIds: ['re_1'],
				recordedReversalIds: ['re_1']
			}).ok
		).toBe(true);
	});
});
