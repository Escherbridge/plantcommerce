import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
import { cornerstoneEssayBySlug, cornerstoneEssayHtml, cornerstoneEssays } from './essays';

describe('cornerstone essays', () => {
	it('publishes both essays with a follow link to PlantGeo', () => {
		expect(cornerstoneEssays.map((essay) => essay.slug)).toEqual([
			'nothing-for-sale-yet',
			'a-flat-eight-percent'
		]);

		for (const essay of cornerstoneEssays) {
			const html = sanitizeRichText(cornerstoneEssayHtml(essay.body));
			expect(html).toContain('href="https://plantgeo.aevani.com/"');
			expect(html).not.toContain('nofollow');
			expect(cornerstoneEssayBySlug(essay.slug)?.title).toBe(essay.title);
			expect(essay.sources.some((source) => source.href === 'https://plantgeo.aevani.com')).toBe(
				true
			);
		}

		const catalogue = cornerstoneEssayBySlug('nothing-for-sale-yet');
		expect(catalogue?.body).toContain(
			'does not publish customer counts, product counts, impact metrics, certifications, awards, partner relationships, team biographies, or company-history milestones as verified facts'
		);
		expect(catalogue?.sources.map((source) => source.href)).toContain('https://aevani.com/terms');

		const fee = cornerstoneEssayBySlug('a-flat-eight-percent');
		expect(fee?.sources.map((source) => source.href)).toContain(
			'https://aevani.com/affiliate/join'
		);
	});
});
