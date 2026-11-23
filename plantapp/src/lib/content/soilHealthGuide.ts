/**
 * Retired soil-health passages. Stored `content_page` rows are not migrated.
 * `content.getPage` applies this to its output, which is the response body
 * SvelteKit inlines from the guide fetch. The guide page load applies it
 * again; a second pass changes nothing.
 * Markdown and HTML both match, including minor whitespace.
 */
const SOIL_HEALTH_SLUG = 'understanding-soil-health';

const SOIL_TEST_OLD =
	'Before amending, test. A basic soil test reveals pH, organic matter percentage, and major nutrient levels (N-P-K).';

const SOIL_TEST_NEW =
	'Before amending, test. A soil test gives a useful baseline on pH, salts, organic matter, phosphorus and potassium. Nitrogen readings have limited use for home gardeners, and a fall test will not reliably predict spring nitrogen.';

const COMPOST_OLD = 'Add 1-2 inches annually as top dressing';

const COMPOST_NEW =
	'For annual beds, add no more than 1 inch of manure or manure compost, or 2 inches of plant-based compost, a year, worked into the top 6 to 8 inches, until a moderate level is reached. Stop routine annual compost at about 5% organic matter, because over-amending may add excess salts.';

/** Whitespace, including the HTML forms a CMS may store for a line break. */
const GAP = String.raw`(?:\s|&nbsp;|&#160;|&#x0*a0;|<br\s*/?>)+`;

function escapeToken(token: string): string {
	return token
		.split('-')
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join(String.raw`\s*-\s*`);
}

function phrase(text: string): string {
	return text.trim().split(/\s+/).map(escapeToken).join(GAP);
}

const COMPOST_LABEL = String.raw`(?:\*\*\s*Compost\s*\*\*|__\s*Compost\s*__|<(?:strong|b)\b[^>]*>\s*Compost\s*</(?:strong|b)>)`;

export function rewriteSoilHealthGuideContent(content: string): string {
	const soil = new RegExp(phrase(SOIL_TEST_OLD), 'g');
	const compost = new RegExp(`(${COMPOST_LABEL})(\\s*-\\s*)(?:${phrase(COMPOST_OLD)})`, 'g');
	return content.replace(soil, SOIL_TEST_NEW).replace(compost, `$1$2${COMPOST_NEW}`);
}

export function presentSoilHealthGuide<
	T extends { page: { slug: string; content?: string | null } }
>(guide: T): T {
	if (guide.page.slug !== SOIL_HEALTH_SLUG || typeof guide.page.content !== 'string') return guide;
	const content = rewriteSoilHealthGuideContent(guide.page.content);
	if (content === guide.page.content) return guide;
	return { ...guide, page: { ...guide.page, content } };
}
