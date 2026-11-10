export interface EssaySource {
	label: string;
	href: string;
	/** ISO-8601 date when the source states one. */
	datePublished?: string;
	alsoHref?: string;
	alsoLead?: string;
}

export interface CornerstoneEssay {
	slug: string;
	title: string;
	excerpt: string;
	/** Document description when it differs from the visible summary. */
	metaDescription?: string;
	publishedAt: string;
	tags: readonly string[];
	sources: readonly EssaySource[];
	body: string;
}

export const cornerstoneEssays: readonly CornerstoneEssay[] = [
	{
		slug: 'cooling-can-use-more-water-than-the-crop',
		title: 'In a dry climate, cooling can use more water than the plants',
		excerpt:
			'A closed growing system in a dry climate is constrained by water, heat, and source-water quality, not by a catalogue photo. In a Tucson hydroponic-tomato trial, pad-and-fan cooling used more water than irrigation.',
		metaDescription:
			'In a Tucson tomato greenhouse, pad-and-fan cooling used more water than irrigation. A dry-climate closed system has to budget for both, and for source water.',
		publishedAt: '2026-11-10T00:00:00.000Z',
		tags: ['Aevani', 'hydroponics', 'water', 'Intermountain West'],
		sources: [
			{
				label:
					'Sabeh, N.C., Giacomelli, G.A., and Kubota, C., “Water use in a greenhouse in a semi-arid climate,” Transactions of the ASABE 54(3): 1069–1077, 2011.',
				href: 'https://experts.arizona.edu/en/publications/water-use-in-a-greenhouse-in-a-semi-arid-climate/',
				datePublished: '2011',
				alsoHref: 'https://ceac.arizona.edu/resources/publications',
				alsoLead: ' — also listed at '
			},
			{
				label:
					'University of Arizona Controlled Environment Agriculture Center, Chapter 10, “Fertigation Systems and Nutrient Solutions.”',
				href: 'https://ceac.arizona.edu/sites/default/files/Ch10.pdf'
			},
			{
				label:
					'USDA Agricultural Research Service, “USDA Unveils Updated Plant Hardiness Zone Map,” 15 November 2023.',
				href: 'https://www.ars.usda.gov/news-events/news/research-news/2023/usda-unveils-updated-plant-hardiness-zone-map',
				datePublished: '2023-11-15'
			},
			{
				label: 'USDA Plant Hardiness Zone Map, and “How to Use the Maps.”',
				href: 'https://planthardiness.ars.usda.gov/',
				alsoHref: 'https://planthardiness.ars.usda.gov/pages/how-to-use-the-maps',
				alsoLead: ' · '
			},
			{
				label:
					'PRISM Group at Oregon State University, official 2023 USDA Plant Hardiness Zone Map ZIP Code Listings (CONUS).',
				href: 'https://prism.oregonstate.edu/phzm/',
				datePublished: '2023',
				alsoHref: 'https://prism.oregonstate.edu/phzm/data/2023/phzm_us_zipcode_2023.csv',
				alsoLead: ' · '
			},
			{
				label:
					'Black, Brent, and Dan Drost, “Temperature Management in High Tunnels,” Utah State University Extension, April 2010.',
				href: 'https://extension.usu.edu/smallfarms/files/Greenhouses_Temp.Mgmt.pdf',
				datePublished: '2010-04'
			}
		],
		body: 'In a Tucson, Arizona, single-span polyethylene greenhouse of hydroponic tomatoes, pad-and-fan cooling used more water than the crop. Sabeh, Giacomelli, and Kubota reported the result in *Transactions of the ASABE* in 2011, from a trial that ran from March to October 2006. Over those eight months, irrigation used 780 L/m² and pad-and-fan cooling used 1,450 L/m². That is a published semi-arid analog, not a Boise field trial, and it is worth saying so in the same breath as the numbers.\n\nThe daily figures make the same point at a closer range. Irrigation rose from 4.3 L/m²/day at establishment to 7.2 L/m²/day at maturity. Pad-and-fan cooling peaked at 11 L/m²/day in the hottest, driest conditions. Water-use efficiency was 30 kg of yield per cubic metre for irrigation alone, 16 for cooling, and 11 when both were combined. The abstract notes that semi-arid regions typically receive less than 500 mm of rain a year. University of Arizona CEAC teaching notes, in Chapter 10 of their fertigation material, give a working example for greenhouse hydroponic tomatoes of about 4 liters per plant per day, or 10 liters/m²/day at 2.5 plants/m², and add that if evaporative cooling is used, especially in deserts, water needs may double. The chapter presents the 4 L/plant/day line as an example, not a universal rule.\n\nA Treasure Valley grower cannot treat Tucson as a local measurement, but two official facts are close enough to use. The 2023 USDA Plant Hardiness Zone Map is built from 30-year averages of the lowest annual winter temperatures (1991–2020), in thirteen 10°F zones, each split into 5°F "a/b" half-zones. A designation is the average annual extreme minimum, not the coldest it has ever been or will be, and not a guarantee. In the official zone listings from the PRISM Group at Oregon State University, central Boise is zone 7a, 0 to 5°F; a foothills area is zone 6b, −5 to 0°F. Cooling water is only half of the budget question. CEAC lists source-water quality — pH, electrical conductivity or salt levels, and contaminants — as a constraint to know before any nutrient recipe. This page does not invent a Treasure Valley TDS figure. A current University of Idaho bulletin PDF could not be retrieved for this piece; Utah State University Extension\'s April 2010 note on temperature management in high tunnels is used instead as the Intermountain land-grant source on heat in a structure.\n\nThe question, then, is what actually limits a closed system in a dry or Intermountain climate. It is water, including the water spent on cooling; heat; light; and the quality of the water you start with. It is not a catalogue photograph. A reservoir sized only for the plants is a reservoir sized for half the problem, in the spirit of the Tucson measurements and the CEAC desert-cooling note. A tunnel that is not ventilated on a sunny day can already overheat in early spring, which is the kind of fact the USU Extension record exists to keep in view.\n\nThe longer climate argument, including official Boise precipitation and 90°F-day counts, lives in the [guide to hydroponics in the Intermountain West](/guides/hydroponics-intermountain). The [Learn](https://aevani.com/learn) hub is free to read, and it does not require an account. If you want to plan a parcel first, [PlantGeo](https://plantgeo.aevani.com) is the related map; [plan the land, then pick the tools](https://plantgeo.aevani.com/blog/plan-the-land-then-pick-the-tools) is the house note on that order, and catalogue items are not for sale yet. If you grow or make tools that belong here, [applications to sell](https://aevani.com/sell) are open. The seller fee is a flat 8%, with card processing included and no other fees; payout timing has not been set, so it is not promised.'
	},
	{
		slug: 'a-flat-eight-percent',
		title: 'The seller fee is a flat 8%',
		excerpt:
			'Sellers on Aevani are charged a flat 8% on each sale, with card processing included. There are no listing fees, monthly fees, or ad fees. Payout timing has not been set, so it is not promised.',
		metaDescription:
			'Sellers on Aevani are charged a flat 8% on each sale, with card processing included. There are no listing, monthly, or ad fees. Payout timing is not promised.',
		publishedAt: '2026-11-09T00:00:00.000Z',
		tags: ['Aevani', 'seller fees', 'marketplace'],
		sources: [
			{ label: 'Sell on Aevani', href: 'https://aevani.com/sell' },
			{ label: 'Aevani homepage', href: 'https://aevani.com' },
			{ label: 'PlantGeo', href: 'https://plantgeo.aevani.com' },
			{
				label: 'Aevani affiliate program (live page; terms not settled)',
				href: 'https://aevani.com/affiliate/join'
			}
		],
		body: 'Marketplace fees have a way of arriving in pieces. There is a commission, and then a payment fee, and then a listing fee, and then a monthly fee for the privilege of remaining listed, and then a promotion fee for being seen at all. By the time a maker has added them up, the number on the marketing page is no longer the number that will leave the sale. The honest version is a single figure, and a short list of what is not added later.\n\nAevani\'s seller fee is a flat 8% on each sale. Card processing is included, and absorbed by Aevani. There are no listing fees, no monthly fees, and no ad fees. That is the whole published rate, and it can be quoted in a conversation with a grower or a maker who is deciding whether to apply. It should also be written, in type large enough to be the argument, on the page where they apply.\n\nThis is not a comparison with anyone else\'s schedule. Other platforms publish their own fees, and those pages change. Aevani is not going to win a seller by narrating a competitor\'s price list, and it is not going to invent a savings figure against a shop the seller already uses. The useful fact is narrower: if you sell on Aevani, the take from the sale is 8%, and the card fee is not an extra line.\n\nWhat the rate does not yet include is a promise about when the money moves. Payout timing has not been set. A page that says "monthly," or "after delivery," or "once you hit fifty dollars," is writing a term that does not exist. The application form should not imply one, and neither should a recruiter. When the timing is set, it should appear next to the 8%, in the same plain type, and not before.\n\nThe same discipline applies to referrals. A later path will let [PlantGeo](https://plantgeo.aevani.com) affiliates invite someone to plan a site and then send them to Aevani. Aevani would pay that referral share from its own margin, only on completed retail sales, and never for recruiting someone into the program. Affiliates would not be sub-affiliates on Amazon, Etsy, or eBay links. The share itself has not been set. Until it is, there is no rate to quote, and there is no application to accept. Direct sellers remain the core of the marketplace. They have a fee. The referral path has a description and a blank where the number will go.\n\nThere is, today, a public affiliate page on aevani.com that still describes a tiered commission, a cookie window, a payout minimum, instant approval, and a platform fee on top of the sale. That page is ahead of the terms, and it conflicts with the 8% rate. It should come down, or be replaced with a short notice that the referral program is not open, before anyone is invited to join it. A rate that has not been agreed is not a marketing asset. It is a draft that escaped.\n\nNone of this is a claim that 8% is the right number for every marketplace. It is the number Aevani is offering to its first sellers. The rest of the commercial picture \u2014 who ships, who handles a return, what a warranty says \u2014 will have to be written on the listing, by the seller, once there is a listing. Site-wide shipping promises and no-fuss guarantees do not belong on a shop that cannot complete a cart.\n\nIf you grow or make something that belongs here, the application is the next step, not a pricing negotiation in a thread. The fee is 8%, processing is included, and there are no other fees. When you get paid has not been written yet, and so you will not find it on the page.'
	}
];

const bySlug = new Map(cornerstoneEssays.map((essay) => [essay.slug, essay]));

/** Retired slugs. Each one 308s to its replacement and must not be listed. */
export const essayRedirects: Readonly<Record<string, string>> = {
	'nothing-for-sale-yet': '/blog/cooling-can-use-more-water-than-the-crop'
};

export function essayRedirectTarget(slug: string): string | undefined {
	return essayRedirects[slug];
}

export function cornerstoneEssayBySlug(slug: string): CornerstoneEssay | undefined {
	return bySlug.get(slug);
}

/** Paragraphs, emphasis, and markdown links only. The blog renderer sanitizes the result. */
export function cornerstoneEssayHtml(body: string): string {
	return body
		.trim()
		.split(/\n\s*\n/)
		.map((paragraph) => {
			const html = paragraph
				.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/(?!\/)[^)\s]+)\)/g, '<a href="$2">$1</a>')
				.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
			return `<p>${html}</p>`;
		})
		.join('');
}

export function cornerstoneEssayRecord(essay: CornerstoneEssay) {
	return {
		page: {
			title: essay.title,
			slug: essay.slug,
			excerpt: essay.excerpt,
			content: cornerstoneEssayHtml(essay.body),
			type: 'blog_post' as const,
			metaTitle: essay.title,
			metaDescription: essay.metaDescription ?? essay.excerpt,
			publishedAt: essay.publishedAt,
			tags: JSON.stringify(essay.tags)
		},
		author: null,
		sources: essay.sources
	};
}
