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
			}
		]);

		const stored =
			'<p>Read the <a href="/learn">hydroponics field guide</a>.</p>' +
			'<p>Start with the <a href="/learn">aquaponics field guide</a>.</p>' +
			'<p>See the <a href="/learn">silvopasture guide</a> and the <a href="/learn">Aevani learning hub</a>.</p>';
		const rewritten = rewriteProductGuideLinks(stored);
		expect(rewritten).toContain(
			'<a href="/guides/choosing-hydroponic-system">hydroponics field guide</a>'
		);
		expect(rewritten).toContain(
			'<a href="/guides/small-scale-aquaponics">aquaponics field guide</a>'
		);
		expect(rewritten).toContain('<a href="/learn">silvopasture guide</a>');
		expect(rewritten).toContain('<a href="/learn">Aevani learning hub</a>');
		expect(rewritten).not.toContain('href="/learn">hydroponics field guide');
		expect(rewritten).not.toContain('href="/learn">aquaponics field guide');

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

		for (const product of demoProducts) {
			expect(rewriteProductGuideLinks(product.descriptionHtml), product.slug).toBe(
				product.descriptionHtml
			);
		}
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
