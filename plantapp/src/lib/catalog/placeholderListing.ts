/**
 * Public presentation for catalogue rows that are not for sale.
 *
 * A row is a placeholder unless `comingSoon` is explicitly false — the same
 * rule as `productIsPurchasable`. This module only rewrites copy for the
 * page. It does not change stored rows, checkout, or payment.
 */

export const TILAPIA_TAGLINE =
	"Example listing for live fingerlings. Aevani doesn't sell or ship live animals.";

export const HERB_TAGLINE =
	"Example listing for starter plants. Aevani doesn't sell or ship live plants.";

export const SHIPPING_SPEC = 'Shipping terms will be written by the seller on a real listing.';

export const FAQ_DEAD_FISH =
	"Aevani doesn't sell or ship live animals. When a real seller lists fingerlings, their arrival terms will be on that listing.";

export const FAQ_TILAPIA_LEGAL =
	"Some states restrict tilapia. That's a real limit for any future listing, but Aevani doesn't sell or ship live animals now.";

export interface ListingStat {
	value: string;
	label: string;
}

export interface ListingSpec {
	label: string;
	value: string;
}

export interface ListingFaq {
	q: string;
	a: string;
}

export interface PlaceholderCopySource {
	slug?: string | null;
	name?: string | null;
	shortDescription?: string | null;
	description?: string | null;
	descriptionHtml?: string | null;
	keyFeatures?: string[] | null;
	stats?: ListingStat[] | null;
	specs?: ListingSpec[] | null;
	inTheBox?: string[] | null;
	faqs?: ListingFaq[] | null;
	badges?: string[] | null;
	testBedNote?: string | null;
	comingSoon?: boolean | null;
}

/** NULL, true, and a missing flag are placeholders. Only explicit false is a sale. */
export function isPlaceholderListing(
	product: { comingSoon?: boolean | null } | null | undefined
): boolean {
	return product?.comingSoon !== false;
}

const CLAIM_SENTENCE =
	/\b(?:overnight|live-arrival|live shipment|packed with oxygen|oxygen packs?|we ship|ships with|we replace|warrant(?:y|ies)|test beds?|test rooms?|field-tested|field tested|before they arrive|yield notes|free replacement)\b/i;

const TIMING_STAT =
	/(?:^|\s)[~<]*\d[\d.+–-]*\s*(?:min|mins|minutes|hrs?|hours|days?|wks?|weeks?|mos?|months?|yrs?|years?)\b/i;

const PERFORMANCE_STAT =
	/harvest|faster|test rooms?|test beds?|field-tested|field tested|guarantee|warrant(?:y|ies)|overnight|live-arrival|yield/i;

/** Stock, bestseller, and live badges. Other labels stay. No Preview badge is added. */
export function isSuppressedCatalogueBadge(badge: string): boolean {
	const value = badge.trim().toLowerCase();
	return (
		value === 'bestseller' ||
		value === 'live' ||
		value === 'in stock' ||
		value === 'out of stock' ||
		value === 'coming soon' ||
		value === 'sale'
	);
}

export function visibleCatalogueBadges(badges: readonly string[] | null | undefined): string[] {
	return (badges ?? []).filter((badge) => !isSuppressedCatalogueBadge(badge));
}

export function isTimingOrPerformanceStat(stat: ListingStat): boolean {
	const blob = `${stat.value} ${stat.label}`;
	return TIMING_STAT.test(blob) || PERFORMANCE_STAT.test(blob);
}

function stripTags(value: string): string {
	return value.replace(/<[^>]*>/g, ' ');
}

function scrubProse(value: string): string {
	return value
		.split(/(?<=[.!?])\s+/)
		.filter((part) => part.trim() && !CLAIM_SENTENCE.test(stripTags(part)))
		.join(' ')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/[ \t]{2,}/g, ' ')
		.trim();
}

function scrubHtml(html: string): string {
	return html.replace(/<(p|li|h2|h3)>([\s\S]*?)<\/\1>/gi, (_full, tag: string, inner: string) => {
		const cleaned = scrubProse(inner);
		return cleaned ? `<${tag}>${cleaned}</${tag}>` : '';
	});
}

function presentLongText(value: string | null | undefined): string | null {
	if (!value) return null;
	const rewritten = rewriteKnownPhrases(value);
	const cleaned = /<[a-z]/i.test(rewritten) ? scrubHtml(rewritten) : scrubProse(rewritten);
	return cleaned || null;
}

function rewriteKnownPhrases(value: string): string {
	return value
		.replace(
			/Six live starters — lavender, chamomile, echinacea, peppermint, lemon balm, and calendula — arrive in biodegradable coir pots/gi,
			'Six starters — lavender, chamomile, echinacea, peppermint, lemon balm, and calendula — are the plants in this example, in biodegradable coir pots'
		)
		.replace(/\b6 live medicinal herb starters\b/gi, '6 herb starters')
		.replace(/\b6 live herb starters\b/gi, '6 herb starters')
		.replace(/\bLive starters in coir pots\b/g, 'Starters in coir pots');
}

function looksLikeTilapia(product: PlaceholderCopySource, short: string): boolean {
	const slug = (product.slug ?? '').toLowerCase();
	const name = (product.name ?? '').toLowerCase();
	const blob = `${slug} ${name} ${short}`.toLowerCase();
	if (slug.includes('tilapia') || name.includes('tilapia')) return true;
	return (
		/overnight shipping|live nile tilapia/.test(blob) && /tilapia|fingerling|nile|fish/.test(blob)
	);
}

function looksLikeHerbKit(product: PlaceholderCopySource, short: string): boolean {
	const slug = (product.slug ?? '').toLowerCase();
	const name = (product.name ?? '').toLowerCase();
	return (
		slug.includes('medicinal-herb') ||
		name.includes('medicinal herb') ||
		/6 live herb starters/i.test(short)
	);
}

function presentShortDescription(product: PlaceholderCopySource): string | null {
	const short = (product.shortDescription ?? '').trim();
	if (looksLikeTilapia(product, short)) return TILAPIA_TAGLINE;
	if (looksLikeHerbKit(product, short)) return HERB_TAGLINE;
	if (!short) return null;
	const cleaned = scrubProse(rewriteKnownPhrases(short));
	return cleaned || null;
}

function presentFeature(feature: string): string | null {
	const rewritten = rewriteKnownPhrases(feature).trim();
	if (!rewritten || CLAIM_SENTENCE.test(rewritten)) return null;
	return rewritten;
}

function presentBoxItem(item: string): string | null {
	const rewritten = rewriteKnownPhrases(item).trim();
	if (!rewritten || CLAIM_SENTENCE.test(rewritten)) return null;
	return rewritten;
}

function presentSpec(spec: ListingSpec): ListingSpec {
	if (/^shipping$/i.test(spec.label.trim())) {
		return { label: spec.label, value: SHIPPING_SPEC };
	}
	if (/overnight|oxygen pack|live-arrival|ships with|\bwe ship\b/i.test(spec.value)) {
		return { label: spec.label, value: SHIPPING_SPEC };
	}
	return { label: spec.label, value: rewriteKnownPhrases(spec.value) };
}

function presentFaq(faq: ListingFaq): ListingFaq | null {
	const question = faq.q.trim().toLowerCase().replaceAll('’', "'");
	if (question.startsWith('what if fish arrive dead')) {
		return { q: faq.q, a: FAQ_DEAD_FISH };
	}
	if (question.startsWith('is tilapia legal')) {
		return { q: faq.q, a: FAQ_TILAPIA_LEGAL };
	}
	const answer = scrubProse(rewriteKnownPhrases(faq.a));
	if (!answer) return null;
	return { q: faq.q, a: answer };
}

export interface PresentedListingCopy {
	shortDescription: string | null;
	description: string | null;
	descriptionHtml: string | null;
	keyFeatures: string[];
	stats: ListingStat[];
	specs: ListingSpec[];
	inTheBox: string[];
	faqs: ListingFaq[];
	badges: string[];
	testBedNote: string | null;
}

/** Rewrite placeholder copy for display. A real sale (`comingSoon === false`) is unchanged. */
export function presentPlaceholderListing(product: PlaceholderCopySource): PresentedListingCopy {
	if (product.comingSoon === false) {
		return {
			shortDescription: product.shortDescription ?? null,
			description: product.description ?? null,
			descriptionHtml: product.descriptionHtml ?? null,
			keyFeatures: product.keyFeatures ?? [],
			stats: product.stats ?? [],
			specs: product.specs ?? [],
			inTheBox: product.inTheBox ?? [],
			faqs: product.faqs ?? [],
			badges: product.badges ?? [],
			testBedNote: product.testBedNote ?? null
		};
	}

	const note = product.testBedNote ? scrubProse(rewriteKnownPhrases(product.testBedNote)) : '';

	return {
		shortDescription: presentShortDescription(product),
		description: presentLongText(product.description),
		descriptionHtml: presentLongText(product.descriptionHtml),
		keyFeatures: (product.keyFeatures ?? [])
			.map(presentFeature)
			.filter((feature): feature is string => feature !== null),
		stats: (product.stats ?? []).filter((stat) => !isTimingOrPerformanceStat(stat)),
		specs: (product.specs ?? []).map(presentSpec),
		inTheBox: (product.inTheBox ?? [])
			.map(presentBoxItem)
			.filter((item): item is string => item !== null),
		faqs: (product.faqs ?? []).map(presentFaq).filter((faq): faq is ListingFaq => faq !== null),
		badges: visibleCatalogueBadges(product.badges),
		testBedNote: note || null
	};
}

export function productStructuredData(input: {
	name: string;
	description?: string | null;
	image?: string | null;
	placeholder: boolean;
	price?: string | null;
	priceCurrency?: string | null;
	inStock?: boolean;
	url: string;
}): Record<string, unknown> {
	const description = input.description
		?.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	const product: Record<string, unknown> = {
		'@type': 'Product',
		name: input.name,
		brand: { '@type': 'Brand', name: 'Aevani' }
	};
	if (description) product.description = description;
	if (input.image) product.image = input.image;
	if (!input.placeholder) {
		product.offers = {
			'@type': 'Offer',
			price: input.price,
			priceCurrency: (input.priceCurrency || 'USD').toUpperCase(),
			availability: input.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
			url: input.url,
			itemCondition: 'https://schema.org/NewCondition'
		};
	}
	return product;
}
