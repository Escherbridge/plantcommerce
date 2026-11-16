import { describe, expect, it } from 'vitest';
import { demoProducts } from '$lib/server/db/catalogDemo';
import { normalizeCatalogProduct, buildParentSlugMap } from '../../routes/products/catalog';
import { normalizeProduct } from '../../routes/products/detail';
import {
	FAQ_DEAD_FISH,
	FAQ_TILAPIA_LEGAL,
	HERB_TAGLINE,
	isPlaceholderListing,
	isTimingOrPerformanceStat,
	presentPlaceholderListing,
	productStructuredData,
	sanitizePlaceholderProduct,
	sanitizePlaceholderRow,
	SHIPPING_SPEC,
	TILAPIA_TAGLINE,
	visibleCatalogueBadges
} from './placeholderListing';

describe('placeholder catalogue presentation', () => {
	it('treats null, true, and a missing flag as a preview, and false as a sale', () => {
		expect(isPlaceholderListing({ comingSoon: null })).toBe(true);
		expect(isPlaceholderListing({ comingSoon: true })).toBe(true);
		expect(isPlaceholderListing({})).toBe(true);
		expect(isPlaceholderListing(undefined)).toBe(true);
		expect(isPlaceholderListing({ comingSoon: false })).toBe(false);
	});

	it('drops stock, bestseller, and live badges without adding a Preview badge', () => {
		expect(
			visibleCatalogueBadges(['BESTSELLER', 'IN STOCK', 'LIVE', 'GIFT', 'Great first kit'])
		).toEqual(['GIFT', 'Great first kit']);
		expect(presentPlaceholderListing({ badges: ['LIVE', 'Bestseller'] }).badges).toEqual([]);
	});

	it('replaces the tilapia overnight-shipping listing with the example lines', () => {
		const presented = presentPlaceholderListing({
			slug: 'tilapia-fingerlings-starter-pack',
			name: 'Tilapia Fingerlings Starter Pack',
			comingSoon: null,
			shortDescription: 'Live Nile tilapia with overnight shipping and acclimation guide.',
			descriptionHtml:
				'<p>Each order is a live shipment of fingerlings packed with oxygen and shipped overnight, before they arrive.</p><p>Cycle the tank first so the biofilter can handle ammonia.</p>',
			keyFeatures: [
				'Overnight shipping with oxygen packs',
				'Live-arrival guarantee',
				'Acclimation guide'
			],
			stats: [
				{ value: '8–10 mo', label: 'to 1–1.5 lb harvest size' },
				{ value: '50', label: 'fingerlings in the example' }
			],
			specs: [{ label: 'Shipping', value: 'Overnight, Mon–Wed, oxygen-packed' }],
			faqs: [
				{ q: 'What if fish arrive dead?', a: 'We replace dead fish for free.' },
				{ q: 'Is tilapia legal in my state?', a: 'Check your state list.' }
			],
			badges: ['LIVE', 'IN STOCK'],
			testBedNote:
				'Honest note: do not add fingerlings to an uncycled tank. Ammonia from day-one fish in a system without an established biofilter is the most common way beginners lose their first batch — cycle first.'
		});

		expect(presented.shortDescription).toBe(TILAPIA_TAGLINE);
		expect(presented.badges).toEqual([]);
		expect(presented.keyFeatures).toEqual(['Acclimation guide']);
		expect(presented.descriptionHtml).toBe(
			'<p>Cycle the tank first so the biofilter can handle ammonia.</p>'
		);
		expect(presented.stats).toEqual([{ value: '50', label: 'fingerlings in the example' }]);
		expect(presented.specs).toEqual([{ label: 'Shipping', value: SHIPPING_SPEC }]);
		expect(presented.faqs[0]?.a).toBe(FAQ_DEAD_FISH);
		expect(presented.faqs[1]?.a).toBe(FAQ_TILAPIA_LEGAL);
		expect(presented.testBedNote).toMatch(/cycle first/i);
		expect(JSON.stringify(presented)).not.toMatch(/overnight|live-arrival|oxygen pack/i);
	});

	it('replaces the medicinal herb tagline and drops the arrival claim', () => {
		const presented = presentPlaceholderListing({
			slug: 'medicinal-herb-garden-kit',
			name: 'Medicinal Herb Garden Kit',
			shortDescription: '6 live herb starters with care cards and preparation guide.',
			descriptionHtml:
				'<p>Six live starters — lavender, chamomile, echinacea, peppermint, lemon balm, and calendula — arrive in biodegradable coir pots, each with a care card.</p>',
			keyFeatures: ['6 live medicinal herb starters', 'Care card for each herb'],
			inTheBox: ['6 live herb starters', '6 care cards'],
			specs: [{ label: 'Form', value: 'Live starters in coir pots' }],
			testBedNote:
				'Honest note: peppermint and lemon balm are vigorous spreaders. Keep them in their own pots or a contained bed, or they will crowd the slower herbs like echinacea right out.'
		});

		expect(presented.shortDescription).toBe(HERB_TAGLINE);
		expect(presented.descriptionHtml).not.toMatch(/arrive/i);
		expect(presented.keyFeatures).toEqual(['6 herb starters', 'Care card for each herb']);
		expect(presented.inTheBox).toEqual(['6 herb starters', '6 care cards']);
		expect(presented.specs[0]?.value).toBe('Starters in coir pots');
		expect(presented.testBedNote).toMatch(/peppermint and lemon balm/);
	});

	it('keeps factual counts and drops timing and harvest tiles', () => {
		expect(isTimingOrPerformanceStat({ value: '6', label: 'parameters covered' })).toBe(false);
		expect(isTimingOrPerformanceStat({ value: '150+', label: 'tests per parameter' })).toBe(false);
		expect(isTimingOrPerformanceStat({ value: '5 min', label: 'to a full water reading' })).toBe(
			true
		);
		expect(isTimingOrPerformanceStat({ value: '8–10 mo', label: 'to 1–1.5 lb harvest size' })).toBe(
			true
		);
		expect(
			isTimingOrPerformanceStat({
				value: '~3 wks',
				label: 'from seedling to first lettuce harvest in our test room'
			})
		).toBe(true);

		const presented = presentPlaceholderListing({
			slug: 'aquaponics-water-testing-kit',
			name: 'Aquaponics Water Testing Kit',
			shortDescription: '6 parameters, 150+ tests, and a plain-language reference.',
			stats: [
				{ value: '6', label: 'parameters covered' },
				{ value: '150+', label: 'tests per parameter' },
				{ value: '5 min', label: 'to a full water reading' }
			],
			testBedNote:
				'Honest note: reagent bottles have a shelf life. Note the date you open them — old ammonia reagent reads falsely low, which is exactly the wrong direction to be wrong in.'
		});

		expect(presented.stats).toEqual([
			{ value: '6', label: 'parameters covered' },
			{ value: '150+', label: 'tests per parameter' }
		]);
		expect(presented.testBedNote).toMatch(/shelf life/);
		expect(presented.shortDescription).toBe(
			'6 parameters, 150+ tests, and a plain-language reference.'
		);
	});

	it('leaves a real sale untouched', () => {
		const sale = presentPlaceholderListing({
			slug: 'real-tower',
			name: 'Real tower',
			comingSoon: false,
			shortDescription: 'In stock and ready.',
			badges: ['IN STOCK'],
			stats: [{ value: '5 min', label: 'to a full water reading' }],
			price: '10.00'
		} as Parameters<typeof presentPlaceholderListing>[0]);

		expect(sale.shortDescription).toBe('In stock and ready.');
		expect(sale.badges).toEqual(['IN STOCK']);
		expect(sale.stats).toHaveLength(1);
	});

	it('omits Offer, price, and availability from placeholder Product JSON-LD', () => {
		const node = productStructuredData({
			name: 'Aquaponics Water Testing Kit',
			description: '6 parameters, 150+ tests, and a plain-language reference.',
			image: 'https://aevani.com/kit.png',
			placeholder: true,
			price: '34.99',
			inStock: true,
			url: 'https://aevani.com/products/aquaponics/aquaponics-water-testing-kit'
		});

		expect(node['@type']).toBe('Product');
		expect(node.name).toBe('Aquaponics Water Testing Kit');
		expect(node.description).toMatch(/6 parameters/);
		expect(node).not.toHaveProperty('offers');
		expect(JSON.stringify(node)).not.toMatch(/34\.99|availability|Offer/);
	});

	it('keeps an Offer only for an actual sale', () => {
		const node = productStructuredData({
			name: 'Tower',
			description: 'A real listing.',
			placeholder: false,
			price: '349.99',
			priceCurrency: 'usd',
			inStock: true,
			url: 'https://aevani.com/products/hydroponics/vertical-tower-garden-system'
		});

		expect(node.offers).toMatchObject({
			'@type': 'Offer',
			price: '349.99',
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock'
		});
	});

	it('strips sale fields from placeholder page data before it is serialized', () => {
		const raw = {
			id: 7,
			name: 'Tilapia Fingerlings Starter Pack',
			slug: 'tilapia-fingerlings-starter-pack',
			comingSoon: null,
			price: '59.99',
			comparePrice: '79.99',
			costPrice: '20.00',
			stockQuantity: 40,
			reservedQuantity: 2,
			badges: ['IN STOCK', 'BESTSELLER'],
			shortDescription: 'Live Nile tilapia with overnight shipping and acclimation guide.',
			description:
				'Each order is a live shipment of fingerlings packed with oxygen and shipped overnight. Cycle the tank first.',
			metaDescription: 'Live Nile tilapia with overnight shipping and an acclimation guide.',
			keyFeatures: [
				'Overnight shipping with oxygen packs',
				'Live-arrival guarantee',
				'Acclimation guide'
			],
			specs: [{ label: 'Shipping', value: 'Overnight, Mon–Wed, oxygen-packed' }],
			bundleOffer: { title: 'Bundle', price: '70.00', compareAt: '90.00', blurb: 'Save' },
			images: [{ url: '/fish.png', altText: 'Live Nile tilapia with overnight shipping.' }]
		};

		const pageProduct = normalizeProduct(raw);
		const catalogue = normalizeCatalogProduct(
			{ product: raw, category: { id: 3, name: 'Fish & Supplies', slug: 'fish-supplies' } },
			buildParentSlugMap([
				{ id: 1, slug: 'aquaponics', parentId: null },
				{ id: 3, slug: 'fish-supplies', parentId: 1, name: 'Fish & Supplies' }
			])
		);
		const searchRow = sanitizePlaceholderRow({
			product: raw,
			category: { id: 3, slug: 'fish-supplies', name: 'Fish & Supplies' }
		});
		const serialized = JSON.stringify({
			pageProduct,
			catalogue,
			searchRow,
			direct: sanitizePlaceholderProduct(raw)
		});

		expect(serialized).not.toMatch(/IN STOCK|BESTSELLER/i);
		expect(serialized).not.toMatch(/overnight/i);
		expect(serialized).not.toMatch(/59\.99|79\.99|20\.00|70\.00|90\.00/);
		expect(serialized).not.toMatch(/"stockQuantity":\s*(?!null)/);
		expect(serialized).not.toMatch(/"reservedQuantity":\s*(?!null)/);
		expect(pageProduct.shortDescription).toBe(TILAPIA_TAGLINE);
		expect(pageProduct.keyFeatures).toEqual(['Acclimation guide']);
		expect(pageProduct.price).toBeNull();
		expect(pageProduct.bundleOffer).toBeNull();
		expect(catalogue.price).toBeNull();
		expect(catalogue.badges).toEqual([]);
	});

	it('strips leftover sale claims from every demo catalogue row', () => {
		for (const product of demoProducts) {
			const presented = presentPlaceholderListing(product);
			const blob = JSON.stringify(presented);
			expect(blob, product.slug).not.toMatch(/overnight/i);
			expect(blob, product.slug).not.toMatch(/live-arrival/i);
			expect(blob, product.slug).not.toMatch(/test bed/i);
			expect(blob, product.slug).not.toMatch(/field-tested/i);
			expect(blob, product.slug).not.toMatch(/\bwe ship\b/i);
			expect(blob, product.slug).not.toMatch(/\bships with\b/i);
			expect(blob, product.slug).not.toMatch(/\bwe replace\b/i);
			expect(blob, product.slug).not.toMatch(/warranty/i);
			expect(blob, product.slug).not.toMatch(/test room/i);
		}

		const herb = demoProducts.find((product) => product.slug === 'medicinal-herb-garden-kit');
		expect(presentPlaceholderListing(herb ?? {}).shortDescription).toBe(HERB_TAGLINE);
	});
});
