import { assertGrowPlan, type GrowPlan } from './contracts';

/** Planned editorial bundles; catalog truth still decides whether any item can be exposed or acted on. */
export const growPlans = [
	{
		id: 'grow-plan-countertop-hydroponics',
		slug: 'countertop-hydroponics',
		title: 'Countertop Hydroponics',
		status: 'specified',
		outcome: 'Set up a small indoor water-growing practice with a clear first harvest path.',
		experienceLevel: 'beginner',
		space: 'A stable countertop near suitable light and a protected water-safe surface.',
		setupTime: 'About 60 minutes once verified components are available.',
		compatibility:
			'Use only components whose dimensions, food-contact materials, electrical safety, and pump compatibility are verified together.',
		nextSteps: ['Review the setup guide.', 'Check water conditions.', 'Choose a compatible crop.'],
		items: [
			{
				catalogSlug: 'deep-water-culture-bucket-system',
				requirement: 'required',
				quantity: 1,
				action: 'aevani_cart',
				note: 'The verified growing-system foundation.',
				affiliateDisclosure: null
			},
			{
				catalogSlug: 'digital-ph-ec-meter-set',
				requirement: 'required',
				quantity: 1,
				action: 'aevani_cart',
				note: 'A compatible meter is needed to monitor the setup.',
				affiliateDisclosure: null
			},
			{
				catalogSlug: 'vertical-tower-garden-system',
				requirement: 'optional',
				quantity: 1,
				action: 'affiliate_outbound',
				note: 'A future expansion option for a larger growing footprint.',
				affiliateDisclosure:
					'This optional item is offered by an external merchant; its outbound link is disclosed and tracked separately from Aevani checkout.'
			}
		]
	},
	{
		id: 'grow-plan-10-day-microgreens',
		slug: '10-day-microgreens',
		title: '10-Day Microgreens',
		status: 'specified',
		outcome: 'Build a compact, repeatable microgreens practice from sowing through first cut.',
		experienceLevel: 'beginner',
		space: 'A clean indoor shelf or counter with room for a tray and appropriate light.',
		setupTime: 'About 30 minutes to prepare the first tray.',
		compatibility:
			'Use a verified kit with traceable seeds and follow its food-safety handling guidance.',
		nextSteps: [
			'Prepare the growing area.',
			'Follow the kit instructions.',
			'Record the first harvest.'
		],
		items: [
			{
				catalogSlug: 'microgreens-growing-kit',
				requirement: 'required',
				quantity: 1,
				action: 'aevani_cart',
				note: 'The verified kit supplies the plan foundation.',
				affiliateDisclosure: null
			}
		]
	},
	{
		id: 'grow-plan-pollinator-patch',
		slug: 'pollinator-patch',
		title: 'Pollinator Patch',
		status: 'specified',
		outcome:
			'Plan a regionally appropriate patch that supports flowering diversity over a growing season.',
		experienceLevel: 'beginner',
		space: 'An outdoor plot or container area suited to the verified seed mix and local guidance.',
		setupTime: 'About 45 minutes for planning and initial sowing preparation.',
		compatibility:
			'Use only a regionally reviewed mix that passes invasive-species and seed-label checks.',
		nextSteps: ['Confirm local suitability.', 'Prepare the site.', 'Observe flowering succession.'],
		items: [
			{
				catalogSlug: 'pollinator-garden-seed-collection',
				requirement: 'required',
				quantity: 1,
				action: 'aevani_cart',
				note: 'The plan begins with a locally suitable, verified collection.',
				affiliateDisclosure: null
			},
			{
				catalogSlug: 'beneficial-insect-habitat-kit',
				requirement: 'optional',
				quantity: 1,
				action: 'aevani_cart',
				note: 'An optional durable habitat component once its claims are verified.',
				affiliateDisclosure: null
			}
		]
	},
	{
		id: 'grow-plan-soil-renewal-composting',
		slug: 'soil-renewal-composting',
		title: 'Soil Renewal / Composting',
		status: 'specified',
		outcome:
			'Start a manageable composting routine and observe how organic material cycles through the garden.',
		experienceLevel: 'beginner',
		space: 'A suitable outdoor or well-managed indoor composting location.',
		setupTime: 'About 45 minutes for first assembly and material sorting.',
		compatibility:
			'Use a verified dry-goods kit; live organisms, amendments, or regulated materials require their own approved evidence.',
		nextSteps: [
			'Choose a location.',
			'Collect suitable materials.',
			'Review moisture and turning guidance.'
		],
		items: [
			{
				catalogSlug: 'composting-starter-kit',
				requirement: 'required',
				quantity: 1,
				action: 'aevani_cart',
				note: 'A dry-goods kit provides the starting tools when its bill of materials is verified.',
				affiliateDisclosure: null
			}
		]
	}
] as const satisfies readonly GrowPlan[];

growPlans.forEach(assertGrowPlan);
