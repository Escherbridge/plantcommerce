import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { publicRouteMetadata } from '$lib/config/site';
import { prelaunchSellerTerms } from '$lib/content/prelaunchPolicy';
import Shipping from '../../routes/shipping/+page.svelte';
import Returns from '../../routes/returns/+page.svelte';
import Warranty from '../../routes/warranty/+page.svelte';
import Faq from '../../routes/faq/+page.svelte';

const faqIntro = 'Answers to common questions about growing, our guides and selling on Aevani.';
const faqCloser =
	'Still stuck? Write to contact@escherbridge.com and a person will get back to you.';

function count(html: string, needle: string): number {
	return html.split(needle).length - 1;
}

function text(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();
}

describe('pre-launch policy and FAQ copy', () => {
	it('renders the seller-terms paragraph once on each policy page', () => {
		for (const page of [Shipping, Returns, Warranty]) {
			const html = render(page).body;
			expect(count(html, prelaunchSellerTerms)).toBe(1);
			expect(html).not.toContain('alert');
			expect(html).toContain('class="max-w-3xl text-lg text-base-content/70"');
		}
	});

	it('renders the FAQ intro and closer once, with the address as a mailto link', () => {
		const html = render(Faq, {
			props: {
				data: { faqs: [], selectedCategory: null } as unknown as ComponentProps<typeof Faq>['data']
			}
		}).body;
		expect(count(html, faqIntro)).toBe(1);
		expect(count(text(html), faqCloser)).toBe(1);
		expect(count(html, 'href="mailto:contact@escherbridge.com"')).toBe(1);
		expect(html).not.toContain('Our support team is here to help you');
		expect(html).not.toContain('Find answers to common questions about our products');
		expect(html).not.toContain('Still have questions?');
		expect(html).not.toContain('Contact Support');
	});

	it('keeps policy pages in the future tense and off live plants', () => {
		const shipping = render(Shipping).body;
		const returns = render(Returns).body;
		const warranty = render(Warranty).body;

		expect(text(shipping)).toContain(
			'When sellers join, independent seed houses, nurseries, and equipment makers will ship from their own benches and workshops.'
		);
		expect(text(shipping)).not.toMatch(/live plants/i);
		expect(text(shipping)).not.toContain('dry seed packets');
		expect(returns).toContain('will be shown on each listing when sellers join');
		expect(returns).not.toContain('shown clearly before checkout');
		expect(warranty).toContain('will be shown on each listing when sellers join');
		expect(warranty).not.toContain('confirmed before purchase');

		expect(publicRouteMetadata('/shipping').description).toBe(
			'When sellers join, each listing will show its own shipping rates, carriers and handling terms before checkout.'
		);
		expect(publicRouteMetadata('/returns').description).toBe(
			'When sellers join, return terms will be shown on each listing.'
		);
		expect(publicRouteMetadata('/warranty').description).toBe(
			'When sellers join, warranty terms will be shown on each listing.'
		);
	});

	it('leaves product pages and the nav alone', () => {
		const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
		const untouched = [
			'routes/products/[category]/[slug]/+page.svelte',
			'lib/components/navigation/Header.svelte',
			'routes/+layout.svelte'
		];
		for (const path of untouched) {
			const source = readFileSync(join(root, path), 'utf8');
			expect(source).not.toContain(prelaunchSellerTerms);
			expect(source).not.toContain(faqIntro);
			expect(source).not.toContain('Still stuck?');
		}
	});
});
