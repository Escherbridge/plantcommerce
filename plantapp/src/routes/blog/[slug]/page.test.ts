import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { cornerstoneEssayBySlug } from '$lib/content/essays';
import BlogPost from './+page.svelte';
import { load } from './+page';

const headline = 'A November soil test reads the slow stuff';
const summary =
	"A late-fall soil test will not reliably predict next spring's nitrogen. Colorado State's own lab says so. It will read pH, salts, lime, phosphorus, potassium, and organic matter: the slow numbers next year's beds depend on.";
const metaDescription =
	"A November soil test will not reliably predict next spring's nitrogen. Colorado State's lab says so. It will read the slow numbers next year's beds depend on.";

const relatedHrefs = [
	'/guides/understanding-soil-health',
	'/guides/raised-beds',
	'/guides/no-dig-sheet-mulch',
	'/guides/frost-dates-hardiness',
	'/guides/winterizing-growing-systems',
	'/blog/raised-beds-for-heavy-clay-and-hot-summers',
	'/blog/pre-spring-grower-checklist',
	'/guides'
] as const;

const unusedFetch = async () => {
	throw new Error('a cornerstone note must not query the CMS');
};

describe('fall soil test field note', () => {
	it('renders the approved headline, sources, and related paths', async () => {
		const data = await load({
			params: { slug: 'fall-soil-test' },
			fetch: unusedFetch
		} as never);
		expect(data?.post.page.title).toBe(headline);

		const rendered = render(BlogPost, { props: { data: data as never } });
		const html = `${rendered.head}${rendered.body}`;

		expect(html).toMatch(/<h1\b[^>]*>\s*A November soil test reads the slow stuff\s*<\/h1>/);
		expect(html).toContain(summary);
		expect(html).toContain(`<meta name="description" content="${metaDescription}"/>`);
		expect(html).toContain(`<meta property="og:description" content="${metaDescription}"/>`);
		expect(html).toContain('property="og:type" content="article"');
		expect(html).toContain('rel="canonical" href="https://aevani.com/blog/fall-soil-test"');
		expect(html).toContain('https://aevani.com/blog/fall-soil-test');
		expect(html).toContain('2026-11-23');
		expect(html).not.toContain('dateModified');
		expect(html).not.toContain('JSON-LD');
		expect(html).toContain('The garden is done, the beds are bare');
		expect(html).toContain('does not always capture the true amount of nitrogen');

		const essay = cornerstoneEssayBySlug('fall-soil-test');
		expect(essay?.metaDescription).toBe(metaDescription);
		expect(essay?.sources.length).toBe(8);
		for (const source of essay?.sources ?? []) {
			expect(source.href.startsWith('https://')).toBe(true);
			expect(html).toContain(`href="${source.href}"`);
		}
		for (const href of relatedHrefs) {
			expect(html).toContain(`href="${href}"`);
		}
		expect(html).toContain('href="https://plantgeo.aevani.com/');
		expect(essay?.body).not.toMatch(
			/\$\d|\baffiliate\b|\bpayout\b|primusneo|when you get paid|\d+\s+[A-Za-z0-9 .]+(?:Street|Avenue|Boulevard|Road|Drive|Lane)\b/i
		);
	});
});
