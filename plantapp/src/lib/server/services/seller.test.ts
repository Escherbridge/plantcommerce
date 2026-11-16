import { describe, expect, it, vi } from 'vitest';
import { normalizeSellerDisplayName, SellerService, snapshotSellerId } from './seller';

function selectChain(rows: unknown[]) {
	const limit = vi.fn().mockResolvedValue(rows);
	const where = vi.fn().mockReturnValue({ limit });
	return { from: vi.fn().mockReturnValue({ where }) };
}

describe('seller ownership', () => {
	it('keeps an Aevani product unassigned', () => {
		expect(snapshotSellerId(null)).toBeNull();
		expect(snapshotSellerId(undefined)).toBeNull();
		expect(snapshotSellerId(4)).toBe(4);
	});

	it('rejects an empty display name', () => {
		expect(() => normalizeSellerDisplayName('   ')).toThrow(/display name/i);
	});

	it('does not open a seller row for a customer', async () => {
		const tx = {
			select: vi.fn().mockReturnValueOnce(selectChain([{ id: 'user_1', role: 'customer' }])),
			insert: vi.fn()
		};
		await expect(
			SellerService.createForSellerUser(tx, {
				userId: 'user_1',
				displayName: 'North Glasshouse'
			})
		).rejects.toThrow(/seller account/i);
		expect(tx.insert).not.toHaveBeenCalled();
	});

	it('opens one seller row for a seller role', async () => {
		const created = {
			id: 9,
			userId: 'user_1',
			displayName: 'North Glasshouse',
			status: 'active'
		};
		const returning = vi.fn().mockResolvedValue([created]);
		const values = vi.fn().mockReturnValue({ returning });
		const tx = {
			select: vi
				.fn()
				.mockReturnValueOnce(selectChain([{ id: 'user_1', role: 'seller' }]))
				.mockReturnValueOnce(selectChain([])),
			insert: vi.fn().mockReturnValue({ values })
		};

		await expect(
			SellerService.createForSellerUser(tx, {
				userId: 'user_1',
				displayName: '  North Glasshouse  '
			})
		).resolves.toEqual(created);
		expect(values).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user_1',
				displayName: 'North Glasshouse',
				status: 'active'
			})
		);
	});

	it('refuses to link a product to a seller who is not active', async () => {
		const tx = {
			select: vi.fn().mockReturnValueOnce(selectChain([])),
			update: vi.fn()
		};
		await expect(SellerService.linkProduct(tx, 3, 9)).rejects.toThrow(/active seller/i);
		expect(tx.update).not.toHaveBeenCalled();
	});
});
