import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { publicIndexablePaths } from '$lib/config/site';
import { _publishedContentPaths } from '../../routes/sitemap.xml/+server';
import { renderLlmsTxt } from './llms';

const applyLine =
	'- Apply to sell: a short web form at https://aevani.com/sell. There is no public API, and applications are read by a person.';

describe('llms.txt', () => {
	it('maps real public URLs and does not invent a store, affiliate program, or address', () => {
		const text = renderLlmsTxt();
		const allowed = new Set<string>([
			...publicIndexablePaths,
			..._publishedContentPaths(),
			'/feed.xml',
			'/sitemap.xml'
		]);

		expect(text).toContain('Author: Escherbridge');
		expect(text).toContain('Operator: Escherbridge, LLC');
		expect(text).toContain('flat 8%');
		expect(text).toContain('There are no affiliate programs.');
		expect(text).toContain('Catalogue items are placeholders and are not for sale.');
		expect(text).toContain(applyLine);
		expect(text).not.toMatch(/https:\/\/aevani\.com\/(?:sell\/apply|apply|seller)\b/);
		const sellPage = readFileSync(
			new URL('../../routes/sell/+page.svelte', import.meta.url),
			'utf8'
		);
		expect(sellPage).toMatch(/<form\b[^>]*method="POST"/);
		expect(text).toContain('https://aevani.com/guides');
		expect(text).toContain('https://aevani.com/blog/cooling-can-use-more-water-than-the-crop');
		expect(text).toContain('https://plantgeo.aevani.com');
		expect(text).not.toMatch(
			/railway\.app|instagram|facebook|affiliate program is open|for sale now/i
		);
		expect(text).not.toMatch(/\b\d{5}(?:-\d{4})?\b/);
		expect(text).not.toMatch(/\b(?:Street|Avenue|Boulevard|Road|Drive|Lane)\b/);

		for (const match of text.matchAll(/https:\/\/aevani\.com(\/[^\s)]*)?/g)) {
			const path =
				match[1] && match[1] !== '/' ? match[1].replace(/[.,;:]+$/, '').replace(/\/+$/, '') : '/';
			expect(allowed.has(path), path).toBe(true);
		}
	});
});
