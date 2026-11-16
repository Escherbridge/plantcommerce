import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
import {
	cornerstoneEssayBySlug,
	cornerstoneEssayHtml,
	cornerstoneEssayRecord,
	cornerstoneEssays,
	essayRedirectTarget
} from './essays';

describe('cornerstone essays', () => {
	it('publishes the field notes, routes into PlantGeo and /sell, and passes hard compliance rules', async () => {
		expect(cornerstoneEssays.map((essay) => essay.slug)).toEqual([
			'cooling-can-use-more-water-than-the-crop',
			'a-flat-eight-percent',
			'the-fee-that-didnt-move',
			'dwc-vs-kratky-vs-nft',
			'raised-beds-for-heavy-clay-and-hot-summers',
			'pre-spring-grower-checklist',
			'cycling-your-first-aquaponics-loop'
		]);
		expect(essayRedirectTarget('nothing-for-sale-yet')).toBe(
			'/blog/cooling-can-use-more-water-than-the-crop'
		);
		expect(cornerstoneEssayBySlug('nothing-for-sale-yet')).toBeUndefined();

		const source = await readFile(new URL('./essays.ts', import.meta.url), 'utf8');
		expect(source).not.toContain('Nothing for sale yet');
		expect(source).not.toContain(
			'A shop is supposed to be a place where you can leave with something.'
		);
		expect(source).not.toMatch(/primusneo|payout timing|when you get paid|when a seller is paid/i);
		for (const essay of cornerstoneEssays) {
			if (essay.slug === 'the-fee-that-didnt-move') continue;
			expect(`${essay.slug} ${essay.body}`).not.toMatch(/growtsy|etsy|the-fee-that-didnt-move/i);
		}

		for (const essay of cornerstoneEssays) {
			const html = sanitizeRichText(cornerstoneEssayHtml(essay.body));
			if (essay.slug !== 'the-fee-that-didnt-move') {
				expect(html).toContain('href="https://plantgeo.aevani.com');
			}
			expect(html).toContain('href="/sell"');
			expect(html).not.toContain('nofollow');
			expect(cornerstoneEssayBySlug(essay.slug)?.title).toBe(essay.title);
			expect(essay.sources.length).toBeGreaterThan(0);
			expect(essay.metaDescription).toBeDefined();
			expect((essay.metaDescription ?? '').length).toBeLessThanOrEqual(220);
			expect(essay.metaDescription).not.toBe(essay.excerpt);
		}

		const fee = cornerstoneEssayBySlug('a-flat-eight-percent');
		expect(fee?.title).toBe('The seller fee is a flat 8%');
		expect(fee?.body).toContain('8% flat commission on completed sales');
		expect(fee?.body).toContain('Card processing included');
		expect(fee?.body).toContain('$0 listing fees');
		expect(fee?.body).toContain('$0 monthly subscription fees');
		expect(fee?.body).toContain('$0 ad fees');
		expect(fee?.sources.map((source) => source.href)).toContain('https://aevani.com/sell');
		expect(fee?.sources.some((source) => source.href === 'https://plantgeo.aevani.com')).toBe(true);
		expect(cornerstoneEssayRecord(fee!).page.metaDescription).toBe(fee?.metaDescription);

		const cooling = cornerstoneEssayBySlug('cooling-can-use-more-water-than-the-crop');
		expect(cooling?.title).toBe('In a dry climate, cooling can use more water than the plants');
		expect(cooling?.seoTitle).toBe('Cooling can use more water than the crop — Aevani');
		expect(cooling!.seoTitle!.length).toBeLessThanOrEqual(60);
		expect(cornerstoneEssayRecord(cooling!).page.documentTitle).toBe(cooling?.seoTitle);
		expect(cooling?.body).toContain('Tucson, Arizona');
		expect(cooling?.body).toContain('semi-arid trial in Tucson');
		expect(cooling?.body).toContain('780 L/m²');
		expect(cooling?.body).toContain('1,450 L/m²');
		expect(cooling?.body).toContain('4.3 L/m²/day');
		expect(cooling?.body).toContain('7.2 L/m²/day');
		expect(cooling?.body).toContain('11 L/m²/day');
		expect(cooling?.body).toContain('central Boise sits in zone 7a');
		expect(cooling?.body).toContain('foothills sit in zone 6b');
		expect(cooling?.sources.map((source) => source.href)).toEqual([
			'https://experts.arizona.edu/en/publications/water-use-in-a-greenhouse-in-a-semi-arid-climate/',
			'https://ceac.arizona.edu/sites/default/files/Ch10.pdf',
			'https://www.ars.usda.gov/news-events/news/research-news/2023/usda-unveils-updated-plant-hardiness-zone-map',
			'https://planthardiness.ars.usda.gov/',
			'https://prism.oregonstate.edu/phzm/',
			'https://extension.usu.edu/smallfarms/files/Greenhouses_Temp.Mgmt.pdf'
		]);
		expect(cooling?.sources.map((source) => source.datePublished ?? null)).toEqual([
			'2011',
			null,
			'2023-11-15',
			null,
			'2023',
			'2010-04'
		]);

		const coolingHtml = sanitizeRichText(cornerstoneEssayHtml(cooling!.body));
		expect(coolingHtml).toContain('<em>Transactions of the ASABE</em>');
		expect(coolingHtml).toContain('href="/guides/hydroponics-intermountain"');
		expect(cornerstoneEssayRecord(cooling!).page.metaDescription).toBe(cooling?.metaDescription);

		const dwc = cornerstoneEssayBySlug('dwc-vs-kratky-vs-nft');
		const dwcHtml = sanitizeRichText(cornerstoneEssayHtml(dwc!.body));
		expect(dwcHtml).toContain('<h2>');
		expect(dwcHtml).toContain('href="/products/hydroponics"');
	});
});
