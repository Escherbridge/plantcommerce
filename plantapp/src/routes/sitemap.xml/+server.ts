import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	// Base URL for your site
	const baseUrl = url.origin;

	// Static routes that exist in your MVP
	const staticRoutes = [
		'',  // Home page
		'/about',
		'/accessibility',
		'/affiliate/join',
		'/affiliate/dashboard',
		'/affiliate/earnings',
		'/affiliate/links',
		'/affiliate/materials',
		'/blog',
		'/careers',
		'/cart',
		'/contact',
		'/cookies',
		'/faq',
		'/guides',
		'/help',
		'/learn',
		'/press',
		'/privacy',
		'/products',
		'/products/agroforestry',
		'/products/aquaponics',
		'/products/hydroponics',
		'/products/silvopasture',
		'/products/mock-detail',
		'/register',
		'/resources',
		'/returns',
		'/shipping',
		'/sustainability',
		'/terms',
		'/login',
		'/account/profile',
		'/account/orders',
		'/account/wishlist',
		'/admin',
		'/admin/analytics',
		'/admin/content',
		'/admin/orders',
		'/admin/products',
		'/admin/users',
		'/verify-email'
	];

	// Generate XML
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
	.map((route) => {
		const fullUrl = `${baseUrl}${route.startsWith('/') ? route : '/' + route}`;
		return `
	<url>
		<loc>${fullUrl}</loc>
		<changefreq>weekly</changefreq>
		<priority>${route === '' ? '1.0' : route.startsWith('/products/') ? '0.8' : '0.6'}</priority>
	</url>`;
	})
	.join('')}
</urlset>`;

	// Return with proper headers
	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
