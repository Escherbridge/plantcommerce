import { describe, expect, it, vi } from 'vitest';
import { clawbackRows, earningBalance, type LedgerEvent } from './sellerLedgerBalance';

vi.mock('$lib/server/db', () => ({ db: {}, sqlClient: null }));

const pending: LedgerEvent = {
	eventType: 'pending',
	amountDeltaMinor: 9200,
	reasonCode: 'initial_accrual',
	eventReference: 'seller-earning:e1:pending'
};

describe('earningBalance: one reader over explicit event types', () => {
	it('a pre-transfer reversal shrinks the earning and a credit restores it', () => {
		const reversed: LedgerEvent = {
			eventType: 'reversed',
			amountDeltaMinor: -2300,
			reasonCode: 'chargeback',
			eventReference: 'seller-earning:e1:reversed:alloc:a1'
		};
		expect(earningBalance([pending, reversed])).toMatchObject({
			netMinor: 9200,
			preTransferReversalMinor: 2300,
			clawedBackMinor: 2300
		});
		const credit: LedgerEvent = {
			eventType: 'reversal_credited',
			amountDeltaMinor: 2300,
			reasonCode: 'dispute_won',
			eventReference: 'seller-earning:e1:reversed:alloc:a1:credit',
			creditsReference: reversed.eventReference
		};
		expect(earningBalance([pending, reversed, credit])).toMatchObject({
			preTransferReversalMinor: 0,
			clawedBackMinor: 0
		});
	});

	it('reserved debt is not nettable while active, and becomes the right balance per outcome', () => {
		const reserved: LedgerEvent = {
			eventType: 'debt',
			amountDeltaMinor: 2300,
			reasonCode: 'refund',
			eventReference: 'seller-earning:e1:debt-reserved:ch_1:2500'
		};
		expect(earningBalance([pending, reserved])).toMatchObject({
			reservedDebtMinor: 2300,
			nettableDebtMinor: 0,
			clawedBackMinor: 2300
		});

		const recovered: LedgerEvent = {
			eventType: 'reversed',
			amountDeltaMinor: -2300,
			reasonCode: 'reversal_of_debt',
			eventReference: 'seller-earning:e1:reversed-at-stripe:ch_1:2500'
		};
		expect(earningBalance([pending, reserved, recovered])).toMatchObject({
			reservedDebtMinor: 0,
			nettableDebtMinor: 0,
			stripeRecoveredMinor: 2300,
			clawedBackMinor: 2300
		});

		const released: LedgerEvent = {
			eventType: 'debt',
			amountDeltaMinor: 2300,
			reasonCode: 'debt_released',
			eventReference: 'seller-earning:e1:debt-released:ch_1:2500'
		};
		expect(earningBalance([pending, reserved, released])).toMatchObject({
			reservedDebtMinor: 0,
			nettableDebtMinor: 2300,
			clawedBackMinor: 2300
		});
	});

	it('a credited dispute fee leaves the clawback untouched and clears only the fee', () => {
		const clawback: LedgerEvent = {
			eventType: 'debt',
			amountDeltaMinor: 3000,
			reasonCode: 'chargeback',
			eventReference: 'seller-earning:e1:debt:alloc:a1'
		};
		const fee: LedgerEvent = {
			eventType: 'debt',
			amountDeltaMinor: 1500,
			reasonCode: 'dispute_fee',
			eventReference: 'seller-earning:e1:debt-fee:alloc:a1'
		};
		const feeCredit: LedgerEvent = {
			eventType: 'fee_credited',
			amountDeltaMinor: -1500,
			reasonCode: 'dispute_won',
			eventReference: 'seller-earning:e1:debt-fee:alloc:a1:credit',
			creditsReference: fee.eventReference
		};
		expect(earningBalance([pending, clawback, fee, feeCredit])).toMatchObject({
			clawedBackMinor: 3000,
			feeDebtMinor: 0,
			nettableDebtMinor: 3000
		});
		expect(clawbackRows([pending, clawback, fee, feeCredit])).toEqual([
			{ reference: clawback.eventReference, reasonCode: 'chargeback', takenMinor: 3000 }
		]);
	});

	it('settlements reduce nettable debt without touching what was clawed back', () => {
		const debt: LedgerEvent = {
			eventType: 'debt',
			amountDeltaMinor: 2300,
			reasonCode: 'refund',
			eventReference: 'seller-earning:e1:debt:ch_1:2500'
		};
		const settled: LedgerEvent = {
			eventType: 'debt',
			amountDeltaMinor: -1000,
			reasonCode: 'debt_settled',
			eventReference: 'seller-earning:e2:debt-settled'
		};
		expect(earningBalance([pending, debt, settled])).toMatchObject({
			clawedBackMinor: 2300,
			nettableDebtMinor: 1300,
			debtSettledMinor: 1000
		});
	});
});
