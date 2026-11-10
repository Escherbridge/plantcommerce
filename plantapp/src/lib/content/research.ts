import indexSource from './research/index.md?raw';
import hydroponicsSource from './research/hydroponics-intermountain.md?raw';
import aquaponicsSource from './research/small-scale-aquaponics.md?raw';
import silvopastureSource from './research/temperate-silvopasture.md?raw';
import ecPhSource from './research/hydroponic-ec-ph-nutrients.md?raw';
import choosingSystemSource from './research/choosing-hydroponic-system.md?raw';
import rootRotSource from './research/hydroponic-troubleshooting-root-rot.md?raw';
import dwcSource from './research/deep-water-culture.md?raw';
import kratkySource from './research/kratky-method.md?raw';
import nftSource from './research/nutrient-film-technique.md?raw';
import raisedBedsSource from './research/raised-beds.md?raw';
import containersSource from './research/container-gardening.md?raw';
import highTunnelsSource from './research/high-tunnels-hoop-houses.md?raw';
import ventilationSource from './research/greenhouse-ventilation-heat.md?raw';
import coversSource from './research/season-extension-covers-frames.md?raw';
import ipmSource from './research/greenhouse-ipm.md?raw';
import cyclingSource from './research/aquaponic-biofilter-cycling.md?raw';
import systemTypesSource from './research/aquaponic-system-types.md?raw';
import fishSpeciesSource from './research/aquaponic-fish-species.md?raw';
import sourceWaterSource from './research/source-water-testing.md?raw';
import cropChoiceSource from './research/hydroponic-crop-choice.md?raw';
import disordersSource from './research/hydroponic-nutrient-disorders.md?raw';
import dripSource from './research/drip-dutch-bucket.md?raw';
import ebbSource from './research/ebb-and-flow.md?raw';
import verticalSource from './research/vertical-growing.md?raw';
import seedStartingSource from './research/soilless-seed-starting.md?raw';
import mediaSource from './research/hydroponic-media.md?raw';
import noDigSource from './research/no-dig-sheet-mulch.md?raw';
import foodForestSource from './research/temperate-food-forest.md?raw';
import guildsSource from './research/permaculture-guilds.md?raw';
import hugelkulturSource from './research/hugelkultur.md?raw';
import lightingSource from './research/indoor-lighting-dli.md?raw';
import pollinationSource from './research/greenhouse-pollination.md?raw';
import winterizingSource from './research/winterizing-growing-systems.md?raw';
import foodSafetySource from './research/soilless-food-safety.md?raw';
import soilDripSource from './research/soil-drip-irrigation.md?raw';
import frostSource from './research/frost-dates-hardiness.md?raw';
import rainwaterSource from './research/rainwater-irrigation-quality.md?raw';
import outdoorIpmSource from './research/outdoor-bed-ipm.md?raw';
import { publicSiteUrl } from '$lib/config/site';

/**
 * Reviewed research drafts. The visible page is the markdown body.
 * The JSON-LD notes at the bottom of each draft are structured data, not copy.
 */

export type GuideInline =
	| { kind: 'text'; text: string }
	| { kind: 'strong'; text: string }
	| { kind: 'em'; text: string }
	| { kind: 'link'; text: string; href: string; strong?: boolean };

export type GuideBlock =
	| { kind: 'eyebrow'; text: string }
	| { kind: 'h1'; text: string }
	| { kind: 'h2'; text: string }
	| { kind: 'p'; inlines: GuideInline[]; standfirst?: boolean }
	| { kind: 'ul'; items: GuideInline[][] }
	| { kind: 'ol'; items: GuideInline[][] }
	| { kind: 'table'; headers: GuideInline[][]; rows: GuideInline[][][] };

export type GuideSource = {
	name: string;
	urls: string[];
	datePublished?: string;
};

export type GuideDocument = {
	slug: string;
	seoTitle: string;
	description: string;
	title: string;
	eyebrow: string;
	canonical: string;
	author: string;
	publishedAt: string;
	reviewedAt: string;
	breadcrumb: string;
	blocks: GuideBlock[];
	sources: GuideSource[];
};

const months: Record<string, string> = {
	January: '01',
	February: '02',
	March: '03',
	April: '04',
	May: '05',
	June: '06',
	July: '07',
	August: '08',
	September: '09',
	October: '10',
	November: '11',
	December: '12'
};

const monthNames = Object.keys(months).join('|');

function splitFrontmatter(raw: string): { data: Record<string, string>; body: string } {
	if (!raw.startsWith('---\n')) throw new Error('research draft is missing frontmatter');
	const end = raw.indexOf('\n---\n', 3);
	if (end === -1) throw new Error('research draft frontmatter is unterminated');
	const data: Record<string, string> = {};
	for (const line of raw.slice(4, end).split('\n')) {
		if (!line.trim()) continue;
		const match = /^([A-Za-z][A-Za-z0-9]*):\s+(?:"([^"]*)"|(\S+))\s*$/.exec(line);
		if (!match) throw new Error(`unreadable research frontmatter: ${line}`);
		data[match[1]] = match[2] ?? match[3];
	}
	return { data, body: raw.slice(end + 5) };
}

function nextMark(input: string, from: number): number {
	let at = input.length;
	for (const token of ['**', '*', '[', 'https://', 'http://']) {
		const found = input.indexOf(token, from);
		if (found !== -1 && found < at) at = found;
	}
	return at;
}

export function parseInlines(input: string): GuideInline[] {
	const inlines: GuideInline[] = [];
	let index = 0;
	while (index < input.length) {
		if (input.startsWith('**', index)) {
			const end = input.indexOf('**', index + 2);
			if (end !== -1) {
				const inner = input.slice(index + 2, end);
				const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(inner);
				if (link) inlines.push({ kind: 'link', text: link[1], href: link[2], strong: true });
				else if (inner) inlines.push({ kind: 'strong', text: inner });
				index = end + 2;
				continue;
			}
		}
		if (input[index] === '*') {
			const end = input.indexOf('*', index + 1);
			if (end > index + 1) {
				inlines.push({ kind: 'em', text: input.slice(index + 1, end) });
				index = end + 1;
				continue;
			}
		}
		if (input[index] === '[') {
			const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(input.slice(index));
			if (link) {
				inlines.push({ kind: 'link', text: link[1], href: link[2] });
				index += link[0].length;
				continue;
			}
		}
		if (input.startsWith('https://', index) || input.startsWith('http://', index)) {
			const url = /^https?:\/\/[^\s)]+/.exec(input.slice(index));
			if (url) {
				inlines.push({ kind: 'link', text: url[0], href: url[0] });
				index += url[0].length;
				continue;
			}
		}
		const end = nextMark(input, index + 1);
		const text = input.slice(index, end);
		if (text) inlines.push({ kind: 'text', text });
		index = end;
	}
	return inlines;
}

function parseBlocks(body: string): GuideBlock[] {
	const visible = body.replace(/\n## JSON-LD notes[\s\S]*$/, '').trim();
	const lines = visible.split('\n');
	const blocks: GuideBlock[] = [];
	let index = 0;
	let seenH1 = false;
	let seenStandfirst = false;

	while (index < lines.length) {
		const line = lines[index];
		if (!line.trim()) {
			index += 1;
			continue;
		}
		if (line.startsWith('## ')) {
			blocks.push({ kind: 'h2', text: line.slice(3).trim() });
			index += 1;
			continue;
		}
		if (line.startsWith('# ')) {
			blocks.push({ kind: 'h1', text: line.slice(2).trim() });
			seenH1 = true;
			index += 1;
			continue;
		}
		if (line.trimStart().startsWith('|')) {
			const rawRows: string[][] = [];
			while (index < lines.length && lines[index].trimStart().startsWith('|')) {
				const cells = lines[index]
					.trim()
					.replace(/^\|/, '')
					.replace(/\|$/, '')
					.split('|')
					.map((cell) => cell.trim());
				const separator = cells.every((cell) => /^:?-{3,}:?$/.test(cell));
				if (!separator) rawRows.push(cells);
				index += 1;
			}
			const [headers = [], ...rows] = rawRows;
			if (headers.length) {
				blocks.push({
					kind: 'table',
					headers: headers.map((cell) => parseInlines(cell)),
					rows: rows.map((row) => row.map((cell) => parseInlines(cell)))
				});
			}
			continue;
		}
		if (line.startsWith('- ')) {
			const items: GuideInline[][] = [];
			while (index < lines.length && lines[index].startsWith('- ')) {
				items.push(parseInlines(lines[index].slice(2)));
				index += 1;
			}
			blocks.push({ kind: 'ul', items });
			continue;
		}
		if (/^\d+\.\s+/.test(line)) {
			const items: GuideInline[][] = [];
			while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
				items.push(parseInlines(lines[index].replace(/^\d+\.\s+/, '')));
				index += 1;
			}
			blocks.push({ kind: 'ol', items });
			continue;
		}

		const inlines = parseInlines(line.trim());
		if (!seenH1 && inlines.length === 1 && inlines[0].kind === 'strong') {
			blocks.push({ kind: 'eyebrow', text: inlines[0].text });
			index += 1;
			continue;
		}
		const standfirst = seenH1 && !seenStandfirst;
		if (standfirst) seenStandfirst = true;
		blocks.push({ kind: 'p', inlines, standfirst });
		index += 1;
	}
	return blocks;
}

function inlinePlain(parts: GuideInline[]): string {
	return parts
		.map((part) => {
			if (part.kind === 'link' && part.text.startsWith('http')) return '';
			return part.text;
		})
		.join('')
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/(?:\s+—\s*background:|\s+background:|\s+and)+\s*$/u, '')
		.trim();
}

function datePublishedFromCitation(name: string): string | undefined {
	const full = new RegExp(`(\\d{1,2}) (${monthNames}) (\\d{4})`).exec(name);
	if (full) return `${full[3]}-${months[full[2]]}-${full[1].padStart(2, '0')}`;
	const monthYear = new RegExp(`\\b(${monthNames}) (\\d{4})\\b`).exec(name);
	if (monthYear) return `${monthYear[2]}-${months[monthYear[1]]}`;
	const edition = /First Edition (\d{4})/.exec(name);
	if (edition) return edition[1];
	const authorYear = /\b[A-Z]\. (\d{4})\./.exec(name);
	if (authorYear) return authorYear[1];
	return undefined;
}

function sourcesFrom(blocks: GuideBlock[]): GuideSource[] {
	const heading = blocks.findIndex((block) => block.kind === 'h2' && block.text === 'Sources');
	if (heading === -1) return [];
	const list = blocks.slice(heading + 1).find((block) => block.kind === 'ol');
	if (!list || list.kind !== 'ol') return [];
	return list.items.map((item) => {
		const httpUrls = item
			.filter((part) => part.kind === 'link' && part.href.startsWith('http'))
			.map((part) => (part.kind === 'link' ? part.href : ''));
		const urls =
			httpUrls.length > 0
				? httpUrls
				: item
						.filter((part) => part.kind === 'link' && part.href.startsWith('/'))
						.map((part) => (part.kind === 'link' ? publicSiteUrl(part.href) : ''));
		const name = inlinePlain(item);
		const datePublished = datePublishedFromCitation(name);
		return datePublished ? { name, urls, datePublished } : { name, urls };
	});
}

function required(data: Record<string, string>, key: string, slug: string): string {
	const value = data[key];
	if (!value) throw new Error(`${slug} research draft is missing ${key}`);
	return value;
}

function breadcrumbName(body: string): string | undefined {
	const match = /Home → Guides → ([^)\n]+)/.exec(body);
	return match?.[1]?.trim();
}

function parseGuide(raw: string): GuideDocument {
	const { data, body } = splitFrontmatter(raw);
	const slug = required(data, 'slug', 'draft');
	const blocks = parseBlocks(body);
	const h1 = blocks.find((block) => block.kind === 'h1');
	const title = required(data, 'h1', slug);
	if (!h1 || h1.kind !== 'h1' || h1.text !== title) {
		throw new Error(`${slug} heading does not match its draft`);
	}
	const eyebrow = blocks.find((block) => block.kind === 'eyebrow');
	const eyebrowText = required(data, 'eyebrow', slug);
	if (!eyebrow || eyebrow.kind !== 'eyebrow' || eyebrow.text !== eyebrowText) {
		throw new Error(`${slug} eyebrow does not match its draft`);
	}
	return {
		slug,
		seoTitle: required(data, 'seoTitle', slug),
		description: required(data, 'metaDescription', slug),
		title,
		eyebrow: eyebrowText,
		canonical: required(data, 'canonical', slug),
		author: required(data, 'author', slug),
		publishedAt: required(data, 'publishedAt', slug),
		reviewedAt: required(data, 'lastReviewed', slug),
		breadcrumb: breadcrumbName(body) ?? 'Guides',
		blocks,
		sources: sourcesFrom(blocks)
	};
}

const documents = [
	indexSource,
	hydroponicsSource,
	aquaponicsSource,
	silvopastureSource,
	ecPhSource,
	choosingSystemSource,
	rootRotSource,
	dwcSource,
	kratkySource,
	nftSource,
	raisedBedsSource,
	containersSource,
	highTunnelsSource,
	ventilationSource,
	coversSource,
	ipmSource,
	cyclingSource,
	systemTypesSource,
	fishSpeciesSource,
	sourceWaterSource,
	cropChoiceSource,
	disordersSource,
	dripSource,
	ebbSource,
	verticalSource,
	seedStartingSource,
	mediaSource,
	noDigSource,
	foodForestSource,
	guildsSource,
	hugelkulturSource,
	lightingSource,
	pollinationSource,
	winterizingSource,
	foodSafetySource,
	soilDripSource,
	frostSource,
	rainwaterSource,
	outdoorIpmSource
].map(parseGuide);

export const guidesIndex = documents[0];
export const publishedGuideSectors: readonly GuideDocument[] = documents.slice(1);

export function guideHrefs(doc: GuideDocument): string[] {
	const hrefs: string[] = [];
	const visit = (parts: GuideInline[]) => {
		for (const part of parts) if (part.kind === 'link') hrefs.push(part.href);
	};
	for (const block of doc.blocks) {
		if (block.kind === 'p') visit(block.inlines);
		if (block.kind === 'ul' || block.kind === 'ol') {
			for (const item of block.items) visit(item);
		}
		if (block.kind === 'table') {
			for (const cell of block.headers) visit(cell);
			for (const row of block.rows) for (const cell of row) visit(cell);
		}
	}
	return hrefs;
}

export function guidePlainText(doc: GuideDocument): string {
	const parts: string[] = [];
	const visit = (inlines: GuideInline[]) => {
		parts.push(
			inlines
				.map((part) => (part.kind === 'link' ? `${part.text} ${part.href}` : part.text))
				.join('')
		);
	};
	for (const block of doc.blocks) {
		if (block.kind === 'eyebrow' || block.kind === 'h1' || block.kind === 'h2')
			parts.push(block.text);
		else if (block.kind === 'p') visit(block.inlines);
		else if (block.kind === 'table') {
			for (const cell of block.headers) visit(cell);
			for (const row of block.rows) for (const cell of row) visit(cell);
		} else for (const item of block.items) visit(item);
	}
	return parts.join('\n');
}

const systemSectionHeadings = new Set([
	'Soilless systems',
	'Soil, beds, and structures',
	'Aquaponics and silvopasture'
]);

/** System cards, then the two shorter notes that the index keeps as related. */
export function indexGuideLinks(
	doc: GuideDocument = guidesIndex
): { name: string; href: string }[] {
	const links: { name: string; href: string }[] = [];
	const seen = new Set<string>();
	let include = false;
	const take = (parts: GuideInline[]) => {
		for (const part of parts) {
			if (part.kind !== 'link' || !part.href.startsWith('/guides/') || part.href === '/guides')
				continue;
			if (seen.has(part.href)) continue;
			seen.add(part.href);
			links.push({ name: part.text, href: part.href });
		}
	};
	for (const block of doc.blocks) {
		if (block.kind === 'h2') {
			if (block.text === 'What Aevani is doing here') break;
			if (systemSectionHeadings.has(block.text)) include = true;
			continue;
		}
		if (!include) continue;
		if (block.kind === 'ul') for (const item of block.items) take(item);
		else if (block.kind === 'p') take(block.inlines);
	}
	return links;
}

const publisher = {
	'@type': 'Organization',
	name: 'Escherbridge',
	legalName: 'Escherbridge, LLC'
} as const;

export function articleStructuredData(guide: GuideDocument) {
	return {
		headline: guide.title,
		description: guide.description,
		datePublished: guide.publishedAt,
		dateModified: guide.reviewedAt,
		author: { '@type': 'Organization', name: guide.author },
		publisher,
		mainEntityOfPage: guide.canonical,
		citation: guide.sources.map((source) => ({
			'@type': 'CreativeWork',
			name: source.name,
			url: source.urls[0],
			...(source.datePublished ? { datePublished: source.datePublished } : {}),
			...(source.urls.length > 1 ? { sameAs: source.urls.slice(1) } : {})
		}))
	};
}

export function articleBreadcrumbData(guide: GuideDocument) {
	return {
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: publicSiteUrl('/') },
			{ '@type': 'ListItem', position: 2, name: 'Guides', item: publicSiteUrl('/guides') },
			{ '@type': 'ListItem', position: 3, name: guide.breadcrumb, item: guide.canonical }
		]
	};
}

export function guidesCollectionData() {
	return {
		name: guidesIndex.seoTitle,
		url: guidesIndex.canonical,
		description: guidesIndex.description,
		author: { '@type': 'Organization', name: guidesIndex.author },
		publisher,
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: indexGuideLinks().map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				url: item.href.startsWith('http') ? item.href : publicSiteUrl(item.href)
			}))
		}
	};
}

export function guidesBreadcrumbData() {
	return {
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: publicSiteUrl('/') },
			{ '@type': 'ListItem', position: 2, name: 'Guides', item: publicSiteUrl('/guides') }
		]
	};
}
