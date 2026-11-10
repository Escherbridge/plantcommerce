import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

vi.mock('$env/dynamic/private', () => ({
	env: {
		SELLER_APPLICATIONS_ADMIN_TOKEN: undefined as string | undefined
	}
}));

vi.mock('$lib/server/sellerApplication/service', () => ({
	SellerApplicationService: {
		list: vi.fn()
	}
}));

import { env } from '$env/dynamic/private';
import { SellerApplicationService } from '$lib/server/sellerApplication/service';
import { GET } from './+server';

const token = 'seller-admin-token-that-is-not-a-password';

function event(path: string, headers?: HeadersInit): RequestEvent {
	const url = new URL(path);
	return {
		request: new Request(url, { method: 'GET', headers }),
		url
	} as RequestEvent;
}

const stored = {
	id: 4,
	name: 'Ada Grower',
	email: 'ada@example.com',
	businessName: 'North Bed Farm',
	websiteOrSocial: null,
	offerings: 'Salad greens and herb starts',
	location: 'Hudson Valley, NY',
	message: 'I would like to sell seasonal starts.',
	createdAt: new Date('2026-11-10T05:00:00.000Z')
};

describe('GET /api/admin/seller-applications', () => {
	beforeEach(() => {
		env.SELLER_APPLICATIONS_ADMIN_TOKEN = undefined;
		vi.mocked(SellerApplicationService.list).mockReset();
		vi.mocked(SellerApplicationService.list).mockResolvedValue([]);
	});

	it('returns 503 when the admin token is unset', async () => {
		const response = await GET(event('https://aevani.com/api/admin/seller-applications'));

		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({ error: 'unavailable' });
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(response.headers.get('x-robots-tag')).toBe('noindex');
		expect(SellerApplicationService.list).not.toHaveBeenCalled();
	});

	it('returns 401 when the bearer token is missing', async () => {
		env.SELLER_APPLICATIONS_ADMIN_TOKEN = token;
		const response = await GET(event('https://aevani.com/api/admin/seller-applications'));

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: 'unauthorized' });
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(response.headers.get('x-robots-tag')).toBe('noindex');
		expect(SellerApplicationService.list).not.toHaveBeenCalled();
	});

	it('returns 401 when the bearer token is wrong', async () => {
		env.SELLER_APPLICATIONS_ADMIN_TOKEN = token;
		const response = await GET(
			event('https://aevani.com/api/admin/seller-applications', {
				authorization: 'Bearer wrong-token',
				origin: 'https://owner.example'
			})
		);

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: 'unauthorized' });
		expect(SellerApplicationService.list).not.toHaveBeenCalled();
	});

	it('returns every stored field newest-first and ignores a foreign Origin', async () => {
		env.SELLER_APPLICATIONS_ADMIN_TOKEN = token;
		vi.mocked(SellerApplicationService.list).mockResolvedValue([stored]);

		const response = await GET(
			event('https://aevani.com/api/admin/seller-applications', {
				authorization: `Bearer ${token}`,
				origin: 'https://owner.example'
			})
		);

		expect(response.status).toBe(200);
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(response.headers.get('x-robots-tag')).toBe('noindex');
		expect(SellerApplicationService.list).toHaveBeenCalledWith(undefined);
		expect(await response.json()).toEqual({
			applications: [
				{
					id: 4,
					name: 'Ada Grower',
					email: 'ada@example.com',
					businessName: 'North Bed Farm',
					websiteOrSocial: null,
					offerings: 'Salad greens and herb starts',
					location: 'Hudson Valley, NY',
					message: 'I would like to sell seasonal starts.',
					createdAt: '2026-11-10T05:00:00.000Z'
				}
			]
		});
	});

	it('filters with created_at greater than since', async () => {
		env.SELLER_APPLICATIONS_ADMIN_TOKEN = token;
		const response = await GET(
			event('https://aevani.com/api/admin/seller-applications?since=2026-11-01T00:00:00.000Z', {
				authorization: `Bearer ${token}`
			})
		);

		expect(response.status).toBe(200);
		expect(SellerApplicationService.list).toHaveBeenCalledWith(
			new Date('2026-11-01T00:00:00.000Z')
		);
	});

	it('rejects an unusable since cursor after the token is accepted', async () => {
		env.SELLER_APPLICATIONS_ADMIN_TOKEN = token;
		const response = await GET(
			event('https://aevani.com/api/admin/seller-applications?since=yesterday', {
				authorization: `Bearer ${token}`
			})
		);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'invalid_since' });
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(SellerApplicationService.list).not.toHaveBeenCalled();
	});
});
