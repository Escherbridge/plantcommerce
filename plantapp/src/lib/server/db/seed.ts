/**
 * Comprehensive UAT Seed Script for Aevani Plant Commerce
 *
 * Seeds all database tables with realistic, interconnected data
 * using the AI-MockAssets images as product/content imagery.
 *
 * Usage: npm run db:seed
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import crypto from 'node:crypto';
import * as schema from './schema';

// ---------- connection ----------
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}
const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

// ---------- helpers ----------
function generateId(): string {
	return crypto.randomUUID();
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number): Date {
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d;
}

function generateOrderNumber(index: number): string {
	const prefix = 'AEV';
	const year = new Date().getFullYear();
	return `${prefix}-${year}-${String(index + 1).padStart(5, '0')}`;
}

// The mock-asset image path prefix (relative from src/lib/images/)
const IMG_BASE = 'AI-MockAssets';

// ---------- file record factory ----------
function makeFileRecord(opts: {
	filename: string;
	entityType: 'product' | 'content' | 'user' | 'general';
	entityId?: string;
	uploadedBy?: string;
}): typeof schema.file.$inferInsert {
	const id = generateId();
	return {
		id,
		filename: opts.filename,
		originalFilename: opts.filename,
		mimeType: 'image/png',
		fileSize: randomInt(200_000, 2_000_000),
		bucketPath: `${IMG_BASE}/${opts.filename}`,
		bucketName: process.env.S3_BUCKET_NAME || 'aevani-assets',
		entityType: opts.entityType,
		entityId: opts.entityId ?? null,
		uploadedBy: opts.uploadedBy ?? null,
		isPublic: true,
		metadata: JSON.stringify({ source: 'seed', mockAsset: true }),
		createdAt: daysAgo(randomInt(30, 120)),
		updatedAt: new Date()
	};
}

// ================================================================
// SEED DATA DEFINITIONS
// ================================================================

// ----- Users -----
const USER_IDS = {
	admin: generateId(),
	sarah: generateId(),
	marcus: generateId(),
	elena: generateId(),
	jordan: generateId(),
	aisha: generateId(),
	tom: generateId(),
	priya: generateId()
};

const users: (typeof schema.user.$inferInsert)[] = [
	{
		id: USER_IDS.admin,
		username: 'admin',
		email: 'admin@aevani.com',
		passwordHash: '', // set below
		firstName: 'Aevani',
		lastName: 'Admin',
		role: 'admin',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(365),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.sarah,
		username: 'sarah.greenthumb',
		email: 'sarah@example.com',
		passwordHash: '',
		firstName: 'Sarah',
		lastName: 'Chen',
		role: 'customer',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(180),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.marcus,
		username: 'marcus.permaculture',
		email: 'marcus@example.com',
		passwordHash: '',
		firstName: 'Marcus',
		lastName: 'Williams',
		role: 'affiliate',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(150),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.elena,
		username: 'elena.hydro',
		email: 'elena@example.com',
		passwordHash: '',
		firstName: 'Elena',
		lastName: 'Rodriguez',
		role: 'customer',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(90),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.jordan,
		username: 'jordan.aqua',
		email: 'jordan@example.com',
		passwordHash: '',
		firstName: 'Jordan',
		lastName: 'Park',
		role: 'affiliate',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(120),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.aisha,
		username: 'aisha.seedsaver',
		email: 'aisha@example.com',
		passwordHash: '',
		firstName: 'Aisha',
		lastName: 'Okafor',
		role: 'customer',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(60),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.tom,
		username: 'tom.silvopasture',
		email: 'tom@example.com',
		passwordHash: '',
		firstName: 'Tom',
		lastName: 'Bennett',
		role: 'customer',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(45),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.priya,
		username: 'priya.mushrooms',
		email: 'priya@example.com',
		passwordHash: '',
		firstName: 'Priya',
		lastName: 'Sharma',
		role: 'customer',
		isActive: true,
		emailVerified: false,
		createdAt: daysAgo(14),
		updatedAt: new Date()
	}
];

// ----- Product Categories (hierarchical) -----
interface CategoryDef {
	name: string;
	slug: string;
	description: string;
	children?: CategoryDef[];
}

const categoryTree: CategoryDef[] = [
	{
		name: 'Plants & Seeds',
		slug: 'plants-seeds',
		description: 'Heirloom seeds, medicinal herbs, native plants, and companion planting collections for polyculture gardens.',
		children: [
			{ name: 'Heirloom Seeds', slug: 'heirloom-seeds', description: 'Open-pollinated, non-GMO heritage seed varieties passed down through generations.' },
			{ name: 'Medicinal Herbs', slug: 'medicinal-herbs', description: 'Therapeutic herb plants and kits for home apothecary gardens.' },
			{ name: 'Pollinator Plants', slug: 'pollinator-plants', description: 'Native flowering plants that attract bees, butterflies, and beneficial insects.' }
		]
	},
	{
		name: 'Garden Tools',
		slug: 'garden-tools',
		description: 'Hand-forged, ergonomic, and sustainable tools for permaculture gardening and soil stewardship.',
		children: [
			{ name: 'Hand Tools', slug: 'hand-tools', description: 'Trowels, cultivators, and pruners crafted for durability and comfort.' },
			{ name: 'Soil Testing', slug: 'soil-testing', description: 'pH meters, nutrient test kits, and soil health monitoring equipment.' }
		]
	},
	{
		name: 'Hydroponics',
		slug: 'hydroponics',
		description: 'Complete hydroponic growing systems, nutrients, and media for soil-free indoor and vertical farming.',
		children: [
			{ name: 'Hydroponic Systems', slug: 'hydroponic-systems', description: 'NFT channels, DWC buckets, vertical towers, and grow tent kits.' },
			{ name: 'Nutrients & Media', slug: 'nutrients-media', description: 'Hydroponic nutrient solutions, rockwool, clay pebbles, and growing substrates.' }
		]
	},
	{
		name: 'Aquaponics',
		slug: 'aquaponics',
		description: 'Integrated fish-and-plant aquaponic systems combining aquaculture with hydroponic growing.',
		children: [
			{ name: 'Aquaponic Systems', slug: 'aquaponic-systems', description: 'Countertop to commercial-scale aquaponic setups.' },
			{ name: 'Fish & Supplies', slug: 'fish-supplies', description: 'Tilapia fingerlings, water testing, bell siphons, and fish tank components.' }
		]
	},
	{
		name: 'Silvopasture',
		slug: 'silvopasture',
		description: 'Silvopasture systems integrating trees, forage, and livestock for regenerative land management.',
		children: [
			{ name: 'Tree & Forage Seeds', slug: 'tree-forage-seeds', description: 'Nitrogen-fixing trees, silvopasture seed mixes, and forage crop starts.' },
			{ name: 'Livestock Integration', slug: 'livestock-integration', description: 'Portable netting, tree shelters, and rotational grazing equipment.' }
		]
	},
	{
		name: 'Agroforestry',
		slug: 'agroforestry',
		description: 'Agroforestry products and tree-based agricultural systems for sustainable food production.',
		children: [
			{ name: 'Tree Crops', slug: 'tree-crops', description: 'Fruit and nut tree seedlings for agroforestry systems.' },
			{ name: 'Forest Farming', slug: 'forest-farming', description: 'Understory crops, mushroom logs, and forest garden components.' }
		]
	},
	{
		name: 'Kits & Collections',
		slug: 'kits-collections',
		description: 'Curated starter kits and themed collections for composting, mushrooms, microgreens, and more.',
		children: [
			{ name: 'Starter Kits', slug: 'starter-kits', description: 'Everything-in-one kits for beginners to get growing immediately.' },
			{ name: 'Composting', slug: 'composting', description: 'Countertop bins, worm farms, and soil amendment bundles.' }
		]
	}
];

// ----- Product definitions mapped to mock assets -----
interface ProductDef {
	name: string;
	slug: string;
	sku: string;
	description: string;
	shortDescription: string;
	price: string;
	comparePrice?: string;
	costPrice: string;
	stock: number;
	weight: string;
	categorySlug: string;
	isFeatured: boolean;
	tags: string[];
	imageFile: string;
	metaTitle: string;
	metaDescription: string;
}

const products: ProductDef[] = [
	// --- Plants & Seeds ---
	{
		name: 'Heirloom Tomato Collection',
		slug: 'heirloom-tomato-collection',
		sku: 'PLT-TOM-001',
		description: 'A curated selection of 6 heritage tomato varieties including Brandywine, Cherokee Purple, Green Zebra, San Marzano, Yellow Pear, and Black Krim. These open-pollinated seeds have been saved for generations, producing tomatoes with unmatched flavor complexity. Each packet contains 25+ seeds with detailed growing guides, companion planting charts, and seed-saving instructions. Perfect for the home gardener seeking exceptional taste and genetic diversity.',
		shortDescription: '6 heritage tomato varieties with 25+ seeds each and growing guides.',
		price: '34.99',
		comparePrice: '44.99',
		costPrice: '12.50',
		stock: 245,
		weight: '0.18',
		categorySlug: 'heirloom-seeds',
		isFeatured: true,
		tags: ['tomato', 'heirloom', 'seeds', 'vegetable', 'organic', 'bestseller'],
		imageFile: 'PlantProduct-TOMATO.png',
		metaTitle: 'Heirloom Tomato Seed Collection | 6 Heritage Varieties',
		metaDescription: 'Grow 6 heritage tomato varieties from open-pollinated seeds. Includes Brandywine, Cherokee Purple & more with planting guides.'
	},
	{
		name: 'Medicinal Herb Garden Kit',
		slug: 'medicinal-herb-garden-kit',
		sku: 'PLT-MED-001',
		description: 'Start your home apothecary with this thoughtfully assembled medicinal herb collection. Includes live starter plants of lavender, chamomile, echinacea, peppermint, lemon balm, and calendula in biodegradable coconut coir pots. Each plant comes with a detailed care card covering growing conditions, harvest timing, drying methods, and traditional medicinal uses. The included field guide covers 30+ herbal preparations from teas to tinctures.',
		shortDescription: '6 live medicinal herb starters with care cards and herbal preparation guide.',
		price: '49.99',
		comparePrice: '59.99',
		costPrice: '18.00',
		stock: 128,
		weight: '2.40',
		categorySlug: 'medicinal-herbs',
		isFeatured: true,
		tags: ['medicinal', 'herbs', 'lavender', 'chamomile', 'organic', 'wellness'],
		imageFile: 'PlantProduct-MED.png',
		metaTitle: 'Medicinal Herb Garden Kit | 6 Live Healing Plants',
		metaDescription: 'Grow your own apothecary. 6 medicinal herb starters with care guides and herbal preparation instructions.'
	},
	{
		name: 'Pollinator Garden Seed Collection',
		slug: 'pollinator-garden-seed-collection',
		sku: 'PLT-POL-001',
		description: 'Attract bees, butterflies, and hummingbirds with this regionally adapted wildflower seed mix. Contains 18 native species including milkweed, bee balm, echinacea, black-eyed susan, and wild bergamot. Enough seed to cover 200 sq ft. Includes a seasonal bloom chart ensuring continuous flowering from spring through fall. Supports monarch migration corridors and native pollinator populations.',
		shortDescription: '18 native wildflower species covering 200 sq ft with seasonal bloom chart.',
		price: '28.99',
		costPrice: '8.50',
		stock: 310,
		weight: '0.12',
		categorySlug: 'pollinator-plants',
		isFeatured: false,
		tags: ['pollinator', 'wildflower', 'native', 'bees', 'butterflies', 'biodiversity'],
		imageFile: 'GeneralKits&Collections-PollinatorGardenSeedCollection.png',
		metaTitle: 'Pollinator Garden Seed Collection | 18 Native Wildflowers',
		metaDescription: 'Support pollinators with 18 native wildflower species. Covers 200 sq ft with blooms from spring through fall.'
	},
	{
		name: 'Heirloom Seed Vault',
		slug: 'heirloom-seed-vault',
		sku: 'PLT-SED-001',
		description: 'A comprehensive collection of 40 heirloom vegetable, herb, and flower seed varieties packaged in moisture-proof resealable pouches inside a durable metal tin. Varieties span every season and growing zone, from cold-hardy kale to heat-loving okra. Each packet is dated and tested for 90%+ germination rates. Includes a 60-page companion planting and succession planting guide. The ultimate seed library for food sovereignty.',
		shortDescription: '40 heirloom seed varieties in moisture-proof vault with planting guide.',
		price: '89.99',
		comparePrice: '119.99',
		costPrice: '28.00',
		stock: 85,
		weight: '1.20',
		categorySlug: 'heirloom-seeds',
		isFeatured: true,
		tags: ['seeds', 'heirloom', 'vault', 'prepper', 'organic', 'collection'],
		imageFile: 'PlantProduct-SEED.png',
		metaTitle: 'Heirloom Seed Vault | 40 Varieties in Moisture-Proof Tin',
		metaDescription: '40 heirloom seed varieties with 90%+ germination. Moisture-proof vault with companion planting guide.'
	},

	// --- Garden Tools ---
	{
		name: 'Hand-Forged Garden Trowel',
		slug: 'hand-forged-garden-trowel',
		sku: 'TLS-TRW-001',
		description: 'Crafted by artisan blacksmiths from high-carbon steel with a hand-turned ash wood handle. The tapered blade cuts through compacted soil effortlessly, while depth markings on the blade ensure precise planting. The full-tang construction means this trowel will last generations. Each piece shows unique hammer marks from the forging process. Leather hanging loop included.',
		shortDescription: 'Artisan-forged high-carbon steel trowel with ash handle and depth markings.',
		price: '42.00',
		costPrice: '16.00',
		stock: 67,
		weight: '0.45',
		categorySlug: 'hand-tools',
		isFeatured: true,
		tags: ['trowel', 'hand-forged', 'tool', 'steel', 'artisan', 'lifetime'],
		imageFile: 'ToolProduct-TROWL.png',
		metaTitle: 'Hand-Forged Garden Trowel | Artisan High-Carbon Steel',
		metaDescription: 'Artisan blacksmith-forged trowel in high-carbon steel with ash wood handle. Built to last generations.'
	},

	// --- Hydroponics ---
	{
		name: 'NFT Hydroponic Channel System',
		slug: 'nft-hydroponic-channel-system',
		sku: 'HYD-NFT-001',
		description: 'Professional-grade Nutrient Film Technique system with 4 food-safe PVC channels, submersible pump, 20-gallon reservoir, timer, and 36 net pots. Grows up to 36 heads of lettuce or herbs simultaneously. UV-stabilized white channels reflect light onto plants while keeping roots cool. Includes starter nutrient pack and pH adjustment kit. Assembly in under 2 hours with no tools required.',
		shortDescription: '4-channel NFT system growing 36 plants with pump, reservoir, and nutrients.',
		price: '189.99',
		comparePrice: '229.99',
		costPrice: '72.00',
		stock: 34,
		weight: '12.50',
		categorySlug: 'hydroponic-systems',
		isFeatured: true,
		tags: ['hydroponic', 'NFT', 'lettuce', 'indoor', 'commercial', 'system'],
		imageFile: 'HydroToolProduct-NFTHydroponicChannelSystem.png',
		metaTitle: 'NFT Hydroponic Channel System | Grow 36 Plants',
		metaDescription: 'Professional NFT hydroponic system with 4 channels, pump, and nutrients. Grow 36 plants simultaneously.'
	},
	{
		name: 'Deep Water Culture Bucket System',
		slug: 'deep-water-culture-bucket-system',
		sku: 'HYD-DWC-001',
		description: 'The simplest path to hydroponic growing. This single-plant DWC system includes a 5-gallon food-grade bucket, 6-inch net pot lid, air pump, air stone, tubing, clay pebbles, and a 2-week nutrient starter. Perfect for growing large plants like tomatoes, peppers, or basil. The opaque bucket prevents algae while the continuous aeration keeps roots oxygenated. Great for beginners and classrooms.',
		shortDescription: '5-gallon DWC bucket with air pump, clay pebbles, and nutrient starter.',
		price: '39.99',
		costPrice: '14.00',
		stock: 156,
		weight: '3.20',
		categorySlug: 'hydroponic-systems',
		isFeatured: false,
		tags: ['hydroponic', 'DWC', 'beginner', 'bucket', 'indoor'],
		imageFile: 'HydroToolProduct-DeepWaterCulture(DWC)Bucket System.png',
		metaTitle: 'Deep Water Culture Bucket System | Beginner Hydroponics',
		metaDescription: 'Start hydroponic growing with this complete DWC bucket system. Includes pump, clay pebbles, and nutrients.'
	},
	{
		name: 'Vertical Tower Garden System',
		slug: 'vertical-tower-garden-system',
		sku: 'HYD-VTG-001',
		description: 'Grow 40+ plants in just 2 square feet of floor space. This 6-foot vertical aeroponic tower uses a top-drip irrigation system to deliver nutrients to stacked grow pods. Ideal for patios, balconies, and small spaces. Made from food-safe BPA-free plastic with UV protection. Includes pump, timer, 40 grow pods, rockwool starters, and a 3-month nutrient supply. Grows strawberries, herbs, greens, and flowers.',
		shortDescription: '6-foot vertical tower growing 40+ plants in 2 sq ft with drip irrigation.',
		price: '349.99',
		comparePrice: '449.99',
		costPrice: '135.00',
		stock: 22,
		weight: '18.00',
		categorySlug: 'hydroponic-systems',
		isFeatured: true,
		tags: ['vertical', 'tower', 'hydroponic', 'aeroponic', 'space-saving', 'patio'],
		imageFile: 'HydroToolProduct-VerticalTowerGardenSystem.png',
		metaTitle: 'Vertical Tower Garden | Grow 40+ Plants in 2 Sq Ft',
		metaDescription: 'Grow 40+ plants vertically in just 2 sq ft. Aeroponic tower with drip system, pump, and 3-month nutrient supply.'
	},
	{
		name: 'Hydroponic Grow Tent Kit',
		slug: 'hydroponic-grow-tent-kit',
		sku: 'HYD-GTK-001',
		description: 'Complete indoor growing environment in a 4x4x7 ft reflective mylar tent. Includes full-spectrum LED grow light (400W equivalent, draws 200W), inline fan with carbon filter for odor control, clip fan for air circulation, thermometer/hygrometer, and hanging equipment. The 600D Oxford exterior blocks all light leaks. Multiple cable ports and observation window. Perfect for year-round indoor production.',
		shortDescription: '4x4 ft grow tent with LED light, ventilation, carbon filter, and climate monitoring.',
		price: '279.99',
		comparePrice: '349.99',
		costPrice: '105.00',
		stock: 18,
		weight: '22.00',
		categorySlug: 'hydroponic-systems',
		isFeatured: false,
		tags: ['grow-tent', 'LED', 'indoor', 'ventilation', 'year-round'],
		imageFile: 'HydroToolProduct-HydroponicGrowTentKit.png',
		metaTitle: 'Hydroponic Grow Tent Kit | Complete 4x4 Indoor Setup',
		metaDescription: 'Complete 4x4 indoor growing tent with LED light, carbon filter ventilation, and climate monitoring.'
	},
	{
		name: 'Hydroponic Nutrients Trio',
		slug: 'hydroponic-nutrients-trio',
		sku: 'HYD-NUT-001',
		description: 'Three-part liquid nutrient system (Grow, Bloom, Micro) designed for all hydroponic and soilless growing methods. Pharmaceutical-grade minerals with chelated micronutrients for maximum plant uptake. Each 1-quart bottle includes a measuring cup and feeding schedule chart for vegetables, herbs, and flowers. pH-buffered formula reduces adjustment needs. Enough for 150+ gallons of nutrient solution.',
		shortDescription: '3-part liquid nutrients (Grow/Bloom/Micro) for 150+ gallons of solution.',
		price: '44.99',
		costPrice: '15.00',
		stock: 203,
		weight: '3.60',
		categorySlug: 'nutrients-media',
		isFeatured: false,
		tags: ['nutrients', 'hydroponic', 'liquid', 'minerals', 'feeding'],
		imageFile: 'HydroToolProduct-HydroponicNutrientsTrio.png',
		metaTitle: 'Hydroponic Nutrients Trio | Grow, Bloom & Micro',
		metaDescription: 'Complete 3-part hydroponic nutrient system. Pharmaceutical-grade minerals for 150+ gallons of solution.'
	},
	{
		name: 'Rockwool Cubes & Growing Media Sampler',
		slug: 'rockwool-cubes-growing-media-sampler',
		sku: 'HYD-MED-001',
		description: 'Sample pack of the most popular hydroponic growing media. Includes 50 rockwool starter cubes (1.5 inch), 2L expanded clay pebbles (hydroton), 2L coco coir, and 1L perlite. Each medium comes with a usage guide explaining which crops and systems it works best with. Perfect for experimenting to find your preferred growing substrate.',
		shortDescription: '50 rockwool cubes plus clay pebbles, coco coir, and perlite samples.',
		price: '24.99',
		costPrice: '8.00',
		stock: 178,
		weight: '2.80',
		categorySlug: 'nutrients-media',
		isFeatured: false,
		tags: ['rockwool', 'clay-pebbles', 'coco-coir', 'growing-media', 'starter'],
		imageFile: 'HydroToolProduct-RockwoolCubes&GrowingMedia.png',
		metaTitle: 'Rockwool & Growing Media Sampler | 4 Substrates',
		metaDescription: 'Try 4 hydroponic growing media: rockwool cubes, clay pebbles, coco coir, and perlite with usage guides.'
	},
	{
		name: 'Net Pots & Clay Pebbles Bundle',
		slug: 'net-pots-clay-pebbles-bundle',
		sku: 'HYD-NPC-001',
		description: 'Essential hydroponic planting supplies: 50 heavy-duty net pots (assorted 2", 3", and 6" sizes) plus 10L of premium expanded clay pebbles. The net pots feature reinforced rims and wide drainage slots for optimal root aeration. Pre-washed clay pebbles are pH-neutral and reusable for years. Compatible with all hydroponic systems.',
		shortDescription: '50 assorted net pots and 10L premium clay pebbles for any hydroponic system.',
		price: '32.99',
		costPrice: '11.00',
		stock: 142,
		weight: '5.00',
		categorySlug: 'nutrients-media',
		isFeatured: false,
		tags: ['net-pots', 'clay-pebbles', 'hydroton', 'supplies'],
		imageFile: 'HydroToolProduct-HydroponicNetPots&ClayPebbles.png',
		metaTitle: 'Net Pots & Clay Pebbles Bundle | Hydroponic Essentials',
		metaDescription: '50 net pots in 3 sizes plus 10L premium clay pebbles. Compatible with all hydroponic systems.'
	},
	{
		name: 'Aeroponic Misting System',
		slug: 'aeroponic-misting-system',
		sku: 'HYD-AER-001',
		description: 'High-pressure aeroponic misting system with 80 PSI diaphragm pump, 12 brass misting nozzles, accumulator tank, cycle timer, and 50 feet of tubing. Delivers a fine 50-micron mist directly to root zones for maximum nutrient absorption and oxygenation. Roots grow 3x faster than traditional hydroponics. Includes anti-drip nozzles and inline filter. For serious growers seeking cutting-edge technology.',
		shortDescription: 'High-pressure 80 PSI misting system with 12 nozzles and cycle timer.',
		price: '219.99',
		comparePrice: '269.99',
		costPrice: '82.00',
		stock: 15,
		weight: '8.50',
		categorySlug: 'hydroponic-systems',
		isFeatured: false,
		tags: ['aeroponic', 'misting', 'high-pressure', 'advanced', 'roots'],
		imageFile: 'HydroToolProduct-AeroponicMistingSystem.png',
		metaTitle: 'Aeroponic Misting System | 80 PSI High-Pressure',
		metaDescription: 'Advanced 80 PSI aeroponic misting system. 12 brass nozzles deliver 50-micron mist for 3x faster root growth.'
	},

	// --- Aquaponics ---
	{
		name: 'Countertop Aquaponics Starter System',
		slug: 'countertop-aquaponics-starter-system',
		sku: 'AQP-CTR-001',
		description: 'A self-contained ecosystem that fits on your kitchen counter. Fish waste feeds the plants, plants clean the water. Includes a 3-gallon clear acrylic tank, grow bed with clay pebbles, LED grow light, air pump, and water conditioner. Accommodates 2-3 small fish (goldfish or bettas) and grows herbs, lettuce, or microgreens year-round. Silent operation, elegant design with bamboo accents. The perfect introduction to aquaponics.',
		shortDescription: 'Kitchen countertop aquaponics with 3-gal tank, grow bed, and LED light.',
		price: '79.99',
		comparePrice: '99.99',
		costPrice: '30.00',
		stock: 64,
		weight: '4.50',
		categorySlug: 'aquaponic-systems',
		isFeatured: true,
		tags: ['aquaponics', 'countertop', 'beginner', 'kitchen', 'fish', 'herbs'],
		imageFile: 'ToolProduct-AquaPonic.png',
		metaTitle: 'Countertop Aquaponics System | Kitchen Fish & Herb Garden',
		metaDescription: 'Grow herbs and raise fish on your kitchen counter. Complete aquaponics starter with tank, grow bed, and LED light.'
	},
	{
		name: 'Commercial Aquaponics Grow Bed',
		slug: 'commercial-aquaponics-grow-bed',
		sku: 'AQP-BED-001',
		description: 'Production-scale 4x8 ft flood-and-drain grow bed with food-grade HDPE liner, bell siphon assembly, 12" depth for deep-rooting crops, and stainless steel frame. Holds 32 cubic feet of growing media. Designed to pair with 275-gallon IBC fish tanks in a 1:1 ratio. Includes plumbing fittings, overflow protection, and installation guide. Rated for 10+ years of continuous use in greenhouse environments.',
		shortDescription: '4x8 ft commercial grow bed with bell siphon, HDPE liner, and steel frame.',
		price: '449.99',
		costPrice: '180.00',
		stock: 8,
		weight: '45.00',
		categorySlug: 'aquaponic-systems',
		isFeatured: false,
		tags: ['aquaponics', 'commercial', 'grow-bed', 'greenhouse', 'production'],
		imageFile: 'ToolProduct-AquaponicBed.png',
		metaTitle: 'Commercial Aquaponics Grow Bed | 4x8 ft Production Scale',
		metaDescription: '4x8 ft commercial aquaponics grow bed with food-grade liner and stainless steel frame for greenhouse production.'
	},
	{
		name: 'IBC Aquaponics Fish Tank',
		slug: 'ibc-aquaponics-fish-tank',
		sku: 'AQP-IBC-001',
		description: 'Professionally converted 275-gallon IBC tote fish tank with food-safe interior coating, viewing window (12x18 in tempered glass), ball valve drain, solids filter basket, aeration manifold with 4 air stones, and insulated jacket for temperature stability. Supports 50-75 tilapia or 100+ ornamental fish. The metal cage provides structural support while the pallet base keeps it elevated for gravity-fed drainage to grow beds.',
		shortDescription: '275-gallon IBC fish tank with viewing window, aeration, and insulated jacket.',
		price: '389.99',
		comparePrice: '479.99',
		costPrice: '155.00',
		stock: 6,
		weight: '55.00',
		categorySlug: 'aquaponic-systems',
		isFeatured: false,
		tags: ['aquaponics', 'fish-tank', 'IBC', 'tilapia', '275-gallon'],
		imageFile: 'ToolProduct-AquaponicFishTank.png',
		metaTitle: 'IBC Aquaponics Fish Tank | 275-Gallon Converted Tote',
		metaDescription: '275-gallon IBC fish tank with viewing window, 4-stone aeration, and insulated jacket for 50-75 tilapia.'
	},
	{
		name: 'Aquaponics Bell Siphon Kit',
		slug: 'aquaponics-bell-siphon-kit',
		sku: 'AQP-BSK-001',
		description: 'Auto-siphon kit that creates the flood-and-drain cycle essential to media-based aquaponics. Includes clear PVC standpipe (adjustable height 6-12"), bell housing, media guard screen, and all fittings for standard 1" bulkhead. The clear construction lets you observe the siphon cycle for educational purposes or troubleshooting. Starts reliably at 2 GPM and breaks cleanly. Works in grow beds 8-14 inches deep.',
		shortDescription: 'Clear PVC bell siphon with adjustable height for 8-14" grow beds.',
		price: '24.99',
		costPrice: '7.00',
		stock: 198,
		weight: '0.60',
		categorySlug: 'fish-supplies',
		isFeatured: false,
		tags: ['aquaponics', 'bell-siphon', 'flood-drain', 'plumbing'],
		imageFile: 'ToolProduct-AquaponicsBellSiphonKit.png',
		metaTitle: 'Aquaponics Bell Siphon Kit | Clear PVC Auto-Siphon',
		metaDescription: 'Clear PVC bell siphon kit for aquaponics flood-and-drain systems. Adjustable 6-12" height for any grow bed.'
	},
	{
		name: 'Aquaponics Water Testing Kit',
		slug: 'aquaponics-water-testing-kit',
		sku: 'AQP-WTK-001',
		description: 'Master test kit specifically calibrated for aquaponics water chemistry. Tests pH, ammonia (NH3/NH4+), nitrite (NO2-), nitrate (NO3-), dissolved oxygen, and general hardness (GH). Includes 150+ tests per parameter, color comparison cards, digital thermometer, and a laminated quick-reference guide for ideal ranges. Essential for maintaining the nitrogen cycle and keeping both fish and plants thriving.',
		shortDescription: 'Complete 6-parameter water test kit with 150+ tests and reference guide.',
		price: '34.99',
		costPrice: '12.00',
		stock: 112,
		weight: '0.80',
		categorySlug: 'fish-supplies',
		isFeatured: false,
		tags: ['aquaponics', 'water-testing', 'pH', 'ammonia', 'nitrogen-cycle'],
		imageFile: 'ToolProduct-AquaponicsWaterTestingKit.png',
		metaTitle: 'Aquaponics Water Testing Kit | 6 Parameters, 150+ Tests',
		metaDescription: 'Master water test kit for aquaponics. Tests pH, ammonia, nitrite, nitrate, DO, and hardness with 150+ tests.'
	},
	{
		name: 'Tilapia Fingerlings Starter Pack',
		slug: 'tilapia-fingerlings-starter-pack',
		sku: 'AQP-TFP-001',
		description: 'Live shipment of 25 Nile tilapia fingerlings (1-2 inches), the gold standard fish for aquaponics. Hardy, fast-growing, and excellent feed conversion. Ships Monday-Wednesday via overnight express in insulated box with oxygen packs. Includes acclimation guide, feeding schedule for the first 90 days, and a water parameter quick-start sheet. Fish arrive healthy or we replace them free. Estimated harvest size: 1-1.5 lbs in 8-10 months.',
		shortDescription: '25 live Nile tilapia fingerlings with overnight shipping and acclimation guide.',
		price: '59.99',
		costPrice: '22.00',
		stock: 40,
		weight: '3.00',
		categorySlug: 'fish-supplies',
		isFeatured: false,
		tags: ['tilapia', 'fingerlings', 'live-fish', 'aquaponics', 'protein'],
		imageFile: 'ToolProduct-AquaponicsTilapiaFingerlings.png',
		metaTitle: 'Tilapia Fingerlings | 25 Live Nile Tilapia for Aquaponics',
		metaDescription: '25 live Nile tilapia fingerlings shipped overnight. Hardy, fast-growing fish for aquaponics systems.'
	},

	// --- Silvopasture & Agroforestry ---
	{
		name: 'Silvopasture Seed Mix',
		slug: 'silvopasture-seed-mix',
		sku: 'SIL-SSM-001',
		description: 'Premium pasture seed blend formulated for silvopasture systems where livestock graze beneath trees. Contains shade-tolerant varieties of orchardgrass, white clover, birdsfoot trefoil, chicory, and timothy. The legume component fixes 80-150 lbs of nitrogen per acre annually, reducing fertilizer costs. Seeding rate: 25 lbs per acre. Suitable for USDA zones 4-8. Comes in a resealable kraft bag with detailed establishment guide.',
		shortDescription: 'Shade-tolerant pasture blend of grasses and legumes for silvopasture systems.',
		price: '64.99',
		costPrice: '24.00',
		stock: 48,
		weight: '25.00',
		categorySlug: 'tree-forage-seeds',
		isFeatured: false,
		tags: ['silvopasture', 'seed-mix', 'pasture', 'shade-tolerant', 'nitrogen-fixing'],
		imageFile: 'Silvopasture&AgroforestryProducts-SilvopastureSeedMix.png',
		metaTitle: 'Silvopasture Seed Mix | Shade-Tolerant Pasture Blend',
		metaDescription: 'Premium shade-tolerant pasture seed mix for silvopasture. Grasses and nitrogen-fixing legumes for zones 4-8.'
	},
	{
		name: 'Tree Shelters & Protectors (25 pack)',
		slug: 'tree-shelters-protectors-25-pack',
		sku: 'SIL-TSP-001',
		description: 'Protect young tree plantings from livestock browse, deer, rodents, and herbicide drift. These 4-foot translucent polypropylene shelters create a greenhouse microclimate that accelerates growth by 50-100%. Includes 25 shelters, 25 hardwood stakes, and 50 zip ties. Biodegradable option: shelters break down in 5-7 years as trees outgrow them. Essential for establishing silvopasture or agroforestry plantings where animals are present.',
		shortDescription: '25 translucent 4-ft tree shelters with stakes for silvopasture establishment.',
		price: '89.99',
		comparePrice: '109.99',
		costPrice: '35.00',
		stock: 32,
		weight: '15.00',
		categorySlug: 'livestock-integration',
		isFeatured: false,
		tags: ['tree-shelters', 'protectors', 'silvopasture', 'deer', 'browse'],
		imageFile: 'Silvopasture&AgroforestryProducts-TreeShelters&Protectors.png',
		metaTitle: 'Tree Shelters & Protectors | 25 Pack for Silvopasture',
		metaDescription: '25 translucent 4-ft tree shelters that accelerate growth 50-100%. Protect from livestock, deer, and rodents.'
	},
	{
		name: 'Forage Chicory Plants (50 plugs)',
		slug: 'forage-chicory-plants-50-plugs',
		sku: 'SIL-FCP-001',
		description: 'Deep-rooted forage chicory is a superstar in silvopasture systems. Its 12-18" taproots break up compacted soil, mine minerals from deep subsoil, and provide drought resistance. Livestock prefer it over most grasses, and it contains natural anthelmintic compounds that reduce parasite loads. This flat of 50 plugs establishes quickly and persists 5+ years. Plant at 4-6" spacing in prepared beds or interplant into existing pasture.',
		shortDescription: '50 forage chicory plugs with deep taproots for soil improvement and livestock forage.',
		price: '44.99',
		costPrice: '16.00',
		stock: 56,
		weight: '6.00',
		categorySlug: 'tree-forage-seeds',
		isFeatured: false,
		tags: ['chicory', 'forage', 'silvopasture', 'soil-health', 'livestock'],
		imageFile: 'Silvopasture&AgroforestryProducts-ForageChicoryPlants.png',
		metaTitle: 'Forage Chicory Plants | 50 Plugs for Silvopasture',
		metaDescription: '50 forage chicory plugs with deep taproots. Improves soil, provides livestock forage, and reduces parasites.'
	},
	{
		name: 'Portable Electric Netting (164 ft)',
		slug: 'portable-electric-netting-164-ft',
		sku: 'SIL-PEN-001',
		description: 'Electrifiable poultry/sheep netting for rotational grazing in silvopasture and orchard systems. 164 ft roll of 42" tall netting with built-in posts (14 posts, 12 ft spacing). Double-spike posts for firm ground hold. Includes 12 ground stakes and carry bag. Compatible with any standard fence energizer (sold separately). Move paddocks daily or weekly to prevent overgrazing and distribute fertility. Orange hi-vis color for safety.',
		shortDescription: '164 ft x 42" electric netting with 14 posts for rotational grazing.',
		price: '149.99',
		costPrice: '58.00',
		stock: 24,
		weight: '12.00',
		categorySlug: 'livestock-integration',
		isFeatured: false,
		tags: ['electric-netting', 'rotational-grazing', 'poultry', 'sheep', 'portable'],
		imageFile: 'Silvopasture&AgroforestryProducts-PortableElectricNettingforRotationalGrazing.png',
		metaTitle: 'Portable Electric Netting | 164 ft Rotational Grazing',
		metaDescription: '164 ft portable electric netting for rotational grazing. 42" tall with built-in posts, perfect for silvopasture.'
	},
	{
		name: 'Livestock Water Trough (Shaded)',
		slug: 'livestock-water-trough-shaded',
		sku: 'SIL-LWT-001',
		description: 'Heavy-gauge galvanized steel 100-gallon stock tank designed for silvopasture use. The galvanized finish resists rust and algae while keeping water cool under tree canopy shade. Includes a float valve for auto-fill from garden hose, drain plug, and mounting bracket for optional shade cover. Round design prevents livestock from getting trapped in corners. Doubles as a raised bed planter or rain catchment barrel in off-season.',
		shortDescription: '100-gallon galvanized stock tank with auto-fill float valve and drain.',
		price: '129.99',
		costPrice: '52.00',
		stock: 19,
		weight: '28.00',
		categorySlug: 'livestock-integration',
		isFeatured: false,
		tags: ['water-trough', 'livestock', 'galvanized', 'silvopasture', 'stock-tank'],
		imageFile: 'Silvopasture&AgroforestryProducts-LivestockWaterTrough.png',
		metaTitle: 'Livestock Water Trough | 100-Gallon Galvanized Tank',
		metaDescription: '100-gallon galvanized livestock water trough with auto-fill. Perfect for silvopasture shade management.'
	},
	{
		name: 'Nitrogen-Fixing Tree Seeds Collection',
		slug: 'nitrogen-fixing-tree-seeds-collection',
		sku: 'SIL-NFT-001',
		description: 'Establish the backbone of your agroforestry system with these nitrogen-fixing tree seeds. Collection includes black locust (100 seeds), autumn olive (50 seeds), siberian pea shrub (75 seeds), and alder (100 seeds). These species fix 50-300 lbs of nitrogen per acre annually through symbiotic root bacteria. Includes scarification and stratification instructions for each species, plus a planting density guide for alley cropping and silvopasture.',
		shortDescription: '4-species nitrogen-fixing tree seed collection with 325+ seeds and planting guide.',
		price: '36.99',
		costPrice: '10.00',
		stock: 72,
		weight: '0.30',
		categorySlug: 'tree-forage-seeds',
		isFeatured: false,
		tags: ['nitrogen-fixing', 'tree-seeds', 'agroforestry', 'black-locust', 'alley-cropping'],
		imageFile: 'Silvopasture&AgroforestryProducts-Nitrogen-FixingTreeSeeds.png',
		metaTitle: 'Nitrogen-Fixing Tree Seeds | 4 Species for Agroforestry',
		metaDescription: '4 nitrogen-fixing tree species (325+ seeds). Fix 50-300 lbs N/acre for silvopasture and alley cropping.'
	},

	// --- Kits & Collections ---
	{
		name: 'Permaculture Starter Kit',
		slug: 'permaculture-starter-kit',
		sku: 'KIT-PRM-001',
		description: 'Everything a beginning permaculturist needs in one beautifully packaged wooden crate. Includes: 12 companion planting seed packets, hand trowel, soil pH test kit, compost thermometer, biodegradable seed-starting pots, plant labels, garden twine, and a 120-page illustrated permaculture principles guidebook. Designed as a gift or self-starter, this kit covers the "observe and interact" through "produce no waste" principles with hands-on activities.',
		shortDescription: 'Complete permaculture starter in wooden crate with seeds, tools, and guidebook.',
		price: '89.99',
		comparePrice: '109.99',
		costPrice: '35.00',
		stock: 42,
		weight: '5.50',
		categorySlug: 'starter-kits',
		isFeatured: true,
		tags: ['permaculture', 'starter', 'gift', 'beginner', 'companion-planting'],
		imageFile: 'GeneralKits&Collections-PermacultureStarterKit.png',
		metaTitle: 'Permaculture Starter Kit | Seeds, Tools & Guidebook',
		metaDescription: 'Complete permaculture starter kit in wooden crate. 12 seed packets, tools, soil test, and 120-page guidebook.'
	},
	{
		name: 'Microgreens Growing Kit',
		slug: 'microgreens-growing-kit',
		sku: 'KIT-MCG-001',
		description: 'Harvest nutritious microgreens in just 7-14 days with this countertop growing kit. Includes 5 stackable BPA-free growing trays (10x20"), 5 seed varieties (sunflower, radish, broccoli, pea shoots, and wheatgrass), coconut coir growing mats, spray bottle, and a recipe booklet for incorporating microgreens into meals. No soil, no mess. Perfect for apartments, classrooms, and kitchens. Yields 10+ harvests from included seeds.',
		shortDescription: '5-tray microgreens kit with 5 seed varieties and coconut coir mats.',
		price: '39.99',
		costPrice: '14.00',
		stock: 94,
		weight: '3.00',
		categorySlug: 'starter-kits',
		isFeatured: false,
		tags: ['microgreens', 'indoor', 'countertop', 'sprouts', 'nutrition'],
		imageFile: 'GeneralKits&Collections-MicrogreensGrowingKit.png',
		metaTitle: 'Microgreens Growing Kit | 5 Varieties, Harvest in 7 Days',
		metaDescription: 'Grow microgreens in 7-14 days. 5 trays, 5 seed varieties, and coconut coir mats for 10+ harvests.'
	},
	{
		name: 'Mushroom Cultivation Kit',
		slug: 'mushroom-cultivation-kit',
		sku: 'KIT-MSH-001',
		description: 'Grow gourmet oyster mushrooms at home with this ready-to-fruit kit. The pre-inoculated hardwood sawdust block is fully colonized and ready to produce within 7-10 days of opening. Simply cut an X in the bag, mist twice daily, and watch clusters of pearl oyster mushrooms emerge. Produces 2-3 flushes totaling 1-2 lbs of fresh mushrooms. Includes a humidity tent, misting bottle, and a guide to log inoculation for continued outdoor growing.',
		shortDescription: 'Ready-to-fruit oyster mushroom kit producing 1-2 lbs in 2-3 flushes.',
		price: '29.99',
		costPrice: '10.00',
		stock: 158,
		weight: '5.00',
		categorySlug: 'starter-kits',
		isFeatured: true,
		tags: ['mushroom', 'oyster', 'fungi', 'indoor', 'gourmet', 'gift'],
		imageFile: 'GeneralKits&Collections-MushroomCultivationKit.png',
		metaTitle: 'Mushroom Cultivation Kit | Grow Oyster Mushrooms at Home',
		metaDescription: 'Grow gourmet oyster mushrooms at home. Ready-to-fruit kit produces 1-2 lbs in 7-10 days.'
	},
	{
		name: 'Composting Starter Kit',
		slug: 'composting-starter-kit',
		sku: 'KIT-CMP-001',
		description: 'Make composting easy and odor-free with this complete countertop-to-garden system. Includes a 1.3-gallon stainless steel countertop bin with charcoal filter lid, compost thermometer (0-200F), stainless steel aerating tool, and a laminated "Browns & Greens" ratio guide. The countertop bin holds 3-4 days of kitchen scraps before transferring to your outdoor pile. The charcoal filter eliminates odors for up to 6 months before replacement.',
		shortDescription: 'Stainless steel countertop compost bin with thermometer, aerator, and guide.',
		price: '44.99',
		costPrice: '18.00',
		stock: 76,
		weight: '2.50',
		categorySlug: 'composting',
		isFeatured: false,
		tags: ['composting', 'kitchen', 'countertop', 'odor-free', 'stainless-steel'],
		imageFile: 'GeneralKits&Collections-CompostingStarterKit.png',
		metaTitle: 'Composting Starter Kit | Countertop Bin & Tools',
		metaDescription: 'Odor-free composting made easy. Stainless steel countertop bin, thermometer, aerator, and ratio guide.'
	},
	{
		name: 'Worm Composting (Vermicompost) Kit',
		slug: 'worm-composting-vermicompost-kit',
		sku: 'KIT-WRM-001',
		description: 'Turn kitchen scraps into black gold with this stackable worm farm. The 3-tray system lets worms migrate upward as each tray fills, leaving finished castings below for easy harvesting. Includes 3 stacking trays, base with spigot for worm tea collection, coir bedding block, moisture mat, and detailed startup guide. Add 1 lb of red wiggler worms (not included, available separately) and start diverting waste within a week. Compact enough for apartments.',
		shortDescription: '3-tray stackable worm farm with spigot, bedding, and startup guide.',
		price: '54.99',
		costPrice: '22.00',
		stock: 61,
		weight: '6.00',
		categorySlug: 'composting',
		isFeatured: false,
		tags: ['vermicompost', 'worm-farm', 'red-wigglers', 'castings', 'apartment'],
		imageFile: 'GeneralKits&Collections-Worm Composting (Vermicompost) Kit.png',
		metaTitle: 'Worm Composting Kit | 3-Tray Vermicompost System',
		metaDescription: 'Stackable 3-tray worm farm for apartment composting. Collect castings and worm tea from kitchen scraps.'
	},
	{
		name: 'Beneficial Insect Habitat Kit',
		slug: 'beneficial-insect-habitat-kit',
		sku: 'KIT-BIH-001',
		description: 'Attract and house the beneficial insects that protect your garden naturally. This kit includes a mason bee house (holds 60+ tubes), a ladybug/lacewing shelter, a butterfly puddling dish (ceramic), 5 packets of beneficial-insect-attracting flower seeds, and an illustrated identification guide for 30 common garden insects. Learn which bugs are friends and create habitat that keeps pest populations in check without chemicals.',
		shortDescription: 'Bee house, insect shelters, puddling dish, flower seeds, and insect ID guide.',
		price: '59.99',
		costPrice: '22.00',
		stock: 38,
		weight: '4.00',
		categorySlug: 'starter-kits',
		isFeatured: false,
		tags: ['beneficial-insects', 'mason-bees', 'ladybugs', 'IPM', 'habitat'],
		imageFile: 'GeneralKits&Collections-Beneficial Insect Habitat Kit.png',
		metaTitle: 'Beneficial Insect Habitat Kit | Bee House & Garden Friends',
		metaDescription: 'Attract garden allies with bee house, insect shelters, flower seeds, and 30-species identification guide.'
	},
	{
		name: 'Rainwater Harvesting Kit',
		slug: 'rainwater-harvesting-kit',
		sku: 'KIT-RWH-001',
		description: 'Capture and reuse rainwater with this complete downspout diverter kit. Connects to any standard rectangular or round downspout to redirect rainwater into a barrel or cistern. Includes universal diverter valve, fine mesh debris filter, overflow fitting, brass spigot, 6 ft of flexible connector hose, and Teflon tape. The diverter automatically bypasses to the downspout when your barrel is full. Saves 1,300+ gallons per year from a typical roof.',
		shortDescription: 'Complete downspout diverter kit with filter, spigot, and overflow valve.',
		price: '49.99',
		costPrice: '18.00',
		stock: 53,
		weight: '3.50',
		categorySlug: 'starter-kits',
		isFeatured: false,
		tags: ['rainwater', 'harvesting', 'water-conservation', 'downspout', 'sustainable'],
		imageFile: 'GeneralKits&Collections-Rainwater Harvesting Kit Components.png',
		metaTitle: 'Rainwater Harvesting Kit | Downspout Diverter System',
		metaDescription: 'Capture 1,300+ gallons of rainwater per year. Complete diverter kit with filter, spigot, and overflow.'
	},
	{
		name: 'Soil Building Amendment Kit',
		slug: 'soil-building-amendment-kit',
		sku: 'KIT-SBA-001',
		description: 'Build living soil with this curated collection of 6 premium amendments. Includes: biochar (2 lbs, pre-charged), worm castings (4 lbs), glacial rock dust (3 lbs), kelp meal (2 lbs), neem cake (1 lb), and mycorrhizal inoculant (4 oz). Each amendment comes in a labeled kraft bag with application rates and timing guidelines. Enough to enrich 50-100 sq ft of garden beds. The synergy between these amendments creates soil that improves year after year.',
		shortDescription: '6 premium soil amendments (biochar, castings, rock dust, kelp, neem, mycorrhizae).',
		price: '69.99',
		comparePrice: '84.99',
		costPrice: '28.00',
		stock: 44,
		weight: '14.00',
		categorySlug: 'starter-kits',
		isFeatured: false,
		tags: ['soil', 'amendments', 'biochar', 'mycorrhizae', 'organic', 'regenerative'],
		imageFile: 'GeneralKits&Collections-Soil Building Amendment Kit.png',
		metaTitle: 'Soil Building Amendment Kit | 6 Premium Amendments',
		metaDescription: 'Build living soil with biochar, worm castings, rock dust, kelp, neem, and mycorrhizae for 50-100 sq ft.'
	},
	{
		name: 'Herb Spiral Garden Kit',
		slug: 'herb-spiral-garden-kit',
		sku: 'KIT-HSG-001',
		description: 'Build the iconic permaculture herb spiral in your backyard. This kit includes a step-by-step construction guide with measurements, 8 herb seedling plugs (rosemary, thyme, oregano, sage, parsley, chives, basil, cilantro), landscape fabric, and plant placement cards showing where each herb goes based on its water and sun preferences. The spiral design creates 6+ microclimates in just 6 sq ft, from dry Mediterranean at the top to moisture-loving herbs at the base.',
		shortDescription: '8 herb seedlings with spiral construction guide and placement cards.',
		price: '54.99',
		costPrice: '20.00',
		stock: 36,
		weight: '4.50',
		categorySlug: 'starter-kits',
		isFeatured: false,
		tags: ['herb-spiral', 'permaculture', 'herbs', 'design', 'microclimates'],
		imageFile: 'GeneralKits&Collections-Herb Spiral Garden Kit.png',
		metaTitle: 'Herb Spiral Garden Kit | Permaculture Design with 8 Herbs',
		metaDescription: 'Build a permaculture herb spiral. 8 herb seedlings with construction guide creating 6+ microclimates in 6 sq ft.'
	},

	// --- Agroforestry ---
	{
		name: 'Chestnut Tree Seedlings (10-pack)',
		slug: 'chestnut-tree-seedlings-10-pack',
		sku: 'AGF-CTS-001',
		description: 'Premium bare-root chestnut tree seedlings perfect for silvopasture and agroforestry systems. These blight-resistant hybrid varieties (Dunstan Chestnut) are selected for exceptional nut production and timber value. Trees provide valuable mast crop for livestock and wildlife while building long-term farm value. Each seedling is 2-3 feet tall with strong root systems, ready to plant in USDA zones 5-9. Chestnuts bear in 3-5 years and produce 50-100 lbs of nuts per tree at maturity. Includes variety tags, planting instructions, and a spacing guide for alley cropping.',
		shortDescription: '10 blight-resistant Dunstan chestnut seedlings (2-3 ft) for agroforestry systems.',
		price: '149.99',
		comparePrice: '179.99',
		costPrice: '55.00',
		stock: 12,
		weight: '8.00',
		categorySlug: 'tree-crops',
		isFeatured: false,
		tags: ['chestnut', 'tree', 'agroforestry', 'silvopasture', 'nut-tree', 'seedlings'],
		imageFile: 'Silvopasture&AgroforestryProducts-PermacultureStarterKit.png',
		metaTitle: 'Chestnut Tree Seedlings | 10-Pack for Agroforestry',
		metaDescription: '10 blight-resistant Dunstan chestnut seedlings for agroforestry. Bear in 3-5 years, produce 50-100 lbs/tree.'
	},

	// --- Tools ---
	{
		name: 'Digital pH & EC Meter Set',
		slug: 'digital-ph-ec-meter-set',
		sku: 'TLS-PHE-001',
		description: 'Professional-grade digital meters for precise nutrient solution and soil monitoring. The pH meter is accurate to 0.01 units with automatic temperature compensation (ATC). The EC/TDS meter measures electrical conductivity and total dissolved solids for hydroponic, aquaponic, and soil nutrient management. Both feature backlit displays, one-touch calibration, and IP67 waterproof housings. Includes pH 4.0 and 7.0 calibration solutions, 1413 uS/cm EC standard, protective carry cases, and a laminated quick-reference guide for ideal ranges by crop type.',
		shortDescription: 'Precision pH and EC/TDS meters with calibration solutions and carry cases.',
		price: '89.99',
		comparePrice: '109.99',
		costPrice: '32.00',
		stock: 34,
		weight: '0.60',
		categorySlug: 'soil-testing',
		isFeatured: false,
		tags: ['pH-meter', 'EC-meter', 'TDS', 'hydroponics', 'testing', 'precision'],
		imageFile: 'HydroToolProduct-RockwoolCubes&GrowingMedia.png',
		metaTitle: 'Digital pH & EC Meter Set | Professional Growing Instruments',
		metaDescription: 'Professional pH and EC/TDS meters with 0.01 accuracy, ATC, and calibration solutions for hydroponics and soil.'
	},

	// --- Additional Plants & Seeds product ---
	{
		name: 'Artisan Seed Packet Collection',
		slug: 'artisan-seed-packet-collection',
		sku: 'PLT-ASP-001',
		description: 'A beautiful collection of 20 heirloom vegetable and flower seeds in artistically designed packets featuring original botanical illustrations. Each packet contains rare and unusual open-pollinated varieties you will not find at big box stores: Moon and Stars watermelon, Lemon cucumber, Dragon Tongue beans, and more. All seeds are certified organic, non-GMO, and tested for 90%+ germination. Comes in a vintage-inspired wooden seed storage box with dividers and blank labels for organizing your collection.',
		shortDescription: '20 artistically packaged heirloom seed varieties in a vintage storage box.',
		price: '49.99',
		costPrice: '16.00',
		stock: 89,
		weight: '1.00',
		categorySlug: 'heirloom-seeds',
		isFeatured: false,
		tags: ['seeds', 'heirloom', 'artisan', 'botanical', 'collection', 'gift'],
		imageFile: 'PlantProduct-SEED.png',
		metaTitle: 'Artisan Seed Packet Collection | 20 Heirloom Varieties',
		metaDescription: '20 heirloom seed varieties in original botanical illustration packets. Vintage wooden storage box included.'
	}
];

// ----- Content pages -----
interface ContentDef {
	title: string;
	slug: string;
	type: 'blog_post' | 'guide' | 'faq' | 'page';
	status: 'published' | 'draft';
	excerpt: string;
	content: string;
	tags: string[];
	imageFile?: string;
	metaTitle: string;
	metaDescription: string;
}

const contentPages: ContentDef[] = [
	{
		title: 'Getting Started with Companion Planting',
		slug: 'getting-started-companion-planting',
		type: 'guide',
		status: 'published',
		excerpt: 'Learn which plants thrive together and why polyculture outperforms monoculture in every home garden.',
		content: `# Getting Started with Companion Planting\n\nCompanion planting is the practice of growing certain plants together for mutual benefit. Unlike monoculture farming, which depletes soil and invites pests, companion planting mimics natural ecosystems where diversity creates resilience.\n\n## The Three Sisters\n\nThe most famous companion planting guild is the Three Sisters: corn, beans, and squash. Corn provides a structure for beans to climb. Beans fix atmospheric nitrogen into the soil, feeding the corn and squash. Squash spreads along the ground, shading out weeds and retaining moisture.\n\n## Tomato Guilds\n\nTomatoes thrive alongside basil (repels aphids and improves flavor), marigolds (repels nematodes), and carrots (loosen soil around tomato roots). Avoid planting tomatoes near brassicas or fennel.\n\n## Getting Started\n\n1. **Start small** - Choose 2-3 companion pairs for your first season\n2. **Observe** - Note which combinations work in your specific microclimate\n3. **Record** - Keep a garden journal of what you plant where and the results\n4. **Iterate** - Expand successful guilds and experiment with new combinations each year`,
		tags: ['companion-planting', 'polyculture', 'beginner', 'guide'],
		imageFile: 'Educational & Content Images-Companion Planting.png',
		metaTitle: 'Companion Planting Guide | Polyculture for Home Gardens',
		metaDescription: 'Learn companion planting basics: Three Sisters, tomato guilds, and how polyculture creates resilient gardens.'
	},
	{
		title: 'Understanding Soil Health: The Foundation of Every Garden',
		slug: 'understanding-soil-health',
		type: 'guide',
		status: 'published',
		excerpt: 'Healthy soil is alive. Learn how to test, build, and maintain the living ecosystem beneath your feet.',
		content: `# Understanding Soil Health\n\nSoil is not dirt. It is a living ecosystem containing billions of organisms per teaspoon, including bacteria, fungi, protozoa, nematodes, and arthropods. These organisms form a food web that cycles nutrients, builds soil structure, suppresses disease, and stores carbon.\n\n## Testing Your Soil\n\nBefore amending, test. A basic soil test reveals pH, organic matter percentage, and major nutrient levels (N-P-K). You can also do simple home tests:\n\n- **Jar test**: Fill a jar with 1/3 soil, 2/3 water, shake, and let settle for 24 hours. Sand settles first, then silt, then clay. Ideal loam is roughly 40% sand, 40% silt, 20% clay.\n- **Earthworm count**: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.\n\n## Building Soil\n\n1. **Compost** - Add 1-2 inches annually as top dressing\n2. **Mulch** - Cover bare soil with 3-4 inches of organic mulch\n3. **Cover crops** - Plant clover or rye in off-seasons\n4. **Minimize tillage** - Let soil organisms build structure undisturbed\n5. **Biochar** - Adds permanent carbon and microbial habitat`,
		tags: ['soil-health', 'composting', 'testing', 'biology', 'guide'],
		imageFile: 'Educational & Content Images-Soil Health Diagram.png',
		metaTitle: 'Soil Health Guide | Test, Build & Maintain Living Soil',
		metaDescription: 'Learn soil testing, building, and maintenance. Understand the living ecosystem that powers every garden.'
	},
	{
		title: 'Hydroponics for Beginners: Growing Without Soil',
		slug: 'hydroponics-for-beginners',
		type: 'blog_post',
		status: 'published',
		excerpt: 'Hydroponics sounds complex, but modern systems make it accessible to anyone with a windowsill and curiosity.',
		content: `# Hydroponics for Beginners\n\nHydroponics is growing plants in nutrient-rich water instead of soil. Plants grow 30-50% faster because roots access nutrients directly without searching through soil. You use 90% less water because it recirculates.\n\n## Choosing Your First System\n\n### Kratky Method (Simplest)\nA jar of nutrient water with a net pot on top. No pumps, no electricity. Perfect for lettuce and herbs.\n\n### Deep Water Culture (DWC)\nA bucket with an air pump. One step up from Kratky. Grow large plants like tomatoes and peppers.\n\n### NFT (Nutrient Film Technique)\nSloped channels with a thin film of flowing nutrients. Great for lettuce farms and serious hobbyists.\n\n## Essential Supplies\n\n- **Nutrients**: A 3-part system (Grow, Bloom, Micro) covers all stages\n- **pH control**: Keep pH between 5.5-6.5 for optimal nutrient uptake\n- **Growing media**: Rockwool, clay pebbles, or coco coir to support plants\n- **Light**: A south-facing window or full-spectrum LED grow light`,
		tags: ['hydroponics', 'beginner', 'indoor-growing', 'tutorial'],
		imageFile: 'Educational & Content Images-Hydroponic Setup (ModernAccessible).png',
		metaTitle: 'Hydroponics for Beginners | Soil-Free Indoor Growing',
		metaDescription: 'Start hydroponic growing with this beginner guide. Covers Kratky, DWC, and NFT systems with supply lists.'
	},
	{
		title: 'Introduction to Aquaponics: Fish Meet Plants',
		slug: 'introduction-to-aquaponics',
		type: 'blog_post',
		status: 'published',
		excerpt: 'Aquaponics merges fish farming and hydroponics into a closed-loop system where waste becomes food.',
		content: `# Introduction to Aquaponics\n\nAquaponics is nature's recycling system scaled for food production. Fish produce ammonia-rich waste. Beneficial bacteria convert ammonia to nitrites, then nitrates. Plants absorb nitrates as fertilizer, cleaning the water that returns to the fish. It's a complete nitrogen cycle in your backyard.\n\n## Why Aquaponics?\n\n- **No synthetic fertilizers** - Fish provide all plant nutrients\n- **No soil-borne disease** - Growing media is inert\n- **Two crops, one system** - Harvest both fish and vegetables\n- **90% less water than soil gardening** - Water recirculates continuously\n\n## System Components\n\n1. **Fish tank** - Home for your fish (tilapia are the gold standard)\n2. **Grow bed** - Where plants grow in clay pebbles or similar media\n3. **Plumbing** - Pipes, pump, and bell siphon to move water\n4. **Biofilter** - Where bacteria colonize (often the grow bed itself)\n5. **Aeration** - Air pump to keep fish healthy and bacteria active\n\n## Starting Small\n\nBegin with a countertop system to learn the nitrogen cycle before scaling up.`,
		tags: ['aquaponics', 'fish', 'nitrogen-cycle', 'sustainable', 'tutorial'],
		imageFile: 'ToolProduct-HydroPonic.png',
		metaTitle: 'Introduction to Aquaponics | Fish-Powered Growing',
		metaDescription: 'Learn how aquaponics works: fish, bacteria, and plants in a closed-loop system. Getting started guide.'
	},
	{
		title: 'What is Silvopasture? Integrating Trees, Forage, and Livestock',
		slug: 'what-is-silvopasture',
		type: 'blog_post',
		status: 'published',
		excerpt: 'Silvopasture combines trees, forage, and livestock on the same land, creating one of the most productive and climate-friendly farming systems on Earth.',
		content: `# What is Silvopasture?\n\nSilvopasture is the deliberate integration of trees, forage crops, and livestock grazing on the same piece of land. It's one of the oldest and most widespread agroforestry practices in the world, and Project Drawdown ranks it #9 among climate solutions.\n\n## Benefits\n\n- **Animal welfare** - Shade reduces heat stress by 30-50%\n- **Carbon sequestration** - Trees store carbon above and below ground\n- **Diversified income** - Timber, nuts, fruit, livestock, and forage from one parcel\n- **Soil health** - Tree roots prevent erosion and cycle deep nutrients\n- **Biodiversity** - Habitat for birds, pollinators, and beneficial insects\n\n## Getting Started\n\n### Existing Pasture → Add Trees\nPlant rows of productive trees (fruit, nut, or timber) with tree shelters for protection. Space rows 30-60 ft apart.\n\n### Existing Forest → Add Forage\nThin the canopy to 40-60% shade. Overseed with shade-tolerant grasses and legumes. Introduce livestock gradually.\n\n## Key Species\n\n- **Trees**: Black walnut, chestnut, apple, black locust (nitrogen-fixer)\n- **Forage**: Orchardgrass, white clover, chicory, birdsfoot trefoil\n- **Livestock**: Cattle, sheep, goats, poultry (rotational grazing essential)`,
		tags: ['silvopasture', 'agroforestry', 'livestock', 'climate', 'regenerative'],
		imageFile: 'Silvopasture&AgroforestryProducts-PermacultureStarterKit.png',
		metaTitle: 'What is Silvopasture? | Trees, Forage & Livestock Integration',
		metaDescription: 'Learn silvopasture: integrating trees, forage, and livestock for climate-friendly, productive farming.'
	},
	{
		title: 'How often should I water my seedlings?',
		slug: 'faq-watering-seedlings',
		type: 'faq',
		status: 'published',
		excerpt: 'Seedling watering depends on container size, soil mix, and environment. Here is a reliable method.',
		content: `# How Often Should I Water My Seedlings?\n\nThe most common cause of seedling death is overwatering, not underwatering. Seedlings need consistently moist — not wet — soil.\n\n## The Finger Test\n\nStick your finger 1 inch into the soil. If it feels dry, water. If it feels moist, wait. Most seedlings need watering every 1-3 days depending on:\n\n- **Container size** - Smaller pots dry out faster\n- **Soil mix** - Peat-heavy mixes retain more moisture\n- **Temperature** - Warmer rooms = faster drying\n- **Humidity** - Low humidity accelerates evaporation\n\n## Best Practices\n\n1. Water from the bottom when possible (set trays in shallow water for 10 minutes)\n2. Use room-temperature water\n3. Water in the morning so foliage dries before evening\n4. Never let seedlings sit in standing water`,
		tags: ['faq', 'watering', 'seedlings', 'beginner'],
		metaTitle: 'How Often to Water Seedlings | FAQ',
		metaDescription: 'Learn the right watering frequency for seedlings using the finger test method and best practices.'
	},
	{
		title: 'Do you ship live plants and fish?',
		slug: 'faq-shipping-live-products',
		type: 'faq',
		status: 'published',
		excerpt: 'Yes! We ship live plants and tilapia fingerlings with special packaging to ensure they arrive healthy.',
		content: `# Do You Ship Live Plants and Fish?\n\nYes, we ship both live plants and live tilapia fingerlings throughout the continental United States.\n\n## Live Plants\n\n- Shipped Monday-Wednesday to avoid weekend delays\n- Packed in moisture-retaining wrap with ventilation\n- Insulated boxes for temperature-sensitive species\n- Arrival guarantee: if plants arrive damaged, we replace them free\n\n## Live Fish (Tilapia Fingerlings)\n\n- Shipped overnight (Monday-Wednesday only)\n- Double-bagged in oxygenated water inside insulated coolers\n- Heat or cold packs added based on forecast temperatures\n- Acclimation guide included in every shipment\n- DOA (Dead on Arrival) guarantee: photograph within 2 hours of delivery for free replacement\n\n## Restrictions\n\n- Live fish cannot ship to Hawaii, Alaska, or P.O. boxes\n- Some states restrict tilapia species — check your local regulations\n- Live plants ship USPS Priority; fish ship FedEx Overnight`,
		tags: ['faq', 'shipping', 'live-plants', 'fish', 'policy'],
		metaTitle: 'Live Plant & Fish Shipping Policy | FAQ',
		metaDescription: 'We ship live plants and tilapia fingerlings with arrival guarantees. Learn about our shipping methods and policies.'
	},
	{
		title: 'From Monoculture to Polyculture: Why Diversity Matters',
		slug: 'monoculture-to-polyculture',
		type: 'blog_post',
		status: 'published',
		excerpt: 'Modern agriculture bets on simplicity. Nature bets on diversity. Here is why polyculture wins.',
		content: `# From Monoculture to Polyculture\n\nMonoculture — growing a single crop over a large area — dominates modern agriculture. It's efficient for machines and supply chains, but it comes at enormous ecological cost: soil depletion, pesticide dependency, biodiversity collapse, and vulnerability to disease.\n\nPolyculture flips the script. By growing multiple species together, we mimic natural ecosystems that have sustained life for millions of years.\n\n## The Case for Polyculture\n\n### Pest Resistance\nPests specialize. A field of one crop is an all-you-can-eat buffet. Mix in flowers, herbs, and different crop families, and pest populations stay in check naturally.\n\n### Soil Health\nDifferent root depths access different soil layers. Legumes fix nitrogen. Deep-rooted plants mine minerals. Diversity feeds diversity — above and below ground.\n\n### Yield\nResearch consistently shows that polyculture systems produce more total food per acre than monocultures when you account for all species harvested (the "land equivalent ratio" exceeds 1.0).\n\n### Resilience\nIf one crop fails to drought, frost, or disease, others compensate. Monoculture is all-or-nothing.\n\n## Start in Your Backyard\n\nYou don't need a farm to practice polyculture. A raised bed with tomatoes, basil, marigolds, and lettuce is a polyculture. A food forest with fruit trees, berry bushes, herbs, and ground cover is a polyculture. Every diverse planting is a step toward a more resilient food system.`,
		tags: ['polyculture', 'monoculture', 'biodiversity', 'philosophy', 'sustainability'],
		imageFile: 'EDProduct-COMPANIONPLANTING.png',
		metaTitle: 'Monoculture vs Polyculture | Why Diversity Wins',
		metaDescription: 'Why polyculture outperforms monoculture: pest resistance, soil health, higher yields, and resilience.'
	}
];

// ================================================================
// SEED EXECUTION
// ================================================================

async function seed() {
	console.log('=== Aevani UAT Seed Script ===\n');

	// --- 0. Hash passwords ---
	console.log('[1/12] Hashing user passwords...');
	const passwordHash = await hash('Aevani2024!', {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	for (const u of users) {
		u.passwordHash = passwordHash;
	}

	// --- 1. Clear existing data (order matters for FK constraints) ---
	console.log('[2/12] Clearing existing data...');
	await db.delete(schema.auditLog);
	await db.delete(schema.affiliateClick);
	await db.delete(schema.orderItem);
	await db.delete(schema.order);
	await db.delete(schema.cartItem);
	await db.delete(schema.cart);
	await db.delete(schema.wishlistItem);
	await db.delete(schema.affiliateLink);
	await db.delete(schema.affiliate);
	await db.delete(schema.productImage);
	await db.delete(schema.product);
	await db.delete(schema.productCategory);
	await db.delete(schema.cmsContent);
	await db.delete(schema.cmsSeoFields);
	await db.delete(schema.contentPage);
	await db.delete(schema.file);
	await db.delete(schema.emailVerificationToken);
	await db.delete(schema.accountLocks);
	await db.delete(schema.socialAccounts);
	await db.delete(schema.loginAttempts);
	await db.delete(schema.session);
	await db.delete(schema.user);

	// --- 2. Users ---
	console.log('[3/12] Inserting users...');
	await db.insert(schema.user).values(users);
	console.log(`  -> ${users.length} users inserted`);

	// --- 3. Product Categories (parent first, then children) ---
	console.log('[4/12] Inserting product categories...');
	const categoryIdMap = new Map<string, number>(); // slug -> id

	for (let i = 0; i < categoryTree.length; i++) {
		const cat = categoryTree[i];
		const [inserted] = await db
			.insert(schema.productCategory)
			.values({
				name: cat.name,
				slug: cat.slug,
				description: cat.description,
				parentId: null,
				sortOrder: i,
				isActive: true
			})
			.returning({ id: schema.productCategory.id });
		categoryIdMap.set(cat.slug, inserted.id);

		if (cat.children) {
			for (let j = 0; j < cat.children.length; j++) {
				const child = cat.children[j];
				const [childInserted] = await db
					.insert(schema.productCategory)
					.values({
						name: child.name,
						slug: child.slug,
						description: child.description,
						parentId: inserted.id,
						sortOrder: j,
						isActive: true
					})
					.returning({ id: schema.productCategory.id });
				categoryIdMap.set(child.slug, childInserted.id);
			}
		}
	}
	console.log(`  -> ${categoryIdMap.size} categories inserted`);

	// --- 4. Files (product images and content images) ---
	console.log('[5/12] Inserting file records...');
	const fileRecords: (typeof schema.file.$inferInsert)[] = [];
	const fileIdMap = new Map<string, string>(); // filename -> file.id

	// Product image files
	for (const p of products) {
		const rec = makeFileRecord({
			filename: p.imageFile,
			entityType: 'product',
			uploadedBy: USER_IDS.admin
		});
		if (!fileIdMap.has(p.imageFile)) {
			fileIdMap.set(p.imageFile, rec.id);
			fileRecords.push(rec);
		}
	}

	// Content/hero image files
	const contentImageFiles = [
		'MAINHERO.png',
		'CommunityHero.png',
		'SustainabilityHero.png',
		'Success State Illustration.png',
		'Brand & Abstract Backgrounds-Abstract Polyculture Texture.png',
		'Brand & Abstract Backgrounds-Mycelium Network.png',
		'Brand & Abstract Backgrounds-Water & Growth.png',
		'EDProduct-DIRT.png'
	];
	for (const f of contentImageFiles) {
		if (!fileIdMap.has(f)) {
			const rec = makeFileRecord({
				filename: f,
				entityType: 'content',
				uploadedBy: USER_IDS.admin
			});
			fileIdMap.set(f, rec.id);
			fileRecords.push(rec);
		}
	}

	// Content page featured images
	for (const cp of contentPages) {
		if (cp.imageFile && !fileIdMap.has(cp.imageFile)) {
			const rec = makeFileRecord({
				filename: cp.imageFile,
				entityType: 'content',
				uploadedBy: USER_IDS.admin
			});
			fileIdMap.set(cp.imageFile, rec.id);
			fileRecords.push(rec);
		}
	}

	await db.insert(schema.file).values(fileRecords);
	console.log(`  -> ${fileRecords.length} file records inserted`);

	// --- 5. Products ---
	console.log('[6/12] Inserting products...');
	const productIdMap = new Map<string, number>(); // slug -> id

	for (const p of products) {
		const categoryId = categoryIdMap.get(p.categorySlug);
		if (!categoryId) {
			console.warn(`  [WARN] Category not found for product "${p.name}" (slug: ${p.categorySlug})`);
			continue;
		}

		const [inserted] = await db
			.insert(schema.product)
			.values({
				name: p.name,
				slug: p.slug,
				description: p.description,
				shortDescription: p.shortDescription,
				sku: p.sku,
				price: p.price,
				comparePrice: p.comparePrice ?? null,
				costPrice: p.costPrice,
				stockQuantity: p.stock,
				trackInventory: true,
				weight: p.weight,
				dimensions: JSON.stringify({ length: randomInt(5, 30), width: randomInt(5, 20), height: randomInt(3, 15) }),
				categoryId,
				isActive: true,
				isFeatured: p.isFeatured,
				tags: JSON.stringify(p.tags),
				metaTitle: p.metaTitle,
				metaDescription: p.metaDescription,
				createdAt: daysAgo(randomInt(30, 200)),
				updatedAt: new Date()
			})
			.returning({ id: schema.product.id });

		productIdMap.set(p.slug, inserted.id);
	}
	console.log(`  -> ${productIdMap.size} products inserted`);

	// --- 6. Product Images ---
	console.log('[7/12] Inserting product images...');
	const productImages: (typeof schema.productImage.$inferInsert)[] = [];

	for (const p of products) {
		const productId = productIdMap.get(p.slug);
		const fileId = fileIdMap.get(p.imageFile);
		if (productId && fileId) {
			productImages.push({
				productId,
				fileId,
				altText: p.shortDescription,
				sortOrder: 0,
				isMain: true
			});
		}
	}

	if (productImages.length > 0) {
		await db.insert(schema.productImage).values(productImages);
	}
	console.log(`  -> ${productImages.length} product images inserted`);

	// --- 7. Affiliates & Links ---
	console.log('[8/12] Inserting affiliates and links...');
	const affiliateData = [
		{
			userId: USER_IDS.marcus,
			code: 'MARCUS10',
			commissionRate: '0.1000',
			totalEarnings: '1247.50',
			totalClicks: 3420,
			totalConversions: 87
		},
		{
			userId: USER_IDS.jordan,
			code: 'JORDANGROW',
			commissionRate: '0.0750',
			totalEarnings: '682.30',
			totalClicks: 1856,
			totalConversions: 42
		}
	];

	const affiliateIdMap = new Map<string, number>(); // userId -> affiliate.id
	for (const a of affiliateData) {
		const [inserted] = await db
			.insert(schema.affiliate)
			.values({
				userId: a.userId,
				affiliateCode: a.code,
				commissionRate: a.commissionRate,
				totalEarnings: a.totalEarnings,
				totalClicks: a.totalClicks,
				totalConversions: a.totalConversions,
				isActive: true,
				createdAt: daysAgo(randomInt(90, 150)),
				updatedAt: new Date()
			})
			.returning({ id: schema.affiliate.id });
		affiliateIdMap.set(a.userId, inserted.id);
	}

	// Create affiliate links for featured products
	const affiliateLinkIds: number[] = [];
	const featuredSlugs = products.filter(p => p.isFeatured).map(p => p.slug);
	for (const slug of featuredSlugs) {
		const productId = productIdMap.get(slug);
		if (!productId) continue;

		for (const [userId, affiliateId] of affiliateIdMap.entries()) {
			const code = `${affiliateData.find(a => a.userId === userId)?.code}-${slug.replace(/-/g, '').slice(0, 10)}-${productId}`.toUpperCase();
			const [inserted] = await db
				.insert(schema.affiliateLink)
				.values({
					affiliateId,
					productId,
					linkCode: code,
					originalUrl: `/products/${slug}`,
					affiliateUrl: `/products/${slug}?ref=${code}`,
					clicks: randomInt(20, 500),
					conversions: randomInt(2, 30),
					earnings: String((Math.random() * 200 + 10).toFixed(2)),
					isActive: true,
					createdAt: daysAgo(randomInt(30, 120)),
					updatedAt: new Date()
				})
				.returning({ id: schema.affiliateLink.id });
			affiliateLinkIds.push(inserted.id);
		}
	}
	console.log(`  -> ${affiliateIdMap.size} affiliates, ${affiliateLinkIds.length} affiliate links inserted`);

	// --- 8. Orders ---
	console.log('[9/12] Inserting orders...');
	const customerIds = [USER_IDS.sarah, USER_IDS.elena, USER_IDS.aisha, USER_IDS.tom, USER_IDS.priya];
	const statuses: ('pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled')[] = [
		'delivered', 'delivered', 'delivered', 'delivered', 'shipped', 'shipped',
		'processing', 'confirmed', 'pending', 'cancelled'
	];
	const allProductSlugs = products.map(p => p.slug);

	const addresses = [
		{ name: 'Sarah Chen', line1: '142 Garden Way', city: 'Portland', state: 'OR', zip: '97201', country: 'US' },
		{ name: 'Elena Rodriguez', line1: '88 Vine Street', city: 'Austin', state: 'TX', zip: '78701', country: 'US' },
		{ name: 'Aisha Okafor', line1: '305 Bloom Ave', city: 'Atlanta', state: 'GA', zip: '30301', country: 'US' },
		{ name: 'Tom Bennett', line1: '7 Pasture Lane', city: 'Burlington', state: 'VT', zip: '05401', country: 'US' },
		{ name: 'Priya Sharma', line1: '1200 Mycelium Dr', city: 'Denver', state: 'CO', zip: '80201', country: 'US' }
	];

	const orderIds: number[] = [];
	for (let i = 0; i < 15; i++) {
		const customerIdx = i % customerIds.length;
		const userId = customerIds[customerIdx];
		const status = statuses[i % statuses.length];
		const addr = addresses[customerIdx];

		// Pick 1-4 random products for this order
		const numItems = randomInt(1, 4);
		const orderProductSlugs: string[] = [];
		while (orderProductSlugs.length < numItems) {
			const slug = randomElement(allProductSlugs);
			if (!orderProductSlugs.includes(slug)) orderProductSlugs.push(slug);
		}

		const orderItems: { slug: string; qty: number; price: number }[] = orderProductSlugs.map(slug => {
			const prod = products.find(p => p.slug === slug)!;
			return { slug, qty: randomInt(1, 3), price: parseFloat(prod.price) };
		});

		const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
		const tax = parseFloat((subtotal * 0.08).toFixed(2));
		const shipping = subtotal > 75 ? 0 : 9.99;
		const total = parseFloat((subtotal + tax + shipping).toFixed(2));
		const affiliateLinkId = i < 4 && affiliateLinkIds.length > 0 ? randomElement(affiliateLinkIds) : null;
		const commission = affiliateLinkId ? parseFloat((subtotal * 0.08).toFixed(2)) : 0;

		const createdAt = daysAgo(randomInt(1, 90));

		const [ord] = await db
			.insert(schema.order)
			.values({
				orderNumber: generateOrderNumber(i),
				userId,
				affiliateLinkId,
				status,
				totalAmount: String(total),
				subtotalAmount: String(subtotal.toFixed(2)),
				taxAmount: String(tax),
				shippingAmount: String(shipping.toFixed(2)),
				discountAmount: '0.00',
				affiliateCommission: String(commission.toFixed(2)),
				shippingAddress: JSON.stringify(addr),
				billingAddress: JSON.stringify(addr),
				customerEmail: users.find(u => u.id === userId)!.email,
				customerPhone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
				notes: i === 9 ? 'Customer requested cancellation before shipment.' : null,
				createdAt,
				updatedAt: new Date()
			})
			.returning({ id: schema.order.id });

		orderIds.push(ord.id);

		// Insert order items
		for (const item of orderItems) {
			const prod = products.find(p => p.slug === item.slug)!;
			const productId = productIdMap.get(item.slug)!;
			await db.insert(schema.orderItem).values({
				orderId: ord.id,
				productId,
				productName: prod.name,
				productSku: prod.sku,
				quantity: item.qty,
				unitPrice: String(item.price.toFixed(2)),
				totalPrice: String((item.price * item.qty).toFixed(2)),
				createdAt
			});
		}
	}
	console.log(`  -> 15 orders with items inserted`);

	// --- 9. Carts (active) ---
	console.log('[10/12] Inserting active carts and wishlists...');
	// Sarah has an active cart
	const [sarahCart] = await db
		.insert(schema.cart)
		.values({ userId: USER_IDS.sarah, sessionId: null, createdAt: daysAgo(1), updatedAt: new Date() })
		.returning({ id: schema.cart.id });

	const sarahCartProducts = [products[0], products[5], products[23]]; // tomato, NFT system, mushroom kit
	for (const p of sarahCartProducts) {
		const productId = productIdMap.get(p.slug);
		if (productId) {
			await db.insert(schema.cartItem).values({
				cartId: sarahCart.id,
				productId,
				quantity: randomInt(1, 2),
				unitPrice: p.price,
				createdAt: daysAgo(1),
				updatedAt: new Date()
			});
		}
	}

	// Guest cart
	const [guestCart] = await db
		.insert(schema.cart)
		.values({ userId: null, sessionId: 'guest-sess-abc123', createdAt: daysAgo(0), updatedAt: new Date() })
		.returning({ id: schema.cart.id });

	const guestCartProduct = products[4]; // trowel
	const trowelId = productIdMap.get(guestCartProduct.slug);
	if (trowelId) {
		await db.insert(schema.cartItem).values({
			cartId: guestCart.id,
			productId: trowelId,
			quantity: 1,
			unitPrice: guestCartProduct.price,
			createdAt: daysAgo(0),
			updatedAt: new Date()
		});
	}

	// Wishlists
	const wishlistData = [
		{ userId: USER_IDS.elena, slugs: ['vertical-tower-garden-system', 'aeroponic-misting-system', 'mushroom-cultivation-kit'] },
		{ userId: USER_IDS.aisha, slugs: ['heirloom-seed-vault', 'permaculture-starter-kit', 'herb-spiral-garden-kit'] },
		{ userId: USER_IDS.tom, slugs: ['silvopasture-seed-mix', 'portable-electric-netting-164-ft', 'ibc-aquaponics-fish-tank'] }
	];

	let wishlistCount = 0;
	for (const wl of wishlistData) {
		for (const slug of wl.slugs) {
			const productId = productIdMap.get(slug);
			if (productId) {
				await db.insert(schema.wishlistItem).values({
					userId: wl.userId,
					productId,
					createdAt: daysAgo(randomInt(1, 30))
				});
				wishlistCount++;
			}
		}
	}
	console.log(`  -> 2 carts, ${wishlistCount} wishlist items inserted`);

	// --- 10. Content Pages ---
	console.log('[11/12] Inserting content pages and CMS data...');
	for (const cp of contentPages) {
		const featuredImageFileId = cp.imageFile ? fileIdMap.get(cp.imageFile) ?? null : null;
		const publishedAt = cp.status === 'published' ? daysAgo(randomInt(5, 60)) : null;

		await db.insert(schema.contentPage).values({
			title: cp.title,
			slug: cp.slug,
			content: cp.content,
			excerpt: cp.excerpt,
			type: cp.type,
			status: cp.status,
			authorId: USER_IDS.admin,
			featuredImageFileId,
			metaTitle: cp.metaTitle,
			metaDescription: cp.metaDescription,
			tags: JSON.stringify(cp.tags),
			publishedAt,
			createdAt: daysAgo(randomInt(30, 90)),
			updatedAt: new Date()
		});

		// CMS SEO fields for each content page
		const seoId = generateId();
		await db.insert(schema.cmsSeoFields).values({
			id: seoId,
			pageId: cp.slug,
			pageType: cp.type === 'blog_post' ? 'post' : 'page',
			metaTitle: cp.metaTitle,
			metaDescription: cp.metaDescription,
			ogTitle: cp.metaTitle,
			ogDescription: cp.metaDescription,
			ogImage: cp.imageFile ? `${IMG_BASE}/${cp.imageFile}` : null,
			robots: 'index, follow',
			canonicalUrl: null
		});
	}

	// Homepage SEO
	await db.insert(schema.cmsSeoFields).values({
		id: generateId(),
		pageId: 'home',
		pageType: 'home',
		metaTitle: 'Aevani | From Monoculture to Polyculture',
		metaDescription: 'Aevani is your marketplace for sustainable gardening, hydroponics, aquaponics, and regenerative agriculture. Seeds, tools, kits, and knowledge for growing a biodiverse future.',
		ogTitle: 'Aevani | Sustainable Gardening & Regenerative Agriculture',
		ogDescription: 'Seeds, tools, kits, and knowledge for polyculture gardening, hydroponics, aquaponics, and silvopasture.',
		ogImage: `${IMG_BASE}/MAINHERO.png`,
		robots: 'index, follow',
		canonicalUrl: null
	});

	console.log(`  -> ${contentPages.length} content pages, ${contentPages.length + 1} SEO records inserted`);

	// --- 11. Audit Log ---
	console.log('[12/12] Inserting audit log entries...');
	const auditEntries: (typeof schema.auditLog.$inferInsert)[] = [
		{ userId: USER_IDS.admin, action: 'seed.executed', details: JSON.stringify({ version: '1.0.0', timestamp: new Date().toISOString() }), timestamp: new Date() },
		{ userId: USER_IDS.admin, action: 'product.created', details: JSON.stringify({ count: products.length, source: 'seed' }), timestamp: daysAgo(1) },
		{ userId: USER_IDS.sarah, action: 'user.login', details: JSON.stringify({ ip: '192.168.1.42', method: 'email' }), timestamp: daysAgo(1) },
		{ userId: USER_IDS.marcus, action: 'affiliate.payout_requested', details: JSON.stringify({ amount: '500.00', method: 'bank_transfer' }), timestamp: daysAgo(7) },
		{ userId: USER_IDS.elena, action: 'order.placed', details: JSON.stringify({ orderNumber: 'AEV-2026-00005' }), timestamp: daysAgo(3) },
		{ userId: USER_IDS.admin, action: 'content.published', details: JSON.stringify({ slug: 'getting-started-companion-planting' }), timestamp: daysAgo(14) },
		{ userId: USER_IDS.jordan, action: 'affiliate.link_created', details: JSON.stringify({ product: 'vertical-tower-garden-system' }), timestamp: daysAgo(20) },
		{ userId: USER_IDS.tom, action: 'user.registered', details: JSON.stringify({ source: 'organic', referrer: 'google' }), timestamp: daysAgo(45) },
		{ userId: USER_IDS.aisha, action: 'wishlist.added', details: JSON.stringify({ product: 'heirloom-seed-vault' }), timestamp: daysAgo(5) },
		{ userId: USER_IDS.priya, action: 'user.registered', details: JSON.stringify({ source: 'affiliate', referrer: 'MARCUS10' }), timestamp: daysAgo(14) }
	];
	await db.insert(schema.auditLog).values(auditEntries);
	console.log(`  -> ${auditEntries.length} audit log entries inserted`);

	// --- Summary ---
	console.log('\n=== Seed Complete ===');
	console.log(`  Users:              ${users.length}`);
	console.log(`  Categories:         ${categoryIdMap.size}`);
	console.log(`  Products:           ${productIdMap.size}`);
	console.log(`  Product Images:     ${productImages.length}`);
	console.log(`  Files:              ${fileRecords.length}`);
	console.log(`  Affiliates:         ${affiliateIdMap.size}`);
	console.log(`  Affiliate Links:    ${affiliateLinkIds.length}`);
	console.log(`  Orders:             15`);
	console.log(`  Carts:              2`);
	console.log(`  Wishlist Items:     ${wishlistCount}`);
	console.log(`  Content Pages:      ${contentPages.length}`);
	console.log(`  CMS SEO Records:    ${contentPages.length + 1}`);
	console.log(`  Audit Entries:      ${auditEntries.length}`);
	console.log('\n  Default password for all users: Aevani2024!');
	console.log('  Admin login: admin@aevani.com / Aevani2024!\n');
}

seed()
	.then(() => {
		console.log('Done. Closing connection.');
		process.exit(0);
	})
	.catch((err) => {
		console.error('Seed failed:', err);
		process.exit(1);
	});
