// Asset manifest — maps stable semantic keys to URL-safe static asset paths.
// Real PNGs live in `static/assets/` (copied + normalized from
// `src/lib/images/AI-MockAssets/`). Serving from `static/` gives stable URLs
// that survive the production build. See design-spec.md §7 for the source
// asset -> product mapping. Rationale/notes: src/lib/data/AGENTS.md.

export const ASSET_BASE = '/assets';

/**
 * Stable semantic key -> `/assets/<normalized>.png` URL.
 * Grouped by design-spec §7. Every value resolves to a real file in
 * `static/assets/` (verified against the copied directory).
 */
export const assetManifest: Record<string, string> = {
	// --- Home / heroes / brand backgrounds / global ---
	heroMain: `${ASSET_BASE}/mainhero.png`,
	communityHero: `${ASSET_BASE}/communityhero.png`,
	sustainabilityHero: `${ASSET_BASE}/sustainabilityhero.png`,
	successIllustration: `${ASSET_BASE}/success-state-illustration.png`,
	bgPolyculture: `${ASSET_BASE}/brand-abstract-backgrounds-abstract-polyculture-texture.png`,
	bgMycelium: `${ASSET_BASE}/brand-abstract-backgrounds-mycelium-network.png`,
	bgWaterGrowth: `${ASSET_BASE}/brand-abstract-backgrounds-water-growth.png`,

	// --- Hydroponics ---
	verticalTower: `${ASSET_BASE}/hydrotoolproduct-verticaltowergardensystem.png`,
	growTent: `${ASSET_BASE}/hydrotoolproduct-hydroponicgrowtentkit.png`,
	aeroponicMisting: `${ASSET_BASE}/hydrotoolproduct-aeroponicmistingsystem.png`,
	nftChannel: `${ASSET_BASE}/hydrotoolproduct-nfthydroponicchannelsystem.png`,
	dwcBucket: `${ASSET_BASE}/hydrotoolproduct-deepwaterculture-dwc-bucket-system.png`,
	nutrientsTrio: `${ASSET_BASE}/hydrotoolproduct-hydroponicnutrientstrio.png`,
	netPotsPebbles: `${ASSET_BASE}/hydrotoolproduct-hydroponicnetpots-claypebbles.png`,
	rockwoolMedia: `${ASSET_BASE}/hydrotoolproduct-rockwoolcubes-growingmedia.png`,
	hydroGeneric: `${ASSET_BASE}/toolproduct-hydroponic.png`,

	// --- Aquaponics ---
	ibcFishTank: `${ASSET_BASE}/toolproduct-aquaponicfishtank.png`,
	growBed: `${ASSET_BASE}/toolproduct-aquaponicbed.png`,
	bellSiphon: `${ASSET_BASE}/toolproduct-aquaponicsbellsiphonkit.png`,
	tilapia: `${ASSET_BASE}/toolproduct-aquaponicstilapiafingerlings.png`,
	waterTesting: `${ASSET_BASE}/toolproduct-aquaponicswatertestingkit.png`,
	countertopAqua: `${ASSET_BASE}/toolproduct-aquaponic.png`,

	// --- Silvopasture ---
	silvoSeedMix: `${ASSET_BASE}/silvopasture-agroforestryproducts-silvopastureseedmix.png`,
	electricNetting: `${ASSET_BASE}/silvopasture-agroforestryproducts-portableelectricnettingforrotationalgrazing.png`,
	waterTrough: `${ASSET_BASE}/silvopasture-agroforestryproducts-livestockwatertrough.png`,
	treeShelters: `${ASSET_BASE}/silvopasture-agroforestryproducts-treeshelters-protectors.png`,
	forageChicory: `${ASSET_BASE}/silvopasture-agroforestryproducts-foragechicoryplants.png`,

	// --- Agroforestry ---
	nfixingTreeSeeds: `${ASSET_BASE}/silvopasture-agroforestryproducts-nitrogen-fixingtreeseeds.png`,
	medicinalHerb: `${ASSET_BASE}/plantproduct-med.png`,

	// --- Kits & collections ---
	permacultureKit: `${ASSET_BASE}/generalkits-collections-permaculturestarterkit.png`,
	mushroomKit: `${ASSET_BASE}/generalkits-collections-mushroomcultivationkit.png`,
	microgreensKit: `${ASSET_BASE}/generalkits-collections-microgreensgrowingkit.png`,
	herbSpiralKit: `${ASSET_BASE}/generalkits-collections-herb-spiral-garden-kit.png`,
	soilAmendmentKit: `${ASSET_BASE}/generalkits-collections-soil-building-amendment-kit.png`,
	rainwaterKit: `${ASSET_BASE}/generalkits-collections-rainwater-harvesting-kit-components.png`,
	beneficialInsectKit: `${ASSET_BASE}/generalkits-collections-beneficial-insect-habitat-kit.png`,
	wormCompostingKit: `${ASSET_BASE}/generalkits-collections-worm-composting-vermicompost-kit.png`,
	compostingStarterKit: `${ASSET_BASE}/generalkits-collections-compostingstarterkit.png`,
	pollinatorCollection: `${ASSET_BASE}/generalkits-collections-pollinatorgardenseedcollection.png`,

	// --- Seeds & supplies ---
	heirloomTomato: `${ASSET_BASE}/plantproduct-tomato.png`,
	seedGeneric: `${ASSET_BASE}/plantproduct-seed.png`,
	handTrowel: `${ASSET_BASE}/toolproduct-trowl.png`,

	// --- Educational (Learn) ---
	companionPlanting: `${ASSET_BASE}/educational-content-images-companion-planting.png`,
	hydroSetup: `${ASSET_BASE}/educational-content-images-hydroponic-setup-modernaccessible.png`,
	soilHealth: `${ASSET_BASE}/educational-content-images-soil-health-diagram.png`,
	edDirt: `${ASSET_BASE}/edproduct-dirt.png`,
	edCompanion: `${ASSET_BASE}/edproduct-companionplanting.png`,

	// --- Fallback reuses: products in spec §7 with no bespoke asset yet.
	// Each points at the closest real asset until dedicated art exists.
	// TODO: replace with bespoke generated art
	chestnutSeedlings: `${ASSET_BASE}/silvopasture-agroforestryproducts-nitrogen-fixingtreeseeds.png`,
	// TODO: replace with bespoke generated art
	phEcMeter: `${ASSET_BASE}/toolproduct-aquaponicswatertestingkit.png`,
	// TODO: replace with bespoke generated art
	graftingKit: `${ASSET_BASE}/toolproduct-trowl.png`,
	// TODO: replace with bespoke generated art
	seasonExtensionKit: `${ASSET_BASE}/hydrotoolproduct-rockwoolcubes-growingmedia.png`,
	// TODO: replace with bespoke generated art
	seedSavingKit: `${ASSET_BASE}/plantproduct-seed.png`,
	// TODO: replace with bespoke generated art
	heirloomSeedVault: `${ASSET_BASE}/plantproduct-seed.png`,
	// TODO: replace with bespoke generated art
	artisanSeedPacket: `${ASSET_BASE}/plantproduct-seed.png`
};

/** Resolve a semantic key to its asset URL, falling back to a generic seed image. */
export function assetUrl(key: string): string {
	return assetManifest[key] ?? assetManifest.seedGeneric;
}

/** Alias for clarity at product-listing call sites. */
export const productImageByKey = assetManifest;
