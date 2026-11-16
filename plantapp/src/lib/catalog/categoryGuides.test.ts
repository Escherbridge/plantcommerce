import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { publishedGuideSectors } from '$lib/content/research';
import { demoProducts } from '$lib/server/db/catalogDemo';
import { load as loadGuide } from '../../routes/guides/[slug]/+page';
import { categoryGuides, guideForCategory } from './categoryGuides';

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
		expect(page).toContain("sanitizeRichText(p.descriptionHtml || p.description || '')");
		expect(page).not.toContain('retargetHydroponicsFieldGuide');
		expect(page).not.toContain('retargetAquaponicsFieldGuide');
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
