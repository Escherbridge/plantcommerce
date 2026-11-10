import type { RequestHandler } from '@sveltejs/kit';
import { demoProducts } from '$lib/server/db/catalogDemo';
import { writingSitemapPaths } from '$lib/content/writing';
import { SITE_URL, publicIndexablePaths } from '$lib/config/site';

/** Published CMS slugs from the editorial seed. FAQ entries stay on /faq. */
const publishedEditorialPaths = [
	'/guides/getting-started-companion-planting',
	'/guides/understanding-soil-health',
	'/blog/hydroponics-for-beginners',
	'/blog/introduction-to-aquaponics',
	'/blog/what-is-silvopasture',
	'/blog/monoculture-to-polyculture',
	'/blog/cooling-can-use-more-water-than-the-crop',
	'/blog/a-flat-eight-percent'
] as const;

export const _publicSitemapRoutes = publicIndexablePaths;

function xmlEscape(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

export function _renderPublicSitemap(
	baseUrl: string,
	routes: readonly string[] = _publicSitemapRoutes
): string {
	const origin = baseUrl.replace(/\/+$/, '');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map((route) => {
		const fullUrl = route === '/' ? `${origin}/` : `${origin}${route}`;
		return `
	<url>
		<loc>${xmlEscape(fullUrl)}</loc>
		<changefreq>weekly</changefreq>
		<priority>${route === '/' ? '1.0' : '0.6'}</priority>
	</url>`;
	})
	.join('')}
</urlset>`;
}

function publishedContentPaths(): string[] {
	return [
		...publishedEditorialPaths,
		...writingSitemapPaths,
		...demoProducts.map((product) => `/products/${product.system}/${product.slug}`)
	];
}

export const GET: RequestHandler = () => {
	const routes = [...new Set([..._publicSitemapRoutes, ...publishedContentPaths()])];
	const xml = _renderPublicSitemap(SITE_URL, routes);

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
