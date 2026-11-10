import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { publicRouteMetadata, publicSiteUrl } from '$lib/config/site';
import {
	articleBreadcrumbData,
	articleStructuredData,
	guideHrefs,
	guidePlainText,
	guidesCollectionData,
	guidesIndex,
	indexGuideLinks,
	publishedGuideSectors,
	type GuideDocument
} from './research';

const draftFiles = {
	index: new URL('./research/index.md', import.meta.url),
	'hydroponics-intermountain': new URL('./research/hydroponics-intermountain.md', import.meta.url),
	'small-scale-aquaponics': new URL('./research/small-scale-aquaponics.md', import.meta.url),
	'temperate-silvopasture': new URL('./research/temperate-silvopasture.md', import.meta.url)
} as const;

function visibleUrls(raw: string): string[] {
	const body = raw.split('\n---\n', 2)[1] ?? raw;
	const visible = body.split('\n## JSON-LD notes')[0];
	const urls = new Set<string>();
	for (const match of visible.matchAll(/\]\(([^)\s]+)\)/g)) urls.add(match[1]);
	for (const match of visible.matchAll(/https?:\/\/[^\s)]+/g)) urls.add(match[0]);
	return [...urls];
}

const bySlug = new Map<string, GuideDocument>([
	[guidesIndex.slug, guidesIndex],
	...publishedGuideSectors.map((guide) => [guide.slug, guide] as const)
]);

const datedUrls: Record<string, string> = {
	'https://www.ars.usda.gov/news-events/news/research-news/2023/usda-unveils-updated-plant-hardiness-zone-map':
		'2023-11-15',
	'https://experts.arizona.edu/en/publications/water-use-in-a-greenhouse-in-a-semi-arid-climate/':
		'2011-05',
	'https://extension.usu.edu/smallfarms/files/Greenhouses_Temp.Mgmt.pdf': '2010-04',
	'https://www.fao.org/4/i4021e/i4021e.pdf': '2014',
	'https://www.fs.usda.gov/research/publications/an/silvopasture-an-agroforestry-practice-an8-final-508.pdf':
		'2025-06',
	'https://www.fs.usda.gov/nac/assets/documents/workingtrees/brochures/wts.pdf': '2008'
};

describe('research guides', () => {
	it('keeps every visible draft URL on the page that cites it', () => {
		for (const [slug, file] of Object.entries(draftFiles)) {
			const guide = bySlug.get(slug);
			expect(guide, slug).toBeTruthy();
			const hrefs = new Set(guideHrefs(guide!));
			for (const url of visibleUrls(readFileSync(file, 'utf8'))) {
				expect(hrefs, `${slug} ${url}`).toContain(url);
			}
		}
	});

	it('publishes the index as three guides, with the older notes kept as writing', () => {
		expect(guidesIndex.title).toBe('Same climate. No invented figures.');
		expect(guidesIndex.author).toBe('Escherbridge');
		expect(publicRouteMetadata('/guides')).toEqual({
			title: guidesIndex.seoTitle,
			description: guidesIndex.description
		});
		expect(indexGuideLinks().map((item) => item.href)).toEqual([
			'/guides/hydroponics-intermountain',
			'/guides/small-scale-aquaponics',
			'/guides/temperate-silvopasture'
		]);
		const text = guidePlainText(guidesIndex);
		expect(text).toContain('These pages are growing-system guides, not product pages.');
		expect(text).toContain('11.51 inches');
		expect(text).toContain('54.8 days');
		expect(text).toContain('zone 7a');
		expect(text).toContain('6b');
		expect(text).toContain('not sector cards');
		expect(text).toContain('/guides/understanding-soil-health');
		expect(text).toContain('/guides/getting-started-companion-planting');
		expect(text).toContain('/learn');
		expect(text).toContain('/sell');
		expect(text).toContain('flat 8%');
		expect(text).toContain('Payout timing is not set');
		expect(text).toContain('not for sale yet');
		expect(text).toContain('https://plantgeo.aevani.com');
		expect(text).not.toContain('An illustrative scenario');
		expect(text).not.toContain('not written yet');

		const collection = guidesCollectionData();
		expect(collection.mainEntity.itemListElement.map((item) => item.url)).toEqual([
			publicSiteUrl('/guides/hydroponics-intermountain'),
			publicSiteUrl('/guides/small-scale-aquaponics'),
			publicSiteUrl('/guides/temperate-silvopasture')
		]);
	});

	it('keeps the cited figures, sources, and illustrative label on each child', () => {
		const expected: Record<string, string[]> = {
			'hydroponics-intermountain': [
				'11.51 inches',
				'54.8 days',
				'Zone 7a',
				'zone 6b',
				'780 L/m²',
				'1,450 L/m²',
				'92.7°F',
				'0.21-inch July',
				'−5 to 0°F',
				'An illustrative scenario',
				'Sources',
				'Every stat on this page is cited.'
			],
			'small-scale-aquaponics': [
				'pH 6–7',
				'0.25–1.0 mg/L',
				'20 kg of fish per 1,000 litres',
				'40–50 grams',
				'50–80 grams',
				'32 percent protein',
				'An illustrative scenario',
				'Sources'
			],
			'temperate-silvopasture': [
				'50 percent or more',
				'70 percent',
				'54.8 days',
				'0.21 inches',
				'11.51 inches',
				'An illustrative scenario',
				'Sources'
			]
		};

		for (const guide of publishedGuideSectors) {
			expect(guide.author).toBe('Escherbridge');
			expect(guide.publishedAt).toBe('2026-11-10');
			expect(guide.reviewedAt).toBe('2026-11-10');
			expect(guide.canonical).toBe(publicSiteUrl(`/guides/${guide.slug}`));
			expect(guide.seoTitle.length).toBeLessThanOrEqual(60);
			expect(guide.description.length).toBeLessThanOrEqual(220);
			const text = guidePlainText(guide);
			for (const figure of expected[guide.slug]) expect(text, figure).toContain(figure);
			expect(text).toContain('flat 8%');
			expect(text.toLowerCase()).toContain('payout timing');
			expect(text).toContain('not for sale');
			expect(text).toContain('https://plantgeo.aevani.com/plan/sample-ada-county');
			expect(text).toContain('/sell');
			expect(text).not.toContain('$');
			expect(text).not.toContain('Add to cart');
			expect(text.toLowerCase()).not.toContain('tower garden');
			expect(guide.sources.length).toBeGreaterThan(0);
			for (const source of guide.sources) expect(source.urls.length).toBeGreaterThan(0);

			const article = articleStructuredData(guide);
			expect(article.headline).toBe(guide.title);
			expect(article.author).toEqual({ '@type': 'Organization', name: 'Escherbridge' });
			expect(article.publisher.legalName).toBe('Escherbridge, LLC');
			expect(article.mainEntityOfPage).toBe(guide.canonical);
			expect(articleBreadcrumbData(guide).itemListElement.map((item) => item.name)).toEqual([
				'Home',
				'Guides',
				guide.breadcrumb
			]);
			for (const source of guide.sources) {
				const citation = article.citation.find((item) => item.url === source.urls[0]);
				expect(citation?.name).toBe(source.name);
				const expectedDate = datedUrls[source.urls[0]];
				expect(source.datePublished).toBe(expectedDate);
			}
		}

		expect(bySlug.get('hydroponics-intermountain')?.breadcrumb).toBe('Hydroponics, Intermountain');
		expect(bySlug.get('small-scale-aquaponics')?.breadcrumb).toBe('Small-scale aquaponics');
		expect(bySlug.get('temperate-silvopasture')?.breadcrumb).toBe('Temperate silvopasture');
	});
});
