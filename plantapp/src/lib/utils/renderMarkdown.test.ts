import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cornerstoneEssayHtml, cornerstoneEssays } from '$lib/content/essays';
import { publishedGuideSectors } from '$lib/content/research';
import { renderMarkdownBody } from './renderMarkdown';
import { sanitizeRichText } from './sanitizeRichText';

const legacySlugs = [
	'getting-started-companion-planting',
	'understanding-soil-health',
	'hydroponics-for-beginners',
	'introduction-to-aquaponics',
	'what-is-silvopasture',
	'monoculture-to-polyculture'
] as const;

function legacyMarkdown(slug: (typeof legacySlugs)[number]): string {
	const source = readFileSync(new URL('../server/db/seed.ts', import.meta.url), 'utf8');
	const slugAt = source.indexOf(`slug: '${slug}'`);
	const marker = 'content: `';
	const start = source.indexOf(marker, slugAt);
	const from = start + marker.length;
	const end = source.indexOf('`,', from);
	return source.slice(from, end).replaceAll('\\n', '\n');
}

function visibleText(html: string): string {
	return html
		.replace(/<\/(p|h[1-6]|li|ul|ol|blockquote|pre)>/g, ' ')
		.replace(/<[^>]+>/g, '')
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replace(/\s+/g, ' ')
		.trim();
}

function markdownWords(markdown: string): string {
	return markdown
		.replace(/^\s{0,3}#{1,6}\s+/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/^\s*\d+\.\s+/gm, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2')
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

describe('renderMarkdownBody', () => {
	it('renders a markdown body with headings, bold, and lists as elements', () => {
		const html = renderMarkdownBody(`# From Monoculture to Polyculture

It's efficient. The "land equivalent ratio" exceeds 1.0.

## The Case for Polyculture

### Pest Resistance
Pests specialize.

- **Pest resistance** - pests specialize
- **Soil health** - legumes fix nitrogen

1. **Start small** - Choose 2-3 companion pairs
2. **Observe** - Note which combinations work
`);

		expect(html).toContain('<h1>From Monoculture to Polyculture</h1>');
		expect(html).toContain('<h2>The Case for Polyculture</h2>');
		expect(html).toContain('<h3>Pest Resistance</h3>');
		expect(html).toContain('<strong>Pest resistance</strong>');
		expect(html).toContain('<strong>Start small</strong>');
		expect(html).toMatch(/<ul><li><strong>Pest resistance<\/strong> - pests specialize<\/li>/);
		expect(html).toMatch(
			/<ol><li><strong>Start small<\/strong> - Choose 2-3 companion pairs<\/li>/
		);
		expect(html).toContain(
			'It&#39;s efficient. The &quot;land equivalent ratio&quot; exceeds 1.0.'
		);
		expect(html).not.toContain('**');
		expect(html).not.toMatch(/<p>[^<]*# /);
	});

	it('keeps the legacy CMS wording and renders each stored body', () => {
		for (const slug of legacySlugs) {
			const markdown = legacyMarkdown(slug);
			const html = renderMarkdownBody(markdown);

			expect(html, slug).toContain('<h1>');
			expect(html, slug).not.toContain('**');
			expect(html, slug).not.toMatch(/^#{1,6} /m);
			expect(visibleText(html), slug).toBe(markdownWords(markdown));

			if (markdown.includes('**')) expect(html, slug).toContain('<strong>');
			if (/^-\s/m.test(markdown)) expect(html, slug).toMatch(/<ul><li>/);
			if (/^\d+\.\s/m.test(markdown)) expect(html, slug).toMatch(/<ol><li>/);
		}
	});

	it('sanitizes markdown links and raw html before the template inserts it', () => {
		expect(renderMarkdownBody('[Read more](/learn?topic=soil&level=1)')).toBe(
			'<p><a href="/learn?topic=soil&amp;level=1" rel="noopener noreferrer">Read more</a></p>'
		);
		expect(renderMarkdownBody('5 < 6 & 7')).toBe('<p>5 &lt; 6 &amp; 7</p>');

		const hostile = renderMarkdownBody(
			'See <script>alert(1)</script> and [click](javascript:alert(1)).'
		);
		expect(hostile).not.toContain('<script');
		expect(hostile).not.toMatch(/<a href="javascript:/);
		expect(hostile).toContain('&lt;script&gt;');
		expect(hostile).toContain('click');
	});

	it('sanitizes cornerstone HTML without changing it', () => {
		for (const essay of cornerstoneEssays) {
			const html = cornerstoneEssayHtml(essay.body);
			expect(renderMarkdownBody(html)).toBe(sanitizeRichText(html));
		}
	});

	it('leaves structured guides on the block renderer', () => {
		const sector = publishedGuideSectors.find((guide) => guide.slug === 'temperate-silvopasture');
		expect(sector?.blocks.some((block) => block.kind === 'h1')).toBe(true);

		const page = readFileSync(
			new URL('../../routes/guides/[slug]/+page.svelte', import.meta.url),
			'utf8'
		);
		const markup = page.slice(page.indexOf('</script>'));
		const sectorBranch = markup.slice(0, markup.indexOf('{:else if page}'));
		expect(sectorBranch).toContain('<GuideSector guide={sector} />');
		expect(sectorBranch).not.toContain('renderMarkdownBody');
	});
});
