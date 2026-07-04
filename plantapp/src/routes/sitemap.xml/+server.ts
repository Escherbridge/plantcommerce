import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { product, productCategory } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;

	const staticRoutes = [
		'',
		'/about',
		'/accessibility',
		'/affiliate/join',
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
		'/register',
		'/resources',
		'/returns',
		'/shipping',
		'/sustainability',
		'/terms',
		'/login',
		'/verify-email'
	];

	// Fetch all active products with their category slugs for dynamic URLs
	let productRoutes: string[] = [];
	try {
		const products = await db
			.select({
				slug: product.slug,
				categorySlug: productCategory.slug
			})
			.from(product)
			.innerJoin(productCategory, eq(product.categoryId, productCategory.id))
			.where(eq(product.isActive, true));

		productRoutes = products.map(p => `/products/${p.categorySlug}/${p.slug}`);
	} catch {
		// If DB is unavailable, sitemap still works with static routes
	}

	const allRoutes = [...staticRoutes, ...productRoutes];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
	.map((route) => {
		const fullUrl = `${baseUrl}${route.startsWith('/') ? route : '/' + route}`;
		const isProduct = route.match(/^\/products\/[^/]+\/[^/]+$/);
		const priority = route === '' ? '1.0' : isProduct ? '0.7' : route.startsWith('/products/') ? '0.8' : '0.6';
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
