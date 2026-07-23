// Canonical demo LMS dataset (4 courses + categories + tags). Single source of
// truth shared by the destructive UAT seed (seed.ts) and the prod-safe idempotent
// upsert (scripts/demo-lms-upsert.ts). Bodies are short, plain, brand-voice.

export interface LmsCourseDef {
	title: string;
	slug: string;
	description: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	durationEstimate: number;
	isFeatured: boolean;
	categorySlug: string;
	tagSlugs: string[];
	/** Product-category slug this course cross-sells to (must exist in product_category). */
	productCategorySlug: string;
	modules: { title: string; lessons: { title: string; body: string; isPreview?: boolean }[] }[];
}

export const lmsCategoryDefs = [
	{ name: 'Growing Systems', slug: 'growing-systems' },
	{ name: 'Regenerative Land', slug: 'regenerative-land' },
	{ name: 'Foundations', slug: 'foundations' }
];

export const lmsTagDefs = [
	{ name: 'Hydroponics', slug: 'hydroponics' },
	{ name: 'Aquaponics', slug: 'aquaponics' },
	{ name: 'Silvopasture', slug: 'silvopasture' },
	{ name: 'Seeds', slug: 'seeds' },
	{ name: 'Soil', slug: 'soil' },
	{ name: 'Beginner', slug: 'beginner' }
];

export const lmsCourseDefs: LmsCourseDef[] = [
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
