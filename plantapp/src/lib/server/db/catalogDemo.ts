/**
 * Aevani demo catalogue — the canonical 40-product dataset as typed data.
 *
 * Source of truth: `.omc/research/aevani-design/catalog-from-design.md`
 * (transcribed from the design's Shop/Product mockups). This module is the
 * single home for the rich product content that both the disposable UAT seed
 * (`seed.ts`) and the prod-safe upsert (`scripts/demo-catalog-upsert.ts`)
 * consume.
 *
 * `assetKey` resolves through `src/lib/data/assetManifest.ts` to a real
 * `/assets/<file>.png` under `static/`. `descriptionHtml` uses only the
 * sanitizer-allowed subset (h2/h3/p/ul/ol/li/strong/em/blockquote/a) with no
 * attributes other than `<a href>`.
 */

import { assetManifest } from '../../data/assetManifest';

// ---------- types ----------
export type DemoSystem =
	| 'hydroponics'
	| 'aquaponics'
	| 'silvopasture'
	| 'agroforestry'
	| 'kits'
	| 'supplies';

export interface DemoStat {
	value: string;
	label: string;
}

export interface DemoSpec {
	label: string;
	value: string;
}

export interface DemoFaq {
	q: string;
	a: string;
}

export interface DemoBundleOffer {
	title: string;
	price: string;
	compareAt: string;
	blurb: string;
}

export interface DemoReview {
	authorName: string;
	rating: number; // 1-5
	title: string;
	body: string;
	isVerifiedPurchase: boolean;
}

export interface DemoCategory {
	name: string;
	slug: string;
	description: string;
	children?: DemoCategory[];
}

export interface DemoProduct {
	slug: string;
	sku: string;
	name: string;
	system: DemoSystem;
	/** Leaf category slug the product belongs to (see `demoCategories`). */
	categorySlug: string;
	/** Human label from the design (drives the sub-category grouping). */
	subCategory: string;
	price: string;
	compareAt?: string;
	assetKey: string;
	/** Extra gallery images (reuse related asset keys). Primary is `assetKey`. */
	galleryAssetKeys?: string[];
	badges: string[];
	isFeatured: boolean;
	shortDescription: string;
	/** SEO title (concise, keyword-relevant). Written verbatim to `product.metaTitle`. */
	metaTitle: string;
	/** SEO meta description (~120–160 chars). Written verbatim to `product.metaDescription`. */
	metaDescription: string;
	/** 4–8 tags (system, use-case, audience). Written as JSON to `product.tags`. */
	tags: string[];
	/**
	 * Slugs of 3 curated cross-sell products from the same/adjacent system
	 * ("Growers also add"). Resolved to product ids at seed/upsert time and
	 * written to `product.relatedProductIds`. Every slug must exist in this list.
	 */
	relatedSlugs: string[];
	descriptionHtml: string;
	keyFeatures: string[];
	stats: DemoStat[];
	specs: DemoSpec[];
	inTheBox: string[];
	faqs: DemoFaq[];
	testBedNote: string;
	shippingNote: string;
	warranty: string;
	bundleOffer?: DemoBundleOffer;
	reviews: DemoReview[];
}

// ---------- categories (6 systems -> sub-categories) ----------
export const demoCategories: DemoCategory[] = [
	{
		name: 'Hydroponics',
		slug: 'hydroponics',
		description:
			'Soil-free growing systems, nutrients, and media for indoor, vertical, and year-round production.',
		children: [
			{
				name: 'Hydroponic Systems',
				slug: 'hydroponic-systems',
				description: 'Vertical towers, NFT channels, DWC buckets, aeroponics, and grow tents.'
			},
			{
				name: 'Nutrients & Media',
				slug: 'nutrients-media',
				description: 'Liquid nutrients, rockwool, clay pebbles, net pots, and growing substrates.'
			},
			{
				name: 'Soil Testing',
				slug: 'soil-testing',
				description: 'pH and EC meters and calibration solutions for precise feeding.'
			}
		]
	},
	{
		name: 'Aquaponics',
		slug: 'aquaponics',
		description:
			'Integrated fish-and-plant systems where fish waste feeds the plants and plants clean the water.',
		children: [
			{
				name: 'Aquaponic Systems',
				slug: 'aquaponic-systems',
				description: 'Countertop to commercial fish tanks and flood-and-drain grow beds.'
			},
			{
				name: 'Fish & Supplies',
				slug: 'fish-supplies',
				description: 'Tilapia fingerlings, water testing, and bell siphons for the nitrogen cycle.'
			}
		]
	},
	{
		name: 'Silvopasture',
		slug: 'silvopasture',
		description:
			'Integrating trees, forage, and livestock on the same ground for shade, forage, and carbon.',
		children: [
			{
				name: 'Silvopasture Supplies',
				slug: 'silvopasture-supplies',
				description: 'Seed mixes, electric netting, water troughs, tree shelters, and forage plugs.'
			}
		]
	},
	{
		name: 'Agroforestry',
		slug: 'agroforestry',
		description:
			'Tree-based agriculture: nut and fruit crops, nitrogen-fixers, and propagation for the long game.',
		children: [
			{
				name: 'Agroforestry Supplies',
				slug: 'agroforestry-supplies',
				description: 'Tree seedlings, nitrogen-fixing seeds, grafting kits, and medicinal starts.'
			}
		]
	},
	{
		name: 'Starter Kits & Collections',
		slug: 'kits',
		description:
			'Curated, everything-in-one kits for growers who want to start today — plus composting systems.',
		children: [
			{
				name: 'Starter Kits',
				slug: 'starter-kits',
				description: 'Permaculture, mushroom, microgreens, herb spiral, and season-extension kits.'
			},
			{
				name: 'Composting',
				slug: 'composting',
				description: 'Countertop bins, worm farms, and soil-building amendment bundles.'
			}
		]
	},
	{
		name: 'Seeds & Supplies',
		slug: 'supplies',
		description: 'Heirloom seed collections, pollinator mixes, seed-saving gear, and hand-forged tools.',
		children: [
			{
				name: 'Heirloom Seeds',
				slug: 'heirloom-seeds',
				description: 'Open-pollinated, non-GMO heritage varieties and vaults.'
			},
			{
				name: 'Seeds & Plants',
				slug: 'seeds-plants',
				description: 'Pollinator collections and seed-saving starter kits.'
			},
			{
				name: 'Hand Tools',
				slug: 'hand-tools',
				description: 'Artisan-forged, built-to-last garden tools.'
			}
		]
	}
];

// ---------- shared defaults ----------
const SEEDS_WARRANTY = 'germination guarantee · 90%+ tested';
const LIVE_WARRANTY = 'live-arrival guarantee · free replacement';
const SYSTEM_WARRANTY = '2-yr warranty · parts stocked';
const TOOL_WARRANTY = 'lifetime warranty · 30-day returns';
const KIT_WARRANTY = '1-yr warranty · 30-day returns';

const SHIP_STANDARD = 'free shipping over $75 · arrives in 3–5 days';
const SHIP_FREE = 'free shipping · arrives in 3–5 days';
const SHIP_BULKY = 'free shipping · arrives in 5–8 days';
const SHIP_LIVE = 'ships Mon–Wed · overnight for live goods';

// ---------- products ----------
export const demoProducts: DemoProduct[] = [
	// ============================ HYDROPONICS ============================
	{
		slug: 'vertical-tower-garden-system',
		sku: 'AEV-HYD-01',
		name: 'Vertical Tower Garden System',
		system: 'hydroponics',
		categorySlug: 'hydroponic-systems',
		subCategory: 'Hydroponics',
		price: '349.99',
		compareAt: '399.99',
		assetKey: 'verticalTower',
		galleryAssetKeys: ['hydroSetup', 'nutrientsTrio', 'netPotsPebbles'],
		badges: ['BESTSELLER', 'IN STOCK'],
		isFeatured: true,
		shortDescription: '40+ plants in 2 sq ft with quiet drip irrigation.',
		metaTitle: 'Vertical Tower Garden System | Aevani Hydroponics',
		metaDescription:
			'Grow 40+ plants in 2 sq ft with a quiet, self-watering vertical hydroponic tower. Uses 90% less water — ships with seeds, nutrients, and a full guide.',
		tags: [
			'hydroponics',
			'vertical garden',
			'indoor growing',
			'space-saving',
			'beginner-friendly',
			'bestseller',
			'herbs & greens'
		],
		relatedSlugs: [
			'hydroponic-grow-tent-kit',
			'nft-hydroponic-channel-system',
			'hydroponic-nutrients-trio'
		],
		descriptionHtml:
			'<h2>Why grow vertically</h2><p>Most of a garden bed is wasted on walkways and root run. A tower throws that logic out: it stacks <strong>forty-four plant sites into two square feet of floor</strong>, feeds them from a single reservoir, and lets gravity do the work a pump would otherwise fight. On a balcony, in a spare room, or beside a south window, it turns a corner nobody was using into a salad garden.</p><p>We built this one around the parts that usually fail first. The pump is oversized so it loafs instead of straining. The reservoir is opaque HDPE, so algae never gets a foothold. The tiers rotate, so the greens on the shaded side get their turn in the light. In our test room it went from seedling to first lettuce harvest in about three weeks, on roughly a weekly top-up of the reservoir.</p><p>It is honestly forgiving. Miss a feeding, skip a weekend, run it a little out of balance — the plants coast. When you are ready to push it, dial in the nutrients and the yields climb fast.</p><p>New to soilless growing? Start with our <a href="/learn">hydroponics field guide</a> — it walks the whole first season.</p>',
		keyFeatures: [
			'Grows 40+ plants in a 2 sq ft footprint — indoors or out',
			'Uses ~90% less water than a conventional bed',
			'20-minute assembly, no tools — timer runs itself',
			'Ships with seeds, nutrients, and our full growing guide'
		],
		stats: [
			{ value: '40+', label: 'plant sites across 8 rotating tiers — greens, herbs, strawberries' },
			{ value: '~3 wks', label: 'from seedling to first lettuce harvest in our test room' },
			{ value: '20 gal', label: 'reservoir — top up about once a week, less in winter' },
			{ value: '38 dB', label: 'pump noise — quieter than a refrigerator hum' }
		],
		specs: [
			{ label: 'Height', value: '6 ft (183 cm)' },
			{ label: 'Footprint', value: '2 sq ft (61×61 cm base)' },
			{ label: 'Plant sites', value: '44 across 8 tiers' },
			{ label: 'Reservoir', value: '20 gal opaque food-grade HDPE' },
			{ label: 'Pump', value: '400 GPH submersible, 15 W, timer included' },
			{ label: 'Materials', value: 'UV-stable, BPA-free, food-safe plastics' },
			{ label: 'Placement', value: 'Indoor / outdoor (freeze-drain plug)' },
			{ label: 'Assembly', value: '~20 min, no tools' }
		],
		inTheBox: [
			'Tower body — 8 tiers',
			'20-gal reservoir base',
			'Pump, timer & tubing',
			'44 net pots + wicks',
			'Starter nutrients (2 mo)',
			'Lettuce & herb seed pack',
			'pH test strips',
			'Printed growing guide'
		],
		faqs: [
			{
				q: 'Do I need grow lights indoors?',
				a: 'By a bright south-facing window, greens and herbs do fine. In a darker room or for fruiting crops, add a full-spectrum LED — the tower has a threaded cap that accepts our light ring.'
			},
			{
				q: 'What does it cost to run?',
				a: 'The pump draws 15 W on a timer, so a few dollars a year in electricity. Nutrients for a full tower run roughly $6–10 a month once the starter pack is used up.'
			},
			{
				q: 'Can it live outside year-round?',
				a: 'Spring through fall, yes. Below freezing, drain the reservoir with the freeze plug and bring the pump indoors — the tower body tolerates cold, standing water does not.'
			},
			{
				q: 'Really no soil at all?',
				a: 'None. Seedlings start in rockwool or the included wicks, and the roots feed on the recirculating nutrient film. It is cleaner than soil and far less thirsty.'
			},
			{
				q: 'What if a part breaks?',
				a: 'Pumps, timers, tiers, and net pots are all stocked as individual spares. Two-year warranty covers defects; after that, replacements are a few dollars each.'
			}
		],
		testBedNote:
			'Honest note: heavy fruiting crops (full-size tomatoes, peppers) get top-heavy above tier five. Keep them low, keep greens high, and the tower stays happy. Everything else exceeded our yield notes.',
		shippingNote: 'free shipping · arrives in 3–5 days',
		warranty: SYSTEM_WARRANTY,
		bundleOffer: {
			title: "Grower's Bundle",
			price: '119.99',
			compareAt: '134.98',
			blurb:
				'Nutrients Trio + pH & EC meters — everything the tower needs for its first six months.'
		},
		reviews: [
			{
				authorName: 'Elena R.',
				rating: 5,
				title: 'Salad every week on the balcony',
				body: 'Third month in and we have not bought lettuce since. Assembly really was 20 minutes and the pump is genuinely quiet — I forget it is running.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Marcus W.',
				rating: 5,
				title: 'Worth the price',
				body: 'I priced out building one myself and could not beat this once you count the pump and food-safe reservoir. Strawberries on the top tiers are ridiculous.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Dana K.',
				rating: 4,
				title: 'Great, but read the note about tomatoes',
				body: 'They are not kidding about top-heavy fruiting crops. Moved my cherry tomatoes to the bottom tiers and it stabilized. Greens up top are flawless.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Priya S.',
				rating: 5,
				title: 'My apartment is now a farm',
				body: 'Two square feet, forty plants, no dirt tracked through the house. The growing guide answered every question I had as a total beginner.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Tom B.',
				rating: 4,
				title: 'Solid, wish it came with lights',
				body: 'Docking a star only because I needed the LED ring for my north-facing room — that is a separate purchase. Once I added it, growth took off.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'hydroponic-grow-tent-kit',
		sku: 'AEV-HYD-02',
		name: 'Hydroponic Grow Tent Kit',
		system: 'hydroponics',
		categorySlug: 'hydroponic-systems',
		subCategory: 'Hydroponics',
		price: '279.99',
		assetKey: 'growTent',
		badges: ['IN STOCK'],
		isFeatured: false,
		shortDescription: '4×4 ft tent with LED light, ventilation, and climate monitoring.',
		metaTitle: 'Hydroponic Grow Tent Kit (4×4) | Aevani Hydroponics',
		metaDescription:
			'Complete 4×4 ft grow tent with full-spectrum LED, inline fan, carbon filter, and climate monitoring — a controlled indoor grow room in one box.',
		tags: [
			'hydroponics',
			'grow tent',
			'indoor growing',
			'led grow light',
			'year-round',
			'complete kit'
		],
		relatedSlugs: [
			'vertical-tower-garden-system',
			'aeroponic-misting-system',
			'digital-ph-ec-meter-set'
		],
		descriptionHtml:
			'<h2>A controlled room, minus the room</h2><p>A grow tent gives you a sealed, reflective box where you set the weather. This 4×4 kit arrives with the parts that usually get bought piecemeal — a full-spectrum LED, an inline fan and carbon filter for odor, a clip fan for airflow, and a thermometer-hygrometer so you are never guessing.</p><p>The 600D exterior blocks light leaks completely, and the mylar lining bounces every watt back onto the canopy. It is the honest shortcut to year-round growing in a spare closet or garage.</p><p>Dialing in your first environment? Our <a href="/learn">hydroponics field guide</a> covers airflow, humidity, and light height.</p>',
		keyFeatures: [
			'Complete 4×4×7 ft environment — light, air, and monitoring included',
			'400W-equivalent full-spectrum LED (draws ~200W)',
			'Inline fan + carbon filter keeps odor and heat in check',
			'Light-proof 600D exterior with mylar lining'
		],
		stats: [
			{ value: '16 sq ft', label: 'canopy — enough for a full tower or four large plants' },
			{ value: '200 W', label: 'actual LED draw for a 400W-equivalent spread' },
			{ value: '4-in', label: 'inline fan + carbon filter, near-silent on low' }
		],
		specs: [
			{ label: 'Footprint', value: '4×4 ft, 7 ft tall' },
			{ label: 'Fabric', value: '600D Oxford, mylar-lined interior' },
			{ label: 'Light', value: 'Full-spectrum LED, 400W equivalent (~200W draw)' },
			{ label: 'Ventilation', value: '4-in inline fan + carbon filter + clip fan' },
			{ label: 'Monitoring', value: 'Thermometer / hygrometer included' },
			{ label: 'Access', value: 'Front zip door + observation window + cable ports' }
		],
		inTheBox: [
			'4×4×7 ft tent',
			'Full-spectrum LED grow light',
			'Inline fan + carbon filter',
			'Clip circulation fan',
			'Thermometer / hygrometer',
			'Hanging ratchets & ducting'
		],
		faqs: [
			{
				q: 'How loud is the fan?',
				a: 'On low it is a soft whoosh, quieter than a bathroom vent. On high, during summer heat, it is noticeable but not disruptive.'
			},
			{
				q: 'Can it fit a vertical tower inside?',
				a: 'Yes — the 7 ft height clears our 6 ft tower with room for the light above it.'
			}
		],
		testBedNote:
			'Honest note: in a hot garage the included fan holds temps in spring and fall but struggles in peak summer. If your space runs above 90°F, plan on a second exhaust fan.',
		shippingNote: SHIP_BULKY,
		warranty: SYSTEM_WARRANTY,
		reviews: [
			{
				authorName: 'Greg P.',
				rating: 5,
				title: 'Everything in one box',
				body: 'No hunting for a compatible fan or filter — it all fit and worked. Zero light leaks. My basement lettuce is thriving in January.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Sam O.',
				rating: 4,
				title: 'Good kit, added a second fan',
				body: 'Exactly as described. In summer I added an extra exhaust like the note warns. Otherwise a great value versus buying parts separately.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'aeroponic-misting-system',
		sku: 'AEV-HYD-03',
		name: 'Aeroponic Misting System',
		system: 'hydroponics',
		categorySlug: 'hydroponic-systems',
		subCategory: 'Hydroponics',
		price: '219.99',
		assetKey: 'aeroponicMisting',
		badges: ['ADVANCED'],
		isFeatured: false,
		shortDescription: 'High-pressure 80 PSI misting with 12 nozzles and cycle timer.',
		metaTitle: 'Aeroponic Misting System (80 PSI) | Aevani Hydroponics',
		metaDescription:
			'High-pressure 80 PSI aeroponic misting with 12 brass nozzles and a cycle timer. Fog-fed roots grow faster than water culture — for advanced growers.',
		tags: [
			'hydroponics',
			'aeroponics',
			'high-pressure misting',
			'advanced',
			'fast growth',
			'cloning'
		],
		relatedSlugs: [
			'nft-hydroponic-channel-system',
			'deep-water-culture-bucket-system',
			'hydroponic-nutrients-trio'
		],
		descriptionHtml:
			'<h2>Roots in the air</h2><p>Aeroponics suspends roots in open air and feeds them a fine 50-micron fog. With that much oxygen at the root zone, plants grow noticeably faster than in water culture. This is a high-pressure setup — a real 80 PSI diaphragm pump, brass nozzles, an accumulator tank, and a cycle timer — not a low-pressure toy.</p><p>It rewards attention. Keep the filter clean and the cycles tight and it is the fastest way we know to grow. Skip maintenance and clogged nozzles will remind you.</p><p>Ready to push technique? The <a href="/learn">hydroponics field guide</a> has a full aeroponics chapter.</p>',
		keyFeatures: [
			'True 80 PSI high-pressure misting for 50-micron fog',
			'12 anti-drip brass nozzles on a cycle timer',
			'Roots oxygenate constantly — faster growth than DWC',
			'Inline filter and accumulator tank for steady pressure'
		],
		stats: [
			{ value: '80 PSI', label: 'diaphragm pump — real high-pressure aeroponics' },
			{ value: '50 µm', label: 'mist droplet size for maximum root absorption' },
			{ value: '12', label: 'brass nozzles, anti-drip, individually replaceable' }
		],
		specs: [
			{ label: 'Pump', value: '80 PSI diaphragm, accumulator tank' },
			{ label: 'Nozzles', value: '12 brass, anti-drip, 50-micron' },
			{ label: 'Control', value: 'Adjustable cycle timer (seconds on/off)' },
			{ label: 'Tubing', value: '50 ft high-pressure line + fittings' },
			{ label: 'Filtration', value: 'Inline sediment filter included' },
			{ label: 'Skill level', value: 'Intermediate to advanced' }
		],
		inTheBox: [
			'80 PSI pump + accumulator',
			'12 brass misting nozzles',
			'Cycle timer',
			'50 ft high-pressure tubing',
			'Inline filter + fittings',
			'Setup & tuning guide'
		],
		faqs: [
			{
				q: 'How much maintenance does it need?',
				a: 'Rinse the filter weekly and soak the nozzles in citric acid monthly. Skipping this is the main cause of clogged nozzles.'
			},
			{
				q: 'Is this good for a first hydroponic build?',
				a: 'Honestly, no — start with a DWC bucket or NFT channel. Aeroponics is the fastest but least forgiving method.'
			}
		],
		testBedNote:
			'Honest note: nozzles clog if you neglect the filter or run hard water. On municipal hard water we saw buildup in weeks — an inline RO or monthly citric-acid soak fixed it entirely.',
		shippingNote: SHIP_FREE,
		warranty: SYSTEM_WARRANTY,
		reviews: [
			{
				authorName: 'Victor H.',
				rating: 5,
				title: 'Fastest roots I have grown',
				body: 'Clones root in days, not weeks. It is more fuss than my DWC but the speed is real. Keep the filter clean and it just works.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Lena M.',
				rating: 4,
				title: 'Powerful but not beginner-friendly',
				body: 'Took me a weekend to tune the timer cycles. Once dialed in, growth is impressive. Not my first hydro system and I would not recommend it as one.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Ray C.',
				rating: 3,
				title: 'Great when maintained, clogs when not',
				body: 'Two nozzles clogged in the first month on my hard water. The monthly soak solved it but I wish that were clearer up front. Performance is excellent otherwise.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'nft-hydroponic-channel-system',
		sku: 'AEV-HYD-04',
		name: 'NFT Hydroponic Channel System',
		system: 'hydroponics',
		categorySlug: 'hydroponic-systems',
		subCategory: 'Hydroponics',
		price: '189.99',
		assetKey: 'nftChannel',
		badges: ['IN STOCK'],
		isFeatured: false,
		shortDescription: '4 channels, 36 plants, pump and nutrients included.',
		metaTitle: 'NFT Hydroponic Channel System | Aevani Hydroponics',
		metaDescription:
			'Grow up to 36 heads of lettuce and herbs in four NFT channels with pump, reservoir, and starter nutrients included — the commercial lettuce workhorse.',
		tags: [
			'hydroponics',
			'nft system',
			'leafy greens',
			'lettuce',
			'continuous harvest',
			'intermediate'
		],
		relatedSlugs: [
			'vertical-tower-garden-system',
			'deep-water-culture-bucket-system',
			'net-pots-clay-pebbles-bundle'
		],
		descriptionHtml:
			'<h2>The lettuce workhorse</h2><p>Nutrient Film Technique runs a thin, constant film of nutrient over the roots in gently sloped channels. It is the method commercial lettuce farms trust because it is simple, cheap to run, and easy to scale. This kit is four food-safe PVC channels, a pump, a 20-gallon reservoir, a timer, and 36 net pots.</p><p>It is the sweet spot between the beginner DWC bucket and a full aeroponic build — forgiving, productive, and tidy.</p><p>Growing greens at volume? The <a href="/learn">hydroponics field guide</a> covers NFT spacing and flow rates.</p>',
		keyFeatures: [
			'Grows up to 36 heads of lettuce or herbs at once',
			'UV-stable white channels keep roots cool and reflect light',
			'Under 2-hour, tool-free assembly',
			'Ships with starter nutrients and a pH kit'
		],
		stats: [
			{ value: '36', label: 'plant sites across 4 channels' },
			{ value: '20 gal', label: 'reservoir with submersible pump and timer' },
			{ value: '<2 hr', label: 'assembly, no tools required' }
		],
		specs: [
			{ label: 'Channels', value: '4 × food-safe PVC, UV-stabilized' },
			{ label: 'Plant sites', value: '36 net pots (3-in)' },
			{ label: 'Reservoir', value: '20 gal + submersible pump + timer' },
			{ label: 'Best crops', value: 'Lettuce, herbs, leafy greens' },
			{ label: 'Footprint', value: '~4 × 2 ft bench or stand' }
		],
		inTheBox: [
			'4 NFT channels + end caps',
			'Submersible pump + timer',
			'20-gal reservoir',
			'36 net pots',
			'Starter nutrient pack',
			'pH adjustment kit'
		],
		faqs: [
			{
				q: 'What happens if the power goes out?',
				a: 'NFT roots dry quickly without flow. For outages, a battery backup on the pump or a quick manual top-up bridges short gaps; long outages need attention.'
			},
			{
				q: 'Can I grow tomatoes in it?',
				a: 'It is built for greens and herbs. Fruiting crops get too heavy and root-bound for shallow channels — use a DWC bucket for those.'
			}
		],
		testBedNote:
			'Honest note: NFT is unforgiving of pump failure — roots dry out within an hour or two. We recommend a cheap battery backup if your power flickers.',
		shippingNote: SHIP_FREE,
		warranty: SYSTEM_WARRANTY,
		reviews: [
			{
				authorName: 'Nadia F.',
				rating: 5,
				title: 'Perfect for a salad rotation',
				body: 'I stagger plantings across the four channels and harvest something every few days. Clean, quiet, and cheap to run.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Owen T.',
				rating: 4,
				title: 'Great starter for greens',
				body: 'Assembled in an hour. My only note is to add a backup for the pump — I lost a batch to an outage before I did.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'deep-water-culture-bucket-system',
		sku: 'AEV-HYD-05',
		name: 'Deep Water Culture Bucket',
		system: 'hydroponics',
		categorySlug: 'hydroponic-systems',
		subCategory: 'Hydroponics',
		price: '39.99',
		assetKey: 'dwcBucket',
		badges: ['GREAT FIRST KIT'],
		isFeatured: false,
		shortDescription: '5-gallon DWC bucket with air pump and starter nutrients.',
		metaTitle: 'Deep Water Culture Bucket System | Aevani Hydroponics',
		metaDescription:
			'The simplest way into hydroponics: a 5-gallon DWC bucket with air pump, media, and starter nutrients. Grow one big tomato, pepper, or basil bush.',
		tags: [
			'hydroponics',
			'deep water culture',
			'beginner-friendly',
			'budget',
			'single plant',
			'classroom'
		],
		relatedSlugs: [
			'nft-hydroponic-channel-system',
			'hydroponic-nutrients-trio',
			'net-pots-clay-pebbles-bundle'
		],
		descriptionHtml:
			'<h2>The easiest way in</h2><p>Deep Water Culture is hydroponics at its simplest: a plant sits in a net-pot lid with its roots dangling in oxygenated, nutrient-rich water. An air pump keeps the roots breathing, the opaque bucket keeps algae out, and that is the whole system. It is the kit we hand beginners and classrooms.</p><p>One big plant — a tomato, a pepper, a basil bush — thrives in a single bucket. Master this and every other method makes sense.</p><p>First time growing without soil? Read the <a href="/learn">hydroponics field guide</a>.</p>',
		keyFeatures: [
			'Simplest possible hydroponic system — great for beginners',
			'Grows one large plant: tomato, pepper, or basil',
			'Opaque food-grade bucket prevents algae',
			'Continuous aeration keeps roots oxygenated'
		],
		stats: [
			{ value: '5 gal', label: 'food-grade bucket, one large plant' },
			{ value: '2 wk', label: 'nutrient starter included' },
			{ value: '1', label: 'moving part — the air pump' }
		],
		specs: [
			{ label: 'Bucket', value: '5 gal opaque, food-grade' },
			{ label: 'Lid', value: '6-in net pot lid' },
			{ label: 'Aeration', value: 'Air pump + air stone + tubing' },
			{ label: 'Media', value: 'Clay pebbles included' },
			{ label: 'Nutrients', value: '2-week starter supply' }
		],
		inTheBox: [
			'5-gal opaque bucket + lid',
			'6-in net pot',
			'Air pump, stone & tubing',
			'Clay pebbles',
			'2-week nutrient starter',
			'Quick-start card'
		],
		faqs: [
			{
				q: 'How often do I change the water?',
				a: 'Top up as the level drops and do a full change every 2–3 weeks. Watch the roots — healthy ones are white and firm.'
			},
			{
				q: 'Is one bucket enough?',
				a: 'For one large plant, yes. Growing several? Line up multiple buckets on one air pump with a splitter.'
			}
		],
		testBedNote:
			'Honest note: warm water above 75°F holds less oxygen and invites root rot. In summer, keep the bucket out of direct sun or add a second air stone.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Hannah D.',
				rating: 5,
				title: 'My first hydro plant',
				body: 'A single basil plant turned into a bush I could not keep up with. Dead simple and cheap. Buying two more.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Carlos V.',
				rating: 4,
				title: 'Great classroom project',
				body: 'Used it with my students to teach roots and oxygen. Easy to explain, easy to run. Summer heat needed the extra air stone the note mentions.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'hydroponic-nutrients-trio',
		sku: 'AEV-HYD-06',
		name: 'Hydroponic Nutrients Trio',
		system: 'hydroponics',
		categorySlug: 'nutrients-media',
		subCategory: 'Nutrients & media',
		price: '44.99',
		assetKey: 'nutrientsTrio',
		badges: ['IN STOCK'],
		isFeatured: false,
		shortDescription: 'Grow / Bloom / Micro — mixes 150+ gallons of solution.',
		metaTitle: 'Hydroponic Nutrients Trio (Grow/Bloom/Micro) | Aevani',
		metaDescription:
			'Three-part Grow, Bloom, and Micro nutrients with chelated minerals and pH buffering. Mixes 150+ gallons for every stage of soilless growing.',
		tags: [
			'hydroponics',
			'nutrients',
			'grow bloom micro',
			'plant food',
			'ph buffered',
			'consumables'
		],
		relatedSlugs: [
			'digital-ph-ec-meter-set',
			'net-pots-clay-pebbles-bundle',
			'rockwool-cubes-growing-media-sampler'
		],
		descriptionHtml:
			'<h2>Feed for every stage</h2><p>A three-part nutrient system lets you shift the balance as a plant moves from leafy growth into flower and fruit. Grow leans nitrogen, Bloom leans phosphorus and potassium, and Micro carries the chelated trace minerals plants take up most easily. Mixed to the included schedule, these three bottles cover vegetables, herbs, and flowers from seedling to harvest.</p><p>The formula is pH-buffered, so you chase adjustments less often. One kit makes over 150 gallons of solution.</p>',
		keyFeatures: [
			'Three-part Grow / Bloom / Micro system for every growth stage',
			'Chelated micronutrients for maximum uptake',
			'pH-buffered to reduce constant adjusting',
			'Makes 150+ gallons of nutrient solution'
		],
		stats: [
			{ value: '150+', label: 'gallons of solution per kit' },
			{ value: '3-part', label: 'Grow, Bloom, and Micro for staged feeding' },
			{ value: '1 qt', label: 'each bottle, with measuring cup' }
		],
		specs: [
			{ label: 'Bottles', value: '3 × 1 qt (Grow / Bloom / Micro)' },
			{ label: 'Coverage', value: '150+ gallons mixed' },
			{ label: 'Formula', value: 'Chelated micros, pH-buffered' },
			{ label: 'Use with', value: 'All hydroponic and soilless systems' },
			{ label: 'Includes', value: 'Measuring cup + feeding schedule chart' }
		],
		inTheBox: [
			'Grow bottle (1 qt)',
			'Bloom bottle (1 qt)',
			'Micro bottle (1 qt)',
			'Measuring cup',
			'Feeding schedule chart'
		],
		faqs: [
			{
				q: 'Does the order I mix them matter?',
				a: 'Yes — add Micro to the water first, stir, then Grow, then Bloom. Mixing concentrates directly together can cause lockout.'
			},
			{
				q: 'Will one kit last a season?',
				a: 'For a single tower or a few buckets, easily. Heavy fruiting gardens go through Bloom faster than Grow.'
			}
		],
		testBedNote:
			'Honest note: measure, do not eyeball. Overdosing "to be safe" burns tips and salts up the reservoir faster than any deficiency would have hurt.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Imani L.',
				rating: 5,
				title: 'The schedule chart is gold',
				body: 'I stopped guessing and my yields jumped. The buffering keeps my pH steadier than the single-part I used before.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Derek S.',
				rating: 4,
				title: 'Lasts forever',
				body: 'Been feeding two towers for months and barely dented the bottles. Follow the mix order or you get cloudy sludge.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'net-pots-clay-pebbles-bundle',
		sku: 'AEV-HYD-07',
		name: 'Net Pots & Clay Pebbles Bundle',
		system: 'hydroponics',
		categorySlug: 'nutrients-media',
		subCategory: 'Nutrients & media',
		price: '32.99',
		assetKey: 'netPotsPebbles',
		badges: [],
		isFeatured: false,
		shortDescription: '50 net pots and 10 L of premium clay pebbles.',
		metaTitle: 'Net Pots & Clay Pebbles Bundle | Aevani Hydroponics',
		metaDescription:
			'50 reinforced net pots in three sizes plus 10 L of pre-washed, reusable clay pebbles — the hydroponic consumables you always run out of.',
		tags: [
			'hydroponics',
			'growing media',
			'net pots',
			'clay pebbles',
			'consumables',
			'all systems'
		],
		relatedSlugs: [
			'rockwool-cubes-growing-media-sampler',
			'hydroponic-nutrients-trio',
			'deep-water-culture-bucket-system'
		],
		descriptionHtml:
			'<h2>The parts you always run out of</h2><p>Net pots and clay pebbles are the consumables of hydroponic growing — you never quite have enough. This bundle stocks fifty heavy-duty net pots in three sizes plus ten liters of pre-washed, pH-neutral clay pebbles that rinse and reuse for years.</p><p>The pots have reinforced rims and wide slots so roots breathe and never strangle. It fits every system we sell.</p>',
		keyFeatures: [
			'50 net pots in 2-in, 3-in, and 6-in sizes',
			'10 L of pre-washed, reusable clay pebbles',
			'Reinforced rims and wide drainage slots',
			'Compatible with every hydroponic system'
		],
		stats: [
			{ value: '50', label: 'net pots across three sizes' },
			{ value: '10 L', label: 'premium clay pebbles, pre-washed' },
			{ value: 'pH 7', label: 'neutral media, reusable for years' }
		],
		specs: [
			{ label: 'Net pots', value: '50 total (2-in, 3-in, 6-in)' },
			{ label: 'Media', value: '10 L expanded clay pebbles (hydroton)' },
			{ label: 'Prep', value: 'Pre-washed, pH-neutral' },
			{ label: 'Reusable', value: 'Rinse and reuse for years' },
			{ label: 'Fits', value: 'All hydroponic and aquaponic systems' }
		],
		inTheBox: [
			'20 × 2-in net pots',
			'20 × 3-in net pots',
			'10 × 6-in net pots',
			'10 L clay pebbles',
			'Reusable mesh rinse bag'
		],
		faqs: [
			{
				q: 'Do I need to rinse the pebbles first?',
				a: 'They come pre-washed, but a quick rinse before first use clears any fine dust that could cloud your reservoir.'
			},
			{
				q: 'Are the pebbles really reusable?',
				a: 'Yes. Rinse and sterilize between grows with a mild peroxide soak and they last for years.'
			}
		],
		testBedNote:
			'Honest note: clay pebbles float when bone dry. Soak them for an hour before planting so they settle and wick properly instead of bobbing up around the stem.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Beatrix N.',
				rating: 5,
				title: 'Stocked up and set',
				body: 'Three sizes covers everything from seedlings to big DWC plants. The pebbles rinsed clean and have lasted two grows already.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Joel K.',
				rating: 4,
				title: 'Good value',
				body: 'Exactly what I needed to refill my systems. Pots are sturdier than the cheap ones I had before.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'rockwool-cubes-growing-media-sampler',
		sku: 'AEV-HYD-08',
		name: 'Rockwool & Media Sampler',
		system: 'hydroponics',
		categorySlug: 'nutrients-media',
		subCategory: 'Nutrients & media',
		price: '24.99',
		assetKey: 'rockwoolMedia',
		badges: [],
		isFeatured: false,
		shortDescription: '50 rockwool cubes plus coir, perlite, and pebble samples.',
		metaTitle: 'Rockwool Cubes & Growing Media Sampler | Aevani',
		metaDescription:
			'50 rockwool starter cubes plus coco coir, perlite, and clay pebble samples with a usage guide. Find the growing medium that fits your crops.',
		tags: [
			'hydroponics',
			'growing media',
			'rockwool',
			'seed starting',
			'coco coir',
			'sampler'
		],
		relatedSlugs: [
			'net-pots-clay-pebbles-bundle',
			'hydroponic-nutrients-trio',
			'digital-ph-ec-meter-set'
		],
		descriptionHtml:
			'<h2>Find your favorite substrate</h2><p>Every grower has a preferred medium, and the only way to find yours is to try a few. This sampler pairs fifty rockwool starter cubes — the classic seed-starting block — with generous samples of clay pebbles, coco coir, and perlite, each with a note on the crops and systems it suits best.</p><p>Start seeds, root cuttings, and compare how each medium holds water and air.</p>',
		keyFeatures: [
			'50 × 1.5-in rockwool starter cubes',
			'Samples of clay pebbles, coco coir, and perlite',
			'Usage guide for each medium',
			'Perfect for finding your preferred substrate'
		],
		stats: [
			{ value: '50', label: 'rockwool starter cubes (1.5-in)' },
			{ value: '4', label: 'media types to compare' },
			{ value: '2 L', label: 'each of pebbles and coir' }
		],
		specs: [
			{ label: 'Rockwool', value: '50 × 1.5-in cubes' },
			{ label: 'Clay pebbles', value: '2 L expanded clay' },
			{ label: 'Coco coir', value: '2 L buffered coir' },
			{ label: 'Perlite', value: '1 L horticultural grade' },
			{ label: 'Includes', value: 'Media selection guide' }
		],
		inTheBox: [
			'50 rockwool cubes',
			'2 L clay pebbles',
			'2 L coco coir',
			'1 L perlite',
			'Media usage guide'
		],
		faqs: [
			{
				q: 'Do I need to condition rockwool before use?',
				a: 'Yes — soak the cubes in pH 5.5 water for an hour before seeding. Straight from the bag rockwool runs alkaline.'
			},
			{
				q: 'Which medium is best for beginners?',
				a: 'Coco coir is the most forgiving of watering mistakes; rockwool gives the cleanest seed starts. The guide breaks it down.'
			}
		],
		testBedNote:
			'Honest note: rockwool is dusty and slightly alkaline dry — always pre-soak to pH 5.5 and wear a mask when handling a full sheet. Once wet it is harmless.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Wren A.',
				rating: 4,
				title: 'Settled the coir vs rockwool debate for me',
				body: 'Trying all four side by side was worth the price alone. Went with coco coir in the end. Guide was genuinely useful.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Felix M.',
				rating: 4,
				title: 'Good starter assortment',
				body: 'Plenty of cubes to get a season of seedlings going. Pre-soak the rockwool like they say.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'digital-ph-ec-meter-set',
		sku: 'AEV-HYD-09',
		name: 'Digital pH & EC Meter Set',
		system: 'hydroponics',
		categorySlug: 'soil-testing',
		subCategory: 'Soil testing',
		price: '89.99',
		assetKey: 'phEcMeter',
		badges: ['IN STOCK'],
		isFeatured: false,
		shortDescription: 'Precision meters with calibration solutions and cases.',
		metaTitle: 'Digital pH & EC Meter Set | Aevani Hydroponics',
		metaDescription:
			'Precision pH and EC/TDS meters with automatic temperature compensation, calibration solutions, and waterproof cases. Stop guessing your reservoir.',
		tags: [
			'hydroponics',
			'soil testing',
			'ph meter',
			'ec meter',
			'water quality',
			'measurement'
		],
		relatedSlugs: [
			'hydroponic-nutrients-trio',
			'deep-water-culture-bucket-system',
			'rockwool-cubes-growing-media-sampler'
		],
		descriptionHtml:
			'<h2>Stop guessing your water</h2><p>In hydroponics, pH and EC are the two numbers that decide everything. Get them right and nutrients flow; get them wrong and plants starve in a full reservoir. This set pairs a 0.01-accuracy pH meter with an EC/TDS meter, both with automatic temperature compensation, backlit displays, and one-touch calibration.</p><p>They arrive with calibration solutions and waterproof cases, ready to use the day they land.</p><p>Not sure what your numbers should be? The <a href="/learn">hydroponics field guide</a> lists target ranges by crop.</p>',
		keyFeatures: [
			'pH accurate to 0.01 with automatic temperature compensation',
			'EC/TDS meter for nutrient strength',
			'One-touch calibration, backlit displays',
			'IP67 waterproof housings with carry cases'
		],
		stats: [
			{ value: '0.01', label: 'pH resolution with ATC' },
			{ value: 'IP67', label: 'waterproof housings' },
			{ value: '3', label: 'calibration solutions included' }
		],
		specs: [
			{ label: 'pH meter', value: '0.01 resolution, ATC, backlit' },
			{ label: 'EC/TDS meter', value: 'µS/cm and ppm modes, ATC' },
			{ label: 'Calibration', value: 'pH 4.0, pH 7.0, 1413 µS/cm standards' },
			{ label: 'Rating', value: 'IP67 waterproof' },
			{ label: 'Cases', value: 'Protective carry cases + quick-reference guide' }
		],
		inTheBox: [
			'Digital pH meter',
			'Digital EC/TDS meter',
			'pH 4.0 & 7.0 buffer solutions',
			'1413 µS/cm EC standard',
			'2 carry cases',
			'Crop range reference card'
		],
		faqs: [
			{
				q: 'How often should I calibrate?',
				a: 'Calibrate the pH meter weekly and after storage. EC meters drift less — monthly is fine for hobby use.'
			},
			{
				q: 'Do the probes need special storage?',
				a: 'The pH probe must stay wet in storage solution (a few drops in the cap). A dry probe dies quickly — that is the #1 killer of pH meters.'
			}
		],
		testBedNote:
			'Honest note: a pH probe left to dry out is a dead probe. Keep storage solution in the cap between uses — plain water slowly ruins it too.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Sophia G.',
				rating: 5,
				title: 'Finally know what my reservoir is doing',
				body: 'Accurate, quick to calibrate, and the cases keep them safe. Diagnosed a lockout the first week that I never would have caught by eye.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Marcus W.',
				rating: 4,
				title: 'Reliable pair',
				body: 'Both hold calibration well. Just remember the storage solution — I killed a cheaper probe before by letting it dry.',
				isVerifiedPurchase: true
			}
		]
	},

	// ============================ AQUAPONICS ============================
	{
		slug: 'ibc-aquaponics-fish-tank',
		sku: 'AEV-AQP-01',
		name: 'IBC Aquaponics Fish Tank',
		system: 'aquaponics',
		categorySlug: 'aquaponic-systems',
		subCategory: 'Aquaponics',
		price: '389.99',
		assetKey: 'ibcFishTank',
		galleryAssetKeys: ['growBed', 'waterTesting', 'bellSiphon'],
		badges: ['IN STOCK', 'FLAGSHIP'],
		isFeatured: true,
		shortDescription: '275-gal tank with viewing window and insulated jacket.',
		metaTitle: 'IBC Aquaponics Fish Tank (275 gal) | Aevani Aquaponics',
		metaDescription:
			'A properly converted 275-gallon IBC tank with tempered-glass viewing window, aeration manifold, and insulated jacket — the heart of a backyard system.',
		tags: [
			'aquaponics',
			'fish tank',
			'ibc tote',
			'backyard system',
			'tilapia',
			'flagship'
		],
		relatedSlugs: [
			'commercial-aquaponics-grow-bed',
			'aquaponics-bell-siphon-kit',
			'aquaponics-water-testing-kit'
		],
		descriptionHtml:
			'<h2>The heart of a backyard system</h2><p>An IBC tote is the workhorse of serious home aquaponics, and this one is converted properly — not just cleaned out. The interior carries a food-safe coating, the front holds a tempered-glass <strong>viewing window</strong> so you can actually watch your fish and their health, and a four-stone aeration manifold keeps the water alive. The insulated jacket buys you temperature stability that bare totes never have.</p><p>The steel cage carries the load and the pallet base lifts it for gravity-fed drainage down to your grow beds. It supports 50–75 tilapia or a hundred-plus ornamentals, which is enough fish to fertilize a real garden.</p><p>We chose the parts a first-timer regrets skipping: the window that catches a sick fish early, the insulation that flattens a cold snap, the manifold that survives a pump hiccup. It is the tank we would put in our own yard.</p><p>Building your first loop? Start with the <a href="/learn">aquaponics field guide</a>.</p>',
		keyFeatures: [
			'Properly converted 275-gal IBC with food-safe interior',
			'12×18 in tempered-glass viewing window',
			'4-stone aeration manifold + ball-valve drain',
			'Insulated jacket for temperature stability'
		],
		stats: [
			{ value: '275 gal', label: 'volume — supports 50–75 tilapia' },
			{ value: '4', label: 'air stones on a shared manifold' },
			{ value: '100+', label: 'ornamental fish alternative capacity' },
			{ value: '10+ yr', label: 'expected service life of the cage and tote' }
		],
		specs: [
			{ label: 'Volume', value: '275 gal (1040 L)' },
			{ label: 'Interior', value: 'Food-safe coating' },
			{ label: 'Window', value: '12×18 in tempered glass' },
			{ label: 'Aeration', value: '4 air stones + manifold' },
			{ label: 'Drainage', value: 'Ball-valve drain + solids filter basket' },
			{ label: 'Insulation', value: 'Removable insulated jacket' },
			{ label: 'Support', value: 'Steel cage + pallet base' },
			{ label: 'Stocking', value: '50–75 tilapia or 100+ ornamentals' }
		],
		inTheBox: [
			'Converted 275-gal IBC tank',
			'Tempered-glass viewing window',
			'4-stone aeration manifold + pump',
			'Ball-valve drain assembly',
			'Solids filter basket',
			'Insulated jacket',
			'Steel cage + pallet base',
			'Setup & stocking guide'
		],
		faqs: [
			{
				q: 'Does it come with the grow bed?',
				a: 'No — the tank is sized to pair 1:1 with our Commercial Aquaponics Grow Bed, which is sold separately so you can match your space.'
			},
			{
				q: 'How many fish can I really keep?',
				a: 'Plan for 50–75 tilapia at harvest weight, or up to 1 lb of fish per 5–7 gallons. Understock at first — a new biofilter cannot handle a full load.'
			},
			{
				q: 'Can I keep it outdoors in winter?',
				a: 'The insulated jacket handles cool nights, but tilapia need water above 60°F. In freezing climates, move the system into a greenhouse or heated space, or switch to a cold-tolerant species.'
			},
			{
				q: 'Is the interior really food-safe?',
				a: 'Yes. Only totes with a documented food-grade history are converted, and the added coating is NSF-listed for potable contact.'
			}
		],
		testBedNote:
			'Honest note: a full 275-gallon tank weighs over a ton. Set it on level, load-rated ground before you fill it — you cannot move it once it is full, and an unlevel base stresses the cage welds.',
		shippingNote: SHIP_BULKY,
		warranty: SYSTEM_WARRANTY,
		bundleOffer: {
			title: 'System Starter Bundle',
			price: '94.99',
			compareAt: '119.97',
			blurb: 'Water Testing Kit + Bell Siphon Kit — the two things your first cycle needs.'
		},
		reviews: [
			{
				authorName: 'Jordan P.',
				rating: 5,
				title: 'The window changes everything',
				body: 'Being able to see the fish caught a water issue before it became a fish kill. Conversion quality is excellent — this is not a rinsed-out tote.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Tom B.',
				rating: 5,
				title: 'Backbone of my greenhouse',
				body: 'Paired it with the grow bed and 50 tilapia. Six months in and the insulation held my water temp through a cold snap that would have crashed a bare tank.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Renee C.',
				rating: 4,
				title: 'Great tank, plan the delivery',
				body: 'It is heavy and bulky — have help and a level spot ready. Once sited and filled it has been rock solid. The viewing window is worth it.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Aisha O.',
				rating: 5,
				title: 'Understocked at first, glad I did',
				body: 'Followed the guide and started with 20 fish while the biofilter matured. Zero losses. Added more once ammonia stayed at zero.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Bill H.',
				rating: 4,
				title: 'Solid value versus building my own',
				body: 'I have converted totes before and this saved me a weekend of grinding and sealing. The window alone is hard to DIY well.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'commercial-aquaponics-grow-bed',
		sku: 'AEV-AQP-02',
		name: 'Commercial Aquaponics Grow Bed',
		system: 'aquaponics',
		categorySlug: 'aquaponic-systems',
		subCategory: 'Aquaponics',
		price: '449.99',
		assetKey: 'growBed',
		badges: ['IN STOCK'],
		isFeatured: false,
		shortDescription: '4×8 ft bed with bell siphon, liner, and steel frame.',
		metaTitle: 'Commercial Aquaponics Grow Bed (4×8) | Aevani',
		metaDescription:
			'A 4×8 ft flood-and-drain grow bed with food-grade liner, bell siphon, and stainless frame. Pairs 1:1 with a 275-gallon IBC tank for real production.',
		tags: [
			'aquaponics',
			'grow bed',
			'flood and drain',
			'production scale',
			'bell siphon',
			'commercial'
		],
		relatedSlugs: [
			'ibc-aquaponics-fish-tank',
			'aquaponics-bell-siphon-kit',
			'tilapia-fingerlings-starter-pack'
		],
		descriptionHtml:
			'<h2>Production-scale growing</h2><p>This is the grow bed built to pair with a 275-gallon IBC tank in a proper 1:1 ratio. A 4×8 ft flood-and-drain bed, twelve inches deep for real root run, on a stainless frame that shrugs off a decade of greenhouse humidity. The food-grade HDPE liner and included bell-siphon assembly turn fish water into a garden.</p><p>It holds 32 cubic feet of media — enough to grow fruiting crops, not just greens.</p><p>Sizing a system? The <a href="/learn">aquaponics field guide</a> covers the tank-to-bed ratio.</p>',
		keyFeatures: [
			'4×8 ft flood-and-drain bed, 12 in deep',
			'Food-grade HDPE liner + bell siphon assembly',
			'Stainless steel frame rated for 10+ years',
			'Pairs 1:1 with a 275-gal IBC tank'
		],
		stats: [
			{ value: '32 cu ft', label: 'media capacity for deep-rooting crops' },
			{ value: '12 in', label: 'bed depth' },
			{ value: '10+ yr', label: 'frame service life' }
		],
		specs: [
			{ label: 'Dimensions', value: '4 × 8 ft, 12 in deep' },
			{ label: 'Liner', value: 'Food-grade HDPE' },
			{ label: 'Frame', value: 'Stainless steel' },
			{ label: 'Siphon', value: 'Bell siphon assembly + overflow' },
			{ label: 'Media capacity', value: '32 cu ft' },
			{ label: 'Pairs with', value: '275-gal IBC tank (1:1)' }
		],
		inTheBox: [
			'Stainless steel frame',
			'Food-grade HDPE liner',
			'Bell siphon assembly',
			'Plumbing fittings',
			'Overflow protection',
			'Installation guide'
		],
		faqs: [
			{
				q: 'Does it include growing media?',
				a: 'No — 32 cubic feet of clay pebbles is a lot to ship affordably, so we let you source it locally. The guide lists what to buy.'
			},
			{
				q: 'Can I use it above ground on a deck?',
				a: 'Full of wet media it is very heavy. Confirm your deck is rated for the load, or place it on grade.'
			}
		],
		testBedNote:
			'Honest note: filled with wet media this bed weighs several hundred pounds. Assemble and level it in its final location — you will not be sliding it over once it is planted.',
		shippingNote: SHIP_BULKY,
		warranty: SYSTEM_WARRANTY,
		reviews: [
			{
				authorName: 'Nathan F.',
				rating: 5,
				title: 'Built to last',
				body: 'The stainless frame is overkill in the best way. Two seasons in a humid greenhouse and zero rust. Bell siphon started cycling first try.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Grace L.',
				rating: 4,
				title: 'Great bed, buy media locally',
				body: 'Solid and deep enough for my tomatoes. Just know you supply the 32 cu ft of pebbles yourself — that adds up.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'countertop-aquaponics-starter-system',
		sku: 'AEV-AQP-03',
		name: 'Countertop Aquaponics Starter',
		system: 'aquaponics',
		categorySlug: 'aquaponic-systems',
		subCategory: 'Aquaponics',
		price: '79.99',
		assetKey: 'countertopAqua',
		badges: ['GREAT FIRST KIT'],
		isFeatured: false,
		shortDescription: '3-gal tank, grow bed, and LED — a loop for your kitchen.',
		metaTitle: 'Countertop Aquaponics Starter System | Aevani',
		metaDescription:
			'A self-contained 3-gallon fish-and-herb loop with LED light for the kitchen. Watch the nitrogen cycle work — a friendly first step into aquaponics.',
		tags: [
			'aquaponics',
			'countertop',
			'beginner-friendly',
			'classroom',
			'herbs',
			'gift'
		],
		relatedSlugs: [
			'aquaponics-water-testing-kit',
			'tilapia-fingerlings-starter-pack',
			'aquaponics-bell-siphon-kit'
		],
		descriptionHtml:
			'<h2>Aquaponics you can watch over breakfast</h2><p>A complete ecosystem that fits on a counter: fish waste feeds the herbs above, the plants clean the water below, and you get to watch the nitrogen cycle happen in miniature. A 3-gallon acrylic tank, a planted grow bed, an LED, an air pump, and a bottle of conditioner — everything to keep two or three small fish and a tray of greens.</p><p>It is the friendliest possible introduction to the idea, and quietly mesmerizing.</p><p>Curious how the loop works? The <a href="/learn">aquaponics field guide</a> explains it start to finish.</p>',
		keyFeatures: [
			'Self-contained fish-and-herb loop for the kitchen',
			'3-gal clear acrylic tank with bamboo accents',
			'LED grow light for year-round herbs',
			'Silent operation — great for classrooms and desks'
		],
		stats: [
			{ value: '3 gal', label: 'tank for 2–3 small fish' },
			{ value: '0', label: 'water changes — the plants clean it' },
			{ value: 'Year-round', label: 'herbs, lettuce, or microgreens' }
		],
		specs: [
			{ label: 'Tank', value: '3 gal clear acrylic' },
			{ label: 'Grow bed', value: 'Clay pebble media tray' },
			{ label: 'Light', value: 'LED grow light' },
			{ label: 'Aeration', value: 'Quiet air pump' },
			{ label: 'Fish', value: '2–3 small (goldfish or betta)' },
			{ label: 'Includes', value: 'Water conditioner' }
		],
		inTheBox: [
			'3-gal acrylic tank',
			'Grow bed + clay pebbles',
			'LED grow light',
			'Air pump',
			'Water conditioner',
			'Quick-start guide'
		],
		faqs: [
			{
				q: 'Does it come with fish?',
				a: 'No — live fish ship separately and cannot travel with the glass tank. Add a betta or a couple of goldfish once the tank cycles.'
			},
			{
				q: 'Is it truly maintenance-free?',
				a: 'Nearly. Feed the fish, top up evaporation, and harvest herbs. You skip water changes because the plants do that job.'
			}
		],
		testBedNote:
			'Honest note: it is a small volume, so it swings fast if you overfeed the fish. A tiny pinch of food and a light herb harvest keeps it in balance — more attention than a big system, not less.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Priya S.',
				rating: 5,
				title: 'My kids are obsessed',
				body: 'Watching the betta feed the basil taught them the nitrogen cycle better than any book. Looks great on the counter too.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Leo M.',
				rating: 4,
				title: 'Charming little system',
				body: 'Herbs grow well under the LED. It is small so do not overfeed — I learned that the first week.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Hana W.',
				rating: 4,
				title: 'Great gift',
				body: 'Bought it for a friend getting into aquaponics. Easy setup, looks lovely, and the guide is beginner-friendly.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'tilapia-fingerlings-starter-pack',
		sku: 'AEV-AQP-04',
		name: 'Tilapia Fingerlings (25)',
		system: 'aquaponics',
		categorySlug: 'fish-supplies',
		subCategory: 'Fish & supplies',
		price: '59.99',
		assetKey: 'tilapia',
		badges: ['LIVE'],
		isFeatured: false,
		shortDescription: 'Live Nile tilapia with overnight shipping and acclimation guide.',
		metaTitle: 'Tilapia Fingerlings Starter Pack (25) | Aevani Aquaponics',
		metaDescription:
			'Twenty-five live Nile tilapia fingerlings shipped overnight with an acclimation guide — the fast-growing, forgiving fish for home aquaponics.',
		tags: [
			'aquaponics',
			'live fish',
			'tilapia',
			'fingerlings',
			'stocking',
			'overnight shipping'
		],
		relatedSlugs: [
			'ibc-aquaponics-fish-tank',
			'aquaponics-water-testing-kit',
			'commercial-aquaponics-grow-bed'
		],
		descriptionHtml:
			'<h2>The gold-standard aquaponics fish</h2><p>Nile tilapia are hardy, fast-growing, and tolerant of the water swings a new system throws at them — which is exactly why they are the fish almost every aquaponics guide recommends first. This is a live shipment of twenty-five 1–2 inch fingerlings, packed with oxygen and shipped overnight so they arrive strong.</p><p>Feed them well and they reach a 1–1.5 lb harvest in eight to ten months, fertilizing your garden the whole way.</p><p>New to livestock? Read the acclimation steps in the <a href="/learn">aquaponics field guide</a> before they arrive.</p>',
		keyFeatures: [
			'25 live Nile tilapia fingerlings (1–2 in)',
			'Hardy and forgiving of new-system water swings',
			'Overnight shipping with oxygen packs',
			'Live-arrival guarantee'
		],
		stats: [
			{ value: '25', label: 'fingerlings per pack' },
			{ value: '8–10 mo', label: 'to 1–1.5 lb harvest size' },
			{ value: '1–2 in', label: 'arrival size' }
		],
		specs: [
			{ label: 'Species', value: 'Nile tilapia (Oreochromis niloticus)' },
			{ label: 'Count', value: '25 fingerlings' },
			{ label: 'Size', value: '1–2 in on arrival' },
			{ label: 'Shipping', value: 'Overnight, Mon–Wed, oxygen-packed' },
			{ label: 'Includes', value: 'Acclimation + 90-day feeding guide' }
		],
		inTheBox: [
			'25 live tilapia fingerlings',
			'Oxygen-packed insulated box',
			'Acclimation guide',
			'90-day feeding schedule',
			'Water quick-start sheet'
		],
		faqs: [
			{
				q: 'What if fish arrive dead?',
				a: 'Photograph any DOA within two hours of delivery and we replace them free. Our live-arrival guarantee covers the whole shipment.'
			},
			{
				q: 'Is tilapia legal in my state?',
				a: 'Some states restrict tilapia. Check your local regulations before ordering — we cannot ship where they are prohibited.'
			}
		],
		testBedNote:
			'Honest note: do not add fingerlings to an uncycled tank. Ammonia from day-one fish in a system without an established biofilter is the most common way beginners lose their first batch — cycle first.',
		shippingNote: SHIP_LIVE,
		warranty: LIVE_WARRANTY,
		reviews: [
			{
				authorName: 'Marcus W.',
				rating: 5,
				title: 'Arrived lively',
				body: 'All 25 swam out strong. Acclimation guide was clear. Growing fast on the feeding schedule — no losses.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Yuki T.',
				rating: 4,
				title: 'Healthy fish, cycle first',
				body: 'They shipped perfectly. My only regret is adding them a week too early — lost two before my biofilter caught up. My fault, not theirs.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'aquaponics-water-testing-kit',
		sku: 'AEV-AQP-05',
		name: 'Aquaponics Water Testing Kit',
		system: 'aquaponics',
		categorySlug: 'fish-supplies',
		subCategory: 'Fish & supplies',
		price: '34.99',
		assetKey: 'waterTesting',
		badges: ['IN STOCK'],
		isFeatured: false,
		shortDescription: '6 parameters, 150+ tests, and a plain-language reference.',
		metaTitle: 'Aquaponics Water Testing Kit | Aevani Aquaponics',
		metaDescription:
			'Test six water parameters over 150+ times with a plain-language nitrogen-cycle reference. Catch problems before they become fish kills.',
		tags: [
			'aquaponics',
			'water testing',
			'nitrogen cycle',
			'fish health',
			'monitoring',
			'consumables'
		],
		relatedSlugs: [
			'aquaponics-bell-siphon-kit',
			'tilapia-fingerlings-starter-pack',
			'ibc-aquaponics-fish-tank'
		],
		descriptionHtml:
			'<h2>Read the water before the fish tell you</h2><p>In aquaponics, water chemistry is the whole game — and by the time fish or plants look stressed, the numbers moved days ago. This master kit tests the six that matter: pH, ammonia, nitrite, nitrate, dissolved oxygen, and general hardness, with over 150 tests per parameter.</p><p>The laminated reference translates results into plain language and ideal ranges, so you know what to do, not just what you measured.</p>',
		keyFeatures: [
			'Tests all 6 key parameters (pH, ammonia, nitrite, nitrate, DO, GH)',
			'150+ tests per parameter',
			'Plain-language reference for ideal ranges',
			'Calibrated specifically for aquaponics'
		],
		stats: [
			{ value: '6', label: 'parameters covered' },
			{ value: '150+', label: 'tests per parameter' },
			{ value: '5 min', label: 'to a full water reading' }
		],
		specs: [
			{ label: 'Parameters', value: 'pH, NH3/NH4+, NO2-, NO3-, DO, GH' },
			{ label: 'Capacity', value: '150+ tests each' },
			{ label: 'Format', value: 'Liquid reagents + comparison cards' },
			{ label: 'Includes', value: 'Digital thermometer + reference guide' }
		],
		inTheBox: [
			'6 liquid reagent sets',
			'Color comparison cards',
			'Digital thermometer',
			'Laminated range guide',
			'Test vials'
		],
		faqs: [
			{
				q: 'How often should I test a new system?',
				a: 'Daily during the first cycle to catch the ammonia and nitrite spikes. Once established, twice a week is plenty.'
			},
			{
				q: 'Are liquid tests better than strips?',
				a: 'Yes — liquid reagents are far more accurate than strips, especially for the low ammonia readings that matter most.'
			}
		],
		testBedNote:
			'Honest note: reagent bottles have a shelf life. Note the date you open them — old ammonia reagent reads falsely low, which is exactly the wrong direction to be wrong in.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Jordan P.',
				rating: 5,
				title: 'Essential from day one',
				body: 'Caught my nitrite spike mid-cycle and knew exactly what to do thanks to the guide. Way more accurate than the strips I started with.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Ana R.',
				rating: 4,
				title: 'Does the job',
				body: 'Clear color changes and enough tests to last a long time. The reference card lives next to my tank now.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Kofi A.',
				rating: 3,
				title: 'Good, but reading colors is fiddly',
				body: 'Accurate once you get used to matching the shades under good light. In a dim garage it is harder than I expected.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'aquaponics-bell-siphon-kit',
		sku: 'AEV-AQP-06',
		name: 'Bell Siphon Kit',
		system: 'aquaponics',
		categorySlug: 'fish-supplies',
		subCategory: 'Fish & supplies',
		price: '24.99',
		assetKey: 'bellSiphon',
		badges: [],
		isFeatured: false,
		shortDescription: 'Clear PVC siphon, adjustable for 8–14 in grow beds.',
		metaTitle: 'Aquaponics Bell Siphon Kit | Aevani Aquaponics',
		metaDescription:
			'A clear PVC bell siphon adjustable for 8–14 in grow beds, automating flood-and-drain cycles with no timer — the quiet workhorse of a media bed.',
		tags: [
			'aquaponics',
			'bell siphon',
			'flood and drain',
			'grow bed',
			'plumbing',
			'diy'
		],
		relatedSlugs: [
			'commercial-aquaponics-grow-bed',
			'ibc-aquaponics-fish-tank',
			'aquaponics-water-testing-kit'
		],
		descriptionHtml:
			'<h2>The clever part of flood-and-drain</h2><p>A bell siphon is the small piece of physics that makes media-bed aquaponics work without electronics: the bed fills, the siphon triggers, it drains completely, and the cycle repeats — no timer, no float switch, no moving parts to fail. This kit is clear PVC so you can actually watch the siphon prime and break, which makes tuning (and teaching) simple.</p><p>The adjustable standpipe fits grow beds from 8 to 14 inches deep.</p>',
		keyFeatures: [
			'Automatic flood-and-drain with no electronics',
			'Clear PVC lets you watch the siphon cycle',
			'Adjustable standpipe for 8–14 in beds',
			'Fits standard 1-in bulkhead fittings'
		],
		stats: [
			{ value: '2 GPM', label: 'reliable trigger flow rate' },
			{ value: '8–14 in', label: 'grow-bed depth range' },
			{ value: '0', label: 'moving parts' }
		],
		specs: [
			{ label: 'Standpipe', value: 'Clear PVC, adjustable 6–12 in' },
			{ label: 'Housing', value: 'Bell + media guard screen' },
			{ label: 'Fitting', value: 'Standard 1-in bulkhead' },
			{ label: 'Trigger', value: 'From ~2 GPM inflow' },
			{ label: 'Bed depth', value: '8–14 in' }
		],
		inTheBox: [
			'Clear PVC standpipe',
			'Bell housing',
			'Media guard screen',
			'Bulkhead fittings',
			'Tuning instructions'
		],
		faqs: [
			{
				q: 'Why will my siphon not break?',
				a: 'Usually the inflow is too high and keeps it primed. Reduce flow slightly until it drains fully — the clear housing makes this easy to see.'
			},
			{
				q: 'Does bed depth matter?',
				a: 'Yes — trim the standpipe to leave 1–2 in of dry media at the top of the flood. The instructions walk through it.'
			}
		],
		testBedNote:
			'Honest note: bell siphons are finicky to tune the first time. Expect to adjust inflow a few times before it cycles cleanly — once dialed in, it runs for years untouched.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Tom B.',
				rating: 5,
				title: 'Cycles like clockwork',
				body: 'Took a couple of flow adjustments to get the break clean, then it just worked. The clear housing made tuning obvious.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Deja W.',
				rating: 4,
				title: 'Works once you tune it',
				body: 'Patience required on setup. After that it has been silent and reliable. Being able to see the cycle really helps.',
				isVerifiedPurchase: true
			}
		]
	},

	// ============================ SILVOPASTURE ============================
	{
		slug: 'silvopasture-seed-mix',
		sku: 'AEV-SIL-01',
		name: 'Silvopasture Seed Mix',
		system: 'silvopasture',
		categorySlug: 'silvopasture-supplies',
		subCategory: 'Silvopasture',
		price: '64.99',
		assetKey: 'silvoSeedMix',
		badges: [],
		isFeatured: false,
		shortDescription: 'Shade-tolerant grasses and legumes for under-canopy pasture.',
		metaTitle: 'Silvopasture Seed Mix | Aevani Silvopasture',
		metaDescription:
			'A shade-tolerant blend of grasses and legumes bred for under-canopy pasture. Feeds livestock and builds soil beneath your trees.',
		tags: [
			'silvopasture',
			'forage seed',
			'shade-tolerant',
			'pasture',
			'livestock',
			'regenerative'
		],
		relatedSlugs: [
			'forage-chicory-plants-50-plugs',
			'tree-shelters-protectors-25-pack',
			'portable-electric-netting-164-ft'
		],
		descriptionHtml:
			'<h2>Forage that thrives in dappled light</h2><p>Most pasture mixes sulk under trees. This one is formulated for it — shade-tolerant orchardgrass and timothy paired with white clover, birdsfoot trefoil, and chicory. The legumes fix 80–150 lbs of nitrogen per acre a year, so the whole stand feeds itself and cuts your fertilizer bill.</p><p>Seed at 25 lbs per acre across USDA zones 4–8. It is the ground layer that makes silvopasture pay.</p><p>Planning a silvopasture? The <a href="/learn">silvopasture guide</a> covers establishment.</p>',
		keyFeatures: [
			'Shade-tolerant grasses and legumes for under-canopy grazing',
			'Legumes fix 80–150 lbs of nitrogen per acre annually',
			'Livestock-preferred chicory and clover',
			'Suited to USDA zones 4–8'
		],
		stats: [
			{ value: '80–150', label: 'lbs of nitrogen fixed per acre each year' },
			{ value: '25 lbs', label: 'seeding rate per acre' },
			{ value: '5', label: 'complementary species in the blend' }
		],
		specs: [
			{ label: 'Species', value: 'Orchardgrass, timothy, white clover, birdsfoot trefoil, chicory' },
			{ label: 'Seeding rate', value: '25 lbs / acre' },
			{ label: 'Zones', value: 'USDA 4–8' },
			{ label: 'Tolerance', value: 'Shade and rotational grazing' },
			{ label: 'Packaging', value: 'Resealable kraft bag + establishment guide' }
		],
		inTheBox: [
			'Silvopasture seed blend',
			'Establishment guide',
			'Resealable kraft bag'
		],
		faqs: [
			{
				q: 'How much shade can it take?',
				a: 'It performs best at 40–60% canopy shade. Under very dense canopy, thin the trees first — no forage thrives in deep shade.'
			},
			{
				q: 'When should I overseed?',
				a: 'Early spring or late summer, into a lightly disturbed seedbed, ahead of reliable moisture.'
			}
		],
		testBedNote:
			'Honest note: establishment is the hard part. Keep livestock off the new stand until it is well-rooted — grazing too early pulls seedlings out by the crown and thins the stand for years.',
		shippingNote: SHIP_STANDARD,
		warranty: SEEDS_WARRANTY,
		reviews: [
			{
				authorName: 'Tom B.',
				rating: 5,
				title: 'Filled in under my oaks',
				body: 'Nothing grew there before. Now my sheep graze under the canopy and the clover is greening up the whole stand. Patient establishment paid off.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Walt R.',
				rating: 4,
				title: 'Good blend for partial shade',
				body: 'Germinated well with spring moisture. Kept the animals off the first season like the guide says. Strong stand now.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'portable-electric-netting-164-ft',
		sku: 'AEV-SIL-02',
		name: 'Portable Electric Netting (164 ft)',
		system: 'silvopasture',
		categorySlug: 'silvopasture-supplies',
		subCategory: 'Silvopasture',
		price: '149.99',
		assetKey: 'electricNetting',
		badges: ['IN STOCK'],
		isFeatured: false,
		shortDescription: '42-inch netting with 14 posts for rotational grazing.',
		metaTitle: 'Portable Electric Netting (164 ft) | Aevani Silvopasture',
		metaDescription:
			'164 feet of 42-inch electric netting with 14 built-in posts for fast rotational grazing. Move stock through silvopasture paddocks in minutes.',
		tags: [
			'silvopasture',
			'electric fence',
			'rotational grazing',
			'livestock',
			'paddock',
			'portable'
		],
		relatedSlugs: [
			'livestock-water-trough-shaded',
			'silvopasture-seed-mix',
			'tree-shelters-protectors-25-pack'
		],
		descriptionHtml:
			'<h2>Move the animals, not the fence posts</h2><p>Rotational grazing is the engine of silvopasture — but only if moving paddocks is easy. This 164-foot roll of 42-inch electric netting has the posts built in, so one person can pick it up, walk it to fresh forage, and set it down in minutes. Double-spike feet hold firm ground; hi-vis orange keeps it visible.</p><p>Pair it with any standard energizer and rotate daily or weekly to spread fertility and stop overgrazing.</p><p>New to rotation? The <a href="/learn">silvopasture guide</a> covers paddock timing.</p>',
		keyFeatures: [
			'164 ft roll with 14 built-in posts',
			'42-in tall for poultry and sheep',
			'Double-spike posts for firm ground hold',
			'Hi-vis orange, works with any standard energizer'
		],
		stats: [
			{ value: '164 ft', label: 'of fence per roll' },
			{ value: '42 in', label: 'height' },
			{ value: '14', label: 'built-in posts, 12 ft spacing' }
		],
		specs: [
			{ label: 'Length', value: '164 ft (50 m)' },
			{ label: 'Height', value: '42 in' },
			{ label: 'Posts', value: '14 with double spikes' },
			{ label: 'Livestock', value: 'Poultry, sheep, goats' },
			{ label: 'Energizer', value: 'Any standard (sold separately)' },
			{ label: 'Includes', value: '12 ground stakes + carry bag' }
		],
		inTheBox: [
			'164 ft electric netting',
			'14 integrated posts',
			'12 ground stakes',
			'Carry bag',
			'Setup instructions'
		],
		faqs: [
			{
				q: 'Does it include an energizer?',
				a: 'No — choose an energizer sized to your total fence length and whether you run mains, battery, or solar power.'
			},
			{
				q: 'Will it hold goats?',
				a: 'With a strong energizer and trained animals, yes. Goats test fences — keep the charge hot and the bottom line clear of grass.'
			}
		],
		testBedNote:
			'Honest note: keep grass and weeds off the bottom line. Vegetation touching the net drains the charge fast, and a weak fence teaches animals to push through it.',
		shippingNote: SHIP_FREE,
		warranty: SYSTEM_WARRANTY,
		reviews: [
			{
				authorName: 'Sandra K.',
				rating: 5,
				title: 'One-person paddock moves',
				body: 'I move my hens to fresh ground every couple of days by myself in minutes. Posts built in is the whole trick. Keep the bottom clear and it holds.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Reuben M.',
				rating: 4,
				title: 'Great for rotation',
				body: 'Sturdy and easy to set. Needed a hotter energizer than I expected for my sheep, but once charged it does the job.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'livestock-water-trough-shaded',
		sku: 'AEV-SIL-03',
		name: 'Livestock Water Trough (Shaded)',
		system: 'silvopasture',
		categorySlug: 'silvopasture-supplies',
		subCategory: 'Silvopasture',
		price: '129.99',
		assetKey: 'waterTrough',
		badges: [],
		isFeatured: false,
		shortDescription: '100-gal galvanized tank with auto-fill float valve.',
		metaTitle: 'Shaded Livestock Water Trough (100 gal) | Aevani',
		metaDescription:
			'A 100-gallon galvanized trough with auto-fill float valve and shade cover to keep water cool. Reliable stock water for rotational silvopasture.',
		tags: [
			'silvopasture',
			'water trough',
			'livestock',
			'auto-fill',
			'grazing',
			'durable'
		],
		relatedSlugs: [
			'portable-electric-netting-164-ft',
			'silvopasture-seed-mix',
			'forage-chicory-plants-50-plugs'
		],
		descriptionHtml:
			'<h2>Cool water, less work</h2><p>Livestock under tree canopy still need reliable water, and hauling buckets gets old fast. This 100-gallon galvanized stock tank fills itself from a garden hose through a float valve, so it tops up as animals drink. The galvanized finish resists rust and stays cool in the shade, and the round shape means no animal gets cornered.</p><p>In the off-season it doubles as a raised planter or a rain-catchment barrel.</p>',
		keyFeatures: [
			'100-gal galvanized steel, rust and algae resistant',
			'Auto-fill float valve from any garden hose',
			'Round design prevents animals cornering',
			'Doubles as a planter or rain barrel off-season'
		],
		stats: [
			{ value: '100 gal', label: 'capacity' },
			{ value: 'Auto', label: 'float-valve fill' },
			{ value: 'Multi-use', label: 'trough, planter, or catchment' }
		],
		specs: [
			{ label: 'Capacity', value: '100 gal' },
			{ label: 'Material', value: 'Heavy-gauge galvanized steel' },
			{ label: 'Fill', value: 'Float valve + garden-hose fitting' },
			{ label: 'Drain', value: 'Bottom drain plug' },
			{ label: 'Extras', value: 'Bracket for optional shade cover' }
		],
		inTheBox: [
			'100-gal galvanized tank',
			'Float valve assembly',
			'Hose fitting',
			'Drain plug',
			'Shade-cover bracket'
		],
		faqs: [
			{
				q: 'Will the float valve freeze in winter?',
				a: 'It can. In freezing climates, add a tank heater and insulate the supply line, or drain it seasonally.'
			},
			{
				q: 'How do I keep it clean?',
				a: 'Galvanized steel resists algae better than plastic, but a monthly scrub and the bottom drain keep it fresh in hot weather.'
			}
		],
		testBedNote:
			'Honest note: a float valve is only as reliable as your water pressure. On low-pressure gravity systems it can stick — check it weekly until you trust your setup.',
		shippingNote: SHIP_BULKY,
		warranty: SYSTEM_WARRANTY,
		reviews: [
			{
				authorName: 'Cal T.',
				rating: 5,
				title: 'No more hauling buckets',
				body: 'Hooked it to a hose and forgot about it. Water stays cool under the trees and the animals took to it immediately.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Meg D.',
				rating: 4,
				title: 'Solid tank',
				body: 'Well built and the float works great at house pressure. Checked it weekly at first like the note suggests.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'tree-shelters-protectors-25-pack',
		sku: 'AEV-SIL-04',
		name: 'Tree Shelters (25 pack)',
		system: 'silvopasture',
		categorySlug: 'silvopasture-supplies',
		subCategory: 'Silvopasture',
		price: '89.99',
		assetKey: 'treeShelters',
		badges: [],
		isFeatured: false,
		shortDescription: '4-ft shelters with stakes to establish trees among livestock.',
		metaTitle: 'Tree Shelters & Protectors (25 pack) | Aevani Silvopasture',
		metaDescription:
			'Twenty-five 4-ft tree shelters with stakes to establish seedlings among grazing livestock. Speed early growth and stop browsing damage.',
		tags: [
			'silvopasture',
			'tree shelters',
			'tree protection',
			'establishment',
			'agroforestry',
			'livestock'
		],
		relatedSlugs: [
			'silvopasture-seed-mix',
			'forage-chicory-plants-50-plugs',
			'portable-electric-netting-164-ft'
		],
		descriptionHtml:
			'<h2>Get trees past the vulnerable years</h2><p>Planting trees where livestock graze is a race: the tree has to outgrow browsing height before an animal or a deer sets it back years. These 4-foot translucent shelters win that race. They block browse, deer, rodents, and herbicide drift while creating a greenhouse microclimate that speeds early growth by 50–100%.</p><p>Twenty-five shelters, stakes, and ties — enough to establish a serious planting.</p><p>Integrating trees and animals? See the <a href="/learn">silvopasture guide</a>.</p>',
		keyFeatures: [
			'Protects from livestock, deer, rodents, and herbicide drift',
			'Greenhouse microclimate speeds growth 50–100%',
			'4-ft translucent polypropylene',
			'Breaks down in 5–7 years as trees outgrow them'
		],
		stats: [
			{ value: '25', label: 'shelters per pack' },
			{ value: '50–100%', label: 'faster early growth' },
			{ value: '4 ft', label: 'height clears browse line' }
		],
		specs: [
			{ label: 'Count', value: '25 shelters' },
			{ label: 'Height', value: '4 ft' },
			{ label: 'Material', value: 'Translucent polypropylene' },
			{ label: 'Stakes', value: '25 hardwood + 50 zip ties' },
			{ label: 'Lifespan', value: 'Biodegrades in 5–7 years' }
		],
		inTheBox: [
			'25 tree shelters',
			'25 hardwood stakes',
			'50 zip ties',
			'Installation guide'
		],
		faqs: [
			{
				q: 'Do I remove them later?',
				a: 'You can, but they are designed to photo-degrade in 5–7 years, by which point most trees have outgrown them. Check ties yearly so they do not girdle the trunk.'
			},
			{
				q: 'Will they overheat seedlings in summer?',
				a: 'The vented design moderates heat, but in very hot climates site plantings where they get afternoon shade for the first season.'
			}
		],
		testBedNote:
			'Honest note: loosen the ties as trunks thicken. A shelter left cinched tight can girdle a fast-growing tree — a two-minute check each spring prevents it.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Owen B.',
				rating: 5,
				title: 'My chestnuts took off',
				body: 'The growth difference versus my unsheltered trees is dramatic. Deer left them alone completely. Loosen the ties yearly.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Fern L.',
				rating: 4,
				title: 'Work as promised',
				body: 'Easy to stake and the trees are romping away inside them. Docking a star only because a couple blew loose in a storm — stake them well.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'forage-chicory-plants-50-plugs',
		sku: 'AEV-SIL-05',
		name: 'Forage Chicory Plugs (50)',
		system: 'silvopasture',
		categorySlug: 'silvopasture-supplies',
		subCategory: 'Silvopasture',
		price: '44.99',
		assetKey: 'forageChicory',
		badges: ['LIVE'],
		isFeatured: false,
		shortDescription: 'Deep taproots that break up soil and feed livestock.',
		metaTitle: 'Forage Chicory Plants (50 plugs) | Aevani Silvopasture',
		metaDescription:
			'Fifty deep-rooted forage chicory plugs that break compaction, mine minerals, and feed livestock high-protein forage through summer.',
		tags: [
			'silvopasture',
			'forage chicory',
			'deep taproot',
			'livestock forage',
			'soil building',
			'pasture'
		],
		relatedSlugs: [
			'silvopasture-seed-mix',
			'tree-shelters-protectors-25-pack',
			'livestock-water-trough-shaded'
		],
		descriptionHtml:
			'<h2>The deep-rooted multitasker</h2><p>Forage chicory is a quiet superstar of silvopasture. Its 12–18 inch taproot punches through compaction, mines minerals from deep subsoil, and gives it real drought resistance. Livestock actually prefer it to most grasses, and it carries natural anthelmintic compounds that help keep parasite loads down.</p><p>This flat of 50 plugs establishes fast and persists five years or more. Plant at 4–6 inch spacing or interplant into existing pasture.</p>',
		keyFeatures: [
			'12–18 in taproots break up compacted soil',
			'Livestock-preferred, high-protein forage',
			'Natural anthelmintic properties reduce parasites',
			'Persists 5+ years once established'
		],
		stats: [
			{ value: '50', label: 'live plugs per flat' },
			{ value: '12–18 in', label: 'taproot depth' },
			{ value: '5+ yr', label: 'stand persistence' }
		],
		specs: [
			{ label: 'Count', value: '50 live plugs' },
			{ label: 'Spacing', value: '4–6 in' },
			{ label: 'Root depth', value: '12–18 in taproot' },
			{ label: 'Use', value: 'New beds or interplant into pasture' },
			{ label: 'Persistence', value: '5+ years' }
		],
		inTheBox: [
			'Flat of 50 chicory plugs',
			'Planting guide',
			'Spacing template'
		],
		faqs: [
			{
				q: 'How soon can I graze it?',
				a: 'Let plugs establish for 60–90 days before the first light graze. After that it recovers quickly under rotation.'
			},
			{
				q: 'Will it take over my pasture?',
				a: 'No — it holds its place as part of a mixed stand. Interplant it rather than seeding it alone for the best balance.'
			}
		],
		testBedNote:
			'Honest note: chicory bolts to a bitter flower stalk if you let it get ahead of the animals. Keep it grazed or topped in early summer to hold it in the leafy, palatable stage.',
		shippingNote: SHIP_LIVE,
		warranty: LIVE_WARRANTY,
		reviews: [
			{
				authorName: 'Tom B.',
				rating: 5,
				title: 'Sheep go straight for it',
				body: 'Plugs arrived healthy and rooted fast. The animals graze it first, before the grass. Noticing better soil where it is established.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Della P.',
				rating: 4,
				title: 'Vigorous once rooted',
				body: 'Establishment took patience but it is thriving now. Have to stay on top of topping it so it does not bolt.',
				isVerifiedPurchase: false
			}
		]
	},

	// ============================ AGROFORESTRY ============================
	{
		slug: 'chestnut-tree-seedlings-10-pack',
		sku: 'AEV-AGF-01',
		name: 'Chestnut Seedlings (10 pack)',
		system: 'agroforestry',
		categorySlug: 'agroforestry-supplies',
		subCategory: 'Agroforestry',
		price: '149.99',
		assetKey: 'chestnutSeedlings',
		badges: ['LIVE'],
		isFeatured: false,
		shortDescription: 'Blight-resistant Dunstan chestnuts, 2–3 ft tall.',
		metaTitle: 'Chestnut Tree Seedlings (10 pack) | Aevani Agroforestry',
		metaDescription:
			'Ten blight-resistant Dunstan chestnut seedlings, 2–3 ft tall, for a productive nut crop. A cornerstone tree for agroforestry and food forests.',
		tags: [
			'agroforestry',
			'tree seedlings',
			'chestnut',
			'nut crop',
			'food forest',
			'perennial'
		],
		relatedSlugs: [
			'nitrogen-fixing-tree-seeds-collection',
			'grafting-propagation-kit',
			'medicinal-herb-garden-kit'
		],
		descriptionHtml:
			'<h2>Plant a crop that outlives you</h2><p>Chestnuts are the anchor of a productive agroforestry system: a blight-resistant Dunstan chestnut yields mast for livestock and wildlife, timber value, and eventually 50–100 lbs of nuts a year per mature tree. These ten bare-root seedlings arrive 2–3 feet tall with strong roots, ready for USDA zones 5–9.</p><p>They bear in three to five years — fast, for a tree that pays for decades.</p><p>Designing an agroforestry planting? Start with the <a href="/learn">silvopasture &amp; agroforestry guide</a>.</p>',
		keyFeatures: [
			'Blight-resistant Dunstan hybrid chestnuts',
			'2–3 ft bare-root seedlings with strong roots',
			'Mast crop for livestock, wildlife, and market',
			'Bears in 3–5 years, hardy in zones 5–9'
		],
		stats: [
			{ value: '10', label: 'seedlings per pack' },
			{ value: '3–5 yr', label: 'to first nut crop' },
			{ value: '50–100', label: 'lbs of nuts per mature tree' }
		],
		specs: [
			{ label: 'Variety', value: 'Dunstan chestnut (blight-resistant)' },
			{ label: 'Size', value: '2–3 ft bare root' },
			{ label: 'Zones', value: 'USDA 5–9' },
			{ label: 'Bearing', value: '3–5 years' },
			{ label: 'Includes', value: 'Variety tags + planting & spacing guide' }
		],
		inTheBox: [
			'10 chestnut seedlings',
			'Variety tags',
			'Planting instructions',
			'Alley-cropping spacing guide'
		],
		faqs: [
			{
				q: 'Do I need more than one for nuts?',
				a: 'Yes — chestnuts need cross-pollination. Plant at least two, ideally more, within 200 feet for good nut set.'
			},
			{
				q: 'How should I protect young trees?',
				a: 'Pair them with our tree shelters — deer and livestock will browse unprotected seedlings to the ground.'
			}
		],
		testBedNote:
			'Honest note: bare-root seedlings must go in the ground promptly and stay watered the first two summers. They look like sticks on arrival — that is normal; keep the roots moist and they leaf out.',
		shippingNote: SHIP_LIVE,
		warranty: LIVE_WARRANTY,
		reviews: [
			{
				authorName: 'Harlan G.',
				rating: 5,
				title: 'Healthy roots, leafed out fast',
				body: 'Arrived dormant as expected. Planted within two days, kept them watered, and eight of ten leafed out beautifully. Two replaced under the guarantee, no fuss.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Beth N.',
				rating: 4,
				title: 'Good start for my orchard',
				body: 'Strong little trees. Just remember you need at least two for pollination — I had to add more. Sheltered them from deer and they are thriving.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'nitrogen-fixing-tree-seeds-collection',
		sku: 'AEV-AGF-02',
		name: 'Nitrogen-Fixing Tree Seeds',
		system: 'agroforestry',
		categorySlug: 'agroforestry-supplies',
		subCategory: 'Agroforestry',
		price: '36.99',
		assetKey: 'nfixingTreeSeeds',
		badges: [],
		isFeatured: false,
		shortDescription: '4 species, 325+ seeds, with a planting guide.',
		metaTitle: 'Nitrogen-Fixing Tree Seeds Collection | Aevani Agroforestry',
		metaDescription:
			'Four nitrogen-fixing tree species and 325+ seeds with a planting guide. Build fertility, windbreaks, and living mulch across your land.',
		tags: [
			'agroforestry',
			'tree seeds',
			'nitrogen fixing',
			'soil fertility',
			'windbreak',
			'propagation'
		],
		relatedSlugs: [
			'chestnut-tree-seedlings-10-pack',
			'grafting-propagation-kit',
			'medicinal-herb-garden-kit'
		],
		descriptionHtml:
			'<h2>Build fertility into the system</h2><p>Nitrogen-fixing trees are the quiet infrastructure of agroforestry — plant them among your crop trees and they pull nitrogen from the air and feed the whole guild. This collection gives you four species (black locust, autumn olive, Siberian pea shrub, and alder) and over 325 seeds, enough to establish real fertility corridors.</p><p>Each species comes with the scarification and stratification steps it needs, plus a density guide for alley cropping and silvopasture.</p>',
		keyFeatures: [
			'4 nitrogen-fixing species, 325+ seeds',
			'Fix 50–300 lbs of nitrogen per acre annually',
			'Scarification and stratification instructions included',
			'Density guide for alley cropping and silvopasture'
		],
		stats: [
			{ value: '325+', label: 'seeds across 4 species' },
			{ value: '50–300', label: 'lbs of nitrogen fixed per acre' },
			{ value: '4', label: 'species for layered fertility' }
		],
		specs: [
			{ label: 'Species', value: 'Black locust, autumn olive, Siberian pea shrub, alder' },
			{ label: 'Seed count', value: '325+ total' },
			{ label: 'Prep', value: 'Species-specific scarify / stratify steps' },
			{ label: 'Use', value: 'Alley cropping, silvopasture, windbreaks' }
		],
		inTheBox: [
			'Black locust seeds (100)',
			'Autumn olive seeds (50)',
			'Siberian pea shrub seeds (75)',
			'Alder seeds (100)',
			'Germination & planting guide'
		],
		faqs: [
			{
				q: 'Why do seeds need scarification?',
				a: 'These hard-coated tree seeds will not germinate until the coat is nicked or cold-treated. The guide gives exact steps per species.'
			},
			{
				q: 'Is autumn olive invasive where I live?',
				a: 'It can be in some regions. Check your state noxious-weed list before planting — the guide flags this.'
			}
		],
		testBedNote:
			'Honest note: black locust in particular spreads by root suckers and can colonize aggressively. Plant it where you want a thicket, not next to a tidy bed — it is a feature or a headache depending on placement.',
		shippingNote: SHIP_STANDARD,
		warranty: SEEDS_WARRANTY,
		reviews: [
			{
				authorName: 'Silas M.',
				rating: 4,
				title: 'Great fertility starter',
				body: 'Good germination after following the stratification steps. The pea shrubs are already fixing nitrogen visibly around my fruit trees.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'June K.',
				rating: 4,
				title: 'Read the invasive note',
				body: 'Seeds sprouted well. Glad the guide flagged autumn olive — I swapped it for more alder for my region. Sensible collection otherwise.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'grafting-propagation-kit',
		sku: 'AEV-AGF-03',
		name: 'Grafting & Propagation Kit',
		system: 'agroforestry',
		categorySlug: 'agroforestry-supplies',
		subCategory: 'Agroforestry',
		price: '47.99',
		assetKey: 'graftingKit',
		badges: [],
		isFeatured: false,
		shortDescription: 'Professional tools and an illustrated how-to.',
		metaTitle: 'Grafting & Propagation Kit | Aevani Agroforestry',
		metaDescription:
			'Professional grafting tools with an illustrated how-to for propagating fruit and nut trees. Multiply your best trees for free.',
		tags: [
			'agroforestry',
			'grafting',
			'propagation',
			'fruit trees',
			'tools',
			'orcharding'
		],
		relatedSlugs: [
			'chestnut-tree-seedlings-10-pack',
			'nitrogen-fixing-tree-seeds-collection',
			'medicinal-herb-garden-kit'
		],
		descriptionHtml:
			'<h2>Multiply your best trees</h2><p>Grafting is how one exceptional tree becomes an orchard. This kit gives you the real tools — a Japanese grafting knife, bypass pruners, grafting tape, parafilm, and rooting hormone — plus an 80-page illustrated guide to whip-and-tongue, cleft, and bud grafting for fruit trees, tomatoes, and ornamentals.</p><p>Two propagation domes let you root cuttings alongside your grafts. It is a skill that pays back every season.</p>',
		keyFeatures: [
			'Japanese grafting knife + bypass pruners',
			'Grafting tape, parafilm, and rooting hormone',
			'80-page illustrated technique guide',
			'2 propagation domes for cuttings'
		],
		stats: [
			{ value: '3', label: 'grafting methods taught (whip, cleft, bud)' },
			{ value: '80', label: 'pages of illustrated instruction' },
			{ value: '2', label: 'propagation domes included' }
		],
		specs: [
			{ label: 'Knife', value: 'Japanese carbon-steel grafting blade' },
			{ label: 'Pruners', value: 'Bypass, spring-loaded' },
			{ label: 'Supplies', value: 'Grafting tape, parafilm, rooting hormone' },
			{ label: 'Domes', value: '2 humidity domes' },
			{ label: 'Guide', value: '80-page illustrated manual' }
		],
		inTheBox: [
			'Japanese grafting knife',
			'Bypass pruning shears',
			'Grafting tape + parafilm',
			'Rooting hormone powder',
			'2 propagation domes',
			'80-page illustrated guide'
		],
		faqs: [
			{
				q: 'Is this suitable for a beginner?',
				a: 'Yes — the guide starts with the most forgiving methods. Grafting takes practice, so expect your success rate to climb over a season.'
			},
			{
				q: 'What is the knife made of?',
				a: 'High-carbon steel, which takes a razor edge but will rust if left wet. Wipe it dry and oil it after use.'
			}
		],
		testBedNote:
			'Honest note: timing beats technique. Even a perfect graft fails if the rootstock is not at the right stage — the guide stresses this, and it is the lesson most first-timers learn the hard way.',
		shippingNote: SHIP_STANDARD,
		warranty: TOOL_WARRANTY,
		reviews: [
			{
				authorName: 'Priya S.',
				rating: 5,
				title: 'Grafted my first apple tree',
				body: 'The knife is genuinely sharp and the guide made whip-and-tongue click for me. Three of my four grafts took on the first try.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Enzo R.',
				rating: 4,
				title: 'Good tools, keep the knife dry',
				body: 'Quality kit for the price. The carbon knife spotted with rust once — my fault for leaving it damp. Wipe and oil it.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'medicinal-herb-garden-kit',
		sku: 'AEV-AGF-04',
		name: 'Medicinal Herb Garden Kit',
		system: 'agroforestry',
		categorySlug: 'agroforestry-supplies',
		subCategory: 'Agroforestry',
		price: '49.99',
		assetKey: 'medicinalHerb',
		badges: [],
		isFeatured: false,
		shortDescription: '6 live herb starters with care cards and preparation guide.',
		metaTitle: 'Medicinal Herb Garden Kit | Aevani Agroforestry',
		metaDescription:
			'Six live medicinal herb starters with care cards and a preparation guide. Grow a home apothecary of teas, salves, and remedies.',
		tags: [
			'agroforestry',
			'medicinal herbs',
			'live plants',
			'apothecary',
			'herbalism',
			'perennial'
		],
		relatedSlugs: [
			'chestnut-tree-seedlings-10-pack',
			'grafting-propagation-kit',
			'nitrogen-fixing-tree-seeds-collection'
		],
		descriptionHtml:
			'<h2>Start a home apothecary</h2><p>The understory of an agroforestry system is where medicinal herbs belong, and this kit is the friendliest way in. Six live starters — lavender, chamomile, echinacea, peppermint, lemon balm, and calendula — arrive in biodegradable coir pots, each with a care card covering growing, harvest timing, drying, and traditional use.</p><p>The field guide walks 30+ preparations from teas to tinctures.</p>',
		keyFeatures: [
			'6 live medicinal herb starters',
			'Biodegradable coir pots — plant the whole thing',
			'Care card for each herb',
			'Field guide to 30+ herbal preparations'
		],
		stats: [
			{ value: '6', label: 'live herb starters' },
			{ value: '30+', label: 'preparations in the guide' },
			{ value: '0', label: 'plastic pots — all compostable coir' }
		],
		specs: [
			{ label: 'Herbs', value: 'Lavender, chamomile, echinacea, peppermint, lemon balm, calendula' },
			{ label: 'Form', value: 'Live starters in coir pots' },
			{ label: 'Care', value: 'Per-herb care cards' },
			{ label: 'Guide', value: '30+ preparation field guide' }
		],
		inTheBox: [
			'6 live herb starters',
			'6 care cards',
			'Herbal preparation field guide',
			'Biodegradable coir pots'
		],
		faqs: [
			{
				q: 'Can I grow these indoors?',
				a: 'Most do well on a sunny sill; lavender and echinacea prefer to move outdoors once established. The care cards note each one.'
			},
			{
				q: 'Are the plants ready to harvest?',
				a: 'They are young starters — give them a season to establish before serious harvesting. Peppermint and lemon balm come on fastest.'
			}
		],
		testBedNote:
			'Honest note: peppermint and lemon balm are vigorous spreaders. Keep them in their own pots or a contained bed, or they will crowd the slower herbs like echinacea right out.',
		shippingNote: SHIP_LIVE,
		warranty: LIVE_WARRANTY,
		reviews: [
			{
				authorName: 'Aisha O.',
				rating: 5,
				title: 'Lovely little starter garden',
				body: 'All six arrived healthy in their coir pots. The care cards are genuinely useful and my chamomile tea this year came from my own windowsill.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Rosa V.',
				rating: 4,
				title: 'Contain the mint',
				body: 'Great plants and a helpful guide. Heed the warning about peppermint — I potted it separately and saved my lavender.',
				isVerifiedPurchase: false
			}
		]
	},

	// ============================ KITS & COLLECTIONS ============================
	{
		slug: 'permaculture-starter-kit',
		sku: 'AEV-KIT-01',
		name: 'Permaculture Starter Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '89.99',
		assetKey: 'permacultureKit',
		galleryAssetKeys: ['handTrowel', 'edCompanion', 'soilHealth'],
		badges: ['GREAT FIRST KIT', 'GIFT'],
		isFeatured: true,
		shortDescription: 'Seeds, tools, and guidebook in a wooden crate.',
		metaTitle: 'Permaculture Starter Kit | Aevani Starter Kits',
		metaDescription:
			'Seeds, core tools, and a guidebook packed in a wooden crate to launch a permaculture garden — everything a first-year grower needs to start today.',
		tags: [
			'starter kit',
			'permaculture',
			'beginner-friendly',
			'seeds & tools',
			'gift',
			'regenerative'
		],
		relatedSlugs: [
			'mushroom-cultivation-kit',
			'microgreens-growing-kit',
			'soil-building-amendment-kit'
		],
		descriptionHtml:
			'<h2>Everything a first garden needs</h2><p>Permaculture can feel like a wall of principles and jargon. This kit turns it into something you can hold: a beautiful wooden crate packed with the seeds, tools, and knowledge to actually start. Twelve companion-planting seed packets, a hand trowel, a soil pH test, a compost thermometer, biodegradable starter pots, labels, twine — and a 120-page illustrated guidebook that walks the principles with hands-on activities.</p><p>We assembled it as the gift we wish we had been given: not the cheapest of each item, but the ones a beginner will not have to replace. The trowel is real steel. The seeds are open-pollinated. The guide answers the questions you have not thought to ask yet.</p><p>It is designed to carry someone from <em>observe and interact</em> all the way to <em>produce no waste</em> over a first season — and to look good on the shelf the whole time.</p><p>Want the bigger picture first? The <a href="/learn">Aevani learning hub</a> has companion-planting and soil guides that pair with this kit.</p>',
		keyFeatures: [
			'12 companion-planting seed packets to start immediately',
			'Real tools: steel trowel, pH test, compost thermometer',
			'120-page illustrated permaculture guidebook',
			'Everything packed in a keepsake wooden crate'
		],
		stats: [
			{ value: '12', label: 'companion-planting seed varieties' },
			{ value: '120', label: 'pages of illustrated guidance' },
			{ value: '1', label: 'crate that covers a whole first season' }
		],
		specs: [
			{ label: 'Seeds', value: '12 companion-planting packets' },
			{ label: 'Tools', value: 'Hand trowel, soil pH test, compost thermometer' },
			{ label: 'Starting', value: 'Biodegradable seed pots + labels + twine' },
			{ label: 'Guidebook', value: '120 pages, illustrated' },
			{ label: 'Packaging', value: 'Wooden crate' },
			{ label: 'Best for', value: 'Beginners and gifts' }
		],
		inTheBox: [
			'12 companion-planting seed packets',
			'Hand trowel',
			'Soil pH test kit',
			'Compost thermometer',
			'Biodegradable seed-starting pots',
			'Plant labels + garden twine',
			'120-page illustrated guidebook',
			'Wooden crate'
		],
		faqs: [
			{
				q: 'Is this good for someone who has never gardened?',
				a: 'That is exactly who we built it for. The guidebook assumes no experience and the seeds are chosen to be forgiving.'
			},
			{
				q: 'When should I give or start it?',
				a: 'Any time — start seeds indoors in late winter, or outdoors after your last frost. The guide includes a simple timing chart.'
			},
			{
				q: 'Are the seeds open-pollinated?',
				a: 'Yes — all 12 varieties are open-pollinated and non-GMO, so you can save seed from them for next year.'
			}
		],
		testBedNote:
			'Honest note: it is a genuine starter, not a farm-in-a-box. Twelve packets plant a bed or two, not an acre. As a first step and a gift it is hard to beat; scale up once you know what you love growing.',
		shippingNote: SHIP_FREE,
		warranty: KIT_WARRANTY,
		bundleOffer: {
			title: 'First-Season Bundle',
			price: '109.99',
			compareAt: '132.99',
			blurb: 'Add the Soil Building Amendment Kit — feed the beds this crate gets you started on.'
		},
		reviews: [
			{
				authorName: 'Sarah C.',
				rating: 5,
				title: 'The gift that actually got used',
				body: 'Gave it to my sister who had never gardened. She planted the whole crate and texts me photos weekly now. The guidebook did the teaching for me.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Devon H.',
				rating: 5,
				title: 'Quality across the board',
				body: 'Expected token tools and got a trowel I actually keep using. Seeds germinated great. The crate looks lovely on the shelf.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Marisol T.',
				rating: 4,
				title: 'Wonderful start, wanted more seeds',
				body: 'Everything is high quality. Twelve packets went fast once I got excited — but that is on me. Reordered seeds and kept going.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Priya S.',
				rating: 5,
				title: 'Perfect beginner box',
				body: 'The soil test and thermometer made composting click for me. Felt guided, not lost. Highly recommend as a first purchase.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'mushroom-cultivation-kit',
		sku: 'AEV-KIT-02',
		name: 'Mushroom Cultivation Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '29.99',
		assetKey: 'mushroomKit',
		badges: ['GIFT'],
		isFeatured: false,
		shortDescription: 'Ready-to-fruit oysters — 1–2 lbs across 2–3 flushes.',
		metaTitle: 'Mushroom Cultivation Kit | Aevani Starter Kits',
		metaDescription:
			'A ready-to-fruit oyster mushroom kit yielding 1–2 lbs across 2–3 flushes. Fresh gourmet mushrooms on your counter in about two weeks.',
		tags: [
			'starter kit',
			'mushrooms',
			'oyster mushrooms',
			'indoor growing',
			'beginner-friendly',
			'gourmet'
		],
		relatedSlugs: [
			'permaculture-starter-kit',
			'microgreens-growing-kit',
			'worm-composting-vermicompost-kit'
		],
		descriptionHtml:
			'<h2>Mushrooms on the counter in ten days</h2><p>This is the most instant-gratification kit we sell. The hardwood block arrives fully colonized — all the hard microbiology is done — so you cut an X in the bag, mist it twice a day, and watch clusters of pearl oyster mushrooms erupt within 7–10 days. Two or three flushes yield 1–2 lbs of gourmet mushrooms.</p><p>When the block is spent, the guide shows how to inoculate logs for outdoor growing.</p>',
		keyFeatures: [
			'Pre-colonized block — fruits in 7–10 days',
			'Yields 1–2 lbs over 2–3 flushes',
			'Just cut, mist, and harvest',
			'Guide to log inoculation for continued growing'
		],
		stats: [
			{ value: '7–10', label: 'days to first flush' },
			{ value: '1–2 lbs', label: 'total yield' },
			{ value: '2–3', label: 'flushes per block' }
		],
		specs: [
			{ label: 'Mushroom', value: 'Pearl oyster' },
			{ label: 'Substrate', value: 'Pre-inoculated hardwood sawdust' },
			{ label: 'Fruiting', value: '7–10 days from opening' },
			{ label: 'Yield', value: '1–2 lbs across 2–3 flushes' },
			{ label: 'Includes', value: 'Humidity tent + misting bottle' }
		],
		inTheBox: [
			'Colonized oyster mushroom block',
			'Humidity tent',
			'Misting bottle',
			'Growing + log-inoculation guide'
		],
		faqs: [
			{
				q: 'Do I need any special conditions?',
				a: 'Just indirect light, room temperature, and twice-daily misting. Bathrooms and kitchens work great for the humidity.'
			},
			{
				q: 'What do I do when it stops fruiting?',
				a: 'Break up the spent block into a shady mulch bed or compost it — it often surprises you with an outdoor flush later.'
			}
		],
		testBedNote:
			'Honest note: humidity is everything. In dry indoor air a block can stall — if flushes look small, mist more often or leave the tent on longer. Too dry, not too cold, is the usual culprit.',
		shippingNote: SHIP_STANDARD,
		warranty: LIVE_WARRANTY,
		reviews: [
			{
				authorName: 'Priya S.',
				rating: 5,
				title: 'Fastest harvest ever',
				body: 'Cut the bag on a Monday, eating oyster mushrooms by the weekend. My kids checked it hourly. Second flush already coming in.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Owen L.',
				rating: 4,
				title: 'Great fun, mist often',
				body: 'First flush was huge, second smaller because I let it dry out. Kept the tent on for round three and it bounced back.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'microgreens-growing-kit',
		sku: 'AEV-KIT-03',
		name: 'Microgreens Growing Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '39.99',
		assetKey: 'microgreensKit',
		badges: [],
		isFeatured: false,
		shortDescription: '5 trays, 5 seed varieties, coconut coir mats.',
		metaTitle: 'Microgreens Growing Kit | Aevani Starter Kits',
		metaDescription:
			'Five reusable trays, five seed varieties, and coconut coir mats for fast, nutrient-dense microgreens. Harvest fresh greens in 7–14 days.',
		tags: [
			'starter kit',
			'microgreens',
			'indoor growing',
			'fast harvest',
			'nutrient-dense',
			'kitchen'
		],
		relatedSlugs: [
			'permaculture-starter-kit',
			'herb-spiral-garden-kit',
			'mushroom-cultivation-kit'
		],
		descriptionHtml:
			'<h2>Fresh greens in a week, no soil, no mess</h2><p>Microgreens are the highest return on the smallest space and time in all of growing — nutrient-dense greens ready to cut in 7–14 days, right on the counter. This kit stacks five reusable trays with five seed varieties (sunflower, radish, broccoli, pea shoots, wheatgrass) on tidy coconut coir mats.</p><p>No soil, no cleanup, and enough seed for ten-plus harvests. A recipe booklet helps you actually use them all.</p>',
		keyFeatures: [
			'Harvest in 7–14 days on the counter',
			'5 trays, 5 seed varieties, coir mats',
			'No soil and almost no cleanup',
			'Seed for 10+ harvests, with a recipe booklet'
		],
		stats: [
			{ value: '7–14', label: 'days seed to harvest' },
			{ value: '5', label: 'seed varieties' },
			{ value: '10+', label: 'harvests from included seed' }
		],
		specs: [
			{ label: 'Trays', value: '5 stackable BPA-free (10×20 in)' },
			{ label: 'Seeds', value: 'Sunflower, radish, broccoli, pea shoots, wheatgrass' },
			{ label: 'Medium', value: 'Coconut coir mats' },
			{ label: 'Extras', value: 'Spray bottle + recipe booklet' }
		],
		inTheBox: [
			'5 growing trays',
			'5 seed varieties',
			'Coconut coir mats',
			'Spray bottle',
			'Recipe booklet'
		],
		faqs: [
			{
				q: 'Do microgreens regrow after cutting?',
				a: 'Most do not — cut once, then reseed a fresh mat. Pea shoots sometimes give a small second cut. Staggering trays keeps a steady supply.'
			},
			{
				q: 'How much light do they need?',
				a: 'A bright windowsill is enough. More light gives stockier, greener shoots; low light makes them leggy.'
			}
		],
		testBedNote:
			'Honest note: the enemy is mold from overwatering, not underwatering. Mist to moisten, never soak, and give them airflow — a soggy tray in still air turns fuzzy fast.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Elena R.',
				rating: 5,
				title: 'Salad topping on tap',
				body: 'I stagger the five trays and always have fresh greens. Sunflower shoots are addictive. Zero mess with the coir mats.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Nate P.',
				rating: 4,
				title: 'Easy and quick',
				body: 'Great results once I stopped overwatering. Broccoli and radish are my favorites. The recipe booklet actually gets used.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'herb-spiral-garden-kit',
		sku: 'AEV-KIT-04',
		name: 'Herb Spiral Garden Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '54.99',
		assetKey: 'herbSpiralKit',
		badges: [],
		isFeatured: false,
		shortDescription: '8 herb seedlings with a spiral construction guide.',
		metaTitle: 'Herb Spiral Garden Kit | Aevani Starter Kits',
		metaDescription:
			'Eight herb seedlings with a spiral construction guide that creates sun, shade, and drainage microclimates in one compact footprint.',
		tags: [
			'starter kit',
			'herb garden',
			'herb spiral',
			'permaculture',
			'culinary herbs',
			'small space'
		],
		relatedSlugs: [
			'microgreens-growing-kit',
			'permaculture-starter-kit',
			'beneficial-insect-habitat-kit'
		],
		descriptionHtml:
			'<h2>The classic permaculture centerpiece</h2><p>An herb spiral is permaculture design you can eat: a rising coil that creates six-plus microclimates in six square feet, from dry Mediterranean at the sunny top to moisture-loving herbs at the shaded base. This kit gives you eight herb seedlings (rosemary, thyme, oregano, sage, parsley, chives, basil, cilantro), the landscape fabric, and placement cards showing exactly where each one goes.</p><p>Build it once and it feeds your kitchen for years.</p>',
		keyFeatures: [
			'Creates 6+ microclimates in just 6 sq ft',
			'8 herb seedlings matched to spiral zones',
			'Step-by-step construction guide with measurements',
			'Placement cards for water and sun preferences'
		],
		stats: [
			{ value: '6+', label: 'microclimates in one structure' },
			{ value: '8', label: 'herb seedlings' },
			{ value: '6 sq ft', label: 'total footprint' }
		],
		specs: [
			{ label: 'Herbs', value: 'Rosemary, thyme, oregano, sage, parsley, chives, basil, cilantro' },
			{ label: 'Footprint', value: '~6 sq ft' },
			{ label: 'Includes', value: 'Landscape fabric + placement cards' },
			{ label: 'Guide', value: 'Construction guide with measurements' }
		],
		inTheBox: [
			'8 herb seedling plugs',
			'Landscape fabric',
			'Placement cards',
			'Construction guide'
		],
		faqs: [
			{
				q: 'Do I supply the stone and soil?',
				a: 'Yes — the spiral is built from local stone or brick and soil you provide. The guide lists quantities so you can gather them first.'
			},
			{
				q: 'Which herbs go where?',
				a: 'Rosemary and thyme up top where it is dry and sunny; basil, parsley, and cilantro at the moist base. The cards map it out.'
			}
		],
		testBedNote:
			'Honest note: the seedlings are the easy part — the stonework takes an afternoon and a wheelbarrow of material you source locally. Budget the time, and build it near the kitchen door so you actually pick from it.',
		shippingNote: SHIP_LIVE,
		warranty: LIVE_WARRANTY,
		reviews: [
			{
				authorName: 'Sarah C.',
				rating: 5,
				title: 'Best-looking bed in my yard',
				body: 'The microclimate idea really works — my rosemary loves the dry top and the basil thrives at the base. Placement cards took the guesswork out.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Ingrid B.',
				rating: 4,
				title: 'Lovely, but plan the build',
				body: 'Seedlings were healthy. The construction is more work than I expected since you gather your own stone. Worth it once it is done.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'soil-building-amendment-kit',
		sku: 'AEV-KIT-05',
		name: 'Soil Building Amendment Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '69.99',
		assetKey: 'soilAmendmentKit',
		badges: [],
		isFeatured: false,
		shortDescription: 'Biochar, castings, rock dust, kelp, neem, mycorrhizae.',
		metaTitle: 'Soil Building Amendment Kit | Aevani Starter Kits',
		metaDescription:
			'Biochar, worm castings, rock dust, kelp, neem, and mycorrhizae in one kit to rebuild living soil. Feed the biology, not just the plant.',
		tags: [
			'starter kit',
			'soil health',
			'amendments',
			'biochar',
			'mycorrhizae',
			'regenerative'
		],
		relatedSlugs: [
			'worm-composting-vermicompost-kit',
			'composting-starter-kit',
			'permaculture-starter-kit'
		],
		descriptionHtml:
			'<h2>Feed the soil, not just the plant</h2><p>Healthy soil is a living system, and these six amendments build it: pre-charged biochar for permanent carbon and microbial habitat, worm castings for biology, glacial rock dust for trace minerals, kelp meal for growth hormones, neem cake for pest suppression, and a mycorrhizal inoculant to wire roots into the whole network.</p><p>Enough to enrich 50–100 sq ft of beds, each in a labeled bag with rates and timing. The synergy compounds year over year.</p><p>Want the why behind each one? The <a href="/learn">soil-health guide</a> breaks it down.</p>',
		keyFeatures: [
			'6 premium amendments in one curated kit',
			'Pre-charged biochar for lasting soil carbon',
			'Mycorrhizal inoculant wires roots into the soil web',
			'Covers 50–100 sq ft with rates and timing included'
		],
		stats: [
			{ value: '6', label: 'complementary amendments' },
			{ value: '50–100', label: 'sq ft enriched' },
			{ value: 'Year+', label: 'benefits that compound over seasons' }
		],
		specs: [
			{ label: 'Biochar', value: '2 lbs, pre-charged' },
			{ label: 'Worm castings', value: '4 lbs' },
			{ label: 'Rock dust', value: '3 lbs glacial' },
			{ label: 'Kelp meal', value: '2 lbs' },
			{ label: 'Neem cake', value: '1 lb' },
			{ label: 'Mycorrhizae', value: '4 oz inoculant' }
		],
		inTheBox: [
			'Pre-charged biochar (2 lbs)',
			'Worm castings (4 lbs)',
			'Glacial rock dust (3 lbs)',
			'Kelp meal (2 lbs)',
			'Neem cake (1 lb)',
			'Mycorrhizal inoculant (4 oz)',
			'Application guide'
		],
		faqs: [
			{
				q: 'Do I use all six at once?',
				a: 'Mostly yes, at planting — but the mycorrhizal inoculant must touch roots directly to work. The guide sequences each amendment.'
			},
			{
				q: 'Is uncharged biochar okay?',
				a: 'Ours is pre-charged, which matters — raw biochar can steal nutrients from soil for a season before it starts giving back.'
			}
		],
		testBedNote:
			'Honest note: mycorrhizae need root contact and hate high-phosphorus synthetic fertilizer. If you drench beds with quick-release fertilizer, you cancel the inoculant — pick one approach.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Marcus W.',
				rating: 5,
				title: 'My beds transformed',
				body: 'Second season using it and the soil is darker, spongier, and full of worms. The biochar being pre-charged is the detail that matters.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Lila F.',
				rating: 4,
				title: 'Good bundle, follow the guide',
				body: 'Convenient to get all six labeled with rates. Learned to keep the inoculant near the roots and skip the synthetic feed.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'rainwater-harvesting-kit',
		sku: 'AEV-KIT-06',
		name: 'Rainwater Harvesting Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '49.99',
		assetKey: 'rainwaterKit',
		badges: [],
		isFeatured: false,
		shortDescription: 'Downspout diverter with filter, spigot, and overflow.',
		metaTitle: 'Rainwater Harvesting Kit | Aevani Starter Kits',
		metaDescription:
			'A downspout diverter with filter, spigot, and overflow to capture roof runoff for the garden. Turn every storm into free irrigation water.',
		tags: [
			'starter kit',
			'rainwater harvesting',
			'water conservation',
			'irrigation',
			'downspout diverter',
			'drought'
		],
		relatedSlugs: [
			'season-extension-kit',
			'permaculture-starter-kit',
			'soil-building-amendment-kit'
		],
		descriptionHtml:
			'<h2>Catch what falls on your roof</h2><p>A typical roof sheds over a thousand gallons of clean water a year straight into the storm drain. This diverter kit redirects it into a barrel or cistern instead. It connects to any standard downspout, filters debris, and automatically bypasses back to the downspout when your barrel is full — so it never overflows where you do not want it.</p><p>Brass spigot, mesh filter, overflow fitting, and connector hose included. Free irrigation, one afternoon of setup.</p>',
		keyFeatures: [
			'Fits any standard round or rectangular downspout',
			'Fine mesh filter keeps debris out of your barrel',
			'Auto-bypasses to the downspout when full',
			'Saves 1,300+ gallons per year from a typical roof'
		],
		stats: [
			{ value: '1,300+', label: 'gallons captured per year' },
			{ value: '1', label: 'afternoon to install' },
			{ value: 'Auto', label: 'overflow bypass' }
		],
		specs: [
			{ label: 'Fits', value: 'Standard round or rectangular downspouts' },
			{ label: 'Filter', value: 'Fine mesh debris screen' },
			{ label: 'Spigot', value: 'Brass' },
			{ label: 'Hose', value: '6 ft flexible connector' },
			{ label: 'Overflow', value: 'Auto-bypass fitting' }
		],
		inTheBox: [
			'Universal diverter valve',
			'Mesh debris filter',
			'Overflow fitting',
			'Brass spigot',
			'6 ft connector hose',
			'Teflon tape'
		],
		faqs: [
			{
				q: 'Does it include the barrel?',
				a: 'No — use any food-safe barrel or cistern. The kit connects your downspout to whatever storage you choose.'
			},
			{
				q: 'Is the water safe for my garden?',
				a: 'Roof runoff is fine for irrigating ornamentals and established plants. For edibles, water the soil rather than the leaves.'
			}
		],
		testBedNote:
			'Honest note: mosquitoes love an open barrel. Keep the inlet screened and toss in a mosquito dunk in summer — the filter stops leaves, not egg-laying insects.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Grace L.',
				rating: 5,
				title: 'Free water for the beds',
				body: 'Installed in an afternoon onto my existing downspout. Fills a 55-gallon barrel in one good storm. The auto-bypass means no messy overflow.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Wes A.',
				rating: 4,
				title: 'Works well, screen the barrel',
				body: 'Diverter is solid and the fittings sealed easily. Add a screen and a dunk or you will grow mosquitoes along with tomatoes.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'season-extension-kit',
		sku: 'AEV-KIT-07',
		name: 'Season Extension Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '59.99',
		assetKey: 'seasonExtensionKit',
		badges: [],
		isFeatured: false,
		shortDescription: 'Row covers and hoops for 4–8 more growing weeks.',
		metaTitle: 'Season Extension Kit | Aevani Starter Kits',
		metaDescription:
			'Row covers and hoops that add 4–8 growing weeks by protecting crops from frost and pests. Start earlier and harvest later each season.',
		tags: [
			'starter kit',
			'season extension',
			'row cover',
			'frost protection',
			'cold weather',
			'yield'
		],
		relatedSlugs: [
			'rainwater-harvesting-kit',
			'microgreens-growing-kit',
			'permaculture-starter-kit'
		],
		descriptionHtml:
			'<h2>Steal weeks from both ends of the season</h2><p>A few degrees of frost protection is the difference between a garden that quits in October and one that keeps going into December. This kit gives you ten galvanized hoops, twenty feet of row-cover fabric, ground staples, and a soil thermometer — enough to build low tunnels that hold off frost to 28°F while letting light and rain through.</p><p>Start earlier in spring, harvest later in fall, on the same beds.</p>',
		keyFeatures: [
			'Extends the season 4–8 weeks on each end',
			'Protects to 28°F while passing light and rain',
			'10 galvanized hoops + 20 ft of row cover',
			'Includes a soil thermometer and planting calendar'
		],
		stats: [
			{ value: '4–8', label: 'extra growing weeks' },
			{ value: '28°F', label: 'frost protection' },
			{ value: '10', label: 'reusable galvanized hoops' }
		],
		specs: [
			{ label: 'Hoops', value: '10 galvanized wire' },
			{ label: 'Fabric', value: '20 ft row cover' },
			{ label: 'Staples', value: '20 ground staples' },
			{ label: 'Extras', value: 'Soil thermometer + planting calendar' }
		],
		inTheBox: [
			'10 galvanized hoops',
			'20 ft row-cover fabric',
			'20 ground staples',
			'Soil thermometer',
			'Planting calendar'
		],
		faqs: [
			{
				q: 'Does row cover need to come off to water?',
				a: 'No — the fabric is permeable, so rain and irrigation pass right through. Vent it on warm sunny days so plants do not overheat.'
			},
			{
				q: 'Can it stop a hard freeze?',
				a: 'It buys a few degrees, good to about 28°F. For a deep freeze, double the layer or add a second cover.'
			}
		],
		testBedNote:
			'Honest note: on a sunny winter day a closed tunnel can cook to summer temperatures. Vent the ends when the sun is out, or you will bake the greens you are trying to protect.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Tom B.',
				rating: 5,
				title: 'Greens into December',
				body: 'Threw the tunnels over my spinach and kale and kept harvesting past the first frosts. Hoops are sturdy and reusable.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Pam R.',
				rating: 4,
				title: 'Works, remember to vent',
				body: 'Great for spring starts. Learned quickly to open the ends on sunny days after cooking a row of lettuce.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'beneficial-insect-habitat-kit',
		sku: 'AEV-KIT-08',
		name: 'Beneficial Insect Habitat Kit',
		system: 'kits',
		categorySlug: 'starter-kits',
		subCategory: 'Starter kits',
		price: '59.99',
		assetKey: 'beneficialInsectKit',
		badges: [],
		isFeatured: false,
		shortDescription: 'Bee house, shelters, flower seeds, and an ID guide.',
		metaTitle: 'Beneficial Insect Habitat Kit | Aevani Starter Kits',
		metaDescription:
			'A bee house, insect shelters, native flower seeds, and an ID guide to invite pollinators and pest predators. Build natural pest control.',
		tags: [
			'starter kit',
			'beneficial insects',
			'pollinators',
			'bee house',
			'natural pest control',
			'biodiversity'
		],
		relatedSlugs: [
			'herb-spiral-garden-kit',
			'permaculture-starter-kit',
			'season-extension-kit'
		],
		descriptionHtml:
			'<h2>Let the good bugs do the pest control</h2><p>A garden with the right insects mostly defends itself. This kit builds habitat for the allies: a mason bee house for 60+ tubes, a ladybug and lacewing shelter, a ceramic butterfly puddling dish, and five packets of insect-attracting flowers. An illustrated guide helps you tell the 30 common garden insects that help from the ones that hurt.</p><p>Fewer sprays, more pollinators, a garden that balances itself.</p>',
		keyFeatures: [
			'Mason bee house holds 60+ nesting tubes',
			'Ladybug and lacewing overwintering shelter',
			'5 packets of beneficial-attracting flower seeds',
			'30-species illustrated identification guide'
		],
		stats: [
			{ value: '60+', label: 'mason bee nesting tubes' },
			{ value: '5', label: 'flower seed packets' },
			{ value: '30', label: 'insects in the ID guide' }
		],
		specs: [
			{ label: 'Bee house', value: '60+ tube capacity' },
			{ label: 'Shelter', value: 'Ladybug / lacewing habitat' },
			{ label: 'Dish', value: 'Ceramic butterfly puddler' },
			{ label: 'Seeds', value: '5 beneficial-attracting flower packets' },
			{ label: 'Guide', value: '30-species identification guide' }
		],
		inTheBox: [
			'Mason bee house',
			'Ladybug / lacewing shelter',
			'Ceramic puddling dish',
			'5 flower seed packets',
			'Insect ID guide'
		],
		faqs: [
			{
				q: 'Where should I hang the bee house?',
				a: 'East or southeast facing, morning sun, about 5 ft up, sheltered from rain. The guide has placement diagrams.'
			},
			{
				q: 'Do I need to maintain the bee house?',
				a: 'Yes — replace or clean the tubes yearly to prevent mites and disease. Reusable liners make this easy.'
			}
		],
		testBedNote:
			'Honest note: a neglected bee house becomes a disease trap. If you will not clean the tubes each year, skip the bees and just plant the flowers — habitat you do not maintain can do more harm than good.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Aisha O.',
				rating: 5,
				title: 'Mason bees moved right in',
				body: 'Within a month tubes were being capped. The flower seeds brought in ladybugs and my aphid problem vanished. Lovely, useful kit.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Kurt D.',
				rating: 4,
				title: 'Great, commit to the cleaning',
				body: 'Everything is well made. The ID guide is genuinely handy. Just be ready to clean the tubes annually or the note is right — skip the bees.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'worm-composting-vermicompost-kit',
		sku: 'AEV-KIT-09',
		name: 'Worm Composting Kit',
		system: 'kits',
		categorySlug: 'composting',
		subCategory: 'Composting',
		price: '54.99',
		assetKey: 'wormCompostingKit',
		badges: [],
		isFeatured: false,
		shortDescription: '3-tray stackable worm farm with spigot and bedding.',
		metaTitle: 'Worm Composting Vermicompost Kit | Aevani Composting',
		metaDescription:
			'A 3-tray stackable worm farm with spigot and bedding to turn kitchen scraps into rich vermicompost and worm-tea fertilizer indoors.',
		tags: [
			'composting',
			'vermicompost',
			'worm farm',
			'kitchen scraps',
			'soil health',
			'indoor'
		],
		relatedSlugs: [
			'composting-starter-kit',
			'soil-building-amendment-kit',
			'permaculture-starter-kit'
		],
		descriptionHtml:
			'<h2>Kitchen scraps into black gold</h2><p>A worm farm is the most apartment-friendly composting there is: quiet, odorless when run right, and endlessly productive. This three-tray system lets worms migrate upward as each tray fills, so you harvest finished castings from the bottom without sorting. The base spigot draws off worm tea for your plants.</p><p>Add a pound of red wigglers (sold separately) and start diverting waste within a week.</p>',
		keyFeatures: [
			'3-tray migrating system — harvest without sorting',
			'Base spigot for liquid worm tea',
			'Compact enough for apartments and balconies',
			'Odorless when balanced'
		],
		stats: [
			{ value: '3', label: 'stacking trays' },
			{ value: '1 wk', label: 'to start diverting scraps' },
			{ value: '0', label: 'odor when run correctly' }
		],
		specs: [
			{ label: 'Trays', value: '3 stacking + collection base' },
			{ label: 'Spigot', value: 'Worm-tea drain' },
			{ label: 'Bedding', value: 'Coir block included' },
			{ label: 'Worms', value: 'Red wigglers sold separately' },
			{ label: 'Footprint', value: 'Apartment-friendly' }
		],
		inTheBox: [
			'3 stacking trays',
			'Collection base with spigot',
			'Coir bedding block',
			'Moisture mat',
			'Startup guide'
		],
		faqs: [
			{
				q: 'Does it smell?',
				a: 'A healthy bin smells earthy, not foul. Odor means too much wet food or not enough bedding — the guide troubleshoots it.'
			},
			{
				q: 'Do the worms come with it?',
				a: 'No — add about a pound of red wigglers separately. Feed lightly the first week while they settle in.'
			}
		],
		testBedNote:
			'Honest note: worms eat far less than people expect at first. Overloading a new bin with scraps is the fast track to a sour, fly-ridden mess — start light and let the population grow into the volume.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Priya S.',
				rating: 5,
				title: 'No smell, great castings',
				body: 'Set it up on my balcony and it just works. The migrating trays make harvesting effortless and the worm tea supercharges my herbs.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Hugo M.',
				rating: 4,
				title: 'Start slow',
				body: 'Overfed mine at first and it got sour. Backed off, added bedding, and it recovered. Now it hums along. Good design.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'composting-starter-kit',
		sku: 'AEV-KIT-10',
		name: 'Composting Starter Kit',
		system: 'kits',
		categorySlug: 'composting',
		subCategory: 'Composting',
		price: '44.99',
		assetKey: 'compostingStarterKit',
		badges: [],
		isFeatured: false,
		shortDescription: 'Countertop bin with thermometer, aerator, and guide.',
		metaTitle: 'Composting Starter Kit | Aevani Composting',
		metaDescription:
			'A countertop compost bin with thermometer, aerator, and guide to start recycling food waste into finished compost. Composting made foolproof.',
		tags: [
			'composting',
			'countertop bin',
			'food waste',
			'soil health',
			'beginner-friendly',
			'kitchen'
		],
		relatedSlugs: [
			'worm-composting-vermicompost-kit',
			'soil-building-amendment-kit',
			'permaculture-starter-kit'
		],
		descriptionHtml:
			'<h2>Composting without the ick</h2><p>Most people quit composting over smell and fruit flies. This kit solves both: a stainless countertop bin with a charcoal-filter lid holds three or four days of scraps odor-free before you carry them out. A compost thermometer and stainless aerator help you manage the outdoor pile, and a laminated browns-and-greens guide keeps the ratio right.</p><p>The clean, tidy on-ramp to closing your kitchen-to-garden loop.</p>',
		keyFeatures: [
			'Charcoal-filter countertop bin stays odor-free',
			'Compost thermometer to manage the pile',
			'Stainless aerating tool',
			'Laminated browns-and-greens ratio guide'
		],
		stats: [
			{ value: '1.3 gal', label: 'countertop bin capacity' },
			{ value: '6 mo', label: 'charcoal filter life' },
			{ value: '0–200°F', label: 'thermometer range' }
		],
		specs: [
			{ label: 'Bin', value: '1.3 gal stainless, charcoal-filter lid' },
			{ label: 'Thermometer', value: '0–200°F compost probe' },
			{ label: 'Aerator', value: 'Stainless steel' },
			{ label: 'Guide', value: 'Laminated browns/greens ratio card' }
		],
		inTheBox: [
			'Stainless countertop bin',
			'Charcoal filter',
			'Compost thermometer',
			'Aerating tool',
			'Browns & greens guide'
		],
		faqs: [
			{
				q: 'How often do I empty the countertop bin?',
				a: 'Every 3–4 days keeps it fresh. The charcoal filter handles odor between trips to the outdoor pile.'
			},
			{
				q: 'Do I need an outdoor pile too?',
				a: 'The countertop bin is a holding step — scraps finish composting in an outdoor pile or tumbler. The guide covers building one.'
			}
		],
		testBedNote:
			'Honest note: the countertop bin holds scraps, it does not compost them. Empty it into a real pile or tumbler within a few days, or the filter will lose the battle with a week of wet food.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Elena R.',
				rating: 4,
				title: 'Keeps the kitchen tidy',
				body: 'The filter really does control odor between trips out. Thermometer helped me get my pile hot enough to break down fast. Good starter.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Sam T.',
				rating: 4,
				title: 'Does what it says',
				body: 'Nice stainless bin and the ratio guide took the mystery out of it. Just remember it is a holding bin, not the compost itself.',
				isVerifiedPurchase: true
			}
		]
	},

	// ============================ SEEDS & SUPPLIES ============================
	{
		slug: 'heirloom-seed-vault',
		sku: 'AEV-SUP-01',
		name: 'Heirloom Seed Vault',
		system: 'supplies',
		categorySlug: 'heirloom-seeds',
		subCategory: 'Heirloom seeds',
		price: '89.99',
		assetKey: 'heirloomSeedVault',
		badges: [],
		isFeatured: false,
		shortDescription: '40 varieties in a moisture-proof vault with planting guide.',
		metaTitle: 'Heirloom Seed Vault (40 varieties) | Aevani Seeds',
		metaDescription:
			'Forty open-pollinated heirloom vegetable varieties in a moisture-proof vault with a planting guide. A resilient seed library for any grower.',
		tags: [
			'seeds',
			'heirloom',
			'open-pollinated',
			'seed vault',
			'food security',
			'non-gmo'
		],
		relatedSlugs: [
			'artisan-seed-packet-collection',
			'heirloom-tomato-collection',
			'seed-saving-starter-kit'
		],
		descriptionHtml:
			'<h2>A seed library for food security</h2><p>Forty open-pollinated heirloom varieties — vegetables, herbs, and flowers spanning every season and zone — sealed in moisture-proof pouches inside a durable metal tin. From cold-hardy kale to heat-loving okra, each packet is dated and tested for 90%+ germination.</p><p>Because they are open-pollinated, you can save seed year after year. A 60-page companion and succession planting guide turns the vault into a real garden plan.</p>',
		keyFeatures: [
			'40 open-pollinated heirloom varieties',
			'Moisture-proof pouches in a durable metal tin',
			'90%+ germination, each packet dated',
			'Save seed year after year'
		],
		stats: [
			{ value: '40', label: 'seed varieties' },
			{ value: '90%+', label: 'tested germination' },
			{ value: '60', label: 'pages of planting guidance' }
		],
		specs: [
			{ label: 'Varieties', value: '40 (vegetables, herbs, flowers)' },
			{ label: 'Type', value: 'Open-pollinated, non-GMO' },
			{ label: 'Storage', value: 'Moisture-proof pouches + metal tin' },
			{ label: 'Germination', value: '90%+ tested' },
			{ label: 'Guide', value: '60-page companion + succession guide' }
		],
		inTheBox: [
			'40 heirloom seed packets',
			'Moisture-proof storage tin',
			'Resealable pouches',
			'60-page planting guide'
		],
		faqs: [
			{
				q: 'How long will the seeds stay viable?',
				a: 'Stored cool and dry in the sealed tin, most stay viable 3–5 years, some far longer. The guide lists per-crop storage life.'
			},
			{
				q: 'Can I really save my own seed?',
				a: 'Yes — all 40 are open-pollinated, so saved seed grows true. The guide covers basic seed-saving for each type.'
			}
		],
		testBedNote:
			'Honest note: it is a broad library, not a curated regional selection. Some of the 40 will suit your climate better than others — plant widely the first year and let your garden tell you which to save.',
		shippingNote: SHIP_STANDARD,
		warranty: SEEDS_WARRANTY,
		reviews: [
			{
				authorName: 'Aisha O.',
				rating: 5,
				title: 'Peace of mind and great germination',
				body: 'Planted a dozen varieties this year and nearly everything came up. Love that I can save seed. The tin keeps the rest safe.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Grover P.',
				rating: 4,
				title: 'Great range',
				body: 'Forty varieties is generous. A few were not ideal for my hot climate, but that is expected. The guide is genuinely useful.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'artisan-seed-packet-collection',
		sku: 'AEV-SUP-02',
		name: 'Artisan Seed Packet Collection',
		system: 'supplies',
		categorySlug: 'heirloom-seeds',
		subCategory: 'Heirloom seeds',
		price: '49.99',
		assetKey: 'artisanSeedPacket',
		badges: ['GIFT'],
		isFeatured: false,
		shortDescription: '20 heirloom varieties in a vintage storage box.',
		metaTitle: 'Artisan Seed Packet Collection | Aevani Seeds',
		metaDescription:
			'Twenty heirloom varieties in beautifully illustrated packets inside a vintage storage box. A giftable collection for the heritage gardener.',
		tags: [
			'seeds',
			'heirloom',
			'seed collection',
			'gift',
			'illustrated packets',
			'non-gmo'
		],
		relatedSlugs: [
			'heirloom-seed-vault',
			'heirloom-tomato-collection',
			'pollinator-garden-seed-collection'
		],
		descriptionHtml:
			'<h2>Seeds worth displaying</h2><p>Twenty rare and unusual heirloom varieties in packets that are small works of art — original botanical illustrations wrapping seeds you will not find at a big-box store. Moon and Stars watermelon, Lemon cucumber, Dragon Tongue beans, and more, all certified organic, non-GMO, and germination-tested.</p><p>They come in a vintage-inspired wooden box with dividers, so it is a gift, a keepsake, and a genuine garden all at once.</p>',
		keyFeatures: [
			'20 rare, open-pollinated heirloom varieties',
			'Original botanical-illustration packets',
			'Certified organic and non-GMO',
			'Vintage wooden storage box with dividers'
		],
		stats: [
			{ value: '20', label: 'rare heirloom varieties' },
			{ value: '90%+', label: 'tested germination' },
			{ value: '1', label: 'keepsake wooden box' }
		],
		specs: [
			{ label: 'Varieties', value: '20 rare heirlooms' },
			{ label: 'Type', value: 'Certified organic, non-GMO, open-pollinated' },
			{ label: 'Packaging', value: 'Botanical-illustration packets' },
			{ label: 'Box', value: 'Vintage wooden storage box with dividers' }
		],
		inTheBox: [
			'20 heirloom seed packets',
			'Wooden storage box',
			'Dividers + blank labels'
		],
		faqs: [
			{
				q: 'Are these good varieties or just pretty packets?',
				a: 'Both — the varieties are chosen for flavor and rarity, not just looks. The illustrations are a bonus, not the point.'
			},
			{
				q: 'Is it a good gift for an experienced gardener?',
				a: 'Very — the unusual varieties are exactly what seasoned growers get excited about, and the box outlasts the seeds.'
			}
		],
		testBedNote:
			'Honest note: these are collector varieties, some quirky to grow (Moon and Stars watermelon needs a long, warm season). Read each packet — a few want more heat or space than a short-season garden gives.',
		shippingNote: SHIP_STANDARD,
		warranty: SEEDS_WARRANTY,
		reviews: [
			{
				authorName: 'Sarah C.',
				rating: 5,
				title: 'Gorgeous and grows well',
				body: 'Gave it as a gift and almost kept it. The Dragon Tongue beans were a hit and the box is beautiful on the shelf.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Bram K.',
				rating: 4,
				title: 'Fun varieties',
				body: 'Loved trying the Lemon cucumbers. A couple of the varieties wanted a longer season than I have, but that is on my climate.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'heirloom-tomato-collection',
		sku: 'AEV-SUP-03',
		name: 'Heirloom Tomato Collection',
		system: 'supplies',
		categorySlug: 'heirloom-seeds',
		subCategory: 'Heirloom seeds',
		price: '34.99',
		compareAt: '44.99',
		assetKey: 'heirloomTomato',
		galleryAssetKeys: ['seedGeneric', 'edCompanion'],
		badges: ['BESTSELLER'],
		isFeatured: true,
		shortDescription: '6 heritage varieties, 25+ seeds each, with guides.',
		metaTitle: 'Heirloom Tomato Collection | Aevani Seeds',
		metaDescription:
			'Six heritage tomato varieties with 25+ seeds each and growing guides. From Brandywine to Cherokee Purple — flavor you cannot buy at a store.',
		tags: [
			'seeds',
			'heirloom tomatoes',
			'tomato varieties',
			'vegetable garden',
			'non-gmo',
			'flavor'
		],
		relatedSlugs: [
			'heirloom-seed-vault',
			'artisan-seed-packet-collection',
			'seed-saving-starter-kit'
		],
		descriptionHtml:
			'<h2>Tomatoes worth saving</h2><p>Supermarket tomatoes are bred to ship, not to taste. Heirlooms are the opposite — bred by generations of gardeners for flavor, and this collection carries six of the best: <strong>Brandywine, Cherokee Purple, Green Zebra, San Marzano, Yellow Pear, and Black Krim</strong>. Each packet holds 25+ open-pollinated seeds, so you can save your own year after year.</p><p>Between them you get a slicer, a sauce tomato, a snacking type, and colors from deep purple to green-striped — a whole summer of the tomatoes you cannot buy. Detailed growing guides and companion-planting charts come in the box.</p><p>These are the flavors that make people who "do not like tomatoes" change their minds. Warm from the vine, they are a different fruit than anything at the store.</p><p>New to starting seed? The <a href="/learn">Aevani learning hub</a> has a companion-planting guide that pairs perfectly.</p>',
		keyFeatures: [
			'6 heritage varieties: Brandywine, Cherokee Purple, Green Zebra, San Marzano, Yellow Pear, Black Krim',
			'25+ open-pollinated seeds per packet',
			'Save your own seed year after year',
			'Growing guides + companion-planting charts included'
		],
		stats: [
			{ value: '6', label: 'heritage tomato varieties' },
			{ value: '25+', label: 'seeds per packet' },
			{ value: '150+', label: 'seeds total across the collection' }
		],
		specs: [
			{ label: 'Varieties', value: 'Brandywine, Cherokee Purple, Green Zebra, San Marzano, Yellow Pear, Black Krim' },
			{ label: 'Seeds', value: '25+ per packet' },
			{ label: 'Type', value: 'Open-pollinated, non-GMO' },
			{ label: 'Days to maturity', value: '65–85 depending on variety' },
			{ label: 'Includes', value: 'Growing guide + companion-planting chart' }
		],
		inTheBox: [
			'Brandywine seed packet',
			'Cherokee Purple seed packet',
			'Green Zebra seed packet',
			'San Marzano seed packet',
			'Yellow Pear seed packet',
			'Black Krim seed packet',
			'Growing + companion-planting guide'
		],
		faqs: [
			{
				q: 'When should I start these indoors?',
				a: 'Start 6–8 weeks before your last frost, then transplant once nights stay above 50°F. The guide has a timing chart.'
			},
			{
				q: 'Are heirlooms harder to grow than hybrids?',
				a: 'They can be a touch more disease-prone, but good spacing and airflow handle it. The reward in flavor is worth the small extra care.'
			},
			{
				q: 'Which is best for sauce?',
				a: 'San Marzano — it is the classic paste tomato, meaty and low-moisture. Brandywine and Cherokee Purple are your slicers.'
			}
		],
		testBedNote:
			'Honest note: heirloom tomatoes crack more than hybrids after heavy rain, and Brandywine yields fewer, bigger fruit than a supermarket hybrid ever would. You trade quantity and shelf-perfection for flavor that is genuinely in another league.',
		shippingNote: SHIP_STANDARD,
		warranty: SEEDS_WARRANTY,
		bundleOffer: {
			title: "Seed Saver's Bundle",
			price: '59.99',
			compareAt: '69.98',
			blurb: 'Add the Seed Saving Starter Kit — save your own heirloom tomato seed this fall.'
		},
		reviews: [
			{
				authorName: 'Sarah C.',
				rating: 5,
				title: 'Converted my tomato-hating husband',
				body: 'The Cherokee Purple warm off the vine ended a 20-year "I do not like tomatoes." Every variety germinated and the flavor is unreal.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Elena R.',
				rating: 5,
				title: 'Best sauce I have made',
				body: 'The San Marzanos alone were worth it. Thick, meaty, low water. Already saving seed for next year like the guide shows.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Nadia B.',
				rating: 4,
				title: 'Incredible flavor, some cracking',
				body: 'Just as the note warns, the Brandywines cracked after a rainy spell. Still the best tomatoes I have grown. Would buy again.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Marcus W.',
				rating: 5,
				title: 'Six for the price of one supermarket flat',
				body: 'Great germination across all six. The Green Zebra is a conversation piece at the market. Guides are clear and useful.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'pollinator-garden-seed-collection',
		sku: 'AEV-SUP-04',
		name: 'Pollinator Garden Collection',
		system: 'supplies',
		categorySlug: 'seeds-plants',
		subCategory: 'Seeds & plants',
		price: '28.99',
		assetKey: 'pollinatorCollection',
		badges: [],
		isFeatured: false,
		shortDescription: '18 native wildflowers covering 200 sq ft.',
		metaTitle: 'Pollinator Garden Seed Collection | Aevani Seeds',
		metaDescription:
			'Eighteen native wildflower species covering 200 sq ft to feed bees, butterflies, and beneficial insects from spring through fall.',
		tags: [
			'seeds',
			'pollinator garden',
			'native wildflowers',
			'bees & butterflies',
			'habitat',
			'biodiversity'
		],
		relatedSlugs: [
			'heirloom-seed-vault',
			'seed-saving-starter-kit',
			'artisan-seed-packet-collection'
		],
		descriptionHtml:
			'<h2>Feed the bees, feed everything</h2><p>Pollinators are in trouble, and a patch of the right native flowers is one of the most useful things a gardener can plant. This regionally adapted mix carries 18 native species — milkweed, bee balm, echinacea, black-eyed susan, wild bergamot, and more — enough to cover 200 square feet with continuous bloom from spring through fall.</p><p>It supports monarch corridors, feeds native bees, and looks beautiful doing it.</p>',
		keyFeatures: [
			'18 native wildflower species',
			'Covers 200 sq ft',
			'Continuous bloom spring through fall',
			'Supports monarchs and native bees'
		],
		stats: [
			{ value: '18', label: 'native species' },
			{ value: '200', label: 'sq ft of coverage' },
			{ value: '3', label: 'seasons of continuous bloom' }
		],
		specs: [
			{ label: 'Species', value: '18 natives incl. milkweed, bee balm, echinacea' },
			{ label: 'Coverage', value: '200 sq ft' },
			{ label: 'Bloom', value: 'Spring through fall (seasonal chart)' },
			{ label: 'Type', value: 'Native, non-GMO' }
		],
		inTheBox: [
			'18-species wildflower seed mix',
			'Seasonal bloom chart',
			'Sowing instructions'
		],
		faqs: [
			{
				q: 'When and how do I sow it?',
				a: 'Sow in fall or early spring onto cleared soil, press in, and keep moist until established. Many natives need a cold period, which fall sowing provides.'
			},
			{
				q: 'Will it come back every year?',
				a: 'Yes — the mix includes perennials and self-seeding annuals, so it fills in and returns. It looks sparse year one, then thrives.'
			}
		],
		testBedNote:
			'Honest note: native wildflowers are slow the first year — they build roots before they show off. Do not judge the patch until year two, and resist mowing it down when it looks weedy early on.',
		shippingNote: SHIP_STANDARD,
		warranty: SEEDS_WARRANTY,
		reviews: [
			{
				authorName: 'Aisha O.',
				rating: 5,
				title: 'Alive with bees by summer',
				body: 'Sowed in fall, quiet in spring, then exploded. Monarchs found the milkweed and the whole patch hums. Patience paid off.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Colin R.',
				rating: 4,
				title: 'Give it time',
				body: 'Year one looked like weeds and I nearly gave up. Year two is gorgeous and full of pollinators. The note is right — wait for it.',
				isVerifiedPurchase: false
			}
		]
	},
	{
		slug: 'seed-saving-starter-kit',
		sku: 'AEV-SUP-05',
		name: 'Seed Saving Starter Kit',
		system: 'supplies',
		categorySlug: 'seeds-plants',
		subCategory: 'Seeds & plants',
		price: '34.99',
		assetKey: 'seedSavingKit',
		badges: [],
		isFeatured: false,
		shortDescription: 'Everything to save and store seeds, in a wooden box.',
		metaTitle: 'Seed Saving Starter Kit | Aevani Seeds',
		metaDescription:
			'Everything to harvest, dry, and store true-to-type seed, packed in a wooden box. Close the loop and build your own seed library.',
		tags: [
			'seeds',
			'seed saving',
			'seed storage',
			'self-sufficiency',
			'heirloom',
			'beginner-friendly'
		],
		relatedSlugs: [
			'heirloom-seed-vault',
			'pollinator-garden-seed-collection',
			'hand-forged-garden-trowel'
		],
		descriptionHtml:
			'<h2>Close the loop</h2><p>Saving seed is how gardeners become self-reliant — and how varieties adapt to your specific garden over the years. This kit gives you the tools and the know-how: seed envelopes, desiccant packets, labels, a magnifying glass, tweezers, and a vintage wooden storage box with dividers.</p><p>The field guide covers collection timing, drying, and storage for 50+ common garden varieties, so you never have to buy the same seed twice.</p>',
		keyFeatures: [
			'Complete seed-saving toolkit',
			'Field guide for 50+ garden varieties',
			'Desiccant packets keep seed dry and viable',
			'Vintage wooden storage box with dividers'
		],
		stats: [
			{ value: '50+', label: 'varieties in the saving guide' },
			{ value: '1', label: 'wooden storage box' },
			{ value: 'Years', label: 'of viability with proper drying' }
		],
		specs: [
			{ label: 'Storage', value: 'Wooden box with dividers' },
			{ label: 'Supplies', value: 'Envelopes, labels, desiccant packets' },
			{ label: 'Tools', value: 'Magnifying glass + tweezers' },
			{ label: 'Guide', value: '50+ variety seed-saving field guide' }
		],
		inTheBox: [
			'Seed envelopes',
			'Desiccant packets',
			'Labels',
			'Magnifying glass',
			'Tweezers',
			'Wooden storage box',
			'Seed-saving field guide'
		],
		faqs: [
			{
				q: 'Can I save seed from any plant?',
				a: 'From open-pollinated and heirloom varieties, yes — they grow true. Hybrids (F1) do not, so the guide flags which is which.'
			},
			{
				q: 'How dry does seed need to be?',
				a: 'Bone dry — that is what the desiccant is for. Seed stored even slightly damp molds or loses viability fast.'
			}
		],
		testBedNote:
			'Honest note: drying is where saved seed lives or dies. Rushing damp seed into storage is the top cause of failure — give it a week of airflow and use the desiccant, every time.',
		shippingNote: SHIP_STANDARD,
		warranty: KIT_WARRANTY,
		reviews: [
			{
				authorName: 'Aisha O.',
				rating: 5,
				title: 'Made seed saving click',
				body: 'The guide answered every question about timing and drying. Saved tomato and bean seed this year and the box keeps it all organized.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Ted M.',
				rating: 4,
				title: 'Handy little kit',
				body: 'Nice box and useful guide. The desiccant packets are the real MVP — my first batch molded before I used them properly.',
				isVerifiedPurchase: true
			}
		]
	},
	{
		slug: 'hand-forged-garden-trowel',
		sku: 'AEV-SUP-06',
		name: 'Hand-Forged Garden Trowel',
		system: 'supplies',
		categorySlug: 'hand-tools',
		subCategory: 'Hand tools',
		price: '42.00',
		assetKey: 'handTrowel',
		badges: ['LIFETIME'],
		isFeatured: false,
		shortDescription: 'High-carbon steel with an ash handle and depth marks.',
		metaTitle: 'Hand-Forged Garden Trowel | Aevani Hand Tools',
		metaDescription:
			'A high-carbon steel trowel with an ash handle and depth marks, forged to last a lifetime. An heirloom hand tool that gets better with use.',
		tags: [
			'hand tools',
			'garden trowel',
			'hand-forged',
			'high-carbon steel',
			'lifetime tool',
			'gift'
		],
		relatedSlugs: [
			'seed-saving-starter-kit',
			'heirloom-seed-vault',
			'artisan-seed-packet-collection'
		],
		descriptionHtml:
			'<h2>The last trowel you will buy</h2><p>Most trowels bend on the first rocky bed. This one is forged by hand from high-carbon steel with a full tang running through a turned ash handle — the construction that lets it lever out roots and rocks without folding. Depth markings on the blade turn planting into a measurement instead of a guess.</p><p>Each piece carries the hammer marks of the forge, so no two are identical. Buy it once; hand it down.</p>',
		keyFeatures: [
			'Hand-forged high-carbon steel, full tang',
			'Turned ash-wood handle',
			'Depth markings for precise planting',
			'Built to last generations'
		],
		stats: [
			{ value: 'Full-tang', label: 'construction — no bending or wobble' },
			{ value: 'Lifetime', label: 'built to hand down' },
			{ value: '1-of-1', label: 'unique hammer marks on every piece' }
		],
		specs: [
			{ label: 'Blade', value: 'High-carbon steel, depth-marked' },
			{ label: 'Handle', value: 'Turned ash wood' },
			{ label: 'Construction', value: 'Full tang' },
			{ label: 'Extras', value: 'Leather hanging loop' },
			{ label: 'Finish', value: 'Hand-forged, hammer-marked' }
		],
		inTheBox: [
			'Hand-forged trowel',
			'Leather hanging loop',
			'Care card'
		],
		faqs: [
			{
				q: 'Does high-carbon steel rust?',
				a: 'It can if left wet — that is the trade for a blade that holds an edge and stays stiff. Wipe it dry and oil it occasionally and it lasts a lifetime.'
			},
			{
				q: 'Is it heavy?',
				a: 'It has real heft — that mass is what powers through hard soil. Most people find it reassuring rather than tiring.'
			}
		],
		testBedNote:
			'Honest note: this is carbon steel, not stainless. Leave it out in the rain and it will spot with surface rust. Ten seconds with a rag after use is the whole maintenance — do that and it outlives you.',
		shippingNote: SHIP_STANDARD,
		warranty: TOOL_WARRANTY,
		reviews: [
			{
				authorName: 'Marcus W.',
				rating: 5,
				title: 'Feels like an heirloom already',
				body: 'Heavy, balanced, and it laughs at the rocky soil that bent my old trowel. The depth marks are more useful than I expected.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Sarah C.',
				rating: 5,
				title: 'Worth every penny',
				body: 'Beautiful tool that works as good as it looks. Keep it dry and oiled. I gave one to my dad and kept one for myself.',
				isVerifiedPurchase: true
			},
			{
				authorName: 'Owen D.',
				rating: 4,
				title: 'Great tool, mind the rust',
				body: 'Superb in the ground. Docking nothing on quality — just know it is carbon steel and needs a wipe-down. Left it out once and learned my lesson.',
				isVerifiedPurchase: false
			}
		]
	}
];

// ---------- derived helpers (shared by seed + upsert) ----------

/** Compute review summary from a product's reviews. */
export function computeRatingSummary(reviews: DemoReview[]): {
	ratingAverage: string | null;
	reviewCount: number;
} {
	if (!reviews.length) {
		return { ratingAverage: null, reviewCount: 0 };
	}
	const sum = reviews.reduce((total, r) => total + r.rating, 0);
	const avg = sum / reviews.length;
	return { ratingAverage: avg.toFixed(2), reviewCount: reviews.length };
}

/** Resolve a demo product's primary + gallery asset keys to `/assets/...` URLs. */
export function resolveAssetUrls(product: DemoProduct): string[] {
	const keys = [product.assetKey, ...(product.galleryAssetKeys ?? [])];
	const urls: string[] = [];
	for (const key of keys) {
		const url = assetManifest[key];
		if (url && !urls.includes(url)) {
			urls.push(url);
		}
	}
	return urls;
}

/** `/assets/foo.png` (or `assets/foo.png`) -> `assets/foo.png` bucket path. */
export function assetUrlToBucketPath(assetUrl: string): string {
	return `assets/${assetUrl.replace(/^\/?assets\//, '')}`;
}

/**
 * Deterministic non-authored product columns (cost, stock, tags, meta) so the
 * seed and the prod-safe upsert produce identical rows.
 */
export function deriveProductColumns(product: DemoProduct): {
	costPrice: string;
	stockQuantity: number;
	tags: string[];
	metaTitle: string;
	metaDescription: string;
} {
	const priceNum = Number.parseFloat(product.price);
	const costPrice = (priceNum * 0.42).toFixed(2);
	const stockQuantity = Math.max(8, Math.round(4000 / priceNum));
	// tags/metaTitle/metaDescription are authored per product on the dataset itself.
	return {
		costPrice,
		stockQuantity,
		tags: product.tags,
		metaTitle: product.metaTitle,
		metaDescription: product.metaDescription
	};
}
