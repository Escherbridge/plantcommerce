import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { isPublicIndexablePath } from '$lib/config/site';
import { _publicSitemapRoutes, _publishedContentPaths, _renderPublicSitemap } from './+server';

describe('public crawler discovery', () => {
	it('publishes public learn, catalog, and support routes at the apex', async () => {
		const source = await readFile(new URL('./+server.ts', import.meta.url), 'utf8');
		const xml = _renderPublicSitemap('https://aevani.com');

		expect(_publicSitemapRoutes).toEqual([
			'/',
			'/about',
			'/sell',
			'/learn',
			'/courses',
			'/guides',
			'/blog',
			'/news',
			'/faq',
			'/products',
			'/products/hydroponics',
			'/products/aquaponics',
			'/products/silvopasture',
			'/products/agroforestry',
			'/size-guide',
			'/support',
			'/contact',
			'/privacy',
			'/terms',
			'/shipping',
			'/returns',
			'/cookies',
			'/accessibility'
		]);
		expect(xml).toContain('<loc>https://aevani.com/</loc>');
		expect(xml).toContain('<loc>https://aevani.com/contact</loc>');
		expect(xml).toContain('<loc>https://aevani.com/privacy</loc>');
		expect(xml).toContain('<loc>https://aevani.com/terms</loc>');
		expect(xml).toContain('<loc>https://aevani.com/shipping</loc>');
		expect(xml).toContain('<loc>https://aevani.com/returns</loc>');
		expect(xml).toContain('<loc>https://aevani.com/cookies</loc>');
		expect(xml).toContain('<loc>https://aevani.com/accessibility</loc>');
		expect(xml).toContain('<loc>https://aevani.com/learn</loc>');
		expect(xml).toContain('<loc>https://aevani.com/courses</loc>');
		expect(xml).toContain('<loc>https://aevani.com/guides</loc>');
		expect(xml).toContain('<loc>https://aevani.com/products</loc>');
		expect(xml).not.toContain('railway.app');
		expect(xml).not.toContain('url.origin');
		expect(source).not.toContain('url.origin');
		expect(source).not.toContain('PUBLIC_BASE_URL');
		expect(source).not.toContain('RAILWAY_PUBLIC_DOMAIN');
		expect(source).toContain('/blog/cooling-can-use-more-water-than-the-crop');
		expect(source).toContain('/blog/a-flat-eight-percent');
		expect(source).not.toContain('nothing-for-sale-yet');

		for (const indexableRoute of [
			'/contact',
			'/privacy',
			'/terms',
			'/shipping',
			'/returns',
			'/cookies',
			'/accessibility'
		]) {
			expect(isPublicIndexablePath(indexableRoute)).toBe(true);
		}

		for (const excludedRoute of [
			'/cart',
			'/checkout',
			'/login',
			'/register',
			'/search',
			'/warranty',
			'/help',
			'/api/admin/seller-applications'
		]) {
			expect(xml).not.toContain(`<loc>https://aevani.com${excludedRoute}</loc>`);
			expect(isPublicIndexablePath(excludedRoute)).toBe(false);
		}

		const withContent = _renderPublicSitemap('https://aevani.com', [
			..._publicSitemapRoutes,
			'/guides/understanding-soil-health',
			'/blog/hydroponics-for-beginners',
			'/products/hydroponics/tower'
		]);
		expect(withContent).toContain('<loc>https://aevani.com/guides/understanding-soil-health</loc>');
		expect(withContent).toContain('<loc>https://aevani.com/blog/hydroponics-for-beginners</loc>');
		expect(withContent).toContain('<loc>https://aevani.com/products/hydroponics/tower</loc>');

		const published = _renderPublicSitemap('https://aevani.com', _publishedContentPaths());
		expect(published).toContain('<loc>https://aevani.com/guides/hydroponics-intermountain</loc>');
		expect(published).toContain('<loc>https://aevani.com/guides/small-scale-aquaponics</loc>');
		expect(published).toContain('<loc>https://aevani.com/guides/temperate-silvopasture</loc>');
		expect(published).toContain('<loc>https://aevani.com/guides/understanding-soil-health</loc>');
		expect(published).toContain(
			'<loc>https://aevani.com/guides/getting-started-companion-planting</loc>'
		);
	});

	it('keeps private, administrative, API, and capability paths out of crawling', async () => {
		const { renderRobotsTxt } = await import('$lib/config/site');
		const robots = renderRobotsTxt();

		for (const path of [
			'/account',
			'/admin',
			'/api',
			'/instructor',
			'/learn/my-courses',
			'/aff/',
			'/checkout/success',
			'/reset-password',
			'/verify-email'
		]) {
			expect(robots).toContain(`Disallow: ${path}`);
		}

		expect(robots).not.toContain('Disallow: /products');
		expect(robots).not.toContain('Disallow: /cart');
		for (const path of [
			'/contact',
			'/privacy',
			'/terms',
			'/shipping',
			'/returns',
			'/cookies',
			'/accessibility'
		]) {
			expect(robots).not.toContain(`Disallow: ${path}`);
		}
		expect(robots).toContain('Sitemap: https://aevani.com/sitemap.xml');
		expect(robots).not.toContain('railway.app');
	});
});
