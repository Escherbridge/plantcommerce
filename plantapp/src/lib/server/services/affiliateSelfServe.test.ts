import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '$lib/server/db';
import { invalidateUserSessions } from '../auth';
import { AffiliateService } from './affiliate';

vi.mock('$lib/server/db', () => {
	const db = {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		execute: vi.fn().mockResolvedValue(undefined),
		transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(db))
	};
	return { db };
});

vi.mock('../auth', () => ({
	invalidateUserSessions: vi.fn()
}));

vi.mock('../catalogTruth/publicCatalog', () => ({
	assertPublicCatalogAvailable: vi.fn(),
	getPublicCatalogAvailability: () => ({ status: 'available', reason: null })
}));

function simpleSelect(rows: unknown[]) {
	return {
		from: () => ({
			where: () => ({
				limit: () => Promise.resolve(rows)
			})
		})
	};
}

function productSelect(rows: unknown[]) {
	return {
		from: () => ({
			innerJoin: () => ({
				where: () => ({
					limit: () => Promise.resolve(rows)
				})
			})
		})
	};
}

const activeAffiliate = {
	id: 4,
	userId: 'user-1',
	status: 'active',
	isActive: true,
	affiliateCode: 'GARDEN1',
	commissionRate: '0.0000',
	totalEarnings: '0.00',
	totalClicks: 0,
	totalConversions: 0
};

describe('affiliate self-serve persistence', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(db.transaction as any).mockImplementation(async (callback: (tx: unknown) => unknown) =>
			callback(db)
		);
		(db.execute as any).mockResolvedValue(undefined);
	});

	it('creates an active affiliate and promotes a customer without ending the session', async () => {
		const values = vi.fn().mockReturnValue({
			onConflictDoNothing: () => ({
				returning: () => Promise.resolve([activeAffiliate])
			})
		});
		(db.insert as any).mockReturnValue({ values });
		(db.select as any)
			.mockReturnValueOnce(simpleSelect([]))
			.mockReturnValueOnce(simpleSelect([{ role: 'customer' }]));
		const set = vi.fn().mockReturnValue({ where: () => Promise.resolve(undefined) });
		(db.update as any).mockReturnValue({ set });

		const result = await AffiliateService.createOrGetAffiliate('user-1', undefined, {
			audience: 'Garden readers',
			promotionMethod: 'website',
			monthlyTraffic: 'under-1000',
			whyJoin: 'Sharing catalogue links'
		});

		expect(result.created).toBe(true);
		expect(result.affiliate.status).toBe('active');
		expect(values).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-1',
				status: 'active',
				isActive: true,
				audience: 'Garden readers',
				commissionRate: '0.0000'
			})
		);
		expect(set).toHaveBeenCalledWith(expect.objectContaining({ role: 'affiliate' }));
		expect(invalidateUserSessions).not.toHaveBeenCalled();
	});

	it('keeps an admin role when that login becomes an affiliate', async () => {
		const values = vi.fn().mockReturnValue({
			onConflictDoNothing: () => ({
				returning: () => Promise.resolve([{ ...activeAffiliate, userId: 'admin-1' }])
			})
		});
		(db.insert as any).mockReturnValue({ values });
		(db.select as any)
			.mockReturnValueOnce(simpleSelect([]))
			.mockReturnValueOnce(simpleSelect([{ role: 'admin' }]));

		await AffiliateService.createOrGetAffiliate('admin-1');

		expect(db.update).not.toHaveBeenCalled();
	});

	it('rejects a duplicate custom affiliate code', async () => {
		(db.select as any)
			.mockReturnValueOnce(simpleSelect([]))
			.mockReturnValueOnce(simpleSelect([{ id: 9 }]));

		await expect(AffiliateService.createOrGetAffiliate('user-2', 'TAKEN')).rejects.toThrow(
			'Affiliate code already exists'
		);
		expect(db.insert).not.toHaveBeenCalled();
	});

	it('reuses the tracked link for a product instead of minting a second code', async () => {
		const existing = {
			id: 11,
			linkCode: 'garden-kit',
			affiliateUrl: '/aff/garden-kit'
		};
		(db.select as any)
			.mockReturnValueOnce(simpleSelect([activeAffiliate]))
			.mockReturnValueOnce(simpleSelect([existing]));

		const link = await AffiliateService.createAffiliateLink({
			affiliateId: activeAffiliate.id,
			productId: 3,
			customCode: 'another'
		});

		expect(link).toBe(existing);
		expect(db.insert).not.toHaveBeenCalled();
	});

	it('stores a unique /aff share path and refuses a colliding custom code', async () => {
		const values = vi.fn().mockReturnValue({
			returning: () =>
				Promise.resolve([
					{
						id: 12,
						linkCode: 'garden-kit',
						affiliateUrl: '/aff/garden-kit'
					}
				])
		});
		(db.insert as any).mockReturnValue({ values });
		(db.select as any)
			.mockReturnValueOnce(simpleSelect([activeAffiliate]))
			.mockReturnValueOnce(simpleSelect([]))
			.mockReturnValueOnce(
				productSelect([
					{
						product: { id: 3, slug: 'net-pots' },
						category: { slug: 'hydroponics', parentId: null }
					}
				])
			)
			.mockReturnValueOnce(simpleSelect([]));

		const link = await AffiliateService.createAffiliateLink({
			affiliateId: activeAffiliate.id,
			productId: 3,
			customCode: 'garden-kit'
		});

		expect(link.affiliateUrl).toBe('/aff/garden-kit');
		expect(values).toHaveBeenCalledWith(
			expect.objectContaining({
				linkCode: 'garden-kit',
				affiliateUrl: '/aff/garden-kit',
				originalUrl: '/products/hydroponics/net-pots'
			})
		);

		(db.select as any)
			.mockReturnValueOnce(simpleSelect([activeAffiliate]))
			.mockReturnValueOnce(simpleSelect([]))
			.mockReturnValueOnce(
				productSelect([
					{
						product: { id: 8, slug: 'tray' },
						category: { slug: 'hydroponics', parentId: null }
					}
				])
			)
			.mockReturnValueOnce(simpleSelect([{ id: 12 }]));

		await expect(
			AffiliateService.createAffiliateLink({
				affiliateId: activeAffiliate.id,
				productId: 8,
				customCode: 'garden-kit'
			})
		).rejects.toThrow('Link code already exists');
	});

	it('rejects a link code that cannot be a single share-path segment', async () => {
		(db.select as any).mockReturnValueOnce(simpleSelect([activeAffiliate]));

		await expect(
			AffiliateService.createAffiliateLink({
				affiliateId: activeAffiliate.id,
				productId: 3,
				customCode: '../checkout'
			})
		).rejects.toThrow(/Link code/);
		expect(db.insert).not.toHaveBeenCalled();
	});
});
