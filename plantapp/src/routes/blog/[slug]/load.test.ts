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

	it('serves published field notes cleanly and passes content compliance rules', async () => {
		const cooling = await load({
			params: { slug: 'cooling-can-use-more-water-than-the-crop' },
			fetch: unusedFetch
		} as never);
		expect(cooling?.post.page.title).toBe(
			'In a dry climate, cooling can use more water than the plants'
		);
		expect(cooling?.post.page.content).toContain('semi-arid trial in Tucson');
		expect(cooling?.post.page.content).toContain('780 L/m²');
		expect(cooling?.post.page.content).not.toContain('JSON-LD');

		const fee = await load({
			params: { slug: 'a-flat-eight-percent' },
			fetch: unusedFetch
		} as never);
		expect(fee?.post.page.title).toBe('The seller fee is a flat 8%');
		expect(fee?.post.page.content).toContain('8% flat commission on completed sales');
		expect(fee?.post.page.content).toContain('Card processing included');
		expect(fee?.post.page.content).toContain('href="/sell"');
		expect(fee?.post.page.content).not.toMatch(
			/payout timing|when you get paid|primusneo|etsy|growtsy|the-fee-that-didnt-move/i
		);

		const dwc = await load({
			params: { slug: 'dwc-vs-kratky-vs-nft' },
			fetch: unusedFetch
		} as never);
		expect(dwc?.post.page.content).toContain('href="/products/hydroponics"');
		expect(dwc?.post.page.content).toContain('href="/sell"');
	});
});
