import { describe, expect, it } from 'vitest';
import { disputeSellerPaysFee, moneyEventFacts, proportionalShare } from './refundClawback';

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
});
