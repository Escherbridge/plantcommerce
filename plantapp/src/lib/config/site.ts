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
] as const;

/** Public operator and contact details approved for customer-facing pages. */
export const publicOperator = {
	legalName: 'Escherbridge, LLC',
	contactName: 'Ahmed Zaher',
	email: 'contact@escherbridge.com',
	phone: '(509) 578-4603',
	phoneHref: 'tel:+15095784603',
	location: 'Boise, Idaho'
} as const;

/** City and public email, with no street or postal code. */
export const publicOperatorLine = `${publicOperator.location}, ${publicOperator.email}` as const;

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
	},
	'/learn': {
		title: 'Learn — Aevani',
		description:
			'Short guides and notes on soil, companion planting, hydroponics, aquaponics, and silvopasture. Free, no account. This is not a complete library, and it does not sell you a kit at the end.'
	},
	'/blog': {
		title: 'Field notes — Aevani',
		description:
			'Dated writing from Escherbridge on growing, selling, and the flat 8% seller fee. The catalogue is still a preview, and the checkout remains off.'
	},
	'/news': {
		title: 'News — Aevani',
		description: 'Public announcements only. There is nothing to announce yet.'
	},
	'/guides': {
		title: 'Guides | Aevani',
		description:
			'Intermountain growing-system guides: hydroponics, aquaponics, and silvopasture, cited from official sources. The catalogue is a preview and not for sale.'
	},
	'/faq': {
		title: 'FAQ — Aevani',
		description:
			'Short answers. Nothing is for sale yet, so buying, shipping, and returns do not have a site-wide promise.'
	},
	'/courses': {
		title: 'Courses — Aevani',
		description: 'Course pages are thin notes, not a catalogue. Nothing here is for sale.'
	},
	'/products': {
		title: 'Catalogue preview — Aevani',
		description: 'The catalogue is a preview. Nothing in it is for sale yet.'
	},
	'/products/hydroponics': {
		title: 'Hydroponics preview — Aevani',
		description: 'A preview of the hydroponics shelf. Nothing in it is for sale yet.'
	},
	'/products/aquaponics': {
		title: 'Aquaponics preview — Aevani',
		description: 'A preview of the aquaponics shelf. Nothing in it is for sale yet.'
	},
	'/products/silvopasture': {
		title: 'Silvopasture preview — Aevani',
		description: 'A preview of the silvopasture shelf. Nothing in it is for sale yet.'
	},
	'/products/agroforestry': {
		title: 'Agroforestry preview — Aevani',
		description: 'A preview of the agroforestry shelf. Nothing in it is for sale yet.'
	},
	'/contact': {
		title: 'Contact — Aevani',
		description: 'Aevani is operated by Escherbridge, LLC. Write or call. Nothing is for sale yet.'
	},
	'/support': {
		title: 'Support — Aevani',
		description: 'Help for the site. There are no orders, because nothing is for sale yet.'
	},
	'/privacy': {
		title: 'Privacy — Aevani',
		description: 'How Escherbridge, LLC handles information on Aevani.'
	},
	'/terms': {
		title: 'Terms — Aevani',
		description: 'Terms for using Aevani, operated by Escherbridge, LLC.'
	},
	'/shipping': {
		title: 'Shipping — Aevani',
		description: 'Nothing is for sale yet, so there is nothing to ship.'
	},
	'/returns': {
		title: 'Returns — Aevani',
		description: 'Nothing is for sale yet, so there is nothing to return.'
	},
	'/cookies': {
		title: 'Cookies — Aevani',
		description: 'How Aevani uses cookies.'
	},
	'/accessibility': {
		title: 'Accessibility — Aevani',
		description: 'Accessibility notes for Aevani, operated by Escherbridge, LLC.'
	},
	'/size-guide': {
		title: 'Size guide — Aevani',
		description: 'No size chart is published. Nothing is for sale yet.'
	},
	'/warranty': {
		title: 'Warranty — Aevani',
		description: 'Nothing is for sale yet, so there is no warranty to claim.'
	},
	'/help': {
		title: 'Help — Aevani',
		description: 'A searchable help center is not published yet.'
	},
	'/press': {
		title: 'Press — Aevani',
		description: 'No press materials are published. This page is not a newsroom.'
	},
	'/resources': {
		title: 'Resources — Aevani',
		description:
			'No downloadable resources yet. The Learn hub is the reading room that exists today.'
	},
	'/sustainability': {
		title: 'Sustainability — Aevani',
		description: 'No quantified environmental claims are published.'
	},
	'/affiliate': {
		title: 'Affiliate referrals — Aevani',
		description:
			'The referral program is not open. The referral share has not been set, and applications are not being accepted.'
	},
	'/affiliate/join': {
		title: 'Affiliate referrals — Aevani',
		description:
			'The referral program is not open. The referral share has not been set, and applications are not being accepted.'
	},
	'/affiliate/terms': {
		title: 'Affiliate referrals — Aevani',
		description:
			'The referral program is not open. The referral share has not been set, and applications are not being accepted.'
	}
};

export function layoutOwnsDocumentMeta(pathname: string): boolean {
	const path = pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/';
	if (/^\/(blog|guides|news|courses)\/[^/]+$/.test(path)) return false;
	if (/^\/products\/[^/]+\/[^/]+$/.test(path)) return false;
	return true;
}

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
