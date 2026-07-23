// Shared catalogue normalization helpers for /products and the per-system
// category pages. Lives in a plain module (NOT +page.ts) because SvelteKit
// route modules may only export `load`/`_`-prefixed symbols. See design-spec §6/§7.

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
	'tilapia-fingerlings-starter-pack': '/assets/toolproduct-aquaponicstilapiafingerlings.png',
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
	price: string;
	comparePrice: string | null;
	isFeatured: boolean;
	badges: string[];
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
	const realUrl = Array.isArray(p.images) && p.images[0]?.url ? String(p.images[0].url) : null;
	const image = realUrl ?? PRODUCT_IMAGE[p.slug] ?? SYSTEM_FALLBACK[system] ?? FALLBACK_IMAGE;

	return {
		id: p.id,
		name: p.name,
		slug: p.slug,
		shortDescription: p.shortDescription ?? null,
		description: p.description ?? null,
		price: String(p.price),
		comparePrice: p.comparePrice ? String(p.comparePrice) : null,
		isFeatured: Boolean(p.isFeatured),
		badges: Array.isArray(p.badges) ? p.badges : [],
		system,
		categoryName: cat?.name ?? '',
		image,
		imageAlt: (Array.isArray(p.images) && p.images[0]?.altText) || p.shortDescription || p.name,
		href: `/products/${system}/${p.slug}`
	};
}
