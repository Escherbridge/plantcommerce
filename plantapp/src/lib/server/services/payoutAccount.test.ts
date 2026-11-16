import { describe, expect, it, vi } from 'vitest';
import { PayoutAccountService } from './payoutAccount';

function selectChain(rows: unknown[]) {
	const limit = vi.fn().mockResolvedValue(rows);
	const where = vi.fn().mockReturnValue({ limit });
	return { from: vi.fn().mockReturnValue({ where }) };
}

describe('payout account records', () => {
	it('stores no Stripe account id until onboarding creates one', async () => {
		const created = {
			id: 'acct_row',
			ownerType: 'seller',
			sellerId: 9,
			affiliateId: null,
			stripeAccountId: null,
			country: null,
			transfersActive: false
		};
		const returning = vi.fn().mockResolvedValue([created]);
		const values = vi.fn().mockReturnValue({ returning });
		const tx = {
			select: vi.fn().mockReturnValueOnce(selectChain([])),
			insert: vi.fn().mockReturnValue({ values })
		};

		await expect(
			PayoutAccountService.ensureLocal(tx, { ownerType: 'seller', sellerId: 9 })
		).resolves.toEqual(created);
		expect(values).toHaveBeenCalledWith(
			expect.objectContaining({
				ownerType: 'seller',
				sellerId: 9,
				affiliateId: null,
				stripeAccountId: null,
				country: null,
				transfersActive: false,
				requirementsDue: false,
				disabledReason: null
			})
		);
	});

	it('returns the existing record instead of inserting another', async () => {
		const existing = { id: 'acct_row', affiliateId: 4, stripeAccountId: null };
		const tx = {
			select: vi.fn().mockReturnValueOnce(selectChain([existing])),
			insert: vi.fn()
		};
		await expect(
			PayoutAccountService.ensureLocal(tx, { ownerType: 'affiliate', affiliateId: 4 })
		).resolves.toEqual(existing);
		expect(tx.insert).not.toHaveBeenCalled();
	});
});
