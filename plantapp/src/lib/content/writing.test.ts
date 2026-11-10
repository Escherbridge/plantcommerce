import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { publicRouteMetadata } from '$lib/config/site';
import { guideSectors, publishedGuideSectors, renderFieldNotesFeed } from './writing';

const blogDescription =
	'Dated writing from Escherbridge on growing, selling, and the flat 8% seller fee. The catalogue is still a preview, and the checkout remains off.';

describe('writing module', () => {
	it('publishes an RSS feed of the real field notes only', () => {
		const xml = renderFieldNotesFeed('https://aevani.com');
		expect(xml).toContain('<rss version="2.0">');
		expect(xml).toContain('https://aevani.com/blog/cooling-can-use-more-water-than-the-crop');
		expect(xml).toContain('https://aevani.com/blog/a-flat-eight-percent');
		expect(xml).toContain('In a dry climate, cooling can use more water than the plants');
		expect(xml).toContain('The seller fee is a flat 8%');
		expect(xml).toContain(blogDescription);
		expect(xml).not.toContain('nothing-for-sale-yet');
		expect(xml).not.toContain('Nothing for sale yet');
		expect(xml).toContain('Escherbridge');
		expect(xml).not.toContain('railway.app');
		expect(xml).not.toContain('Aevani Admin');
		expect(publicRouteMetadata('/blog').description).toBe(blogDescription);
	});

	it('uses the field-note index and leaves checkout off as a sentence', async () => {
		const blog = await readFile(new URL('../../routes/blog/+page.svelte', import.meta.url), 'utf8');
		const learn = await readFile(
			new URL('../../routes/learn/+page.svelte', import.meta.url),
			'utf8'
		);
		const home = await readFile(new URL('../../routes/+page.svelte', import.meta.url), 'utf8');
		const sell = await readFile(new URL('../../routes/sell/+page.svelte', import.meta.url), 'utf8');

		expect(blog).toContain('>Field notes</h1>');
		expect(blog).toContain('and checkout is off.');
		expect(blog).not.toContain('Notes while the shop is empty.');
		expect(blog).not.toMatch(/<h[1-6][^>]*>[^<]*checkout/i);
		expect(learn).toContain('>Guides and notes</h1>');
		expect(learn).not.toContain('Read while the beds are still empty.');
		expect(publicRouteMetadata('/learn').title).toBe('Learn — Aevani');
		expect(home).toContain('The catalogue is a preview. Nothing in it is for sale yet.');
		expect(sell).toContain('The catalogue is a preview. Nothing in it is for sale yet.');
		expect(sell).toContain("A flat 8%. That's the fee.");
	});

	it('names research sectors without linking the unpublished taxonomy', () => {
		expect(guideSectors.map((sector) => sector.name)).toEqual([
			'Hydroponics',
			'Aquaponics',
			'Silvopasture',
			'Agroforestry',
			'Intermountain / high-desert climate'
		]);
		for (const sector of guideSectors) {
			expect(sector).not.toHaveProperty('href');
		}
		expect(publishedGuideSectors.map((guide) => guide.slug)).toEqual([
			'hydroponics-intermountain',
			'small-scale-aquaponics',
			'temperate-silvopasture'
		]);
	});

	it('lists the three guides in the field-notes feed', () => {
		const xml = renderFieldNotesFeed('https://aevani.com');
		expect(xml).toContain('https://aevani.com/guides/hydroponics-intermountain');
		expect(xml).toContain('https://aevani.com/guides/small-scale-aquaponics');
		expect(xml).toContain('https://aevani.com/guides/temperate-silvopasture');
		expect(xml).toContain('Escherbridge');
	});
});
