/**
 * Canonical origin for public metadata.
 *
 * Railway injects the service host into the CSRF origin and into the email
 * and checkout base URL. Those stay as they are. This constant is the only
 * origin used for canonical links, Open Graph, the sitemap, and robots.txt.
 */
export const SITE_URL = 'https://aevani.com' as const;

export const publicIndexablePaths = [
	'/',
	'/sell',
	'/learn',
	'/courses',
	'/guides',
	'/blog',
	'/faq',
	'/products',
	'/products/hydroponics',
	'/products/aquaponics',
	'/products/silvopasture',
	'/products/agroforestry',
	'/size-guide',
	'/support'
] as const;

const publicIndexablePrefixes = ['/guides/', '/blog/', '/courses/', '/products/'] as const;

const unindexedPaths = new Set(['/products/mock-detail']);

/** Paths that must stay out of the public crawl even when a prefix would match. */
export const robotDisallowPaths = [
	'/account',
	'/admin',
	'/api',
	'/instructor',
	'/affiliate/dashboard',
	'/affiliate/earnings',
	'/affiliate/links',
	'/affiliate/materials',
	'/affiliate/payouts',
	'/affiliate/settings',
	'/learn/certificates',
	'/learn/course/',
	'/learn/my-courses',
	'/aff/',
	'/certificates/verify/',
	'/checkout/success',
	'/forgot-password',
	'/login',
	'/register',
	'/resend-verification',
	'/reset-password',
	'/verify-email'
] as const;

/** Shared public identity and canonical origin for customer-facing metadata. */
export const publicSite = {
	name: 'Aevani',
	defaultTitle: 'Aevani | Sustainable Growing Tools & Learning',
	description: 'Practical tools and learning for more resilient growing systems.',
	origin: SITE_URL
} as const;

export function publicSiteUrl(pathname = '/'): string {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${SITE_URL}${path}`;
}

export function isPublicIndexablePath(pathname: string): boolean {
	const normalized = pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/';
	if (unindexedPaths.has(normalized)) return false;
	if (publicIndexablePaths.some((path) => path === normalized)) return true;
	return publicIndexablePrefixes.some((prefix) => normalized.startsWith(prefix));
}

export function renderRobotsTxt(): string {
	return [
		'User-agent: *',
		...robotDisallowPaths.map((path) => `Disallow: ${path}`),
		'',
		`Sitemap: ${SITE_URL}/sitemap.xml`,
		''
	].join('\n');
}
