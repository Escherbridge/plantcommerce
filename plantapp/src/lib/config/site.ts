import { isPublishedWhitePaperPath } from '$lib/content/white-papers';

/**
 * Canonical origin for public metadata.
 *
 * Railway's ORIGIN env var is the service host. Adapter-node uses it as the
 * request origin for CSRF, email, and checkout URLs; this app does not change
 * that variable. No-JS form posts from the public hosts are allowed through
 * kit.csrf.trustedOrigins in svelte.config.js. This constant is the only
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
		title: 'Aevani — Growing Guides, Systems & Independent Sellers',
		description:
			'Practical growing guides for hydroponics, aquaponics, raised beds, and agroforestry, plus open storefront applications for independent seed and tool sellers at a flat 8% fee.'
	},
	'/sell': {
		title: 'Sell on Aevani — a flat 8%',
		description:
			'Sell seeds, hand tools, and growing systems on Aevani for a flat 8% commission with card processing included and zero listing, monthly, or ad fees.'
	},
	'/about': {
		title: 'About Aevani',
		description:
			'Aevani is a growing-tools marketplace and free grower library operated by Escherbridge, LLC in Boise, Idaho.'
	},
	'/learn': {
		title: 'Learn — Aevani',
		description:
			'Free, practical growing guides and field notes covering soil, raised beds, hydroponics, aquaponics, and agroforestry—no account required.'
	},
	'/blog': {
		title: 'Field notes — Aevani',
		description:
			'Hands-on field notes, seasonal growing checklists, system trade-offs, and transparent updates on selling growing gear at a flat 8% fee.'
	},
	'/news': {
		title: 'News — Aevani',
		description: 'Updates on new Aevani growing guides, seller onboarding, and site tools.'
	},
	'/guides': {
		title: 'Guides | Aevani',
		description:
			'Hands-on growing guides for hydroponics, raised beds, high tunnels, aquaponics, and agroforestry—practical ranges, honest trade-offs, and direct gear links.'
	},
	'/faq': {
		title: 'FAQ — Aevani',
		description:
			'Answers to common questions about Aevani growing guides, seller fees, shipping, and independent storefronts.'
	},
	'/courses': {
		title: 'Courses — Aevani',
		description: 'Structured growing walk-throughs paired with free field guides in the Learn hub.'
	},
	'/products': {
		title: 'Growing Systems & Supplies | Aevani',
		description:
			'Explore growing systems, seed-starting gear, drip kits, and specialty categories built for soil, hydro, aquaponic, and agroforestry growers.'
	},
	'/products/hydroponics': {
		title: 'Hydroponics Systems & Gear | Aevani',
		description: 'Deep water culture, Kratky, meters, air pumps, and indoor hydroponic systems.'
	},
	'/products/aquaponics': {
		title: 'Aquaponics Systems & Gear | Aevani',
		description:
			'Closed-loop fish tanks, biofilter media, pumps, and water-testing gear for backyard aquaponics.'
	},
	'/products/silvopasture': {
		title: 'Silvopasture Seeds & Fencing | Aevani',
		description: 'Shade-tolerant forage mixes, tree tubes, and perennial pasture tools.'
	},
	'/products/agroforestry': {
		title: 'Agroforestry Seeds & Nursery Stock | Aevani',
		description: 'Nitrogen-fixing trees, canopy guilds, mulch mats, and perennial orchard supplies.'
	},
	'/contact': {
		title: 'Contact — Aevani',
		description:
			'Aevani is operated by Escherbridge, LLC in Boise, Idaho. Reach us by email or phone about selling or our growing guides.'
	},
	'/support': {
		title: 'Support — Aevani',
		description: 'Help and contact details for Aevani growers and independent sellers.'
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
		description:
			'When sellers join, each listing will show its own shipping rates, carriers and handling terms before checkout.'
	},
	'/returns': {
		title: 'Returns — Aevani',
		description: 'When sellers join, return terms will be shown on each listing.'
	},
	'/cookies': {
		title: 'Cookies — Aevani',
		description: 'How Aevani uses cookies.'
	},
	'/accessibility': {
		title: 'Accessibility — Aevani',
		description: 'Accessibility notes for Aevani, operated by Escherbridge, LLC.'
	},
	'/white-papers': {
		title: 'White papers — Aevani',
		description: 'Published Aevani white papers. Each paper has a short summary and a PDF file.'
	},
	'/size-guide': {
		title: 'Size guide — Aevani',
		description:
			'Sizing and capacity notes for growing containers, beds, and hardware live directly on each seller listing.'
	},
	'/warranty': {
		title: 'Warranty — Aevani',
		description: 'When sellers join, warranty terms will be shown on each listing.'
	},
	'/help': {
		title: 'Help — Aevani',
		description: 'Support contacts and growing guides for Aevani.'
	},
	'/press': {
		title: 'Press — Aevani',
		description: 'Contact Escherbridge, LLC for press or operator questions about Aevani.'
	},
	'/resources': {
		title: 'Resources — Aevani',
		description: 'Browse Aevani field guides, system references, and the free Learn hub.'
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
		title: 'Affiliate application — Aevani',
		description:
			'Apply for an Aevani affiliate account and create tracked links for catalogue items.'
	},
	'/affiliate/terms': {
		title: 'Affiliate referrals — Aevani',
		description:
			'The referral program is not open. The referral share has not been set, and applications are not being accepted.'
	}
};

/** These routes print their own `<title>`. The layout must not add a second one. */
const pageOwnedDocumentTitles = new Set([
	'/account/wishlist',
	'/affiliate/dashboard',
	'/affiliate/earnings',
	'/affiliate/links',
	'/affiliate/materials',
	'/affiliate/payouts',
	'/affiliate/settings',
	'/cart',
	'/checkout',
	'/checkout/success',
	'/component-demo',
	'/forgot-password',
	'/learn/certificates',
	'/learn/my-courses',
	'/login',
	'/register',
	'/resend-verification',
	'/reset-password',
	'/search',
	'/sell',
	'/verify-email'
]);

export function layoutOwnsDocumentMeta(pathname: string): boolean {
	const path = pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/';
	if (/^\/(blog|guides|news|courses)\/[^/]+$/.test(path)) return false;
	if (/^\/white-papers\/[^/]+$/.test(path)) return false;
	if (/^\/products\/[^/]+\/[^/]+$/.test(path)) return false;
	if (path.startsWith('/certificates/verify/')) return false;
	if (path === '/learn/course' || path.startsWith('/learn/course/')) return false;
	if (pageOwnedDocumentTitles.has(path)) return false;
	return true;
}

/** Sister sites for the footer. Aevani itself is omitted. Follow links, no nofollow. */
export const escherbridgeProjects = [
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
			title: 'Aevani',
			description: publicSite.description
		}
	);
}

/** Visible crumb label. Home is named by the caller. */
export function documentCrumbLabel(pathname: string): string {
	return publicRouteMetadata(pathname).title.replace(/\s+(?:—|\|)\s+Aevani$/, '');
}

const shareImagePath = '/og-image.png';

export const publicShareImage = {
	path: shareImagePath,
	url: `${SITE_URL}${shareImagePath}`,
	width: 1200,
	height: 630,
	alt: 'Aevani'
} as const;

/** Module indexes whose child URLs are known without a database read. */
export function moduleIndexList(pathname: string): { name: string; path: string }[] | null {
	const path = pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/';
	if (path === '/products') {
		return [
			{ name: 'Hydroponics', path: '/products/hydroponics' },
			{ name: 'Aquaponics', path: '/products/aquaponics' },
			{ name: 'Silvopasture', path: '/products/silvopasture' },
			{ name: 'Agroforestry', path: '/products/agroforestry' }
		];
	}
	if (path === '/learn') {
		return [
			{ name: 'Guides', path: '/guides' },
			{ name: 'Field notes', path: '/blog' },
			{ name: 'News', path: '/news' },
			{ name: 'FAQ', path: '/faq' }
		];
	}
	return null;
}

export function publicSiteUrl(pathname = '/'): string {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${SITE_URL}${path}`;
}

export function isPublicIndexablePath(pathname: string): boolean {
	const normalized = pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/';
	if (unindexedPaths.has(normalized)) return false;
	if (isPublishedWhitePaperPath(normalized)) return true;
	if (publicIndexablePaths.some((path) => path === normalized)) return true;
	return publicIndexablePrefixes.some((prefix) => normalized.startsWith(prefix));
}

export function renderRobotsTxt(): string {
	return [
		'User-agent: *',
		'Allow: /',
		...robotDisallowPaths.map((path) => `Disallow: ${path}`),
		'',
		`Sitemap: ${SITE_URL}/sitemap.xml`,
		''
	].join('\n');
}
