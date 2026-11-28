import { describe, expect, it } from 'vitest';
import {
	clawbackDelta,
	disputeSellerPaysFee,
	moneyEventFacts,
	proportionalShare
} from './refundClawback';

describe('refund and dispute clawbacks', () => {
	it('refunds the 8% in proportion and leaves the rest of the seller net', () => {
		expect(proportionalShare(800, 2500, 10_000)).toBe(200);
		expect(proportionalShare(9_200, 2500, 10_000)).toBe(2_300);
		expect(proportionalShare(9_200, 0, 10_000)).toBe(0);
	});

	it('passes a seller-fault dispute fee to the seller and absorbs fraud', () => {
		expect(disputeSellerPaysFee('product_not_received')).toBe(true);
		expect(disputeSellerPaysFee('product_unacceptable')).toBe(true);
		expect(disputeSellerPaysFee('fraudulent')).toBe(false);
		expect(disputeSellerPaysFee(null)).toBe(false);
	});

	it('reads a dispute without storing a reason narrative or a fee that was not provided', () => {
		expect(
			moneyEventFacts('charge.dispute.created', {
				id: 'dp_1',
				charge: 'ch_1',
				amount: 5000,
				status: 'needs_response',
				reason: 'fraudulent'
			})
		).toMatchObject({
			action: 'open',
			chargeId: 'ch_1',
			reasonCode: 'chargeback',
			feeMinor: 0,
			sellerPaysFee: false
		});
		expect(
			moneyEventFacts('charge.dispute.closed', {
				id: 'dp_1',
				charge: 'ch_1',
				amount: 5000,
				status: 'lost',
				reason: 'product_not_received',
				balance_transactions: [{ fee: 1500 }]
			})
		).toMatchObject({ action: 'reverse', feeMinor: 1500, sellerPaysFee: true });
	});

	it('reads refunds only from charge.refunded, as a running total', () => {
		expect(moneyEventFacts('charge.refunded', { id: 'ch_1', amount_refunded: 2500 })).toMatchObject(
			{ action: 'reverse', cumulative: true, amountMinor: 2500, objectId: 'ch_1' }
		);
		expect(
			moneyEventFacts('refund.created', { id: 're_1', charge: 'ch_1', amount: 2500 })
		).toBeNull();
	});

	it('does not claw back twice when a lost dispute ends as a refunded charge', () => {
		expect(
			moneyEventFacts('charge.dispute.closed', {
				id: 'dp_1',
				charge: 'ch_1',
				amount: 5000,
				status: 'charge_refunded',
				reason: 'fraudulent'
			})
		).toMatchObject({ action: 'close' });
	});
});

describe('clawbackDelta', () => {
	// base 9200 on a 10000 order
	it.each([
		['first partial refund of 25%', 2500, 0, 0, 2300],
		['replay of the same running total', 2500, 2300, 2300, 0],
		['second partial refund takes only the increase', 5000, 2300, 2300, 2300],
		['an older running total arriving late takes nothing', 2500, 4600, 4600, 0],
		['refund after a lost dispute cannot exceed the base', 10000, 0, 9000, 200],
		['full refund after full chargeback takes nothing', 10000, 0, 9200, 0]
	])('%s', (_name, refunded, forSource, all, expected) => {
		expect(
			clawbackDelta({
				baseMinor: 9200,
				refundedMinor: refunded,
				totalMinor: 10000,
				alreadyForSourceMinor: forSource,
				alreadyAllMinor: all
			})
		).toBe(expected);
	});
});
