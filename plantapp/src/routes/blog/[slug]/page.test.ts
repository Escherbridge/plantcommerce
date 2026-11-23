import { readFile } from 'node:fs/promises';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { cornerstoneEssayBySlug, cornerstoneEssays } from '$lib/content/essays';
import { relatedEssays } from '$lib/content/writing';
import BlogPost from './+page.svelte';
import { load } from './+page';

const headline = 'A November soil test reads the slow stuff';
const summary =
	"A late-fall soil test will not reliably predict next spring's nitrogen. Colorado State's own lab says so. It will read pH, salts, lime, phosphorus, potassium, and organic matter: the slow numbers next year's beds depend on.";
const metaDescription =
	"A November soil test will not reliably predict next spring's nitrogen. Colorado State's lab says so. It will read the slow numbers next year's beds depend on.";

const relatedLinks = [
	['Soil health: the foundation of a garden', '/guides/understanding-soil-health'],
	['Raised beds: width, depth, and soil', '/guides/raised-beds'],
	['PlantGeo', 'https://plantgeo.aevani.com'],
	['No-dig beds and sheet mulching', '/guides/no-dig-sheet-mulch'],
	['Frost dates and hardiness zones', '/guides/frost-dates-hardiness'],
	['Winterizing tunnels, irrigation, and pots', '/guides/winterizing-growing-systems'],
	[
		'How to build a raised bed that works in heavy clay and hot summers',
		'/blog/raised-beds-for-heavy-clay-and-hot-summers'
	],
	[
		'Before you buy seed packets: a five-step pre-spring checklist',
		'/blog/pre-spring-grower-checklist'
	],
	['Guides', '/guides']
] as const;

const unusedFetch = async () => {
	throw new Error('a cornerstone note must not query the CMS');
};

function headingCount(html: string, text: string): number {
	return html.match(new RegExp(`<h2\\b[^>]*>\\s*${text}\\s*</h2>`, 'g'))?.length ?? 0;
}

function sectionAfter(html: string, heading: string): string {
	const marker = `>${heading}</h2>`;
	const start = html.indexOf(marker);
	expect(start, heading).toBeGreaterThanOrEqual(0);
	const end = html.indexOf('</section>', start);
	return html.slice(start, end);
}

async function renderNote(slug: string) {
	const data = await load({ params: { slug }, fetch: unusedFetch } as never);
	const rendered = render(BlogPost, { props: { data: data as never } });
	return { data, html: `${rendered.head}${rendered.body}` };
}

describe('fall soil test field note', () => {
	it('renders the approved headline, one linked Sources list, and the configured Related list', async () => {
		const { data, html } = await renderNote('fall-soil-test');
		expect(data?.post.page.title).toBe(headline);

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
		expect(headingCount(html, 'Sources')).toBe(1);
		expect(headingCount(html, 'Related')).toBe(1);
		const template = await readFile(new URL('./+page.svelte', import.meta.url), 'utf8');
		expect(template).toMatch(/\.prose :global\(li\)[\s\S]*overflow-wrap:\s*anywhere/);

		const essay = cornerstoneEssayBySlug('fall-soil-test');
		expect(essay?.metaDescription).toBe(metaDescription);
		expect(essay?.sources.length).toBe(8);
		const sources = sectionAfter(html, 'Sources');
		const visibleSources = sources.replace(/<[^>]+>/g, ' ');
		for (const source of essay?.sources ?? []) {
			expect(source.href.startsWith('https://')).toBe(true);
			expect(sources).toContain(`<a class="link" href="${source.href}">`);
			expect(visibleSources).not.toContain(source.href);
		}
		const related = sectionAfter(html, 'Related');
		let cursor = 0;
		for (const [label, href] of relatedLinks) {
			const at = related.indexOf(`href="${href}"`, cursor);
			expect(at, href).toBeGreaterThanOrEqual(0);
			expect(related.slice(at, at + href.length + label.length + 80)).toContain(label);
			cursor = at + href.length;
		}
		expect(related.match(/<a\b/g)?.length).toBe(relatedLinks.length);
		expect(related).not.toContain('In a dry climate, cooling can use more water than the plants');
		expect(essay?.body).not.toMatch(
			/\$\d|\baffiliate\b|\bpayout\b|primusneo|when you get paid|\d+\s+[A-Za-z0-9 .]+(?:Street|Avenue|Boulevard|Road|Drive|Lane)\b/i
		);
	});

	it('keeps the automatic related notes on essays that do not configure their own', async () => {
		const { html } = await renderNote('cooling-can-use-more-water-than-the-crop');
		expect(headingCount(html, 'Sources')).toBe(1);
		expect(headingCount(html, 'Related')).toBe(1);
		const related = sectionAfter(html, 'Related');
		const expected = relatedEssays('cooling-can-use-more-water-than-the-crop');
		expect(related.match(/<a\b/g)?.length).toBe(expected.length);
		for (const essay of expected) {
			expect(related).toContain(`href="/blog/${essay.slug}"`);
			expect(related).toContain(essay.title);
		}
		expect(related).not.toContain('href="/blog/cooling-can-use-more-water-than-the-crop"');
	});

	it('prints the fee note’s own related links once, with every source linked', async () => {
		const { html } = await renderNote('the-fee-that-didnt-move');
		expect(headingCount(html, 'Sources')).toBe(1);
		expect(headingCount(html, 'Related')).toBe(1);
		const sources = sectionAfter(html, 'Sources');
		const essay = cornerstoneEssayBySlug('the-fee-that-didnt-move');
		for (const source of essay?.sources ?? []) {
			expect(sources).toContain(`<a class="link" href="${source.href}">${source.label}</a>`);
		}
		expect(sources.replace(/<[^>]+>/g, ' ')).not.toContain('https://');
		const related = sectionAfter(html, 'Related');
		expect(related).toContain(
			'<a class="link link-primary" href="/blog/a-flat-eight-percent">The seller fee is a flat 8%</a> — the published Aevani rate, in one place.'
		);
		expect(related).toContain('href="/blog/cooling-can-use-more-water-than-the-crop"');
		expect(related).toContain('href="/sell"');
		expect(related.match(/<a\b/g)?.length).toBe(3);
		expect(cornerstoneEssays.filter((item) => item.related).map((item) => item.slug)).toEqual([
			'fall-soil-test',
			'the-fee-that-didnt-move'
		]);
	});
});
