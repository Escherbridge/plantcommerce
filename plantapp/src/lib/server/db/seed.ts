/**
 * Comprehensive UAT Seed Script for Aevani Plant Commerce
 *
 * Seeds all database tables with realistic, interconnected data. The product
 * catalogue is the canonical 40-product demo dataset (`catalogDemo.ts`), served
 * from real `/assets/` imagery; content/hero imagery still resolves through the
 * legacy mock-asset serve API.
 *
 * Usage: npm run db:seed:uat
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import crypto from 'node:crypto';
import * as schema from './schema';
import * as lms from './lms-schema';
import {
	demoCategories,
	demoProducts,
	computeRatingSummary,
	resolveAssetUrls,
	assetUrlToBucketPath,
	deriveProductColumns
} from './catalogDemo';

// ---------- connection ----------
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}
const databaseUrl = DATABASE_URL;
const client = postgres(databaseUrl);
const db = drizzle(client, { schema });

function requireDisposableUatSeedConfiguration(): string {
	const confirmation = process.env.AEVANI_UAT_SEED_CONFIRM;
	if (confirmation !== 'ERASE_AND_SEED_DISPOSABLE_DATABASE') {
		throw new Error('Set AEVANI_UAT_SEED_CONFIRM for an explicitly disposable UAT database.');
	}

	const databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');
	if (!/(^|_)(dev|test|uat)(_|$)/i.test(databaseName)) {
		throw new Error(`Refusing destructive UAT seed for non-disposable database "${databaseName}".`);
	}

	const password = process.env.AEVANI_UAT_SEED_PASSWORD;
	if (!password || password.length < 16) {
		throw new Error('Set a unique AEVANI_UAT_SEED_PASSWORD with at least 16 characters.');
	}

	return password;
}

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

// The mock-asset image path prefix (relative from src/lib/images/), still used
// for content/hero imagery served via the file serve API.
const IMG_BASE = 'AI-MockAssets';

// ---------- file record factory (content/hero imagery) ----------
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
	priya: generateId(),
	adminTest: generateId(),
	ahmed: generateId()
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
	},
	{
		id: USER_IDS.adminTest,
		username: 'admin.test',
		email: 'admin-test@aevani.com',
		passwordHash: '',
		firstName: 'Test',
		lastName: 'Admin',
		role: 'admin',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(300),
		updatedAt: new Date()
	},
	{
		id: USER_IDS.ahmed,
		username: 'ahmed.admin',
		email: 'ahmed@aevani.com',
		passwordHash: '',
		firstName: 'Ahmed',
		lastName: 'Zaher',
		role: 'admin',
		isActive: true,
		emailVerified: true,
		createdAt: daysAgo(365),
		updatedAt: new Date()
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
		excerpt:
			'Learn which plants thrive together and why polyculture outperforms monoculture in every home garden.',
		content: `# Getting Started with Companion Planting\n\nCompanion planting is the practice of growing certain plants together for mutual benefit. Unlike monoculture farming, which depletes soil and invites pests, companion planting mimics natural ecosystems where diversity creates resilience.\n\n## The Three Sisters\n\nThe most famous companion planting guild is the Three Sisters: corn, beans, and squash. Corn provides a structure for beans to climb. Beans fix atmospheric nitrogen into the soil, feeding the corn and squash. Squash spreads along the ground, shading out weeds and retaining moisture.\n\n## Tomato Guilds\n\nTomatoes thrive alongside basil (repels aphids and improves flavor), marigolds (repels nematodes), and carrots (loosen soil around tomato roots). Avoid planting tomatoes near brassicas or fennel.\n\n## Getting Started\n\n1. **Start small** - Choose 2-3 companion pairs for your first season\n2. **Observe** - Note which combinations work in your specific microclimate\n3. **Record** - Keep a garden journal of what you plant where and the results\n4. **Iterate** - Expand successful guilds and experiment with new combinations each year`,
		tags: ['companion-planting', 'polyculture', 'beginner', 'guide'],
		imageFile: 'Educational & Content Images-Companion Planting.png',
		metaTitle: 'Companion Planting Guide | Polyculture for Home Gardens',
		metaDescription:
			'Learn companion planting basics: Three Sisters, tomato guilds, and how polyculture creates resilient gardens.'
	},
	{
		title: 'Understanding Soil Health: The Foundation of Every Garden',
		slug: 'understanding-soil-health',
		type: 'guide',
		status: 'published',
		excerpt:
			'Healthy soil is alive. Learn how to test, build, and maintain the living ecosystem beneath your feet.',
		content: `# Understanding Soil Health\n\nSoil is not dirt. It is a living ecosystem containing billions of organisms per teaspoon, including bacteria, fungi, protozoa, nematodes, and arthropods. These organisms form a food web that cycles nutrients, builds soil structure, suppresses disease, and stores carbon.\n\n## Testing Your Soil\n\nBefore amending, test. A basic soil test reveals pH, organic matter percentage, and major nutrient levels (N-P-K). You can also do simple home tests:\n\n- **Jar test**: Fill a jar with 1/3 soil, 2/3 water, shake, and let settle for 24 hours. Sand settles first, then silt, then clay. Ideal loam is roughly 40% sand, 40% silt, 20% clay.\n- **Earthworm count**: Dig a 1 cubic foot hole. Count the earthworms. 10+ means healthy biology.\n\n## Building Soil\n\n1. **Compost** - Add 1-2 inches annually as top dressing\n2. **Mulch** - Cover bare soil with 3-4 inches of organic mulch\n3. **Cover crops** - Plant clover or rye in off-seasons\n4. **Minimize tillage** - Let soil organisms build structure undisturbed\n5. **Biochar** - Adds permanent carbon and microbial habitat`,
		tags: ['soil-health', 'composting', 'testing', 'biology', 'guide'],
		imageFile: 'Educational & Content Images-Soil Health Diagram.png',
		metaTitle: 'Soil Health Guide | Test, Build & Maintain Living Soil',
		metaDescription:
			'Learn soil testing, building, and maintenance. Understand the living ecosystem that powers every garden.'
	},
	{
		title: 'Hydroponics for Beginners: Growing Without Soil',
		slug: 'hydroponics-for-beginners',
		type: 'blog_post',
		status: 'published',
		excerpt:
			'Hydroponics sounds complex, but modern systems make it accessible to anyone with a windowsill and curiosity.',
		content: `# Hydroponics for Beginners\n\nHydroponics is growing plants in nutrient-rich water instead of soil. Plants grow 30-50% faster because roots access nutrients directly without searching through soil. You use 90% less water because it recirculates.\n\n## Choosing Your First System\n\n### Kratky Method (Simplest)\nA jar of nutrient water with a net pot on top. No pumps, no electricity. Perfect for lettuce and herbs.\n\n### Deep Water Culture (DWC)\nA bucket with an air pump. One step up from Kratky. Grow large plants like tomatoes and peppers.\n\n### NFT (Nutrient Film Technique)\nSloped channels with a thin film of flowing nutrients. Great for lettuce farms and serious hobbyists.\n\n## Essential Supplies\n\n- **Nutrients**: A 3-part system (Grow, Bloom, Micro) covers all stages\n- **pH control**: Keep pH between 5.5-6.5 for optimal nutrient uptake\n- **Growing media**: Rockwool, clay pebbles, or coco coir to support plants\n- **Light**: A south-facing window or full-spectrum LED grow light`,
		tags: ['hydroponics', 'beginner', 'indoor-growing', 'tutorial'],
		imageFile: 'Educational & Content Images-Hydroponic Setup (ModernAccessible).png',
		metaTitle: 'Hydroponics for Beginners | Soil-Free Indoor Growing',
		metaDescription:
			'Start hydroponic growing with this beginner guide. Covers Kratky, DWC, and NFT systems with supply lists.'
	},
	{
		title: 'Introduction to Aquaponics: Fish Meet Plants',
		slug: 'introduction-to-aquaponics',
		type: 'blog_post',
		status: 'published',
		excerpt:
			'Aquaponics merges fish farming and hydroponics into a closed-loop system where waste becomes food.',
		content: `# Introduction to Aquaponics\n\nAquaponics is nature's recycling system scaled for food production. Fish produce ammonia-rich waste. Beneficial bacteria convert ammonia to nitrites, then nitrates. Plants absorb nitrates as fertilizer, cleaning the water that returns to the fish. It's a complete nitrogen cycle in your backyard.\n\n## Why Aquaponics?\n\n- **No synthetic fertilizers** - Fish provide all plant nutrients\n- **No soil-borne disease** - Growing media is inert\n- **Two crops, one system** - Harvest both fish and vegetables\n- **90% less water than soil gardening** - Water recirculates continuously\n\n## System Components\n\n1. **Fish tank** - Home for your fish (tilapia are the gold standard)\n2. **Grow bed** - Where plants grow in clay pebbles or similar media\n3. **Plumbing** - Pipes, pump, and bell siphon to move water\n4. **Biofilter** - Where bacteria colonize (often the grow bed itself)\n5. **Aeration** - Air pump to keep fish healthy and bacteria active\n\n## Starting Small\n\nBegin with a countertop system to learn the nitrogen cycle before scaling up.`,
		tags: ['aquaponics', 'fish', 'nitrogen-cycle', 'sustainable', 'tutorial'],
		imageFile: 'ToolProduct-HydroPonic.png',
		metaTitle: 'Introduction to Aquaponics | Fish-Powered Growing',
		metaDescription:
			'Learn how aquaponics works: fish, bacteria, and plants in a closed-loop system. Getting started guide.'
	},
	{
		title: 'What is Silvopasture? Integrating Trees, Forage, and Livestock',
		slug: 'what-is-silvopasture',
		type: 'blog_post',
		status: 'published',
		excerpt:
			'Silvopasture combines trees, forage, and livestock on the same land, creating one of the most productive and climate-friendly farming systems on Earth.',
		content: `# What is Silvopasture?\n\nSilvopasture is the deliberate integration of trees, forage crops, and livestock grazing on the same piece of land. It's one of the oldest and most widespread agroforestry practices in the world, and Project Drawdown ranks it #9 among climate solutions.\n\n## Benefits\n\n- **Animal welfare** - Shade reduces heat stress by 30-50%\n- **Carbon sequestration** - Trees store carbon above and below ground\n- **Diversified income** - Timber, nuts, fruit, livestock, and forage from one parcel\n- **Soil health** - Tree roots prevent erosion and cycle deep nutrients\n- **Biodiversity** - Habitat for birds, pollinators, and beneficial insects\n\n## Getting Started\n\n### Existing Pasture → Add Trees\nPlant rows of productive trees (fruit, nut, or timber) with tree shelters for protection. Space rows 30-60 ft apart.\n\n### Existing Forest → Add Forage\nThin the canopy to 40-60% shade. Overseed with shade-tolerant grasses and legumes. Introduce livestock gradually.\n\n## Key Species\n\n- **Trees**: Black walnut, chestnut, apple, black locust (nitrogen-fixer)\n- **Forage**: Orchardgrass, white clover, chicory, birdsfoot trefoil\n- **Livestock**: Cattle, sheep, goats, poultry (rotational grazing essential)`,
		tags: ['silvopasture', 'agroforestry', 'livestock', 'climate', 'regenerative'],
		imageFile: 'Silvopasture&AgroforestryProducts-PermacultureStarterKit.png',
		metaTitle: 'What is Silvopasture? | Trees, Forage & Livestock Integration',
		metaDescription:
			'Learn silvopasture: integrating trees, forage, and livestock for climate-friendly, productive farming.'
	},
	{
		title: 'How often should I water my seedlings?',
		slug: 'faq-watering-seedlings',
		type: 'faq',
		status: 'published',
		excerpt:
			'Seedling watering depends on container size, soil mix, and environment. Here is a reliable method.',
		content: `# How Often Should I Water My Seedlings?\n\nThe most common cause of seedling death is overwatering, not underwatering. Seedlings need consistently moist — not wet — soil.\n\n## The Finger Test\n\nStick your finger 1 inch into the soil. If it feels dry, water. If it feels moist, wait. Most seedlings need watering every 1-3 days depending on:\n\n- **Container size** - Smaller pots dry out faster\n- **Soil mix** - Peat-heavy mixes retain more moisture\n- **Temperature** - Warmer rooms = faster drying\n- **Humidity** - Low humidity accelerates evaporation\n\n## Best Practices\n\n1. Water from the bottom when possible (set trays in shallow water for 10 minutes)\n2. Use room-temperature water\n3. Water in the morning so foliage dries before evening\n4. Never let seedlings sit in standing water`,
		tags: ['faq', 'watering', 'seedlings', 'beginner'],
		metaTitle: 'How Often to Water Seedlings | FAQ',
		metaDescription:
			'Learn the right watering frequency for seedlings using the finger test method and best practices.'
	},
	{
		title: 'Do you ship live plants and fish?',
		slug: 'faq-shipping-live-products',
		type: 'faq',
		status: 'published',
		excerpt:
			'Yes! We ship live plants and tilapia fingerlings with special packaging to ensure they arrive healthy.',
		content: `# Do You Ship Live Plants and Fish?\n\nYes, we ship both live plants and live tilapia fingerlings throughout the continental United States.\n\n## Live Plants\n\n- Shipped Monday-Wednesday to avoid weekend delays\n- Packed in moisture-retaining wrap with ventilation\n- Insulated boxes for temperature-sensitive species\n- Arrival guarantee: if plants arrive damaged, we replace them free\n\n## Live Fish (Tilapia Fingerlings)\n\n- Shipped overnight (Monday-Wednesday only)\n- Double-bagged in oxygenated water inside insulated coolers\n- Heat or cold packs added based on forecast temperatures\n- Acclimation guide included in every shipment\n- DOA (Dead on Arrival) guarantee: photograph within 2 hours of delivery for free replacement\n\n## Restrictions\n\n- Live fish cannot ship to Hawaii, Alaska, or P.O. boxes\n- Some states restrict tilapia species — check your local regulations\n- Live plants ship USPS Priority; fish ship FedEx Overnight`,
		tags: ['faq', 'shipping', 'live-plants', 'fish', 'policy'],
		metaTitle: 'Live Plant & Fish Shipping Policy | FAQ',
		metaDescription:
			'We ship live plants and tilapia fingerlings with arrival guarantees. Learn about our shipping methods and policies.'
	},
	{
		title: 'From Monoculture to Polyculture: Why Diversity Matters',
		slug: 'monoculture-to-polyculture',
		type: 'blog_post',
		status: 'published',
		excerpt:
			'Modern agriculture bets on simplicity. Nature bets on diversity. Here is why polyculture wins.',
		content: `# From Monoculture to Polyculture\n\nMonoculture — growing a single crop over a large area — dominates modern agriculture. It's efficient for machines and supply chains, but it comes at enormous ecological cost: soil depletion, pesticide dependency, biodiversity collapse, and vulnerability to disease.\n\nPolyculture flips the script. By growing multiple species together, we mimic natural ecosystems that have sustained life for millions of years.\n\n## The Case for Polyculture\n\n### Pest Resistance\nPests specialize. A field of one crop is an all-you-can-eat buffet. Mix in flowers, herbs, and different crop families, and pest populations stay in check naturally.\n\n### Soil Health\nDifferent root depths access different soil layers. Legumes fix nitrogen. Deep-rooted plants mine minerals. Diversity feeds diversity — above and below ground.\n\n### Yield\nResearch consistently shows that polyculture systems produce more total food per acre than monocultures when you account for all species harvested (the "land equivalent ratio" exceeds 1.0).\n\n### Resilience\nIf one crop fails to drought, frost, or disease, others compensate. Monoculture is all-or-nothing.\n\n## Start in Your Backyard\n\nYou don't need a farm to practice polyculture. A raised bed with tomatoes, basil, marigolds, and lettuce is a polyculture. A food forest with fruit trees, berry bushes, herbs, and ground cover is a polyculture. Every diverse planting is a step toward a more resilient food system.`,
		tags: ['polyculture', 'monoculture', 'biodiversity', 'philosophy', 'sustainability'],
		imageFile: 'EDProduct-COMPANIONPLANTING.png',
		metaTitle: 'Monoculture vs Polyculture | Why Diversity Wins',
		metaDescription:
			'Why polyculture outperforms monoculture: pest resistance, soil health, higher yields, and resilience.'
	}
];

// ----- LMS courses (minimal but valid /learn + /courses content) -----
interface LmsCourseDef {
	title: string;
	slug: string;
	description: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	durationEstimate: number;
	isFeatured: boolean;
	categorySlug: string;
	tagSlugs: string[];
	productCategorySlug: string;
	modules: { title: string; lessons: { title: string; body: string; isPreview?: boolean }[] }[];
}

const lmsCategoryDefs = [
	{ name: 'Growing Systems', slug: 'growing-systems' },
	{ name: 'Regenerative Land', slug: 'regenerative-land' },
	{ name: 'Foundations', slug: 'foundations' }
];

const lmsTagDefs = [
	{ name: 'Hydroponics', slug: 'hydroponics' },
	{ name: 'Aquaponics', slug: 'aquaponics' },
	{ name: 'Silvopasture', slug: 'silvopasture' },
	{ name: 'Seeds', slug: 'seeds' },
	{ name: 'Soil', slug: 'soil' },
	{ name: 'Beginner', slug: 'beginner' }
];

const lmsCourseDefs: LmsCourseDef[] = [
	{
		title: 'Hydroponics Field Guide',
		slug: 'hydroponics-field-guide',
		description:
			'Grow your first soil-free crop with confidence — systems, nutrients, pH, and troubleshooting, the way we run them in our own test room.',
		difficulty: 'beginner',
		durationEstimate: 120,
		isFeatured: true,
		categorySlug: 'growing-systems',
		tagSlugs: ['hydroponics', 'beginner'],
		productCategorySlug: 'hydroponics',
		modules: [
			{
				title: 'Choosing a System',
				lessons: [
					{
						title: 'DWC, NFT, and Towers',
						body: 'A plain-language tour of the main hydroponic methods and which one fits your space and goals.',
						isPreview: true
					},
					{
						title: 'What You Actually Need',
						body: 'The short list of gear that matters: reservoir, pump, media, nutrients, and a way to read pH.'
					}
				]
			},
			{
				title: 'Running the System',
				lessons: [
					{
						title: 'pH and EC in Practice',
						body: 'How to read and hold the two numbers that decide whether nutrients flow or plants starve.'
					},
					{
						title: 'Troubleshooting Common Problems',
						body: 'Algae, root rot, nutrient lockout, and pump failure — how to spot and fix each one early.'
					}
				]
			}
		]
	},
	{
		title: 'Aquaponics From Scratch',
		slug: 'aquaponics-from-scratch',
		description:
			'Build a balanced fish-and-plant loop: the nitrogen cycle, stocking rates, and the patient first months that make or break a system.',
		difficulty: 'intermediate',
		durationEstimate: 180,
		isFeatured: true,
		categorySlug: 'growing-systems',
		tagSlugs: ['aquaponics'],
		productCategorySlug: 'aquaponics',
		modules: [
			{
				title: 'The Nitrogen Cycle',
				lessons: [
					{
						title: 'Fish, Bacteria, Plants',
						body: 'How ammonia becomes nitrate and why bacteria are the real workhorse of your system.',
						isPreview: true
					},
					{
						title: 'Cycling a New System',
						body: 'Why you cycle before adding fish, and how to know when your biofilter is ready.'
					}
				]
			},
			{
				title: 'Livestock & Balance',
				lessons: [
					{
						title: 'Stocking and Feeding',
						body: 'Fish-to-plant ratios, understocking early, and feeding rates that keep water clean.'
					}
				]
			}
		]
	},
	{
		title: 'Silvopasture & Agroforestry Basics',
		slug: 'silvopasture-agroforestry-basics',
		description:
			'Integrate trees, forage, and livestock for shade, forage, and long-term farm value — establishment, rotation, and species selection.',
		difficulty: 'intermediate',
		durationEstimate: 150,
		isFeatured: false,
		categorySlug: 'regenerative-land',
		tagSlugs: ['silvopasture'],
		productCategorySlug: 'silvopasture',
		modules: [
			{
				title: 'Designing the System',
				lessons: [
					{
						title: 'Trees Into Pasture, Forage Into Forest',
						body: 'Two paths into silvopasture and how to choose based on what you already have.',
						isPreview: true
					},
					{
						title: 'Protecting Young Trees',
						body: 'Tree shelters, spacing, and getting seedlings past the vulnerable browsing years.'
					}
				]
			}
		]
	},
	{
		title: 'Seed Saving & Soil Health',
		slug: 'seed-saving-soil-health',
		description:
			'Close the loop: save true-to-type seed and build living soil that improves every season. The foundations under every other system.',
		difficulty: 'beginner',
		durationEstimate: 90,
		isFeatured: false,
		categorySlug: 'foundations',
		tagSlugs: ['seeds', 'soil', 'beginner'],
		productCategorySlug: 'supplies',
		modules: [
			{
				title: 'Foundations',
				lessons: [
					{
						title: 'Reading Your Soil',
						body: 'Simple jar and earthworm tests, plus what a basic soil report is telling you.',
						isPreview: true
					},
					{
						title: 'Saving Seed That Grows True',
						body: 'Open-pollinated vs hybrid, drying and storage, and building your own seed library.'
					}
				]
			}
		]
	}
];

// ================================================================
// SEED EXECUTION
// ================================================================

async function seed() {
	const seedPassword = requireDisposableUatSeedConfiguration();
	console.log('=== Aevani UAT Seed Script ===\n');

	// --- 0. Hash passwords ---
	console.log('[1/13] Hashing user passwords...');
	const passwordHash = await hash(seedPassword, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	for (const u of users) {
		u.passwordHash = passwordHash;
	}

	// --- 1. Clear existing data (order matters for FK constraints) ---
	console.log('[2/13] Clearing existing data...');
	// LMS (children -> parents) before file/user/productCategory
	await db.delete(lms.lmsNote);
	await db.delete(lms.lmsBookmark);
	await db.delete(lms.lmsLearnerBadge);
	await db.delete(lms.lmsBadge);
	await db.delete(lms.lmsCertificate);
	await db.delete(lms.lmsCertificateTemplate);
	await db.delete(lms.lmsQuizAnswer);
	await db.delete(lms.lmsQuizAttempt);
	await db.delete(lms.lmsProgress);
	await db.delete(lms.lmsEnrollment);
	await db.delete(lms.lmsQuestionOption);
	await db.delete(lms.lmsQuestion);
	await db.delete(lms.lmsQuestionBank);
	await db.delete(lms.lmsQuiz);
	await db.delete(lms.lmsContentBlock);
	await db.delete(lms.lmsLesson);
	await db.delete(lms.lmsModule);
	await db.delete(lms.lmsDiscussionReply);
	await db.delete(lms.lmsDiscussionThread);
	await db.delete(lms.lmsCourseReview);
	await db.delete(lms.lmsCourseToTagJoin);
	await db.delete(lms.lmsCourseToCategoryJoin);
	await db.delete(lms.lmsCourseProduct);
	await db.delete(lms.lmsCoursePrerequisite);
	await db.delete(lms.lmsCourse);
	await db.delete(lms.lmsCourseTag);
	await db.delete(lms.lmsCourseCategory);
	await db.delete(lms.lmsProgram);

	// Affiliate commission ledger (append-only) + policy snapshots — clear before orders/affiliates.
	await db.delete(schema.affiliateCommissionLedgerEvent);
	await db.delete(schema.affiliatePayout);
	await db.delete(schema.affiliateCommissionLedger);
	await db.delete(schema.affiliateTermsAcceptance);
	await db.delete(schema.affiliateTier);

	await db.delete(schema.auditLog);
	await db.delete(schema.affiliateClick);
	await db.delete(schema.orderItem);
	await db.delete(schema.order);
	// Attributed checkout drafts + webhook events backing the commission ledger demo.
	await db.delete(schema.checkoutDraft);
	await db.delete(schema.stripeWebhookEvent);
	await db.delete(schema.cartItem);
	await db.delete(schema.cart);
	await db.delete(schema.wishlistItem);
	await db.delete(schema.affiliateLink);
	await db.delete(schema.affiliate);
	// catalog-seed managed tables (restrict FKs to product/productCategory)
	await db.delete(schema.catalogSeedItem);
	await db.delete(schema.catalogSeedCategory);
	await db.delete(schema.catalogSeedCollection);
	await db.delete(schema.catalogSeedRun);
	await db.delete(schema.productReview);
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
	console.log('[3/13] Inserting users...');
	await db.insert(schema.user).values(users);
	console.log(`  -> ${users.length} users inserted`);

	// --- 3. Product Categories (parent first, then children) ---
	console.log('[4/13] Inserting product categories...');
	const categoryIdMap = new Map<string, number>(); // slug -> id

	for (let i = 0; i < demoCategories.length; i++) {
		const cat = demoCategories[i];
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

	// --- 4. Catalog: products, files, images, reviews (from catalogDemo) ---
	console.log('[5/13] Inserting catalog products, files, images, and reviews...');
	const productIdMap = new Map<string, number>(); // slug -> id
	const fileIdByBucketPath = new Map<string, string>(); // bucketPath -> file.id
	const productImageRows: (typeof schema.productImage.$inferInsert)[] = [];
	const reviewRows: (typeof schema.productReview.$inferInsert)[] = [];
	let fileCount = 0;

	for (const p of demoProducts) {
		const categoryId = categoryIdMap.get(p.categorySlug);
		if (!categoryId) {
			console.warn(`  [WARN] Category not found for "${p.name}" (slug: ${p.categorySlug})`);
			continue;
		}

		const derived = deriveProductColumns(p);
		const { ratingAverage, reviewCount } = computeRatingSummary(p.reviews);

		const [inserted] = await db
			.insert(schema.product)
			.values({
				name: p.name,
				slug: p.slug,
				description: p.shortDescription,
				shortDescription: p.shortDescription,
				sku: p.sku,
				price: p.price,
				comparePrice: p.compareAt ?? null,
				costPrice: derived.costPrice,
				stockQuantity: derived.stockQuantity,
				trackInventory: true,
				weight: null,
				dimensions: null,
				categoryId,
				isActive: true,
				isFeatured: p.isFeatured,
				tags: JSON.stringify(derived.tags),
				metaTitle: derived.metaTitle,
				metaDescription: derived.metaDescription,
				descriptionHtml: p.descriptionHtml,
				keyFeatures: p.keyFeatures,
				stats: p.stats,
				specs: p.specs,
				inTheBox: p.inTheBox,
				faqs: p.faqs,
				badges: p.badges,
				testBedNote: p.testBedNote,
				warranty: p.warranty,
				shippingNote: p.shippingNote,
				bundleOffer: p.bundleOffer ?? null,
				relatedProductIds: null, // set in a second pass once ids exist
				currency: 'USD',
				ratingAverage,
				reviewCount,
				createdAt: daysAgo(randomInt(30, 200)),
				updatedAt: new Date()
			})
			.returning({ id: schema.product.id });

		const productId = inserted.id;
		productIdMap.set(p.slug, productId);

		// Files (deduped by bucketPath) + product_image rows.
		const assetUrls = resolveAssetUrls(p);
		let sortOrder = 0;
		for (const assetUrl of assetUrls) {
			const bucketPath = assetUrlToBucketPath(assetUrl);
			let fileId = fileIdByBucketPath.get(bucketPath);
			if (!fileId) {
				fileId = generateId();
				fileIdByBucketPath.set(bucketPath, fileId);
				const basename = bucketPath.split('/').pop() ?? bucketPath;
				await db.insert(schema.file).values({
					id: fileId,
					filename: basename,
					originalFilename: basename,
					mimeType: 'image/png',
					fileSize: randomInt(200_000, 2_000_000),
					bucketPath,
					bucketName: process.env.S3_BUCKET_NAME || 'aevani-assets',
					entityType: 'product',
					entityId: String(productId),
					uploadedBy: USER_IDS.admin,
					isPublic: true,
					metadata: JSON.stringify({ source: 'seed', assetKey: p.assetKey }),
					createdAt: daysAgo(randomInt(30, 120)),
					updatedAt: new Date()
				});
				fileCount++;
			}
			productImageRows.push({
				productId,
				fileId,
				altText: p.name,
				sortOrder,
				isMain: sortOrder === 0
			});
			sortOrder++;
		}

		// Reviews
		for (const r of p.reviews) {
			reviewRows.push({
				productId,
				authorName: r.authorName,
				rating: r.rating,
				title: r.title,
				body: r.body,
				isVerifiedPurchase: r.isVerifiedPurchase,
				createdAt: daysAgo(randomInt(1, 150))
			});
		}
	}

	// Second pass: curated related products (3 same/adjacent-system peers, by slug).
	for (const p of demoProducts) {
		const id = productIdMap.get(p.slug);
		if (!id) continue;
		const related = p.relatedSlugs
			.map((slug) => productIdMap.get(slug))
			.filter((x): x is number => typeof x === 'number');
		if (related.length > 0) {
			await db
				.update(schema.product)
				.set({ relatedProductIds: related })
				.where(eq(schema.product.id, id));
		}
	}

	if (productImageRows.length > 0) {
		await db.insert(schema.productImage).values(productImageRows);
	}
	if (reviewRows.length > 0) {
		await db.insert(schema.productReview).values(reviewRows);
	}
	console.log(
		`  -> ${productIdMap.size} products, ${fileCount} asset files, ${productImageRows.length} images, ${reviewRows.length} reviews`
	);

	// --- 5. Content/hero image files (served via mock-asset serve API) ---
	console.log('[6/13] Inserting content image files...');
	const contentFileRecords: (typeof schema.file.$inferInsert)[] = [];
	const contentFileIdMap = new Map<string, string>(); // filename -> file.id

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
		if (!contentFileIdMap.has(f)) {
			const rec = makeFileRecord({ filename: f, entityType: 'content', uploadedBy: USER_IDS.admin });
			contentFileIdMap.set(f, rec.id);
			contentFileRecords.push(rec);
		}
	}
	for (const cp of contentPages) {
		if (cp.imageFile && !contentFileIdMap.has(cp.imageFile)) {
			const rec = makeFileRecord({
				filename: cp.imageFile,
				entityType: 'content',
				uploadedBy: USER_IDS.admin
			});
			contentFileIdMap.set(cp.imageFile, rec.id);
			contentFileRecords.push(rec);
		}
	}
	if (contentFileRecords.length > 0) {
		await db.insert(schema.file).values(contentFileRecords);
	}
	console.log(`  -> ${contentFileRecords.length} content file records inserted`);

	// --- 6. Affiliate tiers, affiliates & links ---
	console.log('[7/13] Inserting affiliate tiers, affiliates, and links...');

	// Confirmed commission model — tiered on lifetime attributed sales, plus a flat
	// platform fee. Sprout 2% ($0–$5k) · Grower 3.5% ($5k–$25k) · Steward 5% ($25k+).
	const AFFILIATE_PLATFORM_FEE_BPS = 200; // flat 2% platform fee on attributed sales
	const affiliateTierDefs = [
		{ code: 'sprout', version: 1, commissionRateBps: 200 }, // 2%   · $0–$5,000 lifetime attributed sales
		{ code: 'grower', version: 1, commissionRateBps: 350 }, // 3.5% · $5,000–$25,000
		{ code: 'steward', version: 1, commissionRateBps: 500 } // 5%   · $25,000+
	];
	for (const t of affiliateTierDefs) {
		await db.insert(schema.affiliateTier).values({
			id: generateId(),
			code: t.code,
			version: t.version,
			commissionRateBps: t.commissionRateBps,
			isActive: true,
			createdAt: daysAgo(200)
		});
	}

	// Demo affiliates mapped onto the tier ladder (previously flat 10% / 7.5%).
	const affiliateData = [
		{
			userId: USER_IDS.marcus,
			code: 'MARCUS10',
			tier: { code: 'steward', version: 1, bps: 500 },
			commissionRate: '0.0500', // Steward — 5%
			totalEarnings: '1312.50', // ≈ 5% of ~$26,250 lifetime attributed sales
			totalClicks: 3420,
			totalConversions: 87
		},
		{
			userId: USER_IDS.jordan,
			code: 'JORDANGROW',
			tier: { code: 'grower', version: 1, bps: 350 },
			commissionRate: '0.0350', // Grower — 3.5%
			totalEarnings: '735.00', // ≈ 3.5% of ~$21,000 lifetime attributed sales
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
				status: 'active',
				createdAt: daysAgo(randomInt(90, 150)),
				updatedAt: new Date()
			})
			.returning({ id: schema.affiliate.id });
		affiliateIdMap.set(a.userId, inserted.id);
	}

	// Create affiliate links for featured products
	const affiliateLinkIds: number[] = [];
	// First link per affiliate — the attribution source for the commission ledger demo.
	const attributionLinkByAffiliate = new Map<number, { linkId: number; productId: number }>();
	const featuredSlugs = demoProducts.filter((p) => p.isFeatured).map((p) => p.slug);
	for (const slug of featuredSlugs) {
		const productId = productIdMap.get(slug);
		if (!productId) continue;

		for (const [userId, affiliateId] of affiliateIdMap.entries()) {
			const code =
				`${affiliateData.find((a) => a.userId === userId)?.code}-${slug.replace(/-/g, '').slice(0, 10)}-${productId}`.toUpperCase();
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
			if (!attributionLinkByAffiliate.has(affiliateId)) {
				attributionLinkByAffiliate.set(affiliateId, { linkId: inserted.id, productId });
			}
		}
	}
	console.log(
		`  -> ${affiliateIdMap.size} affiliates, ${affiliateLinkIds.length} affiliate links inserted`
	);

	// --- 6b. Affiliate commission ledger (confirmed tiered model) ---
	// Immutable, append-only accounting sourced from immutable checkout drafts:
	// accrues 'pending' when an attributed order is paid, clears via 'approved' on
	// fulfilment, reaches 'payable'/'paid' with a payout, and 'reversed' on refund.
	// Amounts reflect each affiliate's tier rate (Steward 5% / Grower 3.5%).
	console.log('[7b/13] Inserting affiliate commission ledger demo data...');

	const hex64 = (material: string): string =>
		crypto.createHash('sha256').update(material).digest('hex');

	type CommissionLifecycle = 'pending' | 'cleared' | 'paid';
	interface AttributedCommissionSpec {
		key: string;
		affiliateUserId: string;
		buyerUserId: string;
		tier: { code: string; version: number; bps: number };
		itemSlugs: { slug: string; qty: number }[];
		lifecycle: CommissionLifecycle;
		reversalReason?: 'refund' | 'chargeback';
		orderStatus: 'processing' | 'delivered' | 'refunded';
		draftStatus: 'paid' | 'fulfilled';
		daysAgoCreated: number;
	}

	// Mix of states: pending (accrued, order paid), cleared (order fulfilled),
	// a full payout lifecycle, and a refunded/reversed accrual.
	const commissionSpecs: AttributedCommissionSpec[] = [
		{
			key: 'marcus-pending',
			affiliateUserId: USER_IDS.marcus,
			buyerUserId: USER_IDS.elena,
			tier: { code: 'steward', version: 1, bps: 500 },
			itemSlugs: [{ slug: 'vertical-tower-garden-system', qty: 1 }],
			lifecycle: 'pending',
			orderStatus: 'processing',
			draftStatus: 'paid',
			daysAgoCreated: 6
		},
		{
			key: 'marcus-cleared',
			affiliateUserId: USER_IDS.marcus,
			buyerUserId: USER_IDS.sarah,
			tier: { code: 'steward', version: 1, bps: 500 },
			itemSlugs: [{ slug: 'ibc-aquaponics-fish-tank', qty: 1 }],
			lifecycle: 'cleared',
			orderStatus: 'delivered',
			draftStatus: 'fulfilled',
			daysAgoCreated: 24
		},
		{
			key: 'marcus-reversed',
			affiliateUserId: USER_IDS.marcus,
			buyerUserId: USER_IDS.aisha,
			tier: { code: 'steward', version: 1, bps: 500 },
			itemSlugs: [{ slug: 'commercial-aquaponics-grow-bed', qty: 1 }],
			lifecycle: 'cleared',
			reversalReason: 'refund',
			orderStatus: 'refunded',
			draftStatus: 'fulfilled',
			daysAgoCreated: 40
		},
		{
			key: 'jordan-pending',
			affiliateUserId: USER_IDS.jordan,
			buyerUserId: USER_IDS.tom,
			tier: { code: 'grower', version: 1, bps: 350 },
			itemSlugs: [{ slug: 'hydroponic-nutrients-trio', qty: 2 }],
			lifecycle: 'pending',
			orderStatus: 'processing',
			draftStatus: 'paid',
			daysAgoCreated: 8
		},
		{
			key: 'jordan-paid',
			affiliateUserId: USER_IDS.jordan,
			buyerUserId: USER_IDS.priya,
			tier: { code: 'grower', version: 1, bps: 350 },
			itemSlugs: [{ slug: 'countertop-aquaponics-starter-system', qty: 1 }],
			lifecycle: 'paid',
			orderStatus: 'delivered',
			draftStatus: 'fulfilled',
			daysAgoCreated: 55
		}
	];

	const AFFILIATE_TERMS_VERSION = 'terms-2026-01';
	const AFFILIATE_DISCLOSURE_VERSION = 'disclosure-2026-01';
	let commissionOrderSeq = 60; // AEV order numbers, clear of the 15 demo orders (0–14)
	let ledgerCount = 0;
	let ledgerEventCount = 0;
	let payoutCount = 0;

	for (const spec of commissionSpecs) {
		const affiliateId = affiliateIdMap.get(spec.affiliateUserId);
		const attributionLink = affiliateId
			? attributionLinkByAffiliate.get(affiliateId)
			: undefined;
		const buyer = users.find((u) => u.id === spec.buyerUserId);
		if (!affiliateId || !attributionLink || !buyer) continue;

		// Line items + amounts in minor units (cents), from real seeded products.
		const items = spec.itemSlugs.map((it) => {
			const prod = demoProducts.find((p) => p.slug === it.slug)!;
			const unitMinor = Math.round(parseFloat(prod.price) * 100);
			return { prod, qty: it.qty, unitMinor, lineMinor: unitMinor * it.qty };
		});
		const subtotalMinor = items.reduce((sum, it) => sum + it.lineMinor, 0);
		const taxMinor = Math.round(subtotalMinor * 0.08);
		const shippingMinor = subtotalMinor > 7500 ? 0 : 999;
		const discountMinor = 0;
		const totalMinor = subtotalMinor + taxMinor + shippingMinor - discountMinor;
		// Commission accrues on the order subtotal at the affiliate's tier rate.
		const commissionMinor = Math.round((subtotalMinor * spec.tier.bps) / 10000);

		const createdAt = daysAgo(spec.daysAgoCreated);
		const snapshotHash = hex64(`draft:${spec.key}`);
		const payloadDigest = hex64(`stripe:${spec.key}`);

		// 1) Immutable checkout draft carrying the frozen affiliate policy snapshot.
		const draftId = generateId();
		await db.insert(schema.checkoutDraft).values({
			id: draftId,
			reference: `seed-draft-${spec.key}`,
			userId: spec.buyerUserId,
			guestSubjectHash: null,
			affiliateLinkId: attributionLink.linkId,
			affiliateCommissionMinor: commissionMinor,
			affiliateId,
			affiliateCommissionRateBps: spec.tier.bps,
			affiliateTierCode: spec.tier.code,
			affiliateTierVersion: spec.tier.version,
			affiliateTermsVersion: AFFILIATE_TERMS_VERSION,
			affiliateDisclosureVersion: AFFILIATE_DISCLOSURE_VERSION,
			status: spec.draftStatus,
			currency: 'usd',
			subtotalMinor,
			taxMinor,
			shippingMinor,
			discountMinor,
			totalMinor,
			snapshotHash,
			customerEmail: buyer.email,
			expiresAt: new Date(createdAt.getTime() + 60 * 60 * 1000),
			createdAt,
			updatedAt: new Date()
		});

		// 2) Stripe webhook event (processed) — the accrual's causation source.
		const webhookId = generateId();
		await db.insert(schema.stripeWebhookEvent).values({
			id: webhookId,
			draftId: null,
			paymentAttemptId: null,
			eventType: 'checkout.session.completed',
			status: 'processed',
			attemptCount: 1,
			payloadDigest,
			receivedAt: createdAt,
			processingAt: createdAt,
			processedAt: createdAt
		});

		// 3) Attributed order (+ items) so the ledger keeps referential integrity.
		const [ord] = await db
			.insert(schema.order)
			.values({
				orderNumber: generateOrderNumber(commissionOrderSeq++),
				checkoutDraftId: draftId,
				userId: spec.buyerUserId,
				affiliateLinkId: attributionLink.linkId,
				status: spec.orderStatus,
				totalAmount: (totalMinor / 100).toFixed(2),
				subtotalAmount: (subtotalMinor / 100).toFixed(2),
				taxAmount: (taxMinor / 100).toFixed(2),
				shippingAmount: (shippingMinor / 100).toFixed(2),
				discountAmount: '0.00',
				affiliateCommission: (commissionMinor / 100).toFixed(2),
				shippingAddress: null,
				billingAddress: null,
				customerEmail: buyer.email,
				createdAt,
				updatedAt: new Date()
			})
			.returning({ id: schema.order.id });

		for (const it of items) {
			await db.insert(schema.orderItem).values({
				orderId: ord.id,
				productId: productIdMap.get(it.prod.slug)!,
				productName: it.prod.name,
				productSku: it.prod.sku,
				quantity: it.qty,
				unitPrice: (it.unitMinor / 100).toFixed(2),
				totalPrice: (it.lineMinor / 100).toFixed(2),
				createdAt
			});
		}

		// 4) Immutable commission fact.
		const commissionId = generateId();
		await db.insert(schema.affiliateCommissionLedger).values({
			id: commissionId,
			affiliateId,
			affiliateLinkId: attributionLink.linkId,
			sourceOrderId: ord.id,
			sourceCheckoutDraftId: draftId,
			sourceStripeWebhookEventId: webhookId,
			sourceReference: `order:${ord.id}:commission`,
			currency: 'usd',
			quotedAmountMinor: commissionMinor,
			commissionRateBps: spec.tier.bps,
			draftSnapshotHash: snapshotHash,
			tierCode: spec.tier.code,
			tierVersion: spec.tier.version,
			termsVersion: AFFILIATE_TERMS_VERSION,
			disclosureVersion: AFFILIATE_DISCLOSURE_VERSION,
			termsAcceptanceId: null,
			createdAt
		});
		ledgerCount++;

		// 5) Lifecycle events. Pending accrual is emitted when the order is paid.
		await db.insert(schema.affiliateCommissionLedgerEvent).values({
			id: generateId(),
			commissionId,
			eventType: 'pending',
			amountDeltaMinor: commissionMinor,
			currency: 'usd',
			eventReference: `order:${ord.id}:commission:pending`,
			causationReference: webhookId,
			reasonCode: 'initial_accrual',
			createdAt
		});
		ledgerEventCount++;

		// Approval clears the accrual on fulfilment.
		if (spec.lifecycle === 'cleared' || spec.lifecycle === 'paid') {
			await db.insert(schema.affiliateCommissionLedgerEvent).values({
				id: generateId(),
				commissionId,
				eventType: 'approved',
				amountDeltaMinor: 0,
				currency: 'usd',
				eventReference: `order:${ord.id}:commission:approved`,
				reasonCode: 'manual_adjustment',
				createdAt: daysAgo(Math.max(1, spec.daysAgoCreated - 3))
			});
			ledgerEventCount++;
		}

		// Payout instruction + payable/paid lifecycle.
		if (spec.lifecycle === 'paid') {
			const payoutId = generateId();
			const paidAt = daysAgo(Math.max(1, spec.daysAgoCreated - 10));
			await db.insert(schema.affiliatePayout).values({
				id: payoutId,
				affiliateId,
				payoutReference: `seed-payout-${spec.key}`,
				currency: 'usd',
				amountMinor: commissionMinor,
				periodStart: daysAgo(spec.daysAgoCreated + 5),
				periodEnd: paidAt,
				createdAt: paidAt
			});
			payoutCount++;

			await db.insert(schema.affiliateCommissionLedgerEvent).values({
				id: generateId(),
				commissionId,
				eventType: 'payable',
				amountDeltaMinor: 0,
				currency: 'usd',
				payoutId,
				eventReference: `order:${ord.id}:commission:payable`,
				reasonCode: 'payout',
				createdAt: paidAt
			});
			ledgerEventCount++;

			await db.insert(schema.affiliateCommissionLedgerEvent).values({
				id: generateId(),
				commissionId,
				eventType: 'paid',
				amountDeltaMinor: 0,
				currency: 'usd',
				payoutId,
				eventReference: `order:${ord.id}:commission:paid`,
				reasonCode: 'payout',
				createdAt: paidAt
			});
			ledgerEventCount++;
		}

		// Refund reverses the full accrual.
		if (spec.reversalReason) {
			await db.insert(schema.affiliateCommissionLedgerEvent).values({
				id: generateId(),
				commissionId,
				eventType: 'reversed',
				amountDeltaMinor: -commissionMinor,
				currency: 'usd',
				eventReference: `order:${ord.id}:commission:reversed`,
				reasonCode: spec.reversalReason,
				createdAt: daysAgo(Math.max(1, spec.daysAgoCreated - 5))
			});
			ledgerEventCount++;
		}
	}

	console.log(
		`  -> platform fee ${AFFILIATE_PLATFORM_FEE_BPS} bps; ${affiliateTierDefs.length} tiers, ${ledgerCount} commissions, ${ledgerEventCount} ledger events, ${payoutCount} payouts inserted`
	);

	// --- 7. Orders ---
	console.log('[8/13] Inserting orders...');
	const customerIds = [USER_IDS.sarah, USER_IDS.elena, USER_IDS.aisha, USER_IDS.tom, USER_IDS.priya];
	const statuses: (
		| 'pending'
		| 'confirmed'
		| 'processing'
		| 'shipped'
		| 'delivered'
		| 'cancelled'
	)[] = [
		'delivered',
		'delivered',
		'delivered',
		'delivered',
		'shipped',
		'shipped',
		'processing',
		'confirmed',
		'pending',
		'cancelled'
	];
	const allProductSlugs = demoProducts.map((p) => p.slug);

	const addresses = [
		{
			name: 'Sarah Chen',
			line1: '142 Garden Way',
			city: 'Portland',
			state: 'OR',
			zip: '97201',
			country: 'US'
		},
		{
			name: 'Elena Rodriguez',
			line1: '88 Vine Street',
			city: 'Austin',
			state: 'TX',
			zip: '78701',
			country: 'US'
		},
		{
			name: 'Aisha Okafor',
			line1: '305 Bloom Ave',
			city: 'Atlanta',
			state: 'GA',
			zip: '30301',
			country: 'US'
		},
		{
			name: 'Tom Bennett',
			line1: '7 Pasture Lane',
			city: 'Burlington',
			state: 'VT',
			zip: '05401',
			country: 'US'
		},
		{
			name: 'Priya Sharma',
			line1: '1200 Mycelium Dr',
			city: 'Denver',
			state: 'CO',
			zip: '80201',
			country: 'US'
		}
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

		const orderItems: { slug: string; qty: number; price: number }[] = orderProductSlugs.map(
			(slug) => {
				const prod = demoProducts.find((p) => p.slug === slug)!;
				return { slug, qty: randomInt(1, 3), price: parseFloat(prod.price) };
			}
		);

		const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
		const tax = parseFloat((subtotal * 0.08).toFixed(2));
		const shipping = subtotal > 75 ? 0 : 9.99;
		const total = parseFloat((subtotal + tax + shipping).toFixed(2));
		const affiliateLinkId =
			i < 4 && affiliateLinkIds.length > 0 ? randomElement(affiliateLinkIds) : null;
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
				customerEmail: users.find((u) => u.id === userId)!.email,
				customerPhone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
				notes: i === 9 ? 'Customer requested cancellation before shipment.' : null,
				createdAt,
				updatedAt: new Date()
			})
			.returning({ id: schema.order.id });

		orderIds.push(ord.id);

		// Insert order items
		for (const item of orderItems) {
			const prod = demoProducts.find((p) => p.slug === item.slug)!;
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

	// --- 8. Carts (active) & wishlists ---
	console.log('[9/13] Inserting active carts and wishlists...');
	// Sarah has an active cart
	const [sarahCart] = await db
		.insert(schema.cart)
		.values({
			userId: USER_IDS.sarah,
			sessionId: null,
			createdAt: daysAgo(1),
			updatedAt: new Date()
		})
		.returning({ id: schema.cart.id });

	const sarahCartSlugs = [
		'heirloom-tomato-collection',
		'nft-hydroponic-channel-system',
		'mushroom-cultivation-kit'
	];
	for (const slug of sarahCartSlugs) {
		const prod = demoProducts.find((p) => p.slug === slug);
		const productId = productIdMap.get(slug);
		if (prod && productId) {
			await db.insert(schema.cartItem).values({
				cartId: sarahCart.id,
				productId,
				quantity: randomInt(1, 2),
				unitPrice: prod.price,
				createdAt: daysAgo(1),
				updatedAt: new Date()
			});
		}
	}

	// Guest cart
	const [guestCart] = await db
		.insert(schema.cart)
		.values({
			userId: null,
			sessionId: 'guest-sess-abc123',
			createdAt: daysAgo(0),
			updatedAt: new Date()
		})
		.returning({ id: schema.cart.id });

	const guestCartSlug = 'hand-forged-garden-trowel';
	const guestProduct = demoProducts.find((p) => p.slug === guestCartSlug);
	const guestProductId = productIdMap.get(guestCartSlug);
	if (guestProduct && guestProductId) {
		await db.insert(schema.cartItem).values({
			cartId: guestCart.id,
			productId: guestProductId,
			quantity: 1,
			unitPrice: guestProduct.price,
			createdAt: daysAgo(0),
			updatedAt: new Date()
		});
	}

	// Wishlists
	const wishlistData = [
		{
			userId: USER_IDS.elena,
			slugs: ['vertical-tower-garden-system', 'aeroponic-misting-system', 'mushroom-cultivation-kit']
		},
		{
			userId: USER_IDS.aisha,
			slugs: ['heirloom-seed-vault', 'permaculture-starter-kit', 'herb-spiral-garden-kit']
		},
		{
			userId: USER_IDS.tom,
			slugs: ['silvopasture-seed-mix', 'portable-electric-netting-164-ft', 'ibc-aquaponics-fish-tank']
		}
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

	// --- 9. Content Pages + CMS SEO ---
	console.log('[10/13] Inserting content pages and CMS data...');
	for (const cp of contentPages) {
		const featuredImageFileId = cp.imageFile ? (contentFileIdMap.get(cp.imageFile) ?? null) : null;
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
		metaDescription:
			'Aevani is your marketplace for sustainable gardening, hydroponics, aquaponics, and regenerative agriculture. Seeds, tools, kits, and knowledge for growing a biodiverse future.',
		ogTitle: 'Aevani | Sustainable Gardening & Regenerative Agriculture',
		ogDescription:
			'Seeds, tools, kits, and knowledge for polyculture gardening, hydroponics, aquaponics, and silvopasture.',
		ogImage: `${IMG_BASE}/MAINHERO.png`,
		robots: 'index, follow',
		canonicalUrl: null
	});

	console.log(
		`  -> ${contentPages.length} content pages, ${contentPages.length + 1} SEO records inserted`
	);

	// --- 10. LMS courses (minimal but valid /learn + /courses content) ---
	console.log('[11/13] Inserting LMS courses...');
	const lmsCategoryIdMap = new Map<string, string>(); // slug -> id
	for (let i = 0; i < lmsCategoryDefs.length; i++) {
		const c = lmsCategoryDefs[i];
		const id = generateId();
		await db.insert(lms.lmsCourseCategory).values({
			id,
			name: c.name,
			slug: c.slug,
			description: null,
			sortOrder: i
		});
		lmsCategoryIdMap.set(c.slug, id);
	}

	const lmsTagIdMap = new Map<string, string>(); // slug -> id
	for (const t of lmsTagDefs) {
		const id = generateId();
		await db.insert(lms.lmsCourseTag).values({ id, name: t.name, slug: t.slug });
		lmsTagIdMap.set(t.slug, id);
	}

	let lmsCourseCount = 0;
	let lmsModuleCount = 0;
	let lmsLessonCount = 0;
	for (let i = 0; i < lmsCourseDefs.length; i++) {
		const c = lmsCourseDefs[i];
		const courseId = generateId();
		await db.insert(lms.lmsCourse).values({
			id: courseId,
			title: c.title,
			slug: c.slug,
			description: c.description,
			courseType: 'self_paced',
			instructorId: USER_IDS.admin,
			difficulty: c.difficulty,
			language: 'en',
			durationEstimate: c.durationEstimate,
			pricingType: 'free',
			enrollmentType: 'open',
			passingScore: 70,
			status: 'published',
			version: 1,
			sortOrder: i,
			sequentialEnabled: true,
			isFeatured: c.isFeatured,
			metaTitle: `${c.title} | Aevani Learn`,
			metaDescription: c.description,
			createdAt: daysAgo(randomInt(30, 120)),
			updatedAt: new Date()
		});
		lmsCourseCount++;

		// Category + tag joins
		const categoryId = lmsCategoryIdMap.get(c.categorySlug);
		if (categoryId) {
			await db.insert(lms.lmsCourseToCategoryJoin).values({ courseId, categoryId });
		}
		for (const tagSlug of c.tagSlugs) {
			const tagId = lmsTagIdMap.get(tagSlug);
			if (tagId) {
				await db.insert(lms.lmsCourseToTagJoin).values({ courseId, tagId });
			}
		}

		// Link to a product category so /learn can cross-sell
		const productCategoryId = categoryIdMap.get(c.productCategorySlug);
		if (productCategoryId) {
			await db.insert(lms.lmsCourseProduct).values({
				id: generateId(),
				courseId,
				productCategoryId
			});
		}

		// Modules -> lessons -> content blocks
		for (let m = 0; m < c.modules.length; m++) {
			const mod = c.modules[m];
			const moduleId = generateId();
			await db.insert(lms.lmsModule).values({
				id: moduleId,
				title: mod.title,
				slug: `${c.slug}-${slugify(mod.title)}`,
				description: null,
				courseId,
				sortOrder: m,
				isPublished: true
			});
			lmsModuleCount++;

			for (let l = 0; l < mod.lessons.length; l++) {
				const lesson = mod.lessons[l];
				const lessonId = generateId();
				await db.insert(lms.lmsLesson).values({
					id: lessonId,
					title: lesson.title,
					slug: `${c.slug}-${slugify(mod.title)}-${slugify(lesson.title)}`,
					description: null,
					moduleId,
					sortOrder: l,
					isPublished: true,
					isPreview: lesson.isPreview ?? false,
					estimatedMinutes: 15
				});
				lmsLessonCount++;

				await db.insert(lms.lmsContentBlock).values({
					id: generateId(),
					lessonId,
					type: 'text',
					title: lesson.title,
					content: `<p>${lesson.body}</p>`,
					sortOrder: 0,
					isRequired: true,
					completionThreshold: 100
				});
			}
		}
	}
	console.log(
		`  -> ${lmsCourseCount} courses, ${lmsModuleCount} modules, ${lmsLessonCount} lessons inserted`
	);

	// --- 11. Audit Log ---
	console.log('[12/13] Inserting audit log entries...');
	const auditEntries: (typeof schema.auditLog.$inferInsert)[] = [
		{
			userId: USER_IDS.admin,
			action: 'seed.executed',
			details: JSON.stringify({ version: '2.0.0', timestamp: new Date().toISOString() }),
			timestamp: new Date()
		},
		{
			userId: USER_IDS.admin,
			action: 'product.created',
			details: JSON.stringify({ count: demoProducts.length, source: 'catalogDemo' }),
			timestamp: daysAgo(1)
		},
		{
			userId: USER_IDS.sarah,
			action: 'user.login',
			details: JSON.stringify({ ip: '192.168.1.42', method: 'email' }),
			timestamp: daysAgo(1)
		},
		{
			userId: USER_IDS.marcus,
			action: 'affiliate.payout_requested',
			details: JSON.stringify({ amount: '500.00', method: 'bank_transfer' }),
			timestamp: daysAgo(7)
		},
		{
			userId: USER_IDS.elena,
			action: 'order.placed',
			details: JSON.stringify({ orderNumber: 'AEV-2026-00005' }),
			timestamp: daysAgo(3)
		},
		{
			userId: USER_IDS.admin,
			action: 'content.published',
			details: JSON.stringify({ slug: 'getting-started-companion-planting' }),
			timestamp: daysAgo(14)
		},
		{
			userId: USER_IDS.jordan,
			action: 'affiliate.link_created',
			details: JSON.stringify({ product: 'vertical-tower-garden-system' }),
			timestamp: daysAgo(20)
		},
		{
			userId: USER_IDS.tom,
			action: 'user.registered',
			details: JSON.stringify({ source: 'organic', referrer: 'google' }),
			timestamp: daysAgo(45)
		},
		{
			userId: USER_IDS.aisha,
			action: 'wishlist.added',
			details: JSON.stringify({ product: 'heirloom-seed-vault' }),
			timestamp: daysAgo(5)
		},
		{
			userId: USER_IDS.priya,
			action: 'user.registered',
			details: JSON.stringify({ source: 'affiliate', referrer: 'MARCUS10' }),
			timestamp: daysAgo(14)
		}
	];
	await db.insert(schema.auditLog).values(auditEntries);
	console.log(`  -> ${auditEntries.length} audit log entries inserted`);

	// --- Summary ---
	console.log('\n=== Seed Complete ===');
	console.log(`  Users:              ${users.length}`);
	console.log(`  Categories:         ${categoryIdMap.size}`);
	console.log(`  Products:           ${productIdMap.size}`);
	console.log(`  Product Images:     ${productImageRows.length}`);
	console.log(`  Product Reviews:    ${reviewRows.length}`);
	console.log(`  Asset Files:        ${fileCount}`);
	console.log(`  Content Files:      ${contentFileRecords.length}`);
	console.log(`  Affiliates:         ${affiliateIdMap.size}`);
	console.log(`  Affiliate Links:    ${affiliateLinkIds.length}`);
	console.log(`  Orders:             15`);
	console.log(`  Carts:              2`);
	console.log(`  Wishlist Items:     ${wishlistCount}`);
	console.log(`  Content Pages:      ${contentPages.length}`);
	console.log(`  CMS SEO Records:    ${contentPages.length + 1}`);
	console.log(`  LMS Courses:        ${lmsCourseCount}`);
	console.log(`  Audit Entries:      ${auditEntries.length}`);
	console.log('\n  Credentials were supplied through the local UAT seed environment.\n');
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
