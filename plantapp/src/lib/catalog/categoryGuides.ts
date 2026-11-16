export interface CategoryGuide {
	href: string;
	label: string;
}

function guide(slug: string, label: string): CategoryGuide {
	return { href: `/guides/${slug}`, label };
}

const hydroponics = guide('choosing-hydroponic-system', 'Choosing a first hydroponic system');
const aquaponics = guide('small-scale-aquaponics', 'Small-scale aquaponics');
const silvopasture = guide('temperate-silvopasture', 'Temperate silvopasture');
const agroforestry = guide(
	'temperate-food-forest',
	'Temperate food forests: layers, guilds, and how to start'
);
const kits = guide('permaculture-guilds', 'Permaculture planting guilds');
const supplies = guide('raised-beds', 'Raised beds: width, depth, and soil');

/** One entry guide for each catalogue category, including its child shelves. */
export const categoryGuides: Record<string, CategoryGuide> = {
	hydroponics,
	'hydroponic-systems': hydroponics,
	'nutrients-media': hydroponics,
	'soil-testing': hydroponics,
	aquaponics,
	'aquaponic-systems': aquaponics,
	'fish-supplies': aquaponics,
	silvopasture,
	'silvopasture-supplies': silvopasture,
	agroforestry,
	'agroforestry-supplies': agroforestry,
	kits,
	'kits-collections': kits,
	'starter-kits': kits,
	composting: kits,
	supplies,
	'seeds-supplies': supplies,
	'heirloom-seeds': supplies,
	'seeds-plants': supplies,
	'plants-seeds': supplies,
	'hand-tools': supplies,
	'garden-tools': supplies
};

export function guideForCategory(slug: string | null | undefined): CategoryGuide | null {
	if (!slug) return null;
	return categoryGuides[slug] ?? null;
}
