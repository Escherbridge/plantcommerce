import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isPublicIndexablePath, layoutOwnsDocumentMeta } from '$lib/config/site';
import { renderLlmsTxt } from './llms';
import {
	renderWhitePaperDocument,
	whitePaperFooterTemplate,
	whitePaperHeaderTemplate
} from './whitePaperPrint';
import {
	WHITE_PAPER_OPERATOR_LINE,
	isPublishedWhitePaperPath,
	publishedWhitePaperPaths,
	publishedWhitePapers,
	whitePaperBySlug,
	whitePaperLlmsEntries,
	whitePaperProblems,
	whitePapers,
	type WhitePaper
} from './white-papers';

const here = dirname(fileURLToPath(import.meta.url));

function source(relativePath: string): string {
	return readFileSync(join(here, relativePath), 'utf8');
}

const publishedFixture: WhitePaper = {
	slug: 'sample-paper',
	title: 'Sample paper',
	summary: 'A sample record used only in this test.',
	coverImage: null,
	coverImageAlt: 'Cover image slot.',
	publishedAt: '2026-11-16',
	pdfPath: '/white-papers/sample-paper.pdf',
	published: true,
	placeholder: false,
	sections: [
		{
			heading: 'Sample',
			paragraphs: ['A cited sentence.[^1]']
		}
	],
	sources: [{ number: 1, label: 'Sample source.' }]
};

describe('white paper records', () => {
	it('keeps a single unpublished placeholder out of public discovery', () => {
		expect(whitePapers).toHaveLength(1);
		const paper = whitePapers[0];
		expect(paper?.title).toBe('Example white paper');
		expect(paper?.slug).toBe('example-white-paper');
		expect(paper?.published).toBe(false);
		expect(paper?.placeholder).toBe(true);
		expect(paper?.summary).toMatch(/placeholder/i);
		expect(paper?.summary).not.toMatch(/\n/);
		expect(paper?.pdfPath).toBe('/white-papers/example-white-paper.pdf');
		const pdf = join(here, '../../../static/white-papers/example-white-paper.pdf');
		expect(existsSync(pdf)).toBe(true);
		expect(readFileSync(pdf).subarray(0, 5).toString()).toBe('%PDF-');
		expect(whitePaperProblems(paper!)).toEqual([]);
		expect(publishedWhitePapers()).toEqual([]);
		expect(publishedWhitePaperPaths()).toEqual([]);
		expect(whitePaperLlmsEntries()).toEqual([]);
		expect(isPublishedWhitePaperPath('/white-papers')).toBe(false);
		expect(isPublishedWhitePaperPath('/white-papers/example-white-paper')).toBe(false);
		expect(isPublicIndexablePath('/white-papers')).toBe(false);
		expect(isPublicIndexablePath('/white-papers/example-white-paper')).toBe(false);
		expect(layoutOwnsDocumentMeta('/white-papers')).toBe(true);
		expect(layoutOwnsDocumentMeta('/white-papers/example')).toBe(false);
		expect(renderLlmsTxt()).not.toContain('/white-papers');
		expect(renderLlmsTxt()).not.toContain('Example white paper');
	});

	it('lists a paper once published is true', () => {
		expect(publishedWhitePaperPaths([publishedFixture])).toEqual([
			'/white-papers',
			'/white-papers/sample-paper'
		]);
		expect(whitePaperLlmsEntries([publishedFixture]).map((entry) => entry.path)).toEqual([
			'/white-papers',
			'/white-papers/sample-paper'
		]);
		expect(isPublishedWhitePaperPath('/white-papers/sample-paper', [publishedFixture])).toBe(true);
		expect(whitePaperBySlug('missing')).toBeUndefined();
	});

	it('uses the operator line and stays free of prices, affiliates, and street addresses', () => {
		expect(WHITE_PAPER_OPERATOR_LINE).toBe(
			'operated by Escherbridge, LLC, Boise, Idaho · contact@escherbridge.com'
		);
		const files = [
			'white-papers.ts',
			'whitePaperPrint.ts',
			'../../routes/white-papers/+page.svelte',
			'../../routes/white-papers/[slug=paper]/+page.svelte'
		].map((file) => source(file));
		const combined = files.join('\n');
		expect(combined).toContain(WHITE_PAPER_OPERATOR_LINE);
		expect(combined).toContain('Download PDF');
		expect(combined).not.toMatch(/lorem|ipsum/i);
		expect(combined).not.toMatch(/\$\d|\baffiliate\b|\binvestor\b/i);
		expect(combined).not.toMatch(/\b\d{5}(?:-\d{4})?\b/);
		expect(combined).not.toMatch(/\b(?:Street|Avenue|Boulevard|Road|Drive|Lane|Court|Way)\b/);
		expect(combined).not.toMatch(/pixel|gtag|posthog/i);
		expect(files.slice(2).join('\n')).not.toMatch(/<form\b/i);
	});

	it('leaves the placeholder out of navigation', () => {
		const nav = [
			source('../components/navigation/Header.svelte'),
			source('../../routes/+layout.svelte'),
			source('../components/platform/nav-configs.ts')
		].join('\n');
		expect(nav).not.toContain('/white-papers');
	});
});

describe('white paper print template', () => {
	it('builds a letter document with the leaf mark, running furniture, and notes', () => {
		const paper = whitePapers[0]!;
		const html = renderWhitePaperDocument(paper);
		const header = whitePaperHeaderTemplate(paper);
		const footer = whitePaperFooterTemplate();
		expect(html).toContain('size: letter');
		expect(html).toContain('class="cover"');
		expect(header).toContain('class="wordmark"');
		expect(header).toContain('letter-spacing: 0.14em');
		expect(header).toContain('AEVANI');
		expect(header).toContain('M24 38 V21');
		expect(footer).toContain('class="pageNumber"');
		expect(footer).toContain(WHITE_PAPER_OPERATOR_LINE);
		expect(html).toContain('id="fn-1"');
		expect(html).toContain(WHITE_PAPER_OPERATOR_LINE);
		expect(html).toContain('Example white paper');
		expect(html).toContain('Familjen Grotesk');
		expect(html).toContain('Instrument Sans');
		expect(html).toContain('JetBrains Mono');
		expect(html).toContain('letter-spacing: 0.14em');
		expect(html).toContain('font-weight: 700');
		expect(html).toContain('#2E6B4F');
		expect(html).toContain('#1E4A36');
		expect(html).toContain('#8FD8B4');
		expect(html).toContain('#F4F1EA');
		expect(html).toContain('#1C3527');
		expect(html).toContain('M24 38 V21');
		expect(html).toContain('M24.5 22.5 C24.5 14.5 30 10 37.5 9.5 C37.5 17.5 32 22.5 24.5 22.5 Z');
		expect(html).not.toContain('213,795');
		expect(html).not.toMatch(/<script\b|<form\b/i);
		expect(html).toContain('Cover image');
		expect(html).toContain('placeholder');
	});
});
