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

/**
 * Preview guides that should not follow the category default.
 * The tower sits in hydroponic-systems, whose category guide is the
 * choosing-a-system page. Its own preview is the vertical growing guide.
 */
const productGuides: Record<string, CategoryGuide> = {
	'vertical-tower-garden-system': verticalGrowing
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
	href: string;
}

/**
 * In-body field-guide anchors. Product pages render `descriptionHtml` from
 * the database. That copy was loaded before the seed hrefs changed, so these
 * anchors still point at `/learn`. The seed file is left as it is.
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
	}
];

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

/**
 * Rewrite stored field-guide anchors at render time.
 * A link changes only when its text and its old href both match a rule.
 */
export function rewriteProductGuideLinks(html: string): string {
	if (!html) return html;
	return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (full, attrs: string, inner: string) => {
		const text = anchorText(inner);
		const rule = productGuideLinks.find((entry) => entry.text === text);
		if (!rule) return full;

		const match = hrefAttribute.exec(attrs);
		if (!match) return full;
		const value = match[1] ?? match[2] ?? match[3] ?? '';
		if (guidePath(value) !== rule.from) return full;

		const quoted = match[1] !== undefined ? '"' : match[2] !== undefined ? "'" : '';
		const replacement = quoted ? `href=${quoted}${rule.href}${quoted}` : `href="${rule.href}"`;
		const nextAttrs =
			attrs.slice(0, match.index) + replacement + attrs.slice(match.index + match[0].length);
		return `<a${nextAttrs}>${inner}</a>`;
	});
}
