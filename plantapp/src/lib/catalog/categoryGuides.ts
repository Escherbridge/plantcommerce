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

/**
 * Preview guides that should not follow the category default.
 * Kits otherwise use permaculture guilds. Supplies otherwise use raised beds.
 *
 * Left on that default because no published guide fits the product:
 * mushroom cultivation, microgreens, worm composting, the compost starter,
 * and seed saving. The trowel stays on raised beds, the bed guide for a
 * hand tool. The pollinator mix stays on raised beds: outdoor-bed IPM is a
 * pest procedure, and guilds are a tree planting, not a native-meadow note.
 * Herb spiral and the permaculture starter stay on guilds on purpose.
 * Aeroponics stays on choosing a system: there is no aeroponics guide.
 */
const productGuides: Record<string, CategoryGuide> = {
	'vertical-tower-garden-system': verticalGrowing,
	'soil-building-amendment-kit': noDig,
	'rainwater-harvesting-kit': rainwaterGuide,
	'season-extension-kit': seasonExtension,
	'rockwool-cubes-growing-media-sampler': hydroponicMedia
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
		text: 'hydroponics field guide',
		from: '/guides/choosing-hydroponic-system',
		href: '/guides/hydroponic-ec-ph-nutrients',
		context: 'target ranges by crop'
	},
	{
		text: 'hydroponics field guide',
		from: '/guides/choosing-hydroponic-system',
		href: '/guides/nutrient-film-technique',
		context: 'nft spacing and flow'
	},
	{
		text: 'hydroponics field guide',
		from: '/guides/choosing-hydroponic-system',
		href: '/guides/indoor-lighting-dli',
		context: 'airflow, humidity, and light height',
		paragraph:
			'Dialing in your first environment? The <a href="/guides/indoor-lighting-dli">indoor lighting guide</a> covers daily light for greens.'
	},
	{
		text: 'hydroponics field guide',
		from: '/guides/choosing-hydroponic-system',
		context: 'aeroponics chapter',
		paragraph:
			'Ready to push technique? None of the published guides includes an aeroponics chapter.'
	}
];

const hydroponicMediaClose =
	'<p>Start seeds, root cuttings, and compare how each medium holds water and air.</p>';
const hydroponicMediaFollow =
	'<p>Perlite, rockwool, and coir are covered in the <a href="/guides/hydroponic-media">hydroponic media guide</a>.</p>';

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
				Boolean(entry.paragraph) &&
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
	if (entry.paragraph) return false;
	if (!entry.href || entry.text !== text || !hrefMatches(entry, path)) return false;
	if (!entry.context) return true;
	return window.toLowerCase().includes(entry.context.toLowerCase());
}

/**
 * Rewrite stored field-guide anchors at render time.
 * A link changes only when its text and its old href both match a rule.
 * Paragraph rules replace a whole sentence when the stored claim does not fit the destination.
 */
export function rewriteProductGuideLinks(html: string): string {
	if (!html) return html;
	const withParagraphs = html.replace(
		/<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi,
		(full, attrs: string | undefined, inner: string) => {
			const rule = paragraphRule(inner);
			if (!rule?.paragraph) return full;
			return `<p${attrs ?? ''}>${rule.paragraph}</p>`;
		}
	);
	const withAnchors = withParagraphs.replace(
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

			const quoted = match[1] !== undefined ? '"' : match[2] !== undefined ? "'" : '';
			const replacement = quoted ? `href=${quoted}${rule.href}${quoted}` : `href="${rule.href}"`;
			const nextAttrs =
				attrs.slice(0, match.index) + replacement + attrs.slice(match.index + match[0].length);
			return `<a${nextAttrs}>${rule.textTo ?? inner}</a>`;
		}
	);
	if (
		withAnchors.includes(hydroponicMediaClose) &&
		!withAnchors.includes('/guides/hydroponic-media')
	) {
		return withAnchors.replace(hydroponicMediaClose, hydroponicMediaClose + hydroponicMediaFollow);
	}
	return withAnchors;
}
