import { describe, expect, it } from 'vitest';
import { guideSectors, publishedGuideSectors, renderFieldNotesFeed } from './writing';

describe('writing module', () => {
	it('publishes an RSS feed of the real field notes only', () => {
		const xml = renderFieldNotesFeed('https://aevani.com');
		expect(xml).toContain('<rss version="2.0">');
		expect(xml).toContain('https://aevani.com/blog/nothing-for-sale-yet');
		expect(xml).toContain('https://aevani.com/blog/a-flat-eight-percent');
		expect(xml).toContain('Escherbridge');
		expect(xml).not.toContain('railway.app');
		expect(xml).not.toContain('Aevani Admin');
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
