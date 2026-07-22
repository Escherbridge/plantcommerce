import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;

	const staticRoutes = [
		'',
		'/accessibility',
		'/blog',
		'/careers',
		'/faq',
		'/guides',
		'/learn',
		'/register',
		'/resources',
		'/size-guide',
		'/support',
		'/login',
		'/verify-email'
	];

	const allRoutes = staticRoutes;

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
	.map((route) => {
		const fullUrl = `${baseUrl}${route.startsWith('/') ? route : '/' + route}`;
		const isProduct = route.match(/^\/products\/[^/]+\/[^/]+$/);
		const priority =
			route === '' ? '1.0' : isProduct ? '0.7' : route.startsWith('/products/') ? '0.8' : '0.6';
		return `
	<url>
		<loc>${fullUrl}</loc>
		<changefreq>${isProduct ? 'daily' : 'weekly'}</changefreq>
		<priority>${priority}</priority>
	</url>`;
	})
	.join('')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
