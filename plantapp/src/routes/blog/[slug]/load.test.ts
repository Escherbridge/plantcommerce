import { isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { load } from './+page';

const unusedFetch = async () => {
	throw new Error('a cornerstone note must not query the CMS');
};

describe('field note load', () => {
	it('308s the retired empty-shop note to the cooling essay', async () => {
		try {
			await load({
				params: { slug: 'nothing-for-sale-yet' },
				fetch: unusedFetch
			} as never);
			expect.fail('expected a redirect');
		} catch (error) {
			expect(isRedirect(error)).toBe(true);
			if (!isRedirect(error)) return;
			expect(error.status).toBe(308);
			expect(error.location).toBe('/blog/cooling-can-use-more-water-than-the-crop');
		}
	});

	it('serves the cooling essay and the fee essay from the published notes', async () => {
		const cooling = await load({
			params: { slug: 'cooling-can-use-more-water-than-the-crop' },
			fetch: unusedFetch
		} as never);
		expect(cooling?.post.page.title).toBe(
			'In a dry climate, cooling can use more water than the plants'
		);
		expect(cooling?.post.page.content).toContain('not a Boise field trial');
		expect(cooling?.post.page.content).toContain('780 L/m²');
		expect(cooling?.post.page.content).not.toContain('JSON-LD');

		const fee = await load({
			params: { slug: 'a-flat-eight-percent' },
			fetch: unusedFetch
		} as never);
		expect(fee?.post.page.title).toBe('The seller fee is a flat 8%');
		expect(fee?.post.page.content).toContain(
			'When you get paid has not been written yet, and so you will not find it on the page.'
		);
	});
});
