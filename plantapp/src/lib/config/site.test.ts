import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
	SITE_URL,
	isPublicIndexablePath,
	publicSite,
	publicSiteUrl,
	renderRobotsTxt
} from './site';

describe('public site origin', () => {
	it('uses the production apex and ignores Railway and request hosts', async () => {
		const source = await readFile(new URL('./site.ts', import.meta.url), 'utf8');

		expect(SITE_URL).toBe('https://aevani.com');
		expect(publicSite.origin).toBe(SITE_URL);
		expect(publicSiteUrl('/learn')).toBe('https://aevani.com/learn');
		expect(publicSiteUrl('/')).toBe('https://aevani.com/');
		expect(source).not.toContain('PUBLIC_BASE_URL');
		expect(source).not.toContain('RAILWAY_PUBLIC_DOMAIN');
		expect(source).not.toContain('url.origin');
		expect(source).not.toMatch(/process\.env\.ORIGIN|env\('ORIGIN'/);
	});

	it('indexes public learn, guide, course, and product paths only', () => {
		expect(isPublicIndexablePath('/sell')).toBe(true);
		expect(isPublicIndexablePath('/learn')).toBe(true);
		expect(isPublicIndexablePath('/guides/understanding-soil-health')).toBe(true);
		expect(isPublicIndexablePath('/blog/hydroponics-for-beginners')).toBe(true);
		expect(isPublicIndexablePath('/courses/hydroponics-field-guide')).toBe(true);
		expect(isPublicIndexablePath('/products/hydroponics/net-pots')).toBe(true);
		expect(isPublicIndexablePath('/learn/course/hydroponics-field-guide')).toBe(false);
		expect(isPublicIndexablePath('/learn/my-courses')).toBe(false);
		expect(isPublicIndexablePath('/products/mock-detail')).toBe(false);
		expect(isPublicIndexablePath('/search')).toBe(false);
		expect(isPublicIndexablePath('/cart')).toBe(false);
		expect(isPublicIndexablePath('/api/admin/seller-applications')).toBe(false);
	});

	it('points robots at the apex sitemap', () => {
		const robots = renderRobotsTxt();
		expect(robots).toContain('Sitemap: https://aevani.com/sitemap.xml');
		expect(robots).toContain('Disallow: /learn/course/');
		expect(robots).not.toContain('railway.app');
	});
});
