import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { demoProducts } from '$lib/server/db/catalogDemo';
import { categoryGuides, guideForCategory, retargetHydroponicsFieldGuide } from './categoryGuides';

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

	it('points the hydroponics field guide at the choosing guide and leaves other copy', () => {
		const html = '<p>Read the <a href="/learn">hydroponics field guide</a>.</p>';
		expect(retargetHydroponicsFieldGuide(html)).toBe(
			'<p>Read the <a href="/guides/choosing-hydroponic-system">hydroponics field guide</a>.</p>'
		);
		const untouched = '<p>Read the <a href="/learn">aquaponics field guide</a>.</p>';
		expect(retargetHydroponicsFieldGuide(untouched)).toBe(untouched);
		expect(retargetHydroponicsFieldGuide('The field guide covers collection timing.')).toBe(
			'The field guide covers collection timing.'
		);
	});

	it('updates the demo long read and leaves specs and FAQs alone', () => {
		const linked = demoProducts.filter((product) =>
			product.descriptionHtml.includes('hydroponics field guide')
		);
		expect(linked.length).toBeGreaterThan(0);
		for (const product of linked) {
			expect(product.descriptionHtml).toContain(
				'<a href="/guides/choosing-hydroponic-system">hydroponics field guide</a>'
			);
			expect(product.descriptionHtml).not.toContain('<a href="/learn">hydroponics field guide</a>');
		}
		for (const product of demoProducts) {
			expect(JSON.stringify(product.specs), product.slug).not.toContain(
				'/guides/choosing-hydroponic-system'
			);
			expect(JSON.stringify(product.faqs), product.slug).not.toContain(
				'/guides/choosing-hydroponic-system'
			);
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
		expect(page).toContain('retargetHydroponicsFieldGuide');
	});
});
