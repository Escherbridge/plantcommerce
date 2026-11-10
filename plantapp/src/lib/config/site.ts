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
	'/about',
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
	'/support',
	'/contact',
	'/privacy',
	'/terms',
	'/shipping',
	'/returns',
	'/cookies',
	'/accessibility'
] as const;

/** Public operator and contact details approved for customer-facing pages. */
export const publicOperator = {
	legalName: 'Escherbridge, LLC',
	contactName: 'Ahmed Zaher',
	email: 'contact@escherbridge.com',
	phone: '(509) 578-4603',
	phoneHref: 'tel:+15095784603',
	address: '1140 S Colorado Ln, Boise, ID'
} as const;

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

const routeMetadata: Record<string, { title: string; description: string }> = {
	'/': {
		title: 'Aevani — A marketplace for growing tools, still taking shape',
		description:
			"We're onboarding our first growers and makers. The catalogue is a preview — nothing in it is for sale yet. The Learn hub is open, and applications to sell are open."
	},
	'/sell': {
		title: 'Sell on Aevani — a flat 8%',
		description:
			'Apply to sell growing tools and systems on Aevani. The fee is a flat 8%. Card processing is included. There are no listing fees, no monthly fees, and no ad fees.'
	},
	'/about': {
		title: 'About Aevani',
		description:
			'Aevani is a marketplace for growing tools and a free Learn hub, operated by Escherbridge, LLC. The catalogue is a preview. Checkout is off.'
	}
};

/** Sister sites for the footer. Aevani itself is omitted. Follow links, no nofollow. */
export const escherbridgeProjects = [
	{ label: 'PrimusNeo, the technology innovation lab', href: 'https://primusneo.com' },
	{ label: 'NEOS, a workspace for agreements and decisions', href: 'https://neos.primusneo.com' },
	{ label: 'AZOA, an engine for structured workflows', href: 'https://azoa.ardanova.com' },
	{ label: 'ArdaNova, a workspace for shared work', href: 'https://ardanova.com' },
	{ label: 'PlantGeo, a 3D map for planning a site', href: 'https://plantgeo.aevani.com' },
	{ label: 'OverseasGenAI, a venture shipyard', href: 'https://overseasgenai.com' },
	{ label: 'Glitxz, an artist-led market for work in progress', href: 'https://glitxz.com' }
] as const;

export function publicRouteMetadata(pathname: string): { title: string; description: string } {
	const path = pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/';
	return (
		routeMetadata[path] ?? {
			title: publicSite.defaultTitle,
			description: publicSite.description
		}
	);
}

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
