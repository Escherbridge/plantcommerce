import { describe, expect, it, vi } from 'vitest';
import { AffiliateCommissionService } from './affiliateCommission';

vi.mock('$env/dynamic/private', () => ({
	env: { AFFILIATE_LEDGER_ENABLED: 'true' }
}));

function selectRows(rows: unknown[]) {
	const limit = vi.fn().mockResolvedValue(rows);
	const orderBy = vi.fn().mockReturnValue({ limit });
	const where = vi.fn().mockReturnValue({ limit, orderBy });
	return { from: vi.fn().mockReturnValue({ where }) };
}

describe('AffiliateCommissionService', () => {
	it('does not create a ledger entry for an unattributed zero-commission draft', async () => {
		const tx = { select: vi.fn(), insert: vi.fn(), update: vi.fn() };

		const result = await AffiliateCommissionService.recordPaidCommission(tx, {
			draft: { affiliateLinkId: null, affiliateCommissionMinor: 0 } as any,
			order: {} as any,
			stripeWebhookEventId: 'evt_unattributed'
		});

		expect(result).toBeNull();
		expect(tx.select).not.toHaveBeenCalled();
		expect(tx.insert).not.toHaveBeenCalled();
	});

	it('does not block fulfillment for an attributed draft whose frozen commission is zero', async () => {
		const tx = { select: vi.fn(), insert: vi.fn(), update: vi.fn() };

		const result = await AffiliateCommissionService.recordPaidCommission(tx, {
			draft: { affiliateLinkId: 17, affiliateCommissionMinor: 0 } as any,
			order: {} as any,
			stripeWebhookEventId: 'evt_zero_quote'
		});

		expect(result).toBeNull();
		expect(tx.select).not.toHaveBeenCalled();
		expect(tx.insert).not.toHaveBeenCalled();
	});

	it('persists the frozen draft quote rather than a current affiliate rate', async () => {
		const ledger = {
			id: 'commission_1',
			affiliateId: 7,
			affiliateLinkId: 17,
			sourceOrderId: 31,
			sourceCheckoutDraftId: 'draft_1',
			sourceReference: 'order:31:commission',
			currency: 'usd',
			quotedAmountMinor: 425,
			draftSnapshotHash: 'a'.repeat(64)
		};
		const ledgerValues = vi.fn().mockReturnValue({
			returning: vi.fn().mockResolvedValue([ledger])
		});
		const eventValues = vi.fn().mockResolvedValue(undefined);
		const updateWhere = vi.fn().mockResolvedValue(undefined);
		const tx = {
			select: vi
				.fn()
				.mockReturnValueOnce(selectRows([{ affiliateId: 7 }]))
				.mockReturnValueOnce(selectRows([]))
				.mockReturnValueOnce(selectRows([])),
			insert: vi
				.fn()
				.mockReturnValueOnce({ values: ledgerValues })
				.mockReturnValueOnce({ values: eventValues }),
			update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: updateWhere }) })
		};

		await AffiliateCommissionService.recordPaidCommission(tx, {
			draft: {
				id: 'draft_1',
				affiliateLinkId: 17,
				affiliateCommissionMinor: 425,
				affiliateId: 7,
				affiliateCommissionRateBps: 500,
				affiliateTierCode: 'legacy-rate',
				affiliateTierVersion: 0,
				affiliateTermsVersion: 'terms-1',
				affiliateDisclosureVersion: 'disclosure-1',
				affiliateTermsAcceptanceId: 'terms_acceptance_1',
				currency: 'usd',
				snapshotHash: 'a'.repeat(64)
			} as any,
			order: { id: 31, checkoutDraftId: 'draft_1', affiliateLinkId: 17 } as any,
			stripeWebhookEventId: 'evt_paid',
			now: new Date('2026-07-20T00:00:00.000Z')
		});

		expect(ledgerValues).toHaveBeenCalledWith(
			expect.objectContaining({
				quotedAmountMinor: 425,
				commissionRateBps: 500,
				currency: 'usd',
				sourceCheckoutDraftId: 'draft_1'
			})
		);
		expect(eventValues).toHaveBeenCalledWith(
			expect.objectContaining({
				eventType: 'pending',
				amountDeltaMinor: 425,
				currency: 'usd'
			})
		);
	});
});
