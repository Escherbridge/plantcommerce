import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import {
	AffiliateAttributionService,
	affiliateAttributionCookieName
} from '$lib/server/affiliateAttribution';

const getLinkByCode = vi.hoisted(() => vi.fn());

vi.mock('$env/dynamic/private', () => ({
	env: {
		AFFILIATE_ATTRIBUTION_ENABLED: 'false',
		AFFILIATE_ATTRIBUTION_COOKIE_SECRET: 'a'.repeat(40)
	}
}));

vi.mock('$app/environment', () => ({ dev: true }));

vi.mock('$lib/server/services/affiliate', () => ({
	default: {
		getLinkByCode
	}
}));

vi.mock('$lib/server/catalogTruth/publicCatalog', () => ({
	getPublicCatalogAvailability: () => ({ status: 'available', reason: null })
}));

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		transaction: vi.fn()
	}
}));

const link = {
	id: 7,
	affiliateId: 4,
	linkCode: 'garden-kit',
	originalUrl: '/products/hydroponics/net-pots',
	isActive: true
};

function cookies() {
	const jar = new Map<string, string>();
	const setCalls: Array<{ name: string; value: string; options: { httpOnly?: boolean } }> = [];
	return {
		jar,
		setCalls,
		get(name: string) {
			return jar.get(name);
		},
		set(name: string, value: string, options: { httpOnly?: boolean }) {
			jar.set(name, value);
			setCalls.push({ name, value, options });
		},
		delete(name: string) {
			jar.delete(name);
		}
	};
}

function queryChain(rows: unknown[]) {
	const limited = Object.assign(Promise.resolve(rows), {
		for: () => Promise.resolve(rows)
	});
	const where = () => ({
		limit: () => limited,
		then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
			Promise.resolve(undefined).then(resolve, reject)
	});
	const values = () => ({
		returning: () => Promise.resolve(rows),
		onConflictDoUpdate: () => ({ returning: () => Promise.resolve(rows) }),
		then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
			Promise.resolve(undefined).then(resolve, reject)
	});
	const api = {
		from: () => api,
		innerJoin: () => api,
		where,
		set: () => ({ where }),
		values
	};
	return api;
}

describe('affiliate attribution', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		env.AFFILIATE_ATTRIBUTION_ENABLED = 'false';
		env.AFFILIATE_ATTRIBUTION_COOKIE_SECRET = 'a'.repeat(40);
		getLinkByCode.mockResolvedValue(link);
		const rows = [{ id: 'aat_test', affiliateId: 4, affiliateLinkId: 7 }];
		(db.select as any).mockImplementation(() => queryChain(rows));
		(db.insert as any).mockImplementation(() => queryChain(rows));
		(db.update as any).mockImplementation(() => queryChain(rows));
		(db.transaction as any).mockImplementation(async (callback: (tx: typeof db) => unknown) =>
			callback(db)
		);
	});

	it('still redirects when attribution is disabled and does not set a cookie', async () => {
		const jar = cookies();
		const resolved = await AffiliateAttributionService.recordRedirect('garden-kit', jar as any);

		expect(resolved?.originalUrl).toBe('/products/hydroponics/net-pots');
		expect(db.transaction).not.toHaveBeenCalled();
		expect(jar.setCalls.some((call) => call.name === affiliateAttributionCookieName)).toBe(false);
		expect(await AffiliateAttributionService.resolveForCart(jar as any)).toBeNull();
	});

	it('issues an httpOnly capability cookie that the cart can resolve when attribution is enabled', async () => {
		env.AFFILIATE_ATTRIBUTION_ENABLED = 'true';
		const jar = cookies();

		const resolved = await AffiliateAttributionService.recordRedirect(
			'garden-kit',
			jar as any,
			'user-1'
		);
		expect(resolved?.id).toBe(link.id);
		const cookie = jar.setCalls.find((call) => call.name === affiliateAttributionCookieName);
		expect(cookie?.value).toMatch(/^v1\./);
		expect(cookie?.options.httpOnly).toBe(true);
		expect(cookie?.value).toMatch(/^v1\.([A-Za-z0-9_-]{43})\.(\d{10,11})\.([A-Za-z0-9_-]{43})$/);

		const attribution = await AffiliateAttributionService.resolveForCart(jar as any, 'user-1');
		expect(attribution).toMatchObject({ id: 'aat_test', affiliateLinkId: 7 });
	});

	it('keeps the redirect when the attribution write fails', async () => {
		env.AFFILIATE_ATTRIBUTION_ENABLED = 'true';
		(db.transaction as any).mockRejectedValue(new Error('relation does not exist'));
		const jar = cookies();

		await expect(
			AffiliateAttributionService.recordRedirect('garden-kit', jar as any)
		).resolves.toMatchObject({ id: link.id });
		expect(jar.jar.has(affiliateAttributionCookieName)).toBe(false);
	});

	it('stays off when the cookie secret is missing or still a placeholder', async () => {
		env.AFFILIATE_ATTRIBUTION_ENABLED = 'true';
		env.AFFILIATE_ATTRIBUTION_COOKIE_SECRET = 'replace-with-a-different-32-byte-random-secret';
		const jar = cookies();

		await AffiliateAttributionService.recordRedirect('garden-kit', jar as any);
		expect(db.transaction).not.toHaveBeenCalled();
	});
});
