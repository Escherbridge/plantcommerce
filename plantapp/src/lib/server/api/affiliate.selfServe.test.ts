import { beforeEach, describe, expect, it, vi } from 'vitest';
import { affiliateRouter } from './affiliate';

const service = vi.hoisted(() => ({
	createOrGetAffiliate: vi.fn(),
	requireActiveAffiliateByUserId: vi.fn(),
	requireActiveAffiliateById: vi.fn(),
	createAffiliateLink: vi.fn(),
	getAffiliateLinks: vi.fn(),
	getAffiliateByUserId: vi.fn()
}));

vi.mock('../services/affiliate', () => ({
	default: service,
	AffiliateAccessError: class AffiliateAccessError extends Error {
		constructor(message = 'Active affiliate approval is required') {
			super(message);
			this.name = 'AffiliateAccessError';
		}
	},
	isActiveApprovedAffiliate: (affiliate: { status: string; isActive: boolean }) =>
		affiliate?.status === 'active' && affiliate?.isActive === true
}));

vi.mock('../catalogTruth/publicCatalog', () => ({
	getPublicCatalogAvailability: () => ({ status: 'available', reason: null })
}));

const active = {
	id: 4,
	userId: 'user-1',
	status: 'active',
	isActive: true,
	affiliateCode: 'GARDEN1',
	commissionRate: '0.0200',
	totalEarnings: '0.00',
	totalClicks: 0,
	totalConversions: 0
};

function caller(role: 'customer' | 'admin' = 'customer', emailVerified = true) {
	return affiliateRouter.createCaller({
		user: { id: 'user-1', role, emailVerified } as any,
		session: { id: 'session-1' } as any,
		event: { url: new URL('https://aevani.com/affiliate/links') } as any
	});
}

const application = {
	audience: 'Garden readers',
	promotionMethod: 'website' as const,
	monthlyTraffic: 'under-1000' as const,
	whyJoin: 'I will share catalogue links.',
	agreeTerms: true as const
};

describe('affiliate self-serve API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects an empty application before any account is created', async () => {
		await expect(
			caller().submitApplication({
				...application,
				audience: '   ',
				agreeTerms: true
			})
		).rejects.toThrow();
		expect(service.createOrGetAffiliate).not.toHaveBeenCalled();
	});

	it('requires the participation agreement', async () => {
		await expect(
			caller().submitApplication({
				...application,
				agreeTerms: false as unknown as true
			})
		).rejects.toThrow();
		expect(service.createOrGetAffiliate).not.toHaveBeenCalled();
	});

	it('refuses an unverified email before creating an affiliate or a link', async () => {
		await expect(caller('customer', false).submitApplication(application)).rejects.toMatchObject({
			code: 'FORBIDDEN'
		});
		await expect(
			caller('customer', false).createLink({ productId: 3, customCode: 'garden-kit' })
		).rejects.toMatchObject({ code: 'FORBIDDEN' });
		expect(service.createOrGetAffiliate).not.toHaveBeenCalled();
		expect(service.createAffiliateLink).not.toHaveBeenCalled();
	});

	it('creates an active affiliate for the signed-in user', async () => {
		service.createOrGetAffiliate.mockResolvedValue({ created: true, affiliate: active });

		const result = await caller().submitApplication(application);

		expect(service.createOrGetAffiliate).toHaveBeenCalledWith('user-1', undefined, {
			website: undefined,
			socialMedia: undefined,
			audience: application.audience,
			promotionMethod: application.promotionMethod,
			monthlyTraffic: application.monthlyTraffic,
			whyJoin: application.whyJoin
		});
		expect(result.status).toBe('active');
		expect(result.isActive).toBe(true);
	});

	it('does not open a second affiliate row for an existing account', async () => {
		service.createOrGetAffiliate.mockResolvedValue({ created: false, affiliate: active });

		await expect(caller().submitApplication(application)).rejects.toMatchObject({
			code: 'CONFLICT'
		});
	});

	it('returns an absolute /aff share URL and surfaces a duplicate code', async () => {
		service.requireActiveAffiliateByUserId.mockResolvedValue(active);
		service.createAffiliateLink.mockResolvedValue({
			id: 12,
			linkCode: 'garden-kit',
			affiliateUrl: '/aff/garden-kit',
			productId: 3
		});

		const created = await caller().createLink({ productId: 3, customCode: 'garden-kit' });
		expect(created.affiliateUrl).toBe('https://aevani.com/aff/garden-kit');

		service.createAffiliateLink.mockRejectedValue(new Error('Link code already exists'));
		await expect(
			caller().createLink({ productId: 8, customCode: 'garden-kit' })
		).rejects.toMatchObject({ code: 'BAD_REQUEST', message: 'Link code already exists' });
	});

	it('refuses a pending applicant before a link is created', async () => {
		const { AffiliateAccessError } = await import('../services/affiliate');
		service.requireActiveAffiliateByUserId.mockRejectedValue(new AffiliateAccessError());

		await expect(caller().createLink({ productId: 3 })).rejects.toMatchObject({
			code: 'FORBIDDEN'
		});
		expect(service.createAffiliateLink).not.toHaveBeenCalled();
	});
});
