// Shared catalogue normalization helpers for /products and the per-system
// category pages. Lives in a plain module (NOT +page.ts) because SvelteKit
// route modules may only export `load`/`_`-prefixed symbols. See design-spec §6/§7.

import {
	isPlaceholderListing,
	isSuppressedCatalogueBadge,
	presentPlaceholderListing,
	sanitizePlaceholderProduct
} from '$lib/catalog/placeholderListing';

/**
 * Exact product slug -> real `/assets/*.png` image (normalized from each product's
 * DB bucket_path). A real url from tRPC always wins when present. See design-spec §7.
 */
const PRODUCT_IMAGE: Record<string, string> = {
	// Hydroponics
	'vertical-tower-garden-system': '/assets/hydrotoolproduct-verticaltowergardensystem.png',
	'nft-hydroponic-channel-system': '/assets/hydrotoolproduct-nfthydroponicchannelsystem.png',
	'aeroponic-misting-system': '/assets/hydrotoolproduct-aeroponicmistingsystem.png',
	'deep-water-culture-bucket-system':
		'/assets/hydrotoolproduct-deepwaterculture-dwc-bucket-system.png',
	'hydroponic-grow-tent-kit': '/assets/hydrotoolproduct-hydroponicgrowtentkit.png',
	'hydroponic-nutrients-trio': '/assets/hydrotoolproduct-hydroponicnutrientstrio.png',
	'net-pots-clay-pebbles-bundle': '/assets/hydrotoolproduct-hydroponicnetpots-claypebbles.png',
	'rockwool-cubes-growing-media-sampler': '/assets/hydrotoolproduct-rockwoolcubes-growingmedia.png',
	// Aquaponics
	'ibc-aquaponics-fish-tank': '/assets/toolproduct-aquaponicfishtank.png',
	'commercial-aquaponics-grow-bed': '/assets/toolproduct-aquaponicbed.png',
	'aquaponics-bell-siphon-kit': '/assets/toolproduct-aquaponicsbellsiphonkit.png',
	'aquaponics-water-testing-kit': '/assets/toolproduct-aquaponicswatertestingkit.png',
	'aquaponics-stocking-notes': '/assets/toolproduct-aquaponicsfish.png',
	'countertop-aquaponics-starter-system': '/assets/toolproduct-aquaponic.png',
	// Silvopasture
	'silvopasture-seed-mix': '/assets/silvopasture-agroforestryproducts-silvopastureseedmix.png',
	'portable-electric-netting-164-ft':
		'/assets/silvopasture-agroforestryproducts-portableelectricnettingforrotationalgrazing.png',
	'livestock-water-trough-shaded':
		'/assets/silvopasture-agroforestryproducts-livestockwatertrough.png',
	'tree-shelters-protectors-25-pack':
		'/assets/silvopasture-agroforestryproducts-treeshelters-protectors.png',
	'forage-chicory-plants-50-plugs':
		'/assets/silvopasture-agroforestryproducts-foragechicoryplants.png',
	'nitrogen-fixing-tree-seeds-collection':
		'/assets/silvopasture-agroforestryproducts-nitrogen-fixingtreeseeds.png',
	// Agroforestry
	'chestnut-tree-seedlings-10-pack':
		'/assets/silvopasture-agroforestryproducts-permaculturestarterkit.png',
	// Kits & collections (Starter kits)
	'permaculture-starter-kit': '/assets/generalkits-collections-permaculturestarterkit.png',
	'mushroom-cultivation-kit': '/assets/generalkits-collections-mushroomcultivationkit.png',
	'microgreens-growing-kit': '/assets/generalkits-collections-microgreensgrowingkit.png',
	'herb-spiral-garden-kit': '/assets/generalkits-collections-herb-spiral-garden-kit.png',
	'soil-building-amendment-kit': '/assets/generalkits-collections-soil-building-amendment-kit.png',
	'rainwater-harvesting-kit':
		'/assets/generalkits-collections-rainwater-harvesting-kit-components.png',
	'beneficial-insect-habitat-kit':
		'/assets/generalkits-collections-beneficial-insect-habitat-kit.png',
	'worm-composting-vermicompost-kit':
		'/assets/generalkits-collections-worm-composting-vermicompost-kit.png',
	'composting-starter-kit': '/assets/generalkits-collections-compostingstarterkit.png',
	'grafting-propagation-kit': '/assets/generalkits-collections-permaculturestarterkit.png',
	'season-extension-kit': '/assets/generalkits-collections-permaculturestarterkit.png',
	'seed-saving-starter-kit': '/assets/plantproduct-seed.png',
	// Seeds & supplies (Plants & Seeds + Garden Tools)
	'heirloom-tomato-collection': '/assets/plantproduct-tomato.png',
	'medicinal-herb-garden-kit': '/assets/plantproduct-med.png',
	'heirloom-seed-vault': '/assets/plantproduct-seed.png',
	'artisan-seed-packet-collection': '/assets/plantproduct-seed.png',
	'pollinator-garden-seed-collection':
		'/assets/generalkits-collections-pollinatorgardenseedcollection.png',
	'hand-forged-garden-trowel': '/assets/toolproduct-trowl.png',
	'digital-ph-ec-meter-set': '/assets/hydrotoolproduct-rockwoolcubes-growingmedia.png'
};

/** Per-system fallback image when a product slug is not individually mapped. */
const SYSTEM_FALLBACK: Record<string, string> = {
	hydroponics: '/assets/toolproduct-hydroponic.png',
	aquaponics: '/assets/toolproduct-aquaponic.png',
	silvopasture: '/assets/silvopasture-agroforestryproducts-silvopastureseedmix.png',
	agroforestry: '/assets/silvopasture-agroforestryproducts-nitrogen-fixingtreeseeds.png',
	'kits-collections': '/assets/generalkits-collections-permaculturestarterkit.png',
	'plants-seeds': '/assets/plantproduct-seed.png',
	'garden-tools': '/assets/toolproduct-trowl.png'
};

const FALLBACK_IMAGE = '/assets/plantproduct-seed.png';

export type CatalogProduct = {
	id: number;
	name: string;
	slug: string;
	shortDescription: string | null;
	description: string | null;
	price: string | null;
	comparePrice: string | null;
	isFeatured: boolean;
	badges: string[];
	/** True when the row is not an actual sale. Prices and stock badges stay off. */
	placeholder: boolean;
	/** Top-level growing-system slug (hydroponics, aquaponics, plants-seeds, …). */
	system: string;
	categoryName: string;
	image: string;
	imageAlt: string;
	href: string;
};

/** Map every category id to its top-level (parent) slug for system grouping + URLs. */
export function buildParentSlugMap(categories: any[]): Map<number, string> {
	const byId = new Map(categories.map((c: any) => [c.id, c]));
	const map = new Map<number, string>();
	for (const cat of categories) {
		if (cat.parentId && byId.has(cat.parentId)) {
			map.set(cat.id, byId.get(cat.parentId).slug);
		} else {
			map.set(cat.id, cat.slug);
		}
	}
	return map;
}

export function normalizeCatalogProduct(
	row: any,
	parentSlugMap: Map<number, string>
): CatalogProduct {
	const p = row.product ?? row;
	const cat = row.category ?? p.category ?? null;
	const system = cat ? (parentSlugMap.get(cat.id) ?? cat.slug) : 'all';
	const placeholder = isPlaceholderListing(p);
	const source = placeholder ? sanitizePlaceholderProduct(p) : p;
	const copy = placeholder ? presentPlaceholderListing(source) : null;
	const realUrl =
		Array.isArray(source.images) && source.images[0]?.url ? String(source.images[0].url) : null;
	const image = realUrl ?? PRODUCT_IMAGE[source.slug] ?? SYSTEM_FALLBACK[system] ?? FALLBACK_IMAGE;

	return {
		id: source.id,
		name: source.name,
		slug: source.slug,
		shortDescription: copy ? copy.shortDescription : (source.shortDescription ?? null),
		description: copy ? copy.description : (source.description ?? null),
		price: placeholder ? null : String(source.price),
		comparePrice: placeholder || !source.comparePrice ? null : String(source.comparePrice),
		isFeatured: Boolean(source.isFeatured),
		badges: (Array.isArray(source.badges) ? source.badges : []).filter(
			(badge: string) => !placeholder || !isSuppressedCatalogueBadge(badge)
		),
		placeholder,
		system,
		categoryName: cat?.name ?? '',
		image,
		imageAlt:
			(Array.isArray(source.images) && source.images[0]?.altText) ||
			copy?.shortDescription ||
			source.shortDescription ||
			source.name,
		href: `/products/${system}/${source.slug}`
	};
}

/**
 * Category crumb targets that exist. Kits and supplies have no `/products/{slug}`
 * page; their catalogue filters are the pages that list them.
 */
const productCategoryHrefs: Record<string, string> = {
	hydroponics: '/products/hydroponics',
	'hydroponic-systems': '/products/hydroponics',
	'nutrients-media': '/products/hydroponics',
	'soil-testing': '/products/hydroponics',
	aquaponics: '/products/aquaponics',
	'aquaponic-systems': '/products/aquaponics',
	'fish-supplies': '/products/aquaponics',
	silvopasture: '/products/silvopasture',
	'silvopasture-supplies': '/products/silvopasture',
	agroforestry: '/products/agroforestry',
	'agroforestry-supplies': '/products/agroforestry',
	kits: '/products?category=kits-collections',
	'kits-collections': '/products?category=kits-collections',
	'starter-kits': '/products?category=kits-collections',
	composting: '/products?category=kits-collections',
	supplies: '/products?category=seeds-supplies',
	'seeds-supplies': '/products?category=seeds-supplies',
	'heirloom-seeds': '/products?category=seeds-supplies',
	'seeds-plants': '/products?category=seeds-supplies',
	'hand-tools': '/products?category=seeds-supplies',
	'plants-seeds': '/products?category=seeds-supplies',
	'garden-tools': '/products?category=seeds-supplies'
};

export function productCategoryHref(categorySlug: string): string | null {
	return productCategoryHrefs[categorySlug] ?? null;
}

/**
 * Breadcrumb label for the page `productCategoryHref(routeCategorySlug)` opens.
 * The pH/EC meter is filed under the Soil Testing shelf, which has no listing
 * of its own. Its crumb opens /products/hydroponics, so the label is that page.
 */
export function productBreadcrumbLabel(
	routeCategorySlug: string,
	productCategory: { name?: string | null; slug?: string | null } | null | undefined
): string {
	const storedName = productCategory?.name?.trim() || routeCategorySlug;
	if (
		productCategory?.slug === 'soil-testing' &&
		productCategoryHref(routeCategorySlug) === '/products/hydroponics'
	) {
		return 'Hydroponics';
	}
	return storedName;
}

/** Old category indexes. They have no page; the catalogue filter lists them. */
export function legacyCatalogueIndexRedirect(pathname: string): string | null {
	if (pathname === '/products/kits') return productCategoryHref('kits');
	if (pathname === '/products/supplies') return productCategoryHref('supplies');
	return null;
}

/** Chip id -> product system. Kits and supplies use the parent category slug. */
export function catalogChipMatches(chipId: string, system: string): boolean {
	if (chipId === 'all') return true;
	if (chipId === 'kits-collections') return system === 'kits' || system === 'kits-collections';
	if (chipId === 'seeds-supplies') {
		return system === 'supplies' || system === 'plants-seeds' || system === 'garden-tools';
	}
	return system === chipId;
}
