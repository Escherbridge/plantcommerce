import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const cms = vi.hoisted(() => ({
	pages: new Map<string, { type: 'guide' | 'blog_post'; title: string; content: string }>()
}));

vi.mock('$lib/trpc/client', () => ({
	createCallerClient: () => ({
		content: {
			getPage: {
				query: async ({ slug }: { slug: string }) => {
					const page = cms.pages.get(slug);
					if (!page) {
						const missing = new Error('NOT_FOUND') as Error & { status: number };
						missing.status = 404;
						throw missing;
					}
					return {
						page: {
							slug,
							excerpt: 'Healthy soil is alive.',
							metaDescription: null,
							...page
						},
						author: { username: 'editor', firstName: null, lastName: null }
					};
				}
			}
		}
	})
}));

import { load } from './+page';

const SOIL_OLD =
	'Before amending, test. A basic soil test reveals pH, organic matter percentage, and major nutrient levels (N-P-K).';
const SOIL_NEW =
	'Before amending, test. A soil test gives a useful baseline on pH, salts, organic matter, phosphorus and potassium. Nitrogen readings have limited use for home gardeners, and a fall test will not reliably predict spring nitrogen.';
const COMPOST_OLD = 'Add 1-2 inches annually as top dressing';
const COMPOST_NEW =
	'For annual beds, add no more than 1 inch of manure or manure compost, or 2 inches of plant-based compost, a year, worked into the top 6 to 8 inches, until a moderate level is reached. Stop routine annual compost at about 5% organic matter, because over-amending may add excess salts.';

const UNCHANGED = [
	'**Jar test**: Fill a jar with 1/3 soil, 2/3 water, shake, and let settle for 24 hours.',
	'**Earthworm count**: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.',
	'**Mulch** - Cover bare soil with 3-4 inches of organic mulch',
	'**Cover crops** - Plant clover or rye in off-seasons',
	'**Minimize tillage** - Let soil organisms build structure undisturbed',
	'**Biochar** - Adds permanent carbon and microbial habitat'
];

function seededSoilGuide(): string {
	const source = readFileSync(new URL('../../../lib/server/db/seed.ts', import.meta.url), 'utf8');
	const slugAt = source.indexOf(`slug: 'understanding-soil-health'`);
	const marker = 'content: `';
	const start = source.indexOf(marker, slugAt);
	const from = start + marker.length;
	const end = source.indexOf('`,', from);
	return source.slice(from, end).replaceAll('\\n', '\n');
}

function store(slug: string, content: string) {
	cms.pages.set(slug, {
		type: 'guide',
		title: 'Understanding Soil Health: The Foundation of Every Garden',
		content
	});
}

async function loadGuide(slug: string) {
	return load({
		params: { slug },
		fetch: async () => {
			throw new Error('the guide load must read the mocked CMS row');
		}
	} as never);
}

describe('soil-health guide load', () => {
	it('serves the corrected seed wording and rewrites a stored legacy body', async () => {
		const seeded = seededSoilGuide();
		expect(seeded).toContain(SOIL_NEW);
		expect(seeded).toContain(`**Compost** - ${COMPOST_NEW}`);
		expect(seeded).not.toContain(SOIL_OLD);
		expect(seeded).not.toContain(COMPOST_OLD);
		for (const line of UNCHANGED) expect(seeded).toContain(line);

		const stored = seeded
			.replace(SOIL_NEW, SOIL_OLD)
			.replace(`**Compost** - ${COMPOST_NEW}`, `**Compost** - ${COMPOST_OLD}`);
		store('understanding-soil-health', stored);

		const loaded = await loadGuide('understanding-soil-health');
		const content = loaded?.guide?.page.content ?? '';
		expect(content).toBe(seeded);
		const serialized = JSON.stringify(loaded);
		expect(serialized).not.toContain(SOIL_OLD);
		expect(serialized).not.toContain(COMPOST_OLD);
		expect(serialized).not.toContain('major nutrient levels (N-P-K)');
		expect(serialized).toContain(SOIL_NEW);
		expect(serialized).toContain(COMPOST_NEW);
		for (const line of UNCHANGED) expect(content).toContain(line);

		store('understanding-soil-health', content);
		const again = await loadGuide('understanding-soil-health');
		expect(again?.guide?.page.content).toBe(content);
	});

	it('rewrites HTML and loose whitespace without touching the other lines', async () => {
		const html = [
			`<p>Before amending,  test.<br>A basic soil test reveals pH, organic matter percentage, and major nutrient levels (N-P-K).</p>`,
			'<ul>',
			'<li><strong>Jar test</strong>: Fill a jar with 1/3 soil, 2/3 water, shake, and let settle for 24 hours.</li>',
			'<li><strong>Earthworm count</strong>: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.</li>',
			'</ul>',
			'<ol>',
			'<li><strong>Compost</strong> - Add 1-2 inches annually as top dressing</li>',
			'<li><b>Mulch</b> - Cover bare soil with 3-4 inches of organic mulch</li>',
			'<li><strong>Biochar</strong> - Adds permanent carbon and microbial habitat</li>',
			'</ol>',
			'<p>A later note that is not the compost item: Add 1-2 inches annually as top dressing.</p>'
		].join('\n');
		store('understanding-soil-health', html);

		const loaded = await loadGuide('understanding-soil-health');
		const content = loaded?.guide?.page.content ?? '';
		const serialized = JSON.stringify(loaded);
		expect(serialized).not.toContain(SOIL_OLD);
		expect(serialized).not.toContain('major nutrient levels (N-P-K)');
		expect(serialized).toContain(SOIL_NEW);
		expect(content).toContain(`<p>${SOIL_NEW}</p>`);
		expect(content).toContain(`<li><strong>Compost</strong> - ${COMPOST_NEW}</li>`);
		expect(content).toContain(
			'<li><strong>Jar test</strong>: Fill a jar with 1/3 soil, 2/3 water, shake, and let settle for 24 hours.</li>'
		);
		expect(content).toContain(
			'<li><strong>Earthworm count</strong>: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.</li>'
		);
		expect(content).toContain(
			'<li><b>Mulch</b> - Cover bare soil with 3-4 inches of organic mulch</li>'
		);
		expect(content).toContain(
			'<li><strong>Biochar</strong> - Adds permanent carbon and microbial habitat</li>'
		);
		expect(content).toContain(
			'<p>A later note that is not the compost item: Add 1-2 inches annually as top dressing.</p>'
		);
		expect(content.match(/Add 1-2 inches annually as top dressing/g)).toEqual([
			'Add 1-2 inches annually as top dressing'
		]);

		store('understanding-soil-health', content);
		const again = await loadGuide('understanding-soil-health');
		expect(again?.guide?.page.content).toBe(content);
	});

	it('keeps the compost label when markdown spacing varies', async () => {
		const markdown = [
			'Before amending,\ttest.',
			'A basic soil test reveals pH, organic matter percentage, and major nutrient levels (N-P-K).',
			'',
			'1. **Compost**   -   Add  1 - 2   inches annually as top dressing',
			'2. **Mulch** - Cover bare soil with 3-4 inches of organic mulch',
			'- **Earthworm count**: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.'
		].join('\n');
		store('understanding-soil-health', markdown);

		const loaded = await loadGuide('understanding-soil-health');
		const content = loaded?.guide?.page.content ?? '';
		expect(JSON.stringify(loaded)).not.toContain(SOIL_OLD);
		expect(JSON.stringify(loaded)).not.toContain(COMPOST_OLD);
		expect(content).toContain(SOIL_NEW);
		expect(content).toContain(`1. **Compost**   -   ${COMPOST_NEW}`);
		expect(content).not.toMatch(/\*\*Compost\*\*\s*-\s*Add/);
		expect(content).toContain('2. **Mulch** - Cover bare soil with 3-4 inches of organic mulch');
		expect(content).toContain(
			'- **Earthworm count**: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.'
		);
	});

	it('leaves every other guide body unchanged', async () => {
		const body = `${SOIL_OLD}\n\n1. **Compost** - ${COMPOST_OLD}`;
		store('getting-started-companion-planting', body);
		const loaded = await loadGuide('getting-started-companion-planting');
		expect(loaded?.guide?.page.content).toBe(body);
		expect(loaded?.guide?.page.slug).toBe('getting-started-companion-planting');
	});
});
