import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { isPublicIndexablePath } from '$lib/config/site';
import { _publicSitemapRoutes, _renderPublicSitemap } from './+server';

describe('public crawler discovery', () => {
	it('publishes only truthful, indexable public routes at the canonical origin', () => {
		const xml = _renderPublicSitemap('https://www.aevani.example/');

		expect(_publicSitemapRoutes).toEqual(['/', '/size-guide', '/support']);
		expect(xml).toContain('<loc>https://www.aevani.example/</loc>');
		expect(xml).toContain('<loc>https://www.aevani.example/size-guide</loc>');
		expect(xml).toContain('<loc>https://www.aevani.example/support</loc>');

		for (const excludedRoute of [
			'/blog',
			'/cart',
			'/checkout',
			'/faq',
			'/guides',
			'/login',
			'/products',
			'/register',
			'/resources',
			'/reset-password',
			'/verify-email'
		]) {
			expect(xml).not.toContain(`<loc>https://www.aevani.example${excludedRoute}</loc>`);
			expect(isPublicIndexablePath(excludedRoute)).toBe(false);
		}

		expect(isPublicIndexablePath('/')).toBe(true);
		expect(isPublicIndexablePath('/size-guide/')).toBe(true);
		expect(isPublicIndexablePath('/support')).toBe(true);
	});

	it('keeps private, administrative, API, and capability paths out of crawling', async () => {
		const robots = await readFile(new URL('../../../static/robots.txt', import.meta.url), 'utf8');

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
		expect(robots).toContain('Sitemap: https://aevani-web-production.up.railway.app/sitemap.xml');
	});
});
