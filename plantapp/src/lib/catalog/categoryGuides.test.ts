import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { publishedGuideSectors } from '$lib/content/research';
import { demoProducts } from '$lib/server/db/catalogDemo';
import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
import { load as loadGuide } from '../../routes/guides/[slug]/+page';
import {
	categoryGuides,
	guideForCategory,
	guideForProduct,
	productGuideLinks,
	rewriteProductGuideLinks
} from './categoryGuides';

describe('product category guides', () => {
	it('maps each catalogue category to one guide', () => {
		expect(guideForCategory('hydroponics')).toEqual(categoryGuides.hydroponics);
		expect(guideForCategory('hydroponic-systems')?.href).toBe('/guides/choosing-hydroponic-system');
		expect(guideForCategory('nutrients-media')?.href).toBe('/guides/choosing-hydroponic-system');
		expect(guideForCategory('aquaponics')?.href).toBe('/guides/small-scale-aquaponics');
		expect(guideForCategory('fish-supplies')?.label).toBe('Small-scale aquaponics');
		expect(guideForCategory('silvopasture')?.href).toBe('/guides/temperate-silvopasture');
		expect(guideForCategory('agroforestry')?.href).toBe('/guides/temperate-food-forest');
		expect(guideForCategory('kits')?.href).toBe('/guides/permaculture-guilds');
		expect(guideForCategory('composting')?.href).toBe('/guides/permaculture-guilds');
		expect(guideForCategory('supplies')?.href).toBe('/guides/raised-beds');
		expect(guideForCategory('heirloom-seeds')?.href).toBe('/guides/raised-beds');
		expect(guideForCategory('hand-tools')?.href).toBe('/guides/raised-beds');
		expect(guideForCategory('missing')).toBeNull();
	});

	it('stores the hydroponics and aquaponics field-guide hrefs on the real guides', () => {
		const hydro = demoProducts.filter((product) =>
			product.descriptionHtml.includes('hydroponics field guide')
		);
		expect(hydro.length).toBeGreaterThan(0);
		for (const product of hydro) {
			expect(product.descriptionHtml, product.slug).toContain(
				'<a href="/guides/choosing-hydroponic-system">hydroponics field guide</a>'
			);
			expect(product.descriptionHtml, product.slug).not.toContain('href="/learn"');
		}

		const aqua = demoProducts.filter((product) =>
			product.descriptionHtml.includes('aquaponics field guide')
		);
		expect(aqua.map((product) => product.slug)).toContain('ibc-aquaponics-fish-tank');
		for (const product of aqua) {
			expect(product.descriptionHtml, product.slug).toContain(
				'<a href="/guides/small-scale-aquaponics">aquaponics field guide</a>'
			);
			expect(product.descriptionHtml, product.slug).not.toContain('href="/learn"');
		}

		for (const product of demoProducts) {
			expect(JSON.stringify(product.specs), product.slug).not.toContain('/guides/');
			expect(JSON.stringify(product.faqs), product.slug).not.toContain('aquaponics field guide');
			expect(JSON.stringify(product.faqs), product.slug).not.toContain('hydroponics field guide');
		}
	});

	it('keeps the preview line and adds the guide and sell links under it', () => {
		const page = readFileSync(
			join(
				dirname(fileURLToPath(import.meta.url)),
				'../../routes/products/[category]/[slug]/+page.svelte'
			),
			'utf8'
		);
		expect(page).toContain(
			"This listing is a preview. We're onboarding growers and makers, so it isn't available"
		);
		expect(page).toContain('to purchase yet.');
		expect(page).toContain('href={nextGuide.href}');
		expect(page).toContain('Make something like this?');
		expect(page).toContain('href="/sell">Apply to sell it on Aevani.</a>');
		expect(page).toContain(
			"sanitizeRichText(rewriteProductGuideLinks(p.descriptionHtml || p.description || ''))"
		);
		const productGuide = page.indexOf('guideForProduct(p.slug)');
		const categoryGuide = page.indexOf('guideForCategory(p.category?.slug)');
		expect(productGuide).toBeGreaterThan(-1);
		expect(categoryGuide).toBeGreaterThan(productGuide);
	});

	it('points the tower preview at the vertical growing guide', () => {
		expect(guideForProduct('vertical-tower-garden-system')).toEqual({
			href: '/guides/vertical-growing',
			label: 'Vertical hydroponic growing: density and light'
		});
		expect(guideForProduct('nft-hydroponic-channel-system')).toBeNull();
		expect(guideForProduct('ibc-aquaponics-fish-tank')).toBeNull();
		expect(guideForProduct(null)).toBeNull();
	});

	it('overrides a product preview only when a published guide fits', () => {
		const live = new Set(publishedGuideSectors.map((guide) => `/guides/${guide.slug}`));
		expect(guideForProduct('soil-building-amendment-kit')).toEqual({
			href: '/guides/no-dig-sheet-mulch',
			label: 'No-dig beds and sheet mulching'
		});
		expect(guideForProduct('rainwater-harvesting-kit')).toEqual({
			href: '/guides/rainwater-irrigation-quality',
			label: 'Harvesting rainwater for garden irrigation'
		});
		expect(guideForProduct('season-extension-kit')).toEqual({
			href: '/guides/season-extension-covers-frames',
			label: 'Row covers, low tunnels, and cold frames'
		});
		expect(guideForProduct('rockwool-cubes-growing-media-sampler')).toEqual({
			href: '/guides/hydroponic-media',
			label: 'Soilless hydroponic media: perlite, rockwool, and coir'
		});
		for (const guide of [
			guideForProduct('soil-building-amendment-kit'),
			guideForProduct('rainwater-harvesting-kit'),
			guideForProduct('season-extension-kit'),
			guideForProduct('rockwool-cubes-growing-media-sampler'),
			guideForProduct('vertical-tower-garden-system')
		]) {
			expect(live.has(guide?.href ?? ''), guide?.href).toBe(true);
		}

		// No published guide is a better fit, so these stay on the category default.
		for (const slug of [
			'mushroom-cultivation-kit',
			'microgreens-growing-kit',
			'worm-composting-vermicompost-kit',
			'composting-starter-kit',
			'seed-saving-starter-kit',
			'hand-forged-garden-trowel',
			'pollinator-garden-seed-collection',
			'herb-spiral-garden-kit',
			'permaculture-starter-kit',
			'aeroponic-misting-system'
		]) {
			expect(guideForProduct(slug), slug).toBeNull();
		}
	});

	it('rewrites stored field-guide hrefs from the link text and the old /learn href', () => {
		expect(productGuideLinks).toEqual([
			{
				text: 'hydroponics field guide',
				from: '/learn',
				href: '/guides/choosing-hydroponic-system'
			},
			{
				text: 'aquaponics field guide',
				from: '/learn',
				href: '/guides/small-scale-aquaponics'
			},
			{
				text: 'silvopasture guide',
				from: '/learn',
				href: '/guides/temperate-silvopasture'
			},
			{
				text: 'soil-health guide',
				from: '/learn',
				href: '/guides/no-dig-sheet-mulch'
			},
			{
				text: 'silvopasture &amp; agroforestry guide',
				from: '/learn',
				href: '/guides/temperate-food-forest',
				textTo: 'food forest guide'
			},
			{
				text: 'soil-health guide',
				from: '/learn',
				alsoFrom: ['/guides/understanding-soil-health'],
				href: '/guides/no-dig-sheet-mulch',
				context: 'why behind each one',
				paragraph:
					'For how a bed is built from compost layers and worm castings, see the <a href="/guides/no-dig-sheet-mulch">no-dig guide</a>.'
			},
			{
				text: 'hydroponics field guide',
				from: '/guides/choosing-hydroponic-system',
				href: '/guides/hydroponic-ec-ph-nutrients',
				context: 'target ranges by crop'
			},
			{
				text: 'hydroponics field guide',
				from: '/guides/choosing-hydroponic-system',
				href: '/guides/nutrient-film-technique',
				context: 'nft spacing and flow'
			},
			{
				text: 'hydroponics field guide',
				from: '/guides/choosing-hydroponic-system',
				href: '/guides/indoor-lighting-dli',
				context: 'airflow, humidity, and light height',
				paragraph:
					'Dialing in your first environment? The <a href="/guides/indoor-lighting-dli">indoor lighting guide</a> covers daily light for greens.'
			},
			{
				text: 'hydroponics field guide',
				from: '/guides/choosing-hydroponic-system',
				context: 'aeroponics chapter',
				paragraph:
					'Ready to push technique? None of the published guides includes an aeroponics chapter.'
			}
		]);
		const live = new Set(publishedGuideSectors.map((guide) => `/guides/${guide.slug}`));
		for (const rule of productGuideLinks) {
			if (rule.href) expect(live.has(rule.href), rule.href).toBe(true);
		}

		const stored =
			'<p>Read the <a href="/learn">hydroponics field guide</a>.</p>' +
			'<p>Start with the <a href="/learn">aquaponics field guide</a>.</p>' +
			'<p>See the <a href="/learn">silvopasture guide</a>, the <a href="/learn">soil-health guide</a>, and the <a href="/learn">silvopasture &amp; agroforestry guide</a>.</p>' +
			'<p>The <a href="/learn">Aevani learning hub</a> stays put.</p>';
		const rewritten = rewriteProductGuideLinks(stored);
		expect(rewritten).toContain(
			'<a href="/guides/choosing-hydroponic-system">hydroponics field guide</a>'
		);
		expect(rewritten).toContain(
			'<a href="/guides/small-scale-aquaponics">aquaponics field guide</a>'
		);
		expect(rewritten).toContain('<a href="/guides/temperate-silvopasture">silvopasture guide</a>');
		expect(rewritten).toContain('<a href="/guides/no-dig-sheet-mulch">soil-health guide</a>');
		expect(rewritten).toContain('<a href="/guides/temperate-food-forest">food forest guide</a>');
		expect(rewritten).toContain('<a href="/learn">Aevani learning hub</a>');
		expect(rewritten).not.toContain('href="/learn">hydroponics field guide');
		expect(rewritten).not.toContain('href="/learn">aquaponics field guide');
		expect(rewritten).not.toContain('href="/learn">silvopasture guide');
		expect(rewritten).not.toContain('href="/learn">soil-health guide');
		expect(rewritten).not.toContain('silvopasture &amp; agroforestry guide');

		expect(
			rewriteProductGuideLinks(
				'<a href="/learn" rel="noopener noreferrer">hydroponics field guide</a>'
			)
		).toBe(
			'<a href="/guides/choosing-hydroponic-system" rel="noopener noreferrer">hydroponics field guide</a>'
		);
		expect(rewriteProductGuideLinks(`<a href='/learn'> Aquaponics   Field Guide </a>`)).toBe(
			`<a href='/guides/small-scale-aquaponics'> Aquaponics   Field Guide </a>`
		);
		expect(
			rewriteProductGuideLinks('<a href="https://aevani.com/learn/">aquaponics field guide</a>')
		).toBe('<a href="/guides/small-scale-aquaponics">aquaponics field guide</a>');

		const already =
			'<p>Our <a href="/guides/choosing-hydroponic-system">hydroponics field guide</a> and <a href="/guides/vertical-growing">vertical growing guide</a>.</p>';
		expect(rewriteProductGuideLinks(already)).toBe(already);
		expect(
			rewriteProductGuideLinks(
				'<a href="/guides/nutrient-film-technique">hydroponics field guide</a>'
			)
		).toBe('<a href="/guides/nutrient-film-technique">hydroponics field guide</a>');
		expect(rewriteProductGuideLinks('The field guide covers collection timing.')).toBe(
			'The field guide covers collection timing.'
		);
		expect(rewriteProductGuideLinks('')).toBe('');
		expect(
			sanitizeRichText(rewriteProductGuideLinks('<a href="/learn">hydroponics field guide</a>'))
		).toBe(
			'<a href="/guides/choosing-hydroponic-system" rel="noopener noreferrer">hydroponics field guide</a>'
		);
		expect(
			sanitizeRichText(rewriteProductGuideLinks('<a href="/learn">aquaponics field guide</a>'))
		).toBe(
			'<a href="/guides/small-scale-aquaponics" rel="noopener noreferrer">aquaponics field guide</a>'
		);

		const retargeted = new Map<string, string>([
			['silvopasture-seed-mix', '/guides/temperate-silvopasture'],
			['portable-electric-netting-164-ft', '/guides/temperate-silvopasture'],
			['tree-shelters-protectors-25-pack', '/guides/temperate-silvopasture'],
			['chestnut-tree-seedlings-10-pack', '/guides/temperate-food-forest'],
			['soil-building-amendment-kit', '/guides/no-dig-sheet-mulch']
		]);
		const rewrittenInPlace = new Set([
			'hydroponic-grow-tent-kit',
			'aeroponic-misting-system',
			'nft-hydroponic-channel-system',
			'digital-ph-ec-meter-set',
			'rockwool-cubes-growing-media-sampler'
		]);
		for (const product of demoProducts) {
			const rewritten = rewriteProductGuideLinks(product.descriptionHtml);
			expect(rewriteProductGuideLinks(rewritten), product.slug).toBe(rewritten);
			const target = retargeted.get(product.slug);
			if (target) {
				expect(product.descriptionHtml, product.slug).toContain('href="/learn"');
				expect(rewritten, product.slug).toContain(`href="${target}"`);
				expect(rewritten, product.slug).not.toContain('href="/learn"');
				continue;
			}
			if (rewrittenInPlace.has(product.slug)) continue;
			expect(rewritten, product.slug).toBe(product.descriptionHtml);
		}
	});

	it('points the remaining stored /learn anchors at specific guides', () => {
		for (const slug of [
			'silvopasture-seed-mix',
			'portable-electric-netting-164-ft',
			'tree-shelters-protectors-25-pack'
		]) {
			const product = demoProducts.find((entry) => entry.slug === slug);
			expect(product?.descriptionHtml, slug).toContain('<a href="/learn">silvopasture guide</a>');
			expect(rewriteProductGuideLinks(product?.descriptionHtml ?? ''), slug).toContain(
				'<a href="/guides/temperate-silvopasture">silvopasture guide</a>'
			);
		}

		const soil = demoProducts.find((product) => product.slug === 'soil-building-amendment-kit');
		expect(soil?.descriptionHtml).toContain('<a href="/learn">soil-health guide</a>');
		expect(soil?.descriptionHtml).toContain('breaks it down');
		const soilRewritten = rewriteProductGuideLinks(soil?.descriptionHtml ?? '');
		expect(soilRewritten).toContain('<a href="/guides/no-dig-sheet-mulch">no-dig guide</a>');
		expect(soilRewritten).not.toContain('understanding-soil-health');
		expect(soilRewritten).not.toContain('breaks it down');
		expect(soilRewritten).toContain('compost layers and worm castings');

		expect(
			rewriteProductGuideLinks('<a href="/learn" rel="noopener noreferrer">silvopasture guide</a>')
		).toBe(
			'<a href="/guides/temperate-silvopasture" rel="noopener noreferrer">silvopasture guide</a>'
		);
		expect(rewriteProductGuideLinks(`<a href='/learn'> Soil-Health   Guide </a>`)).toBe(
			`<a href='/guides/no-dig-sheet-mulch'> Soil-Health   Guide </a>`
		);
		expect(
			rewriteProductGuideLinks(
				'<a href="https://aevani.com/learn?topic=soil">soil-health guide</a>'
			)
		).toBe('<a href="/guides/no-dig-sheet-mulch">soil-health guide</a>');
		expect(
			rewriteProductGuideLinks('<a href="/guides/understanding-soil-health">soil-health guide</a>')
		).toBe('<a href="/guides/understanding-soil-health">soil-health guide</a>');
		expect(
			rewriteProductGuideLinks(
				'<p>Want the why behind each one? The <a href="/guides/understanding-soil-health">soil-health guide</a> breaks it down.</p>'
			)
		).toBe(
			'<p>For how a bed is built from compost layers and worm castings, see the <a href="/guides/no-dig-sheet-mulch">no-dig guide</a>.</p>'
		);
		expect(
			rewriteProductGuideLinks('<a href="/products/silvopasture">silvopasture guide</a>')
		).toBe('<a href="/products/silvopasture">silvopasture guide</a>');

		const chestnut = demoProducts.find(
			(product) => product.slug === 'chestnut-tree-seedlings-10-pack'
		);
		expect(chestnut?.descriptionHtml).toContain(
			'<a href="/learn">silvopasture &amp; agroforestry guide</a>'
		);
		expect(rewriteProductGuideLinks(chestnut?.descriptionHtml ?? '')).toContain(
			'<a href="/guides/temperate-food-forest">food forest guide</a>'
		);
		expect(rewriteProductGuideLinks(chestnut?.descriptionHtml ?? '')).not.toContain(
			'silvopasture &amp; agroforestry guide'
		);
		expect(
			rewriteProductGuideLinks(
				'<a href="/learn" rel="noopener noreferrer">silvopasture &amp; agroforestry guide</a>'
			)
		).toBe(
			'<a href="/guides/temperate-food-forest" rel="noopener noreferrer">food forest guide</a>'
		);

		for (const slug of ['permaculture-starter-kit', 'heirloom-tomato-collection'] as const) {
			const product = demoProducts.find((entry) => entry.slug === slug);
			expect(product?.descriptionHtml, slug).toContain('<a href="/learn">Aevani learning hub</a>');
			expect(rewriteProductGuideLinks(product?.descriptionHtml ?? ''), slug).toContain(
				'<a href="/learn">Aevani learning hub</a>'
			);
		}
	});

	it('retargets hydroponic long reads that promise a topic the system guide does not cover', () => {
		const tent = demoProducts.find((product) => product.slug === 'hydroponic-grow-tent-kit');
		expect(tent?.descriptionHtml).toContain(
			'<a href="/guides/choosing-hydroponic-system">hydroponics field guide</a> covers airflow, humidity, and light height.'
		);
		const tentRewritten = rewriteProductGuideLinks(tent?.descriptionHtml ?? '');
		expect(tentRewritten).toContain(
			'<a href="/guides/indoor-lighting-dli">indoor lighting guide</a> covers daily light for greens.'
		);
		expect(tentRewritten).not.toContain('airflow, humidity, and light height');
		expect(tentRewritten).not.toContain('/guides/choosing-hydroponic-system');

		const nft = demoProducts.find((product) => product.slug === 'nft-hydroponic-channel-system');
		expect(rewriteProductGuideLinks(nft?.descriptionHtml ?? '')).toContain(
			'<a href="/guides/nutrient-film-technique">hydroponics field guide</a> covers NFT spacing and flow rates.'
		);

		const meter = demoProducts.find((product) => product.slug === 'digital-ph-ec-meter-set');
		expect(rewriteProductGuideLinks(meter?.descriptionHtml ?? '')).toContain(
			'<a href="/guides/hydroponic-ec-ph-nutrients">hydroponics field guide</a> lists target ranges by crop.'
		);

		const media = demoProducts.find(
			(product) => product.slug === 'rockwool-cubes-growing-media-sampler'
		);
		expect(media?.descriptionHtml).not.toContain('/guides/');
		const mediaRewritten = rewriteProductGuideLinks(media?.descriptionHtml ?? '');
		expect(mediaRewritten).toContain(
			'<a href="/guides/hydroponic-media">hydroponic media guide</a>'
		);
		expect(mediaRewritten).toContain('Perlite, rockwool, and coir are covered');
		expect(mediaRewritten).not.toContain('/guides/choosing-hydroponic-system');

		const aeroponics = demoProducts.find((product) => product.slug === 'aeroponic-misting-system');
		expect(aeroponics?.descriptionHtml).toContain('has a full aeroponics chapter');
		const aeroponicsRewritten = rewriteProductGuideLinks(aeroponics?.descriptionHtml ?? '');
		expect(aeroponicsRewritten).toContain(
			'Ready to push technique? None of the published guides includes an aeroponics chapter.'
		);
		expect(aeroponicsRewritten).not.toContain('has a full aeroponics chapter');
		expect(aeroponicsRewritten).not.toContain('/guides/choosing-hydroponic-system');
		expect(aeroponicsRewritten).toContain('Aeroponics suspends roots');

		const dwc = demoProducts.find((product) => product.slug === 'deep-water-culture-bucket-system');
		expect(rewriteProductGuideLinks(dwc?.descriptionHtml ?? '')).toBe(dwc?.descriptionHtml);
		expect(dwc?.descriptionHtml).toContain(
			'<a href="/guides/choosing-hydroponic-system">hydroponics field guide</a>'
		);
	});

	it('points the tower long read at the published vertical growing guide', async () => {
		const guide = publishedGuideSectors.find((entry) => entry.slug === 'vertical-growing');
		expect(guide?.canonical).toBe('https://aevani.com/guides/vertical-growing');
		const loaded = await loadGuide({
			params: { slug: 'vertical-growing' }
		} as Parameters<typeof loadGuide>[0]);
		expect(loaded).toMatchObject({ sector: { slug: 'vertical-growing' }, guide: null });

		const tower = demoProducts.find((product) => product.slug === 'vertical-tower-garden-system');
		expect(tower?.descriptionHtml).toContain(
			'<a href="/guides/vertical-growing">vertical growing guide</a>'
		);
		expect(tower?.descriptionHtml).not.toContain('/guides/choosing-hydroponic-system');
		expect(tower?.descriptionHtml).not.toContain('href="/learn"');
	});
});
