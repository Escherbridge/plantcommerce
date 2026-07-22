import { createHash } from 'node:crypto';

export const launchCatalogManifestVersion = '2026-07.1';
export const launchCatalogManifestNamespace = 'aevani.launch.2026-07';

export type LaunchReadiness = 'R0' | 'R1' | 'R2' | 'HOLD';
export type LaunchOfferingKind =
	| 'aevani_owned'
	| 'affiliate_only'
	| 'hybrid'
	| 'collection'
	| 'educational';

export type LaunchCatalogCategory = Readonly<{
	sourceId: string;
	slug: string;
	name: string;
	description: string;
	parentSourceId: string | null;
	sortOrder: number;
}>;

export type LaunchCatalogCandidate = Readonly<{
	sourceId: string;
	categorySourceId: string;
	slug: string;
	sku: string;
	name: string;
	shortDescription: string;
	longDescription: string;
	tags: readonly string[];
	compatibilityNotes: readonly string[];
	offeringKind: Exclude<LaunchOfferingKind, 'collection'>;
	launchReadiness: LaunchReadiness;
	principalGate: string;
	price: Readonly<{ currency: 'USD'; semantics: 'unpriced'; amountMinor: null }>;
	operationalState: Readonly<{
		supplierAgreement: 'unverified';
		inventory: 'unverified';
		fulfillment: 'unverified';
		compliance: 'unverified';
		returns: 'unverified';
	}>;
	media: Readonly<{
		primaryImageObjectKey: null;
		additionalImageObjectKeys: readonly string[];
		rightsSource: null;
		altText: null;
		verifiedAt: null;
	}>;
	customerFacing: false;
	sellable: false;
	isActive: false;
	managedFields: readonly string[];
}>;

export type LaunchCatalogCollection = Readonly<{
	sourceId: string;
	categorySourceId: string;
	slug: string;
	name: string;
	offeringKind: 'collection';
	price: Readonly<{ currency: 'USD'; semantics: 'not_applicable'; amountMinor: null }>;
	customerFacing: false;
	sellable: false;
	isActive: false;
}>;

const categorySourceId = (slug: string) => `${launchCatalogManifestNamespace}.category.${slug}`;
const productSourceId = (slug: string) => `${launchCatalogManifestNamespace}.product.${slug}`;

export const launchCatalogCategories: readonly LaunchCatalogCategory[] = [
	{
		sourceId: categorySourceId('general-gardening-permaculture'),
		slug: 'general-gardening-permaculture',
		name: 'General Gardening & Permaculture',
		description: 'Research candidates for regenerative home-gardening supplies.',
		parentSourceId: null,
		sortOrder: 10
	},
	{
		sourceId: categorySourceId('hydroponics'),
		slug: 'hydroponics',
		name: 'Hydroponics',
		description: 'Research candidates for controlled-environment growing.',
		parentSourceId: null,
		sortOrder: 20
	},
	{
		sourceId: categorySourceId('hydroponic-consumables'),
		slug: 'hydroponic-consumables',
		name: 'Hydroponic Consumables',
		description: 'Future landing-page taxonomy only; it is not a sellable SKU.',
		parentSourceId: categorySourceId('hydroponics'),
		sortOrder: 21
	},
	{
		sourceId: categorySourceId('aquaponics'),
		slug: 'aquaponics',
		name: 'Aquaponics',
		description: 'Research candidates for educational and system-oriented aquaponics.',
		parentSourceId: null,
		sortOrder: 30
	},
	{
		sourceId: categorySourceId('silvopasture-agroforestry'),
		slug: 'silvopasture-agroforestry',
		name: 'Silvopasture & Agroforestry',
		description: 'Research candidates for long-horizon regenerative land stewardship.',
		parentSourceId: null,
		sortOrder: 40
	}
];

type CandidateDraft = readonly [
	slug: string,
	sku: string,
	name: string,
	categorySlug: string,
	offeringKind: Exclude<LaunchOfferingKind, 'collection'>,
	launchReadiness: LaunchReadiness,
	principalGate: string
];

const candidateDrafts: readonly CandidateDraft[] = [
	[
		'heirloom-tomato-collection',
		'PLT-TOM-001',
		'Heirloom Tomato Seed Collection',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Cultivar, lot, germination, and state seed-label review; no live plants.'
	],
	[
		'medicinal-herb-garden-kit',
		'PLT-MED-001',
		'Medicinal Herb Garden Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R1',
		'Exact species and bill of materials; remove unsupported health claims.'
	],
	[
		'hand-forged-garden-trowel',
		'TLS-TRW-001',
		'Hand-Forged Garden Trowel',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Materials, origin claims, safety, warranty, and sample approval.'
	],
	[
		'artisan-seed-packet-collection',
		'PLT-ASP-001',
		'Artisan Seed Packet Collection',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Cultivars, quantities, germination, labels, and illustration rights.'
	],
	[
		'microgreens-growing-kit',
		'KIT-MCG-001',
		'Microgreens Growing Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Bill of materials, lot traceability, seed treatment, and food safety.'
	],
	[
		'mushroom-cultivation-kit',
		'KIT-MSH-001',
		'Mushroom Cultivation Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R1',
		'Species, substrate, shelf life, and biological-material shipping.'
	],
	[
		'composting-starter-kit',
		'KIT-CMP-001',
		'Composting Starter Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Dry-goods bill of materials; live worms require a separate contract.'
	],
	[
		'pollinator-garden-seed-collection',
		'PLT-POL-001',
		'Pollinator Garden Seed Collection',
		'general-gardening-permaculture',
		'aevani_owned',
		'R1',
		'Regional mix, invasive review, labels, and substantiated claims.'
	],
	[
		'soil-building-amendment-kit',
		'KIT-SBA-001',
		'Soil Building Amendment Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'HOLD',
		'Analysis, SDS, state registrations, and verified OMRI claims only.'
	],
	[
		'grafting-propagation-kit',
		'KIT-GPK-001',
		'Grafting & Propagation Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Bill of materials, blade safety, replacement parts, and instructions.'
	],
	[
		'seed-saving-starter-kit',
		'KIT-SSK-001',
		'Seed Saving Starter Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Bill of materials, packaging rights, and seed rules if seeds are included.'
	],
	[
		'season-extension-kit',
		'KIT-SEK-001',
		'Season Extension Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'Dimensions, fabric and UV data, and weather/load limits.'
	],
	[
		'beneficial-insect-habitat-kit',
		'KIT-BIH-001',
		'Beneficial Insect Habitat Kit',
		'general-gardening-permaculture',
		'aevani_owned',
		'R0',
		'No live insects; durability and restrained ecological claims.'
	],
	[
		'nft-hydroponic-channel-system',
		'HYD-NFT-001',
		'NFT Hydroponic Channel System',
		'hydroponics',
		'affiliate_only',
		'R2',
		'Partner approval, food-contact materials, electrical safety, and freight.'
	],
	[
		'deep-water-culture-bucket-system',
		'HYD-DWC-001',
		'Deep Water Culture Bucket System',
		'hydroponics',
		'hybrid',
		'R1',
		'Food-contact PE, pump certification, leak test, and bill of materials.'
	],
	[
		'vertical-tower-garden-system',
		'HYD-VTG-001',
		'Vertical Tower Garden System',
		'hydroponics',
		'affiliate_only',
		'R2',
		'Partner approval, stability, materials, and electrical proof.'
	],
	[
		'hydroponic-grow-tent-kit',
		'HYD-GTK-001',
		'Hydroponic Grow Tent Kit',
		'hydroponics',
		'affiliate_only',
		'R2',
		'NRTL/electrical evidence, fire performance, wattage, and warranty.'
	],
	[
		'aeroponic-misting-system',
		'HYD-AER-001',
		'Aeroponic Misting System',
		'hydroponics',
		'hybrid',
		'R1',
		'Pressure/nozzles, pump safety, water-contact materials, and spares.'
	],
	[
		'hydroponic-nutrients-trio',
		'HYD-NUT-001',
		'Hydroponic Nutrients Trio',
		'hydroponics',
		'hybrid',
		'HOLD',
		'Formula, analysis, SDS, registrations, shelf life, and claim proof.'
	],
	[
		'rockwool-cubes-growing-media-sampler',
		'HYD-MED-001',
		'Rockwool Cubes & Growing Media Sampler',
		'hydroponics',
		'aevani_owned',
		'R0',
		'Brand authorization, sizes/count, and handling guidance.'
	],
	[
		'digital-ph-ec-meter-set',
		'TLS-PHE-001',
		'Digital pH & EC Meter Set',
		'hydroponics',
		'hybrid',
		'R0',
		'Accuracy/calibration, battery/electrical compliance, and warranty.'
	],
	[
		'net-pots-clay-pebbles-bundle',
		'HYD-NPC-001',
		'Net Pots & Clay Pebbles Bundle',
		'hydroponics',
		'aevani_owned',
		'R0',
		'Dimensions/count, food-contact evidence, and media cleanliness.'
	],
	[
		'countertop-aquaponics-starter-system',
		'AQP-CTR-001',
		'Countertop Aquaponics Starter System',
		'aquaponics',
		'affiliate_only',
		'R2',
		'Partner approval, tank/pump safety, and fish-welfare guidance.'
	],
	[
		'commercial-aquaponics-grow-bed',
		'AQP-BED-001',
		'Commercial Aquaponics Grow Bed',
		'aquaponics',
		'affiliate_only',
		'R2',
		'Configuration, food-grade liner, installation, and freight/quote model.'
	],
	[
		'ibc-aquaponics-fish-tank',
		'AQP-IBC-001',
		'IBC Aquaponics Fish Tank',
		'aquaponics',
		'affiliate_only',
		'R2',
		'Chain of custody, food-grade proof, structural safety, and freight.'
	],
	[
		'aquaponics-bell-siphon-kit',
		'AQP-BSK-001',
		'Aquaponics Bell Siphon Kit',
		'aquaponics',
		'aevani_owned',
		'R0',
		'Pipe compatibility, dimensions, materials, and installation guide.'
	],
	[
		'aquaponics-water-testing-kit',
		'AQP-WTK-001',
		'Aquaponics Water Testing Kit',
		'aquaponics',
		'hybrid',
		'R1',
		'Reagent SDS, shipping, accuracy, test count, and expiration.'
	],
	[
		'tilapia-aquaponics-illustrated-guide',
		'AQP-TIG-001',
		'Tilapia Aquaponics Illustrated Guide',
		'aquaponics',
		'educational',
		'R0',
		'Owned illustrations/content, format, fish-law, and welfare review; never live fingerlings.'
	],
	[
		'silvopasture-seed-mix',
		'SIL-SSM-001',
		'Silvopasture Seed Mix',
		'silvopasture-agroforestry',
		'aevani_owned',
		'R1',
		'Regional composition, lot/germination/weed analysis, and labels.'
	],
	[
		'tree-shelters-protectors-25-pack',
		'SIL-TSP-001',
		'Tree Shelters & Protectors, 25-pack',
		'silvopasture-agroforestry',
		'aevani_owned',
		'R0',
		'Dimensions, material, UV durability, and installation guide.'
	],
	[
		'chestnut-tree-seedlings-10-pack',
		'AGF-CTS-001',
		'Chestnut Tree Seedlings, 10-pack',
		'silvopasture-agroforestry',
		'hybrid',
		'HOLD',
		'Nursery licensing, quarantine, cultivar, seasonality, and live-arrival policy.'
	],
	[
		'forage-chicory-seed',
		'SIL-FCS-001',
		'Forage Chicory Seed',
		'silvopasture-agroforestry',
		'aevani_owned',
		'R1',
		'Package weight, lot/germination/weed analysis, and seed labels.'
	],
	[
		'portable-electric-netting-164-ft',
		'SIL-PEN-001',
		'Portable Electric Netting, 164 ft',
		'silvopasture-agroforestry',
		'hybrid',
		'R1',
		'Energizer compatibility, warnings, livestock suitability, and warranty.'
	],
	[
		'livestock-water-trough',
		'SIL-LWT-001',
		'Livestock Water Trough',
		'silvopasture-agroforestry',
		'affiliate_only',
		'R2',
		'Capacity/dimensions, water-contact proof, freight, and warranty.'
	],
	[
		'nitrogen-fixing-tree-seeds-collection',
		'SIL-NFT-001',
		'Black Locust Seed Collection',
		'silvopasture-agroforestry',
		'aevani_owned',
		'HOLD',
		'Species/seed proof, invasive review, and destination geo-blocking.'
	]
];

const managedProductFields = [
	'name',
	'slug',
	'description',
	'short_description',
	'sku',
	'category_id',
	'price',
	'compare_price',
	'cost_price',
	'stock_quantity',
	'reserved_quantity',
	'track_inventory',
	'weight',
	'dimensions',
	'is_active',
	'is_featured',
	'tags',
	'meta_title',
	'meta_description'
] as const;

export const launchCatalogCandidates: readonly LaunchCatalogCandidate[] = candidateDrafts.map(
	([slug, sku, name, categorySlug, offeringKind, launchReadiness, principalGate]) => ({
		sourceId: productSourceId(slug),
		categorySourceId: categorySourceId(categorySlug),
		slug,
		sku,
		name,
		shortDescription: `${name} is an internal research candidate, not an offer.`,
		longDescription: `${name} is retained solely for launch-catalog research. It remains unavailable until the documented validation gate is satisfied.`,
		tags: ['launch-candidate', categorySlug, offeringKind, launchReadiness.toLowerCase()],
		compatibilityNotes: [principalGate],
		offeringKind,
		launchReadiness,
		principalGate,
		price: { currency: 'USD', semantics: 'unpriced', amountMinor: null },
		operationalState: {
			supplierAgreement: 'unverified',
			inventory: 'unverified',
			fulfillment: 'unverified',
			compliance: 'unverified',
			returns: 'unverified'
		},
		media: {
			primaryImageObjectKey: null,
			additionalImageObjectKeys: [],
			rightsSource: null,
			altText: null,
			verifiedAt: null
		},
		customerFacing: false,
		sellable: false,
		isActive: false,
		managedFields: managedProductFields
	})
);

export const launchCatalogCollections: readonly LaunchCatalogCollection[] = [
	{
		sourceId: `${launchCatalogManifestNamespace}.collection.hydroponic-consumables`,
		categorySourceId: categorySourceId('hydroponic-consumables'),
		slug: 'hydroponic-consumables',
		name: 'Hydroponic Consumables',
		offeringKind: 'collection',
		price: { currency: 'USD', semantics: 'not_applicable', amountMinor: null },
		customerFacing: false,
		sellable: false,
		isActive: false
	}
];

function canonicalize(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(canonicalize);
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, child]) => [key, canonicalize(child)])
		);
	}
	return value;
}

export const launchCatalogManifest = Object.freeze({
	namespace: launchCatalogManifestNamespace,
	version: launchCatalogManifestVersion,
	categories: launchCatalogCategories,
	candidates: launchCatalogCandidates,
	collections: launchCatalogCollections
});

export const launchCatalogManifestHash = createHash('sha256')
	.update(JSON.stringify(canonicalize(launchCatalogManifest)))
	.digest('hex');

export function assertLaunchCatalogManifest(): void {
	const ids = [
		...launchCatalogCategories.map((item) => item.sourceId),
		...launchCatalogCandidates.map((item) => item.sourceId),
		...launchCatalogCollections.map((item) => item.sourceId)
	];
	if (new Set(ids).size !== ids.length)
		throw new Error('Launch catalog manifest source IDs must be unique.');
	if (launchCatalogCandidates.length !== 35)
		throw new Error('Launch catalog manifest must contain 35 candidates.');
	if (launchCatalogCollections.length !== 1)
		throw new Error('Launch catalog manifest must contain one collection.');

	for (const candidate of launchCatalogCandidates) {
		if (candidate.isActive || candidate.customerFacing || candidate.sellable) {
			throw new Error(`${candidate.sourceId} must remain inactive, non-public, and non-sellable.`);
		}
		if (candidate.price.amountMinor !== null || candidate.price.semantics !== 'unpriced') {
			throw new Error(
				`${candidate.sourceId} must not derive a retail price from sourcing research.`
			);
		}
		if (candidate.media.primaryImageObjectKey !== null || candidate.media.verifiedAt !== null) {
			throw new Error(`${candidate.sourceId} must not reference unverified imagery.`);
		}
	}
}

assertLaunchCatalogManifest();
