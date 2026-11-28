import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contentRouter } from './content';

const getPageBySlug = vi.hoisted(() => vi.fn());

vi.mock('../services/content', () => ({
	ContentService: {
		getPageBySlug
	}
}));

const SOIL_OLD =
	'Before amending, test. A basic soil test reveals pH, organic matter percentage, and major nutrient levels (N-P-K).';
const SOIL_NEW =
	'Before amending, test. A soil test gives a useful baseline on pH, salts, organic matter, phosphorus and potassium. Nitrogen readings have limited use for home gardeners, and a fall test will not reliably predict spring nitrogen.';
const COMPOST_OLD = 'Add 1-2 inches annually as top dressing';
const COMPOST_NEW =
	'For annual beds, add no more than 1 inch of manure or manure compost, or 2 inches of plant-based compost, a year, worked into the top 6 to 8 inches, until a moderate level is reached. Stop routine annual compost at about 5% organic matter, because over-amending may add excess salts.';

const UNCHANGED = [
	'- **Jar test**: Fill a jar with 1/3 soil, 2/3 water, shake, and let settle for 24 hours.',
	'- **Earthworm count**: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.',
	'2. **Mulch** - Cover bare soil with 3-4 inches of organic mulch',
	'5. **Biochar** - Adds permanent carbon and microbial habitat'
];

function caller() {
	return contentRouter.createCaller({
		user: null,
		session: null,
		event: { url: new URL('https://aevani.com/guides/understanding-soil-health') } as never
	});
}

function row(slug: string, content: string) {
	return {
		page: {
			id: 1,
			slug,
			type: 'guide' as const,
			title: 'Understanding Soil Health: The Foundation of Every Garden',
			content,
			status: 'published' as const
		},
		author: { username: 'editor', firstName: null, lastName: null }
	};
}

describe('content.getPage soil-health wording', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rewrites the procedure output and leaves the stored row unchanged', async () => {
		const stored = [
			SOIL_OLD,
			'',
			...UNCHANGED.slice(0, 2),
			'',
			`1. **Compost** - ${COMPOST_OLD}`,
			...UNCHANGED.slice(2)
		].join('\n');
		const record = row('understanding-soil-health', stored);
		getPageBySlug.mockResolvedValue(record);

		const result = await caller().getPage({ slug: 'understanding-soil-health' });
		const serialized = JSON.stringify(result);

		expect(getPageBySlug).toHaveBeenCalledWith('understanding-soil-health');
		expect(record.page.content).toBe(stored);
		expect(serialized).not.toContain(SOIL_OLD);
		expect(serialized).not.toContain(COMPOST_OLD);
		expect(serialized).not.toContain('major nutrient levels (N-P-K)');
		expect(result.page.content).toContain(SOIL_NEW);
		expect(result.page.content).toContain(`**Compost** - ${COMPOST_NEW}`);
		for (const line of UNCHANGED) expect(result.page.content).toContain(line);

		getPageBySlug.mockResolvedValue(row('understanding-soil-health', result.page.content ?? ''));
		const again = await caller().getPage({ slug: 'understanding-soil-health' });
		expect(again.page.content).toBe(result.page.content);
	});

	it('rewrites an HTML body in the procedure output', async () => {
		const stored = [
			`<p>${SOIL_OLD}</p>`,
			'<ol>',
			`<li><strong>Compost</strong> - ${COMPOST_OLD}</li>`,
			'<li><strong>Mulch</strong> - Cover bare soil with 3-4 inches of organic mulch</li>',
			'</ol>'
		].join('');
		getPageBySlug.mockResolvedValue(row('understanding-soil-health', stored));

		const result = await caller().getPage({ slug: 'understanding-soil-health' });
		const serialized = JSON.stringify(result);
		expect(serialized).not.toContain(SOIL_OLD);
		expect(serialized).not.toContain(COMPOST_OLD);
		expect(result.page.content).toContain(`<p>${SOIL_NEW}</p>`);
		expect(result.page.content).toContain(`<li><strong>Compost</strong> - ${COMPOST_NEW}</li>`);
		expect(result.page.content).toContain(
			'<li><strong>Mulch</strong> - Cover bare soil with 3-4 inches of organic mulch</li>'
		);
	});

	it('leaves every other published page unchanged', async () => {
		const stored = `${SOIL_OLD}\n\n1. **Compost** - ${COMPOST_OLD}`;
		const record = row('getting-started-companion-planting', stored);
		getPageBySlug.mockResolvedValue(record);

		const result = await caller().getPage({ slug: 'getting-started-companion-planting' });
		expect(result).toBe(record);
		expect(result.page.content).toBe(stored);
	});
});
