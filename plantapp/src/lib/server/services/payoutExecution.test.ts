import { describe, expect, it, vi } from 'vitest';
import {
	affiliateBatchGate,
	netAfterDebt,
	planSellerTransfer,
	payableBalance,
	sellerTransferGate
} from './payoutExecution';
import { runSellerTransfers } from './payoutJobs';

vi.mock('$lib/server/db', () => ({ db: {}, sqlClient: null }));

const stripe = {
	transfers: {
		create: vi.fn(() => {
			throw new Error('Stripe must not be called while payouts are off');
		})
	}
};

describe('payout kill switches', () => {
	it('does not ready a seller transfer while the switch or the return window is unset', async () => {
		await expect(runSellerTransfers({}, stripe)).resolves.toEqual({
			skipped: true,
			reason: 'disabled',
			transferred: 0
		});
		expect(sellerTransferGate({})).toBe('disabled');
		expect(sellerTransferGate({ SELLER_TRANSFERS_ENABLED: 'true' })).toBe('timing_unset');
		expect(
			sellerTransferGate({
				SELLER_TRANSFERS_ENABLED: 'true',
				PAYOUT_HOLD_DAYS_AFTER_DELIVERY: '14'
			})
		).toBe('ready');
		expect(stripe.transfers.create).not.toHaveBeenCalled();
	});

	it('does not ready an affiliate batch until rate, window, minimum, and float are set', () => {
		expect(affiliateBatchGate({}).action).toBe('skip');
		expect(
			affiliateBatchGate({
				AFFILIATE_PAYOUTS_ENABLED: 'true',
				AFFILIATE_COMMISSION_BPS: '100',
				AFFILIATE_ATTRIBUTION_WINDOW_DAYS: '30',
				AFFILIATE_PAYOUT_MINIMUM_MINOR: '5000',
				AFFILIATE_PAYOUT_FLOAT_MINOR: '100000'
			})
		).toMatchObject({ action: 'pay', minimumMinor: 5000 });
	});

	it('requires approval for every batch when the threshold is unset', () => {
		const gate = affiliateBatchGate({
			AFFILIATE_PAYOUTS_ENABLED: 'true',
			AFFILIATE_COMMISSION_BPS: '100',
			AFFILIATE_ATTRIBUTION_WINDOW_DAYS: '30',
			AFFILIATE_PAYOUT_MINIMUM_MINOR: '0',
			AFFILIATE_PAYOUT_FLOAT_MINOR: '1'
		});
		if (gate.action !== 'pay') throw new Error('expected a payable gate');
		expect(gate.needsApproval(1)).toBe(true);
		expect(gate.needsApproval(50_000)).toBe(true);
	});

	it('pays only approved commission that has not already been sent', () => {
		expect(
			payableBalance([
				{ eventType: 'pending', amountDeltaMinor: 400 },
				{ eventType: 'approved', amountDeltaMinor: 0 }
			])
		).toBe(400);
		expect(
			payableBalance([
				{ eventType: 'pending', amountDeltaMinor: 400 },
				{ eventType: 'approved', amountDeltaMinor: 0 },
				{ eventType: 'paid', amountDeltaMinor: 0 }
			])
		).toBeNull();
	});

	it('nets seller debt from the next transfer', () => {
		expect(netAfterDebt(9200, 2000)).toEqual({ payMinor: 7200, debtAppliedMinor: 2000 });
		expect(netAfterDebt(500, 800)).toEqual({ payMinor: 0, debtAppliedMinor: 500 });
	});
});

describe('planSellerTransfer', () => {
	it.each([
		// net, reversed before transfer, seller debt -> pay, debt applied, permanent
		[9200, 0, 0, 9200, 0, false],
		[9200, 2300, 0, 6900, 0, false],
		[9200, 0, 3000, 6200, 3000, false],
		[9200, 0, 20000, 0, 9200, true],
		[9200, 9200, 5000, 0, 0, true],
		[9200, 12000, 0, 0, 0, true]
	])('net %i, reversed %i, debt %i', (net, reversed, debt, pay, applied, permanent) => {
		expect(
			planSellerTransfer({ netMinor: net, ownReversalsMinor: reversed, sellerDebtMinor: debt })
		).toEqual({ payMinor: pay, debtAppliedMinor: applied, permanent });
	});
});
