import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { publicRouteMetadata } from '$lib/config/site';
import { guideSectors, publishedGuideSectors, renderFieldNotesFeed } from './writing';

const blogDescription =
	'Hands-on field notes, seasonal growing checklists, system trade-offs, and transparent updates on selling growing gear at a flat 8% fee.';

describe('writing module', () => {
	it('publishes an RSS feed of the real field notes only', () => {
		const xml = renderFieldNotesFeed('https://aevani.com');
		expect(xml).toContain('<rss version="2.0">');
		expect(xml).toContain('https://aevani.com/blog/cooling-can-use-more-water-than-the-crop');
		expect(xml).toContain('https://aevani.com/blog/a-flat-eight-percent');
		expect(xml).toContain('https://aevani.com/blog/dwc-vs-kratky-vs-nft');
		expect(xml).toContain('https://aevani.com/blog/raised-beds-for-heavy-clay-and-hot-summers');
		expect(xml).toContain('https://aevani.com/blog/pre-spring-grower-checklist');
		expect(xml).toContain('https://aevani.com/blog/cycling-your-first-aquaponics-loop');
		expect(xml).toContain('In a dry climate, cooling can use more water than the plants');
		expect(xml).toContain('The seller fee is a flat 8%');
		expect(xml).toContain(blogDescription);
		expect(xml).not.toContain('nothing-for-sale-yet');
		expect(xml).not.toContain('Nothing for sale yet');
		expect(xml).not.toMatch(
			/primusneo|payout timing|when you get paid|when a seller is paid|etsy|growtsy|the-fee-that-didnt-move|no kits for sale/i
		);
		expect(xml).toContain('Escherbridge');
		expect(xml).not.toContain('railway.app');
		expect(xml).not.toContain('Aevani Admin');
		expect(publicRouteMetadata('/blog').description).toBe(blogDescription);
	});

	it('wires positive editorial copy and funnel links across public pages', async () => {
		const blog = await readFile(new URL('../../routes/blog/+page.svelte', import.meta.url), 'utf8');
		const learn = await readFile(
			new URL('../../routes/learn/+page.svelte', import.meta.url),
			'utf8'
		);
		const home = await readFile(new URL('../../routes/+page.svelte', import.meta.url), 'utf8');
		const sell = await readFile(new URL('../../routes/sell/+page.svelte', import.meta.url), 'utf8');
		const products = await readFile(
			new URL('../../routes/products/+page.svelte', import.meta.url),
			'utf8'
		);
		const cart = await readFile(new URL('../../routes/cart/+page.svelte', import.meta.url), 'utf8');
		const news = await readFile(new URL('../../routes/news/+page.svelte', import.meta.url), 'utf8');

		expect(blog).toContain('>Field notes</h1>');
		expect(blog).toContain('href="/sell"');
		expect(blog).not.toContain('Notes while the shop is empty.');
		expect(learn).toContain('>Guides and notes</h1>');
		expect(learn).not.toContain('Read while the beds are still empty.');
		expect(publicRouteMetadata('/learn').title).toBe('Learn — Aevani');
		expect(home).toContain('flat 8% commission');
		expect(sell).toContain("A flat 8%. That's the fee.");
		expect(sell).toContain('Card processing');
		expect(products).toContain('flat 8% commission');

		for (const pageCopy of [blog, learn, home, sell, products, cart, news]) {
			expect(pageCopy).not.toMatch(
				/primusneo|payout timing|when you get paid|when a seller is paid|the-fee-that-didnt-move|growtsy|etsy|nothing in it is for sale yet|catalogue is a preview/i
			);
		}
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
			'temperate-food-forest',
			'permaculture-guilds',
			'hugelkultur',
			'indoor-lighting-dli',
			'greenhouse-pollination',
			'winterizing-growing-systems',
			'soilless-food-safety',
			'soil-drip-irrigation',
			'frost-dates-hardiness',
			'rainwater-irrigation-quality',
			'outdoor-bed-ipm'
		]);
	});

	it('lists every published guide in the field-notes feed', () => {
		const xml = renderFieldNotesFeed('https://aevani.com');
		for (const guide of publishedGuideSectors) {
			expect(xml).toContain(guide.canonical);
			expect(xml).toContain(guide.title);
		}
		expect(xml).toContain('Escherbridge');
	});
});
