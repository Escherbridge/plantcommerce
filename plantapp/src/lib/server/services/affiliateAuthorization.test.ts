import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '$lib/server/db';
import { invalidateUserSessions } from '../auth';
import { AffiliateAccessError, AffiliateService, isActiveApprovedAffiliate } from './affiliate';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		transaction: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('../auth', () => ({
	invalidateUserSessions: vi.fn()
}));

const pendingAffiliate = {
	id: 7,
	userId: 'applicant-7',
	status: 'pending',
	isActive: false
} as any;

function selectResult(rows: unknown[]) {
	const limit = vi.fn().mockResolvedValue(rows);
	const where = vi.fn().mockReturnValue({ limit });
	const from = vi.fn().mockReturnValue({ where });
	return { from };
}

describe('affiliate approval authorization', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('treats only active, approved records as operational affiliates', () => {
		expect(isActiveApprovedAffiliate({ status: 'active', isActive: true } as any)).toBe(true);
		expect(isActiveApprovedAffiliate({ status: 'pending', isActive: true } as any)).toBe(false);
		expect(isActiveApprovedAffiliate({ status: 'active', isActive: false } as any)).toBe(false);
		expect(isActiveApprovedAffiliate({ status: 'rejected', isActive: false } as any)).toBe(false);
		expect(isActiveApprovedAffiliate({ status: 'suspended', isActive: false } as any)).toBe(false);
	});

	it('fails closed before a pending applicant can create a link', async () => {
		(db.select as any).mockReturnValue(selectResult([pendingAffiliate]));

		await expect(
			AffiliateService.createAffiliateLink({ affiliateId: pendingAffiliate.id, productId: 3 })
		).rejects.toBeInstanceOf(AffiliateAccessError);
	});

	it('rejects a stale affiliate role record from the portal access requirement', async () => {
		(db.select as any).mockReturnValue(selectResult([pendingAffiliate]));

		await expect(
			AffiliateService.requireActiveAffiliateByUserId(pendingAffiliate.userId)
		).rejects.toBeInstanceOf(AffiliateAccessError);
	});

	it('rejecting an application deactivates it, restores customer status, and revokes sessions', async () => {
		(db.select as any).mockReturnValue(selectResult([pendingAffiliate]));

		const set = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
		const tx = {
			select: vi.fn().mockReturnValue(selectResult([{ role: 'affiliate' }])),
			update: vi.fn().mockReturnValue({
				set
			})
		};
		(db.transaction as any).mockImplementation(async (callback: any) => callback(tx));

		const affiliate = await AffiliateService.rejectAffiliate(pendingAffiliate.id);

		expect(affiliate.status).toBe('rejected');
		expect(affiliate.isActive).toBe(false);
		expect(tx.update).toHaveBeenCalledTimes(2);
		expect(set).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'rejected', isActive: false })
		);
		expect(set).toHaveBeenCalledWith(expect.objectContaining({ role: 'customer' }));
		expect(invalidateUserSessions).toHaveBeenCalledWith(pendingAffiliate.userId);
	});

	it('approving an application activates it, grants affiliate status, and revokes sessions', async () => {
		(db.select as any).mockReturnValue(selectResult([pendingAffiliate]));

		const set = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
		const tx = {
			select: vi.fn().mockReturnValue(selectResult([{ role: 'customer' }])),
			update: vi.fn().mockReturnValue({
				set
			})
		};
		(db.transaction as any).mockImplementation(async (callback: any) => callback(tx));

		const affiliate = await AffiliateService.approveAffiliate(pendingAffiliate.id);

		expect(affiliate.status).toBe('active');
		expect(affiliate.isActive).toBe(true);
		expect(set).toHaveBeenCalledWith(expect.objectContaining({ status: 'active', isActive: true }));
		expect(set).toHaveBeenCalledWith(expect.objectContaining({ role: 'affiliate' }));
		expect(invalidateUserSessions).toHaveBeenCalledWith(pendingAffiliate.userId);
	});
});
