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
		}
	});
});
