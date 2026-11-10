import { cornerstoneEssays, type CornerstoneEssay } from './essays';
import { SITE_URL } from '$lib/config/site';

/** Fixed topics that the published notes actually use. Not an open tag cloud. */
export const fieldNoteTopics = [
	'marketplace honesty',
	'seller onboarding',
	'seller fees',
	'marketplace'
] as const;

/**
 * Research sectors from the house taxonomy. No child page is published until
 * a sourced guide exists, so these stay unlinked.
 */
export const guideSectors = [
	{ name: 'Hydroponics' },
	{ name: 'Aquaponics' },
	{ name: 'Silvopasture' },
	{ name: 'Agroforestry' },
	{ name: 'Intermountain / high-desert climate' }
] as const;

/** A sourced research child. None are published until the figures are real. */
export type GuideSectorPage = {
	slug: string;
	name: string;
	title: string;
	description: string;
	standfirst: string;
	reviewedAt: string;
	stats: { figure: string; label: string; source: string }[];
	challenges: { title: string; body: string; metric: string }[];
	applications: { title: string; body: string }[];
	sources: { organization: string; year: string; title: string; href: string }[];
	illustrative: { heading: string; body: string };
	siblings: { name: string; href: string }[];
};

/** Empty on purpose. Do not add a sector until its sources are opened. */
export const publishedGuideSectors: readonly GuideSectorPage[] = [];

/** Existing notes. They are not sector cards. */
export const relatedGuideNotes = [
	{
		title: 'Understanding Soil Health',
		href: '/guides/understanding-soil-health'
	},
	{
		title: 'Getting Started with Companion Planting',
		href: '/guides/getting-started-companion-planting'
	}
] as const;

export const writingSitemapPaths = ['/news', '/feed.xml'] as const;

export function relatedEssays(slug: string): CornerstoneEssay[] {
	return cornerstoneEssays.filter((essay) => essay.slug !== slug);
}

export function renderFieldNotesFeed(origin = SITE_URL): string {
	const site = origin.replace(/\/+$/, '');
	const items = cornerstoneEssays
		.map((essay) => {
			const link = `${site}/blog/${essay.slug}`;
			const pub = new Date(essay.publishedAt).toUTCString();
			return `
		<item>
			<title>${xmlEscape(essay.title)}</title>
			<link>${xmlEscape(link)}</link>
			<guid>${xmlEscape(link)}</guid>
			<pubDate>${xmlEscape(pub)}</pubDate>
			<description>${xmlEscape(essay.excerpt)}</description>
			<author>contact@escherbridge.com (Escherbridge)</author>
		</item>`;
		})
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Aevani field notes</title>
		<link>${xmlEscape(`${site}/blog`)}</link>
		<description>Dated notes from Escherbridge. The catalogue is a preview. Nothing in it is for sale yet.</description>
		${items}
	</channel>
</rss>
`;
}

function xmlEscape(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}
