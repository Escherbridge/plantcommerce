import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
	SITE_URL,
	isPublicIndexablePath,
	layoutOwnsDocumentMeta,
	publicRouteMetadata,
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
		expect(isPublicIndexablePath('/about')).toBe(true);
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

	it('gives leftover public pages their own title and lets posts own theirs', () => {
		expect(publicRouteMetadata('/faq').title).toBe('FAQ — Aevani');
		expect(publicRouteMetadata('/warranty').title).not.toBe(publicSite.defaultTitle);
		expect(publicRouteMetadata('/press').title).not.toBe(publicSite.defaultTitle);
		expect(layoutOwnsDocumentMeta('/faq')).toBe(true);
		expect(layoutOwnsDocumentMeta('/blog/nothing-for-sale-yet')).toBe(false);
		expect(layoutOwnsDocumentMeta('/blog/cooling-can-use-more-water-than-the-crop')).toBe(false);
		expect(layoutOwnsDocumentMeta('/guides/understanding-soil-health')).toBe(false);
		expect(layoutOwnsDocumentMeta('/courses/hydroponics-field-guide')).toBe(false);
		expect(layoutOwnsDocumentMeta('/products/hydroponics/net-pots')).toBe(false);
	});

	it('points robots at the apex sitemap', () => {
		const robots = renderRobotsTxt();
		expect(robots).toContain('Sitemap: https://aevani.com/sitemap.xml');
		expect(robots).toContain('Disallow: /learn/course/');
		expect(robots).not.toContain('railway.app');
	});
});
