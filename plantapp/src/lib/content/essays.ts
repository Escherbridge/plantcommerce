export interface EssaySource {
	label: string;
	href: string;
}

export interface CornerstoneEssay {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	tags: readonly string[];
	sources: readonly EssaySource[];
	body: string;
}

export const cornerstoneEssays: readonly CornerstoneEssay[] = [
	{
		slug: 'nothing-for-sale-yet',
		title: 'Nothing for sale yet',
		excerpt:
			'A marketplace can go live with a catalogue full of things nobody can buy, or it can say the shelves are empty and still be useful. Aevani is choosing the second. The Learn hub is open. Applications to sell are open. Checkout is not.',
		publishedAt: '2026-11-09T00:00:00.000Z',
		tags: ['Aevani', 'marketplace honesty', 'seller onboarding'],
		sources: [
			{ label: 'Aevani homepage', href: 'https://aevani.com' },
			{ label: 'Sell on Aevani', href: 'https://aevani.com/sell' },
			{ label: 'Aevani Learn hub', href: 'https://aevani.com/learn' },
			{ label: 'Aevani About', href: 'https://aevani.com/about' },
			{ label: 'Aevani terms (operator: Escherbridge, LLC)', href: 'https://aevani.com/terms' },
			{ label: 'PlantGeo', href: 'https://plantgeo.aevani.com' }
		],
		body: "A shop is supposed to be a place where you can leave with something. Most new marketplaces skip that part and open anyway. They put a price on a photograph, a review on a product that has not been sold, and a button that says Add to cart on a warehouse that does not exist. It looks as if commerce has started. It has not. What has started is a story about commerce, which is a different and less useful product.\n\nAevani is a marketplace for growing tools and a free Learn hub, operated by Escherbridge, LLC in Boise, Idaho. It is being seeded. The first job is not to look stocked. The first job is to recruit growers and makers who will actually sell hydroponic, aquaponic, silvopasture, and agroforestry tools, and the parts and guides that keep those tools running. Until that happens, the honest sentence is the one already on the homepage: the catalogue is a preview. Nothing in it is for sale yet.\n\nThat sentence is easy to treat as a temporary embarrassment, to be hidden under a merchandising grid until it can be retired. It is the other way around. The embarrassment is a grid that still shows a price. A price is an offer. An offer that cannot be completed is not charming; it is a small lie that trains the visitor to discount everything else on the page, including the parts that are true.\n\nWhat is true is narrower, and better for that. Applications to sell are open. The Learn hub is free to read, and it does not require an account. Checkout is off. Aevani does not publish customer counts, product counts, impact metrics, certifications, awards, partner relationships, team biographies, or company-history milestones as verified facts. That list is already on the About page. The homepage is equally plain about harvest counts and warranties: it will not publish numbers it cannot stand behind. Those limits should stay even after the first real listing appears, because the temptation, later, will be to decorate a short history.\n\nThere is a usual objection, and it is not a foolish one. People like to browse. A silhouette of the catalogue helps a maker decide whether this is the right room, and it helps a grower see what the room is for. The silhouette can stay. What cannot stay is the habit of treating the silhouette as inventory: named kits, struck-through prices, shipping windows, overnight live goods, a 30-day return, a lifetime warranty, a frequently asked question that says yes, we ship tilapia. Those lines describe a shop that can complete a sale. This one cannot.\n\nThe useful work, while the shelves are empty, is unglamorous. Read the guides that exist, and notice the holes. If you grow or make something that belongs in one of the four categories, apply to sell. If you were hoping to buy a tower this week, you will have to do that somewhere else, which is an inconvenience the site should not try to talk you out of. If you wanted to plan a plot first, [PlantGeo](https://plantgeo.aevani.com) is the related map for that; it does not sell the tools, and neither, today, does Aevani. A marketplace that cannot serve you yet should not keep you on the page with a costume of availability.\n\nThere is a version of this story that turns the emptiness into a virtue too loudly, as if refusing to sell were itself a product. It is not. Selling is the point. The empty shelf is a fact about the present, not a philosophy. The moment a real seller is accepted and a real listing goes up, that listing should say who is selling it, what it costs, and what happens if it breaks. Aevani's fee for that sale is a flat 8%, with card processing included and no other fees. Payout timing is not set, and so it is not promised. Until then, the cart is a relic, and the catalogue is a drawing of a room that is still being built.\n\nThe Learn hub is the one part of the site that does not have to wait for a seller. A note about soil, or about plants that share a bed, can be useful on a week when nothing can be bought. It should not pretend to be a complete library, and it should not end with a kit. If a guide is missing, the page can say so. An empty shelf in the library is the same kind of honesty as an empty shelf in the shop, and it costs less to admit than to fill with a comprehensive list of resources that do not exist.\n\nA marketplace is not a photograph of goods. It is an agreement between someone who makes a thing and someone who wants it, plus a record of the money and the terms. Aevani does not have that agreement yet, except as an application form and a fee. That is enough to start, and not enough to sell. The visitors who needed a shop will leave. The ones who might sell here can stay and tell us what they would list first.\n\nNothing is for sale yet. The sentence will be out of date the day it is no longer true. Until then, it is the most useful line on the site."
	},
	{
		slug: 'a-flat-eight-percent',
		title: "A flat 8%. That's the fee.",
		excerpt:
			'Sellers on Aevani are charged a flat 8% on each sale. Card processing is included. There are no listing fees, no monthly fees, and no ad fees. Payout timing is not set, and so it is not promised.',
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
		body: 'Marketplace fees have a way of arriving in pieces. There is a commission, and then a payment fee, and then a listing fee, and then a monthly fee for the privilege of remaining listed, and then a promotion fee for being seen at all. By the time a maker has added them up, the number on the marketing page is no longer the number that will leave the sale. The honest version is a single figure, and a short list of what is not added later.\n\nAevani\'s seller fee is a flat 8% on each sale. Card processing is included, and absorbed by Aevani. There are no listing fees, no monthly fees, and no ad fees. That is the whole published rate. It can be quoted in a conversation with a grower or a maker who is deciding whether to apply. It is also the rate that should be written, in type large enough to be the argument, on the page where they apply.\n\nThis is not a comparison with anyone else\'s schedule. Other platforms publish their own fees, and those pages change. Aevani is not going to win a seller by narrating a competitor\'s price list, and it is not going to invent a savings figure against a shop the seller already uses. The useful fact is narrower: if you sell on Aevani, the take from the sale is 8%, and the card fee is not an extra line.\n\nWhat the rate does not yet include is a promise about when the money moves. Payout timing has not been set. A page that says "monthly," or "after delivery," or "once you hit fifty dollars," is writing a term that does not exist. The application form should not imply one, and neither should a recruiter. When the timing is set, it should appear next to the 8%, in the same plain type, and not before.\n\nThe same discipline applies to referrals. A later path will let [PlantGeo](https://plantgeo.aevani.com) affiliates invite someone to plan a site and then send them to Aevani. Aevani would pay that referral share from its own margin, only on completed retail sales, and never for recruiting someone into the program. Affiliates would not be sub-affiliates on Amazon, Etsy, or eBay links. The share itself has not been set. Until it is, there is no rate to quote, and there is no application to accept. Direct sellers remain the core of the marketplace. They have a fee. The referral path has a description and a blank where the number will go.\n\nThere is, today, a public affiliate page on aevani.com that still describes a tiered commission, a cookie window, a payout minimum, instant approval, and a platform fee on top of the sale. That page is ahead of the terms, and it conflicts with the 8% rate. It should come down, or be replaced with a short notice that the referral program is not open, before anyone is invited to join it. A rate that has not been agreed is not a marketing asset. It is a draft that escaped.\n\nNone of this is a philosophy of fairness, and it is not a claim that 8% is the right number for every marketplace. It is the number Aevani is offering to its first sellers. The rest of the commercial picture \u2014 who ships, who handles a return, what a warranty says \u2014 will have to be written on the listing, by the seller, once there is a listing. Site-wide shipping promises and no-fuss guarantees do not belong on a shop that cannot complete a cart.\n\nIf you grow or make something that belongs here, the application is the next step, not a pricing negotiation in a thread. The fee is 8%. Processing is included. There are no other fees. When you get paid is a sentence we have not written yet, and so you will not find it on the page.'
	}
];

const bySlug = new Map(cornerstoneEssays.map((essay) => [essay.slug, essay]));

export function cornerstoneEssayBySlug(slug: string): CornerstoneEssay | undefined {
	return bySlug.get(slug);
}

/** Paragraphs and markdown links only. The blog renderer sanitizes the result. */
export function cornerstoneEssayHtml(body: string): string {
	return body
		.trim()
		.split(/\n\s*\n/)
		.map((paragraph) => {
			const linked = paragraph.replace(
				/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
				'<a href="$2">$1</a>'
			);
			return `<p>${linked}</p>`;
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
			metaDescription: essay.excerpt,
			publishedAt: essay.publishedAt,
			tags: JSON.stringify(essay.tags)
		},
		author: null,
		sources: essay.sources
	};
}
