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
	it('publishes the cooling essay and the fee essay, and retires the empty-shop post', async () => {
		expect(cornerstoneEssays.map((essay) => essay.slug)).toEqual([
			'cooling-can-use-more-water-than-the-crop',
			'a-flat-eight-percent'
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

		for (const essay of cornerstoneEssays) {
			const html = sanitizeRichText(cornerstoneEssayHtml(essay.body));
			expect(html).toContain('href="https://plantgeo.aevani.com/"');
			expect(html).not.toContain('nofollow');
			expect(cornerstoneEssayBySlug(essay.slug)?.title).toBe(essay.title);
		}

		const fee = cornerstoneEssayBySlug('a-flat-eight-percent');
		expect(fee?.title).toBe('The seller fee is a flat 8%');
		expect(fee?.body).toContain(
			'The fee is 8%, processing is included, and there are no other fees. When you get paid has not been written yet, and so you will not find it on the page.'
		);
		expect(fee?.body).toContain('Payout timing has not been set.');
		expect(fee?.body).toContain('The share itself has not been set.');
		expect(fee?.body).toContain('tiered commission');
		expect(fee?.body).toContain('cookie window');
		expect(fee?.body).toContain('payout minimum');
		expect(fee?.body).toContain('instant approval');
		expect(fee?.body).toContain('platform fee on top of the sale');
		expect(fee?.sources.map((source) => source.href)).toContain(
			'https://aevani.com/affiliate/join'
		);
		expect(fee?.sources.some((source) => source.href === 'https://plantgeo.aevani.com')).toBe(true);
		expect(cornerstoneEssayRecord(fee!).page.metaDescription).toBe(fee?.metaDescription);
		expect(fee?.metaDescription).not.toBe(fee?.excerpt);

		const cooling = cornerstoneEssayBySlug('cooling-can-use-more-water-than-the-crop');
		expect(cooling?.title).toBe('In a dry climate, cooling can use more water than the plants');
		expect(cooling?.body).toContain('Tucson, Arizona');
		expect(cooling?.body).toContain('not a Boise field trial');
		expect(cooling?.body).toContain('780 L/m²');
		expect(cooling?.body).toContain('1,450 L/m²');
		expect(cooling?.body).toContain('4.3 L/m²/day');
		expect(cooling?.body).toContain('7.2 L/m²/day');
		expect(cooling?.body).toContain('11 L/m²/day');
		expect(cooling?.body).toContain('central Boise is zone 7a');
		expect(cooling?.body).toContain('a foothills area is zone 6b');
		expect(cooling?.metaDescription).toHaveLength(157);
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
	});
});
