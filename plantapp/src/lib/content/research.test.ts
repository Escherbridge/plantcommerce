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
	'temperate-silvopasture': new URL('./research/temperate-silvopasture.md', import.meta.url),
	'hydroponic-ec-ph-nutrients': new URL(
		'./research/hydroponic-ec-ph-nutrients.md',
		import.meta.url
	),
	'choosing-hydroponic-system': new URL(
		'./research/choosing-hydroponic-system.md',
		import.meta.url
	),
	'hydroponic-troubleshooting-root-rot': new URL(
		'./research/hydroponic-troubleshooting-root-rot.md',
		import.meta.url
	),
	'deep-water-culture': new URL('./research/deep-water-culture.md', import.meta.url),
	'kratky-method': new URL('./research/kratky-method.md', import.meta.url),
	'nutrient-film-technique': new URL('./research/nutrient-film-technique.md', import.meta.url),
	'raised-beds': new URL('./research/raised-beds.md', import.meta.url),
	'container-gardening': new URL('./research/container-gardening.md', import.meta.url),
	'high-tunnels-hoop-houses': new URL('./research/high-tunnels-hoop-houses.md', import.meta.url),
	'greenhouse-ventilation-heat': new URL(
		'./research/greenhouse-ventilation-heat.md',
		import.meta.url
	),
	'season-extension-covers-frames': new URL(
		'./research/season-extension-covers-frames.md',
		import.meta.url
	),
	'greenhouse-ipm': new URL('./research/greenhouse-ipm.md', import.meta.url),
	'aquaponic-biofilter-cycling': new URL(
		'./research/aquaponic-biofilter-cycling.md',
		import.meta.url
	),
	'aquaponic-system-types': new URL('./research/aquaponic-system-types.md', import.meta.url),
	'aquaponic-fish-species': new URL('./research/aquaponic-fish-species.md', import.meta.url),
	'source-water-testing': new URL('./research/source-water-testing.md', import.meta.url),
	'hydroponic-crop-choice': new URL('./research/hydroponic-crop-choice.md', import.meta.url),
	'hydroponic-nutrient-disorders': new URL(
		'./research/hydroponic-nutrient-disorders.md',
		import.meta.url
	),
	'drip-dutch-bucket': new URL('./research/drip-dutch-bucket.md', import.meta.url),
	'ebb-and-flow': new URL('./research/ebb-and-flow.md', import.meta.url),
	'vertical-growing': new URL('./research/vertical-growing.md', import.meta.url),
	'soilless-seed-starting': new URL('./research/soilless-seed-starting.md', import.meta.url),
	'hydroponic-media': new URL('./research/hydroponic-media.md', import.meta.url),
	'no-dig-sheet-mulch': new URL('./research/no-dig-sheet-mulch.md', import.meta.url),
	'temperate-food-forest': new URL('./research/temperate-food-forest.md', import.meta.url)
} as const;

const publishedGuideHrefs = [
	'/guides/hydroponics-intermountain',
	'/guides/hydroponic-ec-ph-nutrients',
	'/guides/source-water-testing',
	'/guides/choosing-hydroponic-system',
	'/guides/hydroponic-crop-choice',
	'/guides/hydroponic-nutrient-disorders',
	'/guides/hydroponic-troubleshooting-root-rot',
	'/guides/deep-water-culture',
	'/guides/kratky-method',
	'/guides/nutrient-film-technique',
	'/guides/drip-dutch-bucket',
	'/guides/ebb-and-flow',
	'/guides/vertical-growing',
	'/guides/soilless-seed-starting',
	'/guides/hydroponic-media',
	'/guides/raised-beds',
	'/guides/no-dig-sheet-mulch',
	'/guides/container-gardening',
	'/guides/high-tunnels-hoop-houses',
	'/guides/greenhouse-ventilation-heat',
	'/guides/season-extension-covers-frames',
	'/guides/greenhouse-ipm',
	'/guides/temperate-food-forest',
	'/guides/small-scale-aquaponics',
	'/guides/aquaponic-biofilter-cycling',
	'/guides/aquaponic-system-types',
	'/guides/aquaponic-fish-species',
	'/guides/temperate-silvopasture'
] as const;

const relatedNoteHrefs = [
	'/guides/understanding-soil-health',
	'/guides/getting-started-companion-planting'
] as const;

const legacySlugs = new Set([
	'hydroponics-intermountain',
	'small-scale-aquaponics',
	'temperate-silvopasture'
]);

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

	it('publishes the index grouped by system type, and only links built guides', () => {
		expect(guidesIndex.title).toBe('Growing-system guides');
		expect(guidesIndex.author).toBe('Escherbridge');
		expect(publicRouteMetadata('/guides')).toEqual({
			title: guidesIndex.seoTitle,
			description: guidesIndex.description
		});
		expect(indexGuideLinks().map((item) => item.href)).toEqual([
			...publishedGuideHrefs,
			...relatedNoteHrefs
		]);
		const text = guidePlainText(guidesIndex);
		expect(text).toContain('These pages are growing-system guides, not product pages.');
		expect(text).toContain('Soilless systems');
		expect(text).toContain('Soil, beds, and structures');
		expect(text).toContain('Aquaponics and silvopasture');
		expect(text).toContain('11.51 inches');
		expect(text).toContain('54.8 days');
		expect(text).toContain('zone 7a');
		expect(text).toContain('6b');
		expect(text).toContain('not system cards');
		expect(text).toContain('/guides/understanding-soil-health');
		expect(text).toContain('/guides/getting-started-companion-planting');
		expect(text).toContain('/learn');
		expect(text).toContain('/sell');
		expect(text).toContain('flat 8%');
		expect(text).toContain('Payout timing is not set');
		expect(text).toContain('/blog/a-flat-eight-percent');
		expect(text).toContain('https://plantgeo.aevani.com');
		expect(text).not.toContain('/blog/nothing-for-sale-yet');
		expect(text).not.toContain('An illustrative scenario');
		expect(text).not.toContain('not written yet');
		const indexLinks = new Map(indexGuideLinks().map((item) => [item.href, item.name]));
		for (const href of publishedGuideHrefs) {
			const slug = href.slice('/guides/'.length);
			const guide = bySlug.get(slug);
			expect(guide, slug).toBeTruthy();
			expect(text, slug).toContain(href);
			expect(indexLinks.get(href), slug).toBeTruthy();
			if (!legacySlugs.has(slug)) expect(indexLinks.get(href)).toBe(guide!.title);
		}

		const collection = guidesCollectionData();
		expect(collection.mainEntity.itemListElement.map((item) => item.url)).toEqual(
			[...publishedGuideHrefs, ...relatedNoteHrefs].map((href) => publicSiteUrl(href))
		);
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
			],
			'hydroponic-ec-ph-nutrients': [
				'Check EC first, then pH',
				'pH between 5 and 6',
				'5.8 to 6.2',
				'1.15–1.25 mS/cm',
				'An illustrative scenario',
				'Sources'
			],
			'choosing-hydroponic-system': [
				'less than 2 gallons',
				'6–8 ppm',
				'at least 4 ppm',
				'An illustrative scenario',
				'Sources'
			],
			'raised-beds': ['3 to 4 feet', '6 to 12 inches', 'An illustrative scenario', 'Sources'],
			'high-tunnels-hoop-houses': [
				'Conservation Practice 325',
				'120°F',
				'An illustrative scenario',
				'Sources'
			],
			'hydroponic-troubleshooting-root-rot': [
				'at least 4 ppm',
				'6–8 ppm',
				'65–75°F',
				'An illustrative scenario',
				'Sources'
			],
			'deep-water-culture': ['6–8 ppm', 'at least 4 ppm', 'An illustrative scenario', 'Sources'],
			'kratky-method': [
				'less than 2 gallons',
				'Electricity and pumps are not needed',
				'An illustrative scenario',
				'Sources'
			],
			'container-gardening': [
				'20-inch-wide pot',
				'20" or 22"',
				'1½ gallons',
				'do not use straight garden soil',
				'An illustrative scenario',
				'Sources'
			],
			'greenhouse-ventilation-heat': [
				'120°F',
				'780 L/m²',
				'1,450 L/m²',
				'An illustrative scenario',
				'Sources'
			],
			'season-extension-covers-frames': [
				'floating row covers',
				'45°F',
				'120°F',
				'An illustrative scenario',
				'Sources'
			],
			'aquaponic-biofilter-cycling': [
				'25–40 days',
				'1–2 mg/litre',
				'between 3 and 5 mg/L',
				'An illustrative scenario',
				'Sources'
			],
			'greenhouse-ipm': [
				'Hero practices',
				'different from growing the same crop in the open field',
				'An illustrative scenario',
				'Sources'
			],
			'nutrient-film-technique': [
				'minimum 2% slope',
				'1–2 litres/min',
				'An illustrative scenario',
				'Sources'
			],
			'aquaponic-system-types': [
				'most popular design for small-scale aquaponics',
				'width of about 1 m',
				'An illustrative scenario',
				'Sources'
			],
			'aquaponic-fish-species': [
				'die below 12 °C',
				'below 17 °C',
				'22–32 °C',
				'10–18 °C',
				'An illustrative scenario',
				'Sources'
			],
			'source-water-testing': [
				'1,000 microsiemens per centimeter',
				'does not follow a typographical slip',
				'year 3 or 4',
				'In Kentucky, source water is typically alkaline',
				'most Florida irrigation water',
				'An illustrative scenario',
				'Sources'
			],
			'hydroponic-crop-choice': [
				'1.2–1.8',
				'2.0–4.0',
				'1,000 microsiemens per centimeter',
				'An illustrative scenario',
				'Sources'
			],
			'hydroponic-nutrient-disorders': [
				'Mobile versus immobile',
				'An illustrative scenario',
				'Sources'
			],
			'drip-dutch-bucket': [
				'1.5 to 3.5',
				'1.0 EC units',
				'does not name a commercial tower or bucket brand',
				'An illustrative scenario',
				'Sources'
			],
			'ebb-and-flow': [
				'15 min',
				'every 12 hours',
				'15-on/45-off',
				'An illustrative scenario',
				'Sources'
			],
			'vertical-growing': [
				'sometimes offset by the non-uniformity',
				'does not name a commercial stacked-pot product',
				'An illustrative scenario',
				'Sources'
			],
			'soilless-seed-starting': [
				'1,200 µS/cm above source water',
				'1.0 mS/cm',
				'Two official lettuce programs, side by side',
				'An illustrative scenario',
				'Sources'
			],
			'hydroponic-media': [
				'at least twice the amount of water',
				'8.34',
				'coco-versus-rockwool',
				'An illustrative scenario',
				'Sources'
			],
			'no-dig-sheet-mulch': [
				'https://sfyl.ifas.ufl.edu/lawn-and-garden/no-dig-garden-beds/',
				'An illustrative scenario',
				'Sources'
			],
			'temperate-food-forest': [
				'1 February 2022',
				'AG-831',
				'apple tree guild',
				'An illustrative scenario',
				'Sources'
			]
		};

		const builtHrefs = new Set<string>([...publishedGuideHrefs, ...relatedNoteHrefs]);
		expect(publishedGuideSectors.map((guide) => guide.slug)).toEqual([
			'hydroponics-intermountain',
			'small-scale-aquaponics',
			'temperate-silvopasture',
			'hydroponic-ec-ph-nutrients',
			'choosing-hydroponic-system',
			'hydroponic-troubleshooting-root-rot',
			'deep-water-culture',
			'kratky-method',
			'nutrient-film-technique',
			'raised-beds',
			'container-gardening',
			'high-tunnels-hoop-houses',
			'greenhouse-ventilation-heat',
			'season-extension-covers-frames',
			'greenhouse-ipm',
			'aquaponic-biofilter-cycling',
			'aquaponic-system-types',
			'aquaponic-fish-species',
			'source-water-testing',
			'hydroponic-crop-choice',
			'hydroponic-nutrient-disorders',
			'drip-dutch-bucket',
			'ebb-and-flow',
			'vertical-growing',
			'soilless-seed-starting',
			'hydroponic-media',
			'no-dig-sheet-mulch',
			'temperate-food-forest'
		]);
		expect(new Set(publishedGuideSectors.map((guide) => guide.seoTitle)).size).toBe(
			publishedGuideSectors.length
		);

		for (const guide of publishedGuideSectors) {
			expect(guide.author).toBe('Escherbridge');
			expect(guide.publishedAt).toBe('2026-11-10');
			expect(guide.reviewedAt).toBe('2026-11-10');
			expect(guide.canonical).toBe(publicSiteUrl(`/guides/${guide.slug}`));
			expect(guide.seoTitle.length).toBeLessThanOrEqual(100);
			expect(guide.description.length).toBeLessThanOrEqual(220);
			expect(guide.breadcrumb).not.toBe('Guides');
			const text = guidePlainText(guide);
			for (const figure of expected[guide.slug]) expect(text, figure).toContain(figure);
			expect(text).toContain('flat 8%');
			expect(text.toLowerCase()).toContain('payout timing');
			expect(text).toContain('https://plantgeo.aevani.com');
			expect(text).toContain('/learn');
			expect(text).toContain('/sell');
			expect(text).not.toContain('$');
			expect(text).not.toContain('Add to cart');
			expect(text).not.toContain('/blog/nothing-for-sale-yet');
			expect(text.toLowerCase()).not.toContain('tower garden');
			if (legacySlugs.has(guide.slug)) {
				expect(text).toContain('not for sale');
				expect(text).toContain('https://plantgeo.aevani.com/plan/sample-ada-county');
			}
			for (const href of guideHrefs(guide)) {
				if (href.startsWith('/guides/') && href !== '/guides') {
					expect(builtHrefs, `${guide.slug} ${href}`).toContain(href);
				}
			}
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
				if (legacySlugs.has(guide.slug)) {
					expect(source.datePublished).toBe(datedUrls[source.urls[0]]);
				}
			}
		}

		expect(bySlug.get('hydroponics-intermountain')?.breadcrumb).toBe('Hydroponics, Intermountain');
		expect(bySlug.get('small-scale-aquaponics')?.breadcrumb).toBe('Small-scale aquaponics');
		expect(bySlug.get('temperate-silvopasture')?.breadcrumb).toBe('Temperate silvopasture');
	});
});
