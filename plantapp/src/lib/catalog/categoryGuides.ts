export interface CategoryGuide {
	href: string;
	label: string;
}

function guide(slug: string, label: string): CategoryGuide {
	return { href: `/guides/${slug}`, label };
}

const hydroponics = guide('choosing-hydroponic-system', 'Choosing a first hydroponic system');
const aquaponics = guide('small-scale-aquaponics', 'Small-scale aquaponics');
const silvopasture = guide('temperate-silvopasture', 'Temperate silvopasture');
const agroforestry = guide(
	'temperate-food-forest',
	'Temperate food forests: layers, guilds, and how to start'
);
const kits = guide('permaculture-guilds', 'Permaculture planting guilds');
const supplies = guide('raised-beds', 'Raised beds: width, depth, and soil');

/** One entry guide for each catalogue category, including its child shelves. */
export const categoryGuides: Record<string, CategoryGuide> = {
	hydroponics,
	'hydroponic-systems': hydroponics,
	'nutrients-media': hydroponics,
	'soil-testing': hydroponics,
	aquaponics,
	'aquaponic-systems': aquaponics,
	'fish-supplies': aquaponics,
	silvopasture,
	'silvopasture-supplies': silvopasture,
	agroforestry,
	'agroforestry-supplies': agroforestry,
	kits,
	'kits-collections': kits,
	'starter-kits': kits,
	composting: kits,
	supplies,
	'seeds-supplies': supplies,
	'heirloom-seeds': supplies,
	'seeds-plants': supplies,
	'plants-seeds': supplies,
	'hand-tools': supplies,
	'garden-tools': supplies
};

export function guideForCategory(slug: string | null | undefined): CategoryGuide | null {
	if (!slug) return null;
	return categoryGuides[slug] ?? null;
}

const verticalGrowing = guide('vertical-growing', 'Vertical hydroponic growing: density and light');
const noDig = guide('no-dig-sheet-mulch', 'No-dig beds and sheet mulching');
const rainwaterGuide = guide(
	'rainwater-irrigation-quality',
	'Harvesting rainwater for garden irrigation'
);
const seasonExtension = guide(
	'season-extension-covers-frames',
	'Row covers, low tunnels, and cold frames'
);
const hydroponicMedia = guide(
	'hydroponic-media',
	'Soilless hydroponic media: perlite, rockwool, and coir'
);
const indoorLighting = guide(
	'indoor-lighting-dli',
	'Daily light integral for indoor and greenhouse greens'
);
const nutrientFilm = guide(
	'nutrient-film-technique',
	'Nutrient film technique: slope, flow and channel length'
);
const ecPh = guide('hydroponic-ec-ph-nutrients', 'Hydroponic nutrients, EC, and pH');
const outdoorIpm = guide(
	'outdoor-bed-ipm',
	'Integrated pest management in outdoor beds and containers'
);

/**
 * Preview guides that should not follow the category default.
 * Kits otherwise use permaculture guilds. Supplies otherwise use raised beds.
 *
 * Left on that default because no published guide fits the product:
 * mushroom cultivation, microgreens, worm composting, the compost starter,
 * and seed saving. The trowel stays on raised beds, the bed guide for a
 * hand tool. Seed collections (heirloom vault, artisan packets, tomato
 * collection, pollinator mix) stay on raised beds: the live seed notes are
 * soilless plug starting and hydroponic crop choice, and both say they are
 * not seed catalogs. Outdoor-bed IPM fits the beneficial-insect kit, not a
 * wildflower mix.
 * Herb spiral and the permaculture starter stay on guilds on purpose.
 * Aeroponics stays on choosing a system: there is no aeroponics guide.
 * Deep water culture stays there too: its sentence does not promise a missing topic.
 */
const productGuides: Record<string, CategoryGuide> = {
	'vertical-tower-garden-system': verticalGrowing,
	'hydroponic-grow-tent-kit': indoorLighting,
	'nft-hydroponic-channel-system': nutrientFilm,
	'digital-ph-ec-meter-set': ecPh,
	'soil-building-amendment-kit': noDig,
	'rainwater-harvesting-kit': rainwaterGuide,
	'season-extension-kit': seasonExtension,
	'rockwool-cubes-growing-media-sampler': hydroponicMedia,
	'beneficial-insect-habitat-kit': outdoorIpm
};

export function guideForProduct(slug: string | null | undefined): CategoryGuide | null {
	if (!slug) return null;
	return productGuides[slug] ?? null;
}

export interface ProductGuideLink {
	/** Visible anchor text, compared after whitespace is collapsed. */
	text: string;
	/** Href stored on the live catalogue rows this rule replaces. */
	from: string;
	/** Other stored hrefs that should match, such as a legacy guide this rule retires. */
	alsoFrom?: readonly string[];
	/**
	 * Destination when the anchor stays.
	 * Omitted when `paragraph` removes the link.
	 */
	href?: string;
	/** Replacement for the anchor's inner HTML. Omit to keep the stored text. */
	textTo?: string;
	/** Case-insensitive snippet that must appear in the same paragraph. */
	context?: string;
	/** Replaces the inner HTML of the paragraph that contains the matched anchor. */
	paragraph?: string;
	/**
	 * Deletes that paragraph, including the whitespace around it.
	 * Used when the stored claim should leave no replacement text.
	 */
	removeParagraph?: boolean;
}

/**
 * In-body guide anchors. Product pages render `descriptionHtml` from the
 * database. A rule matches the stored anchor text and that old href.
 * The seed file is left as it is. "Aevani learning hub" stays on `/learn`.
 */
export const productGuideLinks: readonly ProductGuideLink[] = [
	{
		text: 'hydroponics field guide',
		from: '/learn',
		href: '/guides/choosing-hydroponic-system'
	},
	{
		text: 'aquaponics field guide',
		from: '/learn',
		href: '/guides/small-scale-aquaponics'
	},
	{
		text: 'silvopasture guide',
		from: '/learn',
		href: '/guides/temperate-silvopasture'
	},
	{
		text: 'soil-health guide',
		from: '/learn',
		href: '/guides/no-dig-sheet-mulch'
	},
	{
		// The chestnut seedlings row stores the ampersand escaped. anchorText does not decode it.
		text: 'silvopasture &amp; agroforestry guide',
		from: '/learn',
		href: '/guides/temperate-food-forest',
		textTo: 'food forest guide'
	},
	{
		text: 'soil-health guide',
		from: '/learn',
		alsoFrom: ['/guides/understanding-soil-health'],
		href: '/guides/no-dig-sheet-mulch',
		context: 'why behind each one',
		paragraph:
			'For how a bed is built from compost layers and worm castings, see the <a href="/guides/no-dig-sheet-mulch">no-dig guide</a>.'
	},
	{
		// Prod rows still store /learn. The seed already points at the system guide.
		text: 'hydroponics field guide',
		from: '/learn',
		alsoFrom: ['/guides/choosing-hydroponic-system'],
		href: '/guides/hydroponic-ec-ph-nutrients',
		context: 'target ranges by crop'
	},
	{
		text: 'hydroponics field guide',
		from: '/learn',
		alsoFrom: ['/guides/choosing-hydroponic-system'],
		href: '/guides/nutrient-film-technique',
		context: 'nft spacing and flow',
		paragraph:
			'Growing greens at volume? The <a href="/guides/nutrient-film-technique">nutrient film technique guide</a> covers channel slope, flow rate and channel length.'
	},
	{
		text: 'hydroponics field guide',
		from: '/learn',
		alsoFrom: ['/guides/choosing-hydroponic-system'],
		href: '/guides/indoor-lighting-dli',
		context: 'airflow, humidity, and light height',
		paragraph:
			'Dialing in your first environment? The <a href="/guides/indoor-lighting-dli">indoor lighting guide</a> covers daily light for greens.'
	},
	{
		// Both closing sentences go: the lead-in and the aeroponics-chapter claim.
		text: 'hydroponics field guide',
		from: '/learn',
		alsoFrom: ['/guides/choosing-hydroponic-system'],
		context: 'aeroponics chapter',
		removeParagraph: true
	}
];

const hydroponicMediaClose =
	'<p>Start seeds, root cuttings, and compare how each medium holds water and air.</p>';
const hydroponicMediaFollow =
	'<p>Perlite, rockwool, and coir are covered in the <a href="/guides/hydroponic-media">hydroponic media guide</a>.</p>';
const nutrientFilmSentence =
	'The <a href="/guides/nutrient-film-technique">nutrient film technique guide</a> covers channel slope, flow rate and channel length.';

const hrefAttribute = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

function anchorText(inner: string): string {
	return inner
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;|&#160;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}

/** Path of an internal href, so `/learn/`, `/learn?x`, and the absolute site URL match `/learn`. */
function guidePath(href: string): string {
	const trimmed = href.trim();
	let path = trimmed;
	if (/^https?:\/\//i.test(trimmed)) {
		try {
			const url = new URL(trimmed);
			const host = url.hostname.toLowerCase();
			if (host !== 'aevani.com' && host !== 'www.aevani.com') return trimmed;
			path = url.pathname;
		} catch {
			return trimmed;
		}
	}
	const bare = path.split(/[?#]/)[0] ?? path;
	const normalized = bare.length > 1 && bare.endsWith('/') ? bare.slice(0, -1) : bare;
	return normalized.toLowerCase();
}

function hrefMatches(entry: ProductGuideLink, path: string): boolean {
	if (path === guidePath(entry.from)) return true;
	return (entry.alsoFrom ?? []).some((candidate) => guidePath(candidate) === path);
}

function paragraphWindow(html: string, offset: number): string {
	const start = html.lastIndexOf('<p', offset);
	const end = html.indexOf('</p>', offset);
	if (start !== -1 && end !== -1 && start <= offset) return html.slice(start, end + 4);
	return html.slice(Math.max(0, offset - 240), Math.min(html.length, offset + 240));
}

function paragraphRule(inner: string): ProductGuideLink | undefined {
	const anchors = inner.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi);
	for (const anchor of anchors) {
		const text = anchorText(anchor[2] ?? '');
		const match = hrefAttribute.exec(anchor[1] ?? '');
		if (!match) continue;
		const value = match[1] ?? match[2] ?? match[3] ?? '';
		const path = guidePath(value);
		const rule = productGuideLinks.find(
			(entry) =>
				(Boolean(entry.paragraph) || entry.removeParagraph === true) &&
				entry.text === text &&
				hrefMatches(entry, path) &&
				Boolean(entry.context) &&
				inner.toLowerCase().includes(entry.context!.toLowerCase())
		);
		if (rule) return rule;
	}
	return undefined;
}

function ruleMatchesAnchor(
	entry: ProductGuideLink,
	text: string,
	path: string,
	window: string
): boolean {
	if (entry.paragraph || entry.removeParagraph) return false;
	if (!entry.href || entry.text !== text || !hrefMatches(entry, path)) return false;
	if (!entry.context) return true;
	return window.toLowerCase().includes(entry.context.toLowerCase());
}

function storedGuideHref(attrs: string): string {
	const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(attrs);
	return guidePath(match?.[1] ?? match?.[2] ?? match?.[3] ?? '');
}

/**
 * Claim text that may sit outside a `<p>`, or on an anchor that carries extra attributes.
 * Prod stores `/learn`. The seed and some rendered copies use the system guide.
 */
function rewriteLooseClaims(html: string): string {
	const allowed = new Set(['/learn', '/guides/choosing-hydroponic-system']);
	const replace = (pattern: RegExp, replacement: string, source: string) =>
		source.replace(pattern, (full: string, attrs: string) =>
			allowed.has(storedGuideHref(attrs)) ? replacement : full
		);
	const lighting = replace(
		/<a\b([^>]*)>\s*hydroponics field guide\s*<\/a>\s*covers airflow, humidity, and light height\./gi,
		'<a href="/guides/indoor-lighting-dli">indoor lighting guide</a> covers daily light for greens.',
		html
	);
	const nft = replace(
		/(?:The\s+)?<a\b([^>]*)>\s*hydroponics field guide\s*<\/a>\s*covers NFT spacing and flow rates\./gi,
		nutrientFilmSentence,
		lighting
	);
	return replace(
		/(?:The\s+)?<a\b([^>]*)>\s*hydroponics field guide\s*<\/a>\s*has a full aeroponics chapter\.\s*/gi,
		'',
		nft
	);
}

/**
 * The previous aeroponics close, and a claim that was not inside a `<p>`.
 * An emptied paragraph is removed so the page does not keep a blank `<p>`.
 */
function stripRetiredAeroponicsCopy(html: string): string {
	if (
		!html.includes('Ready to push technique') &&
		!html.includes('None of the published guides includes an aeroponics chapter.')
	) {
		return html;
	}
	const stripped = html
		.replace(/Ready to push technique\?\s*/g, '')
		.replace(/None of the published guides includes an aeroponics chapter\.\s*/g, '')
		.replace(/\s*<p\b[^>]*>\s*<\/p>/gi, '');
	return stripped.trim() ? stripped : '';
}

/**
 * Rewrite stored field-guide anchors at render time.
 * A link changes only when its text and its old href both match a rule.
 * Paragraph rules replace a whole sentence when the stored claim does not fit the destination.
 * A `removeParagraph` rule drops the paragraph instead of leaving a new sentence.
 * Extra attributes on the anchor are ignored, and the replacement keeps only href.
 * Running the function again on its own output changes nothing.
 */
export function rewriteProductGuideLinks(html: string): string {
	if (!html) return html;
	const withParagraphs = html.replace(
		/([ \t]*\n)?<p(\s[^>]*)?>([\s\S]*?)<\/p>([ \t]*\n)?/gi,
		(
			full,
			before: string | undefined,
			attrs: string | undefined,
			inner: string,
			after: string | undefined
		) => {
			const rule = paragraphRule(inner);
			if (rule?.removeParagraph) return '';
			if (!rule?.paragraph) return full;
			return `${before ?? ''}<p${attrs ?? ''}>${rule.paragraph}</p>${after ?? ''}`;
		}
	);
	const withClaims = stripRetiredAeroponicsCopy(rewriteLooseClaims(withParagraphs));
	const withAnchors = withClaims.replace(
		/<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
		(full, attrs: string, inner: string, offset: number, source: string) => {
			const text = anchorText(inner);
			const match = hrefAttribute.exec(attrs);
			if (!match) return full;
			const value = match[1] ?? match[2] ?? match[3] ?? '';
			const path = guidePath(value);
			const window = paragraphWindow(source, offset);
			const matches = productGuideLinks.filter((entry) =>
				ruleMatchesAnchor(entry, text, path, window)
			);
			const rule =
				matches.find((entry) => entry.context) ?? matches.find((entry) => !entry.context);
			if (!rule?.href) return full;

			// Drop every attribute except the new href. Stored rows may carry rel or other
			// attributes, and the sanitizer keeps an anchor only when href is the only one.
			return `<a href="${rule.href}">${rule.textTo ?? inner}</a>`;
		}
	);
	let result = withAnchors;
	if (result.includes(hydroponicMediaClose) && !result.includes('/guides/hydroponic-media')) {
		result = result.replace(hydroponicMediaClose, hydroponicMediaClose + hydroponicMediaFollow);
	}
	if (result === html) return html;
	const tidied = result.replace(/\s+$/g, '');
	return tidied.trim() ? tidied : '';
}

/** Product-page load data. Rewritten HTML is what SvelteKit serializes for the client. */
export function rewriteProductPageData<T extends { descriptionHtml?: string | null }>(data: {
	product: T;
	relatedProducts: readonly T[];
	categorySlug: string;
}): { product: T; relatedProducts: T[]; categorySlug: string } {
	const rewrite = (product: T): T => {
		if (!product.descriptionHtml) return product;
		const descriptionHtml = rewriteProductGuideLinks(product.descriptionHtml);
		return descriptionHtml === product.descriptionHtml ? product : { ...product, descriptionHtml };
	};
	return {
		categorySlug: data.categorySlug,
		product: rewrite(data.product),
		relatedProducts: data.relatedProducts.map(rewrite)
	};
}
