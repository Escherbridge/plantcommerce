import { cornerstoneEssays, type CornerstoneEssay } from './essays';
import { publishedGuideSectors } from './research';
import { SITE_URL } from '$lib/config/site';

export { publishedGuideSectors };
export type { GuideDocument as GuideSectorPage } from './research';

/** Fixed topics that the published notes actually use. Not an open tag cloud. */
export const fieldNoteTopics = [
	'seller fees',
	'marketplace',
	'hydroponics',
	'water',
	'Intermountain West'
] as const;

/**
 * House taxonomy. These names stay unlinked. Published children live on
 * `publishedGuideSectors` and are not cards for the unpublished sectors.
 */
export const guideSectors = [
	{ name: 'Hydroponics' },
	{ name: 'Aquaponics' },
	{ name: 'Silvopasture' },
	{ name: 'Agroforestry' },
	{ name: 'Intermountain / high-desert climate' }
] as const;

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
	const notes = cornerstoneEssays.map((essay) => {
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
	});
	const guides = publishedGuideSectors.map((guide) => {
		const link = guide.canonical;
		const pub = new Date(`${guide.publishedAt}T00:00:00.000Z`).toUTCString();
		return `
		<item>
			<title>${xmlEscape(guide.title)}</title>
			<link>${xmlEscape(link)}</link>
			<guid>${xmlEscape(link)}</guid>
			<pubDate>${xmlEscape(pub)}</pubDate>
			<description>${xmlEscape(guide.description)}</description>
			<author>contact@escherbridge.com (Escherbridge)</author>
		</item>`;
	});
	const items = [...notes, ...guides].join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Aevani field notes</title>
		<link>${xmlEscape(`${site}/blog`)}</link>
		<description>Dated writing from Escherbridge on growing, selling, and the flat 8% seller fee. The catalogue is still a preview, and the checkout remains off.</description>
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
