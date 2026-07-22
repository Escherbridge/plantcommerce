import type { RequestHandler } from '@sveltejs/kit';
import { publicIndexablePaths, publicSiteUrl } from '$lib/config/site';

export const _publicSitemapRoutes = publicIndexablePaths;

export function _renderPublicSitemap(baseUrl: string): string {
	const origin = baseUrl.replace(/\/+$/, '');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${_publicSitemapRoutes
	.map((route) => {
		const fullUrl = route === '/' ? `${origin}/` : `${origin}${route}`;
		return `
	<url>
		<loc>${fullUrl}</loc>
		<changefreq>weekly</changefreq>
		<priority>${route === '/' ? '1.0' : '0.6'}</priority>
	</url>`;
	})
	.join('')}
</urlset>`;
}

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = publicSiteUrl('/', url.origin).replace(/\/+$/, '');
	const xml = _renderPublicSitemap(baseUrl);

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
