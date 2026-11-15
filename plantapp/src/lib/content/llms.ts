import {
	SITE_URL,
	documentCrumbLabel,
	escherbridgeProjects,
	publicIndexablePaths,
	publicOperator,
	publicRouteMetadata
} from '$lib/config/site';
import { cornerstoneEssays } from './essays';
import { publishedGuideSectors } from './research';

/** Published CMS pages that are not in the typed guide or essay arrays. */
const legacyPages = [
	{
		path: '/guides/getting-started-companion-planting',
		title: 'Getting Started with Companion Planting'
	},
	{
		path: '/guides/understanding-soil-health',
		title: 'Understanding Soil Health: The Foundation of Every Garden'
	},
	{
		path: '/blog/hydroponics-for-beginners',
		title: 'Hydroponics for Beginners: Growing Without Soil'
	},
	{
		path: '/blog/introduction-to-aquaponics',
		title: 'Introduction to Aquaponics: Fish Meet Plants'
	},
	{
		path: '/blog/what-is-silvopasture',
		title: 'What is Silvopasture? Integrating Trees, Forage, and Livestock'
	},
	{
		path: '/blog/monoculture-to-polyculture',
		title: 'From Monoculture to Polyculture: Why Diversity Matters'
	}
] as const;

function link(path: string, label: string): string {
	return `- [${label}](${SITE_URL}${path === '/' ? '/' : path})`;
}

/**
 * Public map for agents. Every Aevani URL is a page the site already publishes.
 * No street address, no affiliate offer, and no claim that a catalogue item is for sale.
 */
export function renderLlmsTxt(): string {
	const siteLinks = publicIndexablePaths.map((path) =>
		link(path, path === '/' ? 'Home' : documentCrumbLabel(path))
	);
	const guideLinks = [
		...publishedGuideSectors.map((guide) => link(`/guides/${guide.slug}`, guide.title)),
		...legacyPages
			.filter((page) => page.path.startsWith('/guides/'))
			.map((page) => link(page.path, page.title))
	];
	const noteLinks = [
		...cornerstoneEssays.map((essay) => link(`/blog/${essay.slug}`, essay.title)),
		...legacyPages
			.filter((page) => page.path.startsWith('/blog/'))
			.map((page) => link(page.path, page.title))
	];
	const sisters = escherbridgeProjects.map((site) => `- [${site.label}](${site.href})`);

	return [
		'# Aevani',
		'',
		`> Aevani (${SITE_URL}) is a catalogue of growing tools and a free library of growing guides. Author: Escherbridge. Operator: ${publicOperator.legalName}. The seller fee is a flat 8% on completed sales, with card processing included and no listing, monthly, or ad fees. There are no affiliate programs. Catalogue items are placeholders and are not for sale.`,
		'',
		`Contact: ${publicOperator.email}. ${publicOperator.location}.`,
		'',
		'## Site',
		...siteLinks,
		link('/feed.xml', 'RSS'),
		link('/sitemap.xml', 'Sitemap'),
		'',
		`## Guides`,
		`${publishedGuideSectors.length} researched guides, plus two shorter notes. Figures on the researched guides belong to the cited sources.`,
		...guideLinks,
		'',
		'## Field notes',
		...noteLinks,
		'',
		'## Catalogue',
		'The catalogue is placeholders. Checkout is not a store, and nothing in it is offered for sale.',
		link('/products', publicRouteMetadata('/products').title.replace(/\s+\|\s+Aevani$/, '')),
		link('/products/hydroponics', 'Hydroponics'),
		link('/products/aquaponics', 'Aquaponics'),
		link('/products/silvopasture', 'Silvopasture'),
		link('/products/agroforestry', 'Agroforestry'),
		'',
		'## Elsewhere',
		...sisters,
		''
	].join('\n');
}
