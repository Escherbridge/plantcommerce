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
	/** Document title when the visible h1 would be clipped in a results snippet. */
	seoTitle?: string;
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
		seoTitle: 'Cooling can use more water than the crop — Aevani',
		excerpt:
			'If you size a greenhouse water tank strictly for what tomatoes drink, August heat will empty it early. In a Tucson trial, evaporative cooling took nearly twice as much water as irrigation.',
		metaDescription:
			'In a Tucson hydroponic tomato greenhouse, pad-and-fan cooling used more water than irrigation. Here is how to budget water, shade, venting, and water quality in dry climates.',
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
		body: `If you plan a greenhouse around what the crop drinks, August will empty your cistern twice as fast as your math says it should.

In a Tucson, Arizona trial inside a single-span polyethylene greenhouse growing hydroponic tomatoes from March to October 2006, Sabeh, Giacomelli, and Kubota measured two separate water budgets side by side in *Transactions of the ASABE* (2011). Across those eight months, the plants themselves took 780 L/m² of irrigation water. The pad-and-fan evaporative cooling system took 1,450 L/m²—nearly double the crop's own consumption.

Daily demand tells the same story up close. Plant irrigation climbed from 4.3 L/m²/day during establishment to 7.2 L/m²/day at maturity, while evaporative cooling peaked at 11 L/m²/day on the hottest, driest afternoons. Measured by yield per drop, irrigation alone delivered 30 kg of yield per cubic metre, cooling alone came out to 16 kg/m³, and combining both dropped total water-use efficiency to 11 kg/m³. University of Arizona CEAC fertigation notes (Chapter 10) reinforce that pattern in regions receiving less than 500 mm of annual rainfall: a greenhouse hydroponic tomato crop takes roughly 4 liters per plant per day (about 10 liters/m²/day at 2.5 plants/m²), and running evaporative cooling in desert summers can easily double total water demand.

A semi-arid trial in Tucson is not an exact stand-in for every backyard or Intermountain bench, yet three practical habits translate directly wherever summers run hot and dry:

- **Size reservoirs and rainwater totes for cooling water, not just root uptake.** Pair cooling math with shade cloth and high ridge venting covered in our [greenhouse ventilation and heat guide](/guides/greenhouse-ventilation-heat).
- **Read your hardiness map for winter lows, not spring tunnels.** On the 2023 USDA Plant Hardiness Zone Map (1991–2020 30-year averages), central Boise sits in zone 7a (0 to 5°F) and nearby foothills sit in zone 6b (−5 to 0°F). That guides overwintering perennials, not early spring hoop-house venting—unvented tunnels already overheat on bright March afternoons, as Utah State University Extension documents.
- **Test raw water before mixing fertilizer recipes.** CEAC emphasizes checking source-water pH, electrical conductivity (EC), and dissolved salts up front so evaporation does not steadily concentrate carbonates inside recirculating reservoirs.

When you set up a closed hydroponic shed or seasonal hoop house in a dry climate, total water—including cooling water—alongside airflow, light, and raw-water quality are the constraints that make or break a season. Read the full regional walkthrough in [hydroponics in the Intermountain West](/guides/hydroponics-intermountain), explore [hydroponic systems and meters](/products/hydroponics), or map sun and water across your site on [PlantGeo](https://plantgeo.aevani.com/). Build or sell cooling valves, shade hardware, or hydroponic kits? Apply at [Sell on Aevani](/sell) for a flat 8% commission with card processing included and zero listing, monthly, or ad fees.`
	},
	{
		slug: 'a-flat-eight-percent',
		title: 'The seller fee is a flat 8%',
		excerpt:
			'Independent seed houses, nurseries, and growing-tool makers pay one flat 8% commission on completed Aevani sales—with card processing included and zero listing, monthly, or ad fees.',
		metaDescription:
			'Sellers on Aevani pay a flat 8% commission on each completed sale, with card processing included and zero listing, monthly, or ad fees.',
		publishedAt: '2026-11-09T00:00:00.000Z',
		tags: ['Aevani', 'seller fees', 'marketplace'],
		sources: [
			{ label: 'Sell on Aevani', href: 'https://aevani.com/sell' },
			{ label: 'Aevani growing guides', href: 'https://aevani.com/guides' },
			{ label: 'PlantGeo site planner', href: 'https://plantgeo.aevani.com' }
		],
		body: `Marketplace fees have a way of arriving in pieces. There is a base commission, then a payment processing cut, then a per-item listing charge, then a monthly subscription just to keep your catalog online, and finally a promoted-listing tax if you want anyone to find your shop in search. By the time a small nursery, seed saver, or toolmaker finishes doing the math at year-end, the headline percentage on the brochure rarely matches what stayed in the farm account.

The honest alternative is a single number—and a short, stubborn list of what is never stacked on top of it:

- **8% flat commission on completed sales**
- **Card processing included** (absorbed by Aevani, never tacked on at settlement)
- **$0 listing fees**
- **$0 monthly subscription fees**
- **$0 ad fees**

If you list a $50 heirloom seed box or a $180 broadfork on Aevani, you keep 92% before your own shipping costs. You do not have to mark packet prices up to feed an internal ad auction, and quiet winter months between growing seasons never burn cash in monthly storefront rent.

## Why sellers own shipping, returns, and warranties

Growing supplies do not behave like phone cases. Bare-root perennials, live starts, bulk compost amendments, heirloom seed packets, and welded Dutch-bucket frames each have completely different weight breaks, temperature sensitivity, and return realities. Rather than forcing specialty growers into a one-size-fits-all site template, each seller publishes their own shipping windows, carrier terms, return policies, and hardware warranties directly on every listing so buyers know what to expect before checkout.

## Built beside PlantGeo—always for real growers and makers

While growers read free [field guides](/guides) and sketch beds, greenhouses, and windbreaks on [PlantGeo](https://plantgeo.aevani.com/), independent sellers remain the center of Aevani. Whether you breed regional seeds, forge hand tools, assemble solar drip kits, or fabricate aquaponic and hydroponic hardware, our [seller application](/sell) takes just a few minutes. Tell us what you grow or build, and we follow up directly by email.`
	},
	{
		slug: 'the-fee-that-didnt-move',
		title: "The fee that didn't move: what a small grower actually pays to sell online",
		excerpt:
			"Etsy's headline seller fees didn't change in 2026. On a $40 seed order, listing, processing, and sometimes an ad line still show up. Here is the arithmetic, including Aevani's flat 8%.",
		metaDescription:
			"Etsy's headline seller fees didn't change in 2026. On a $40 seed order, listing, processing, and sometimes an ad line still show up. Here is the arithmetic.",
		publishedAt: '2026-11-10T00:00:00.000Z',
		tags: ['Aevani', 'seller fees', 'marketplace'],
		sources: [
			{
				label: 'Etsy Help: What are the Fees and Taxes for Selling on Etsy',
				href: 'https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy'
			},
			{
				label: 'Etsy Help: What are Payment Processing Fees for Selling on Etsy',
				href: 'https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy'
			},
			{
				label: 'eBay Seller Center: seller fees',
				href: 'https://www.ebay.com/sellercenter/selling/start-selling-on-ebay/seller-fees'
			},
			{
				label: 'Growtsy, Etsy changes changelog (Oct. 5 and June 22 dates)',
				href: 'https://www.growtsy.com/etsy-changes'
			},
			{ label: 'Sell on Aevani', href: 'https://aevani.com/sell' }
		],
		body: `A $40 order of seed packets, shipping included, no sales tax, from a U.S. seller with a U.S. bank account. That is a small, ordinary sale. What the seller keeps is not the headline rate someone checked in the spring. It is the total of every line that still prints on the statement.

Etsy's headline seller fees did not change in 2026 for a U.S. shop. Growtsy's changelog, which compared the February 13 and October 5 versions of the fees policy, is the source for that October 5 revision date. Etsy's own legal fees page blocked a fetch for this piece, so the date is treated as secondary. The number people watch held still. The other lines did what they always do.

## What Etsy actually charges

Etsy's help page on fees and taxes, opened 10 November 2026, still lists a $0.20 listing fee, paid "regardless of resulting sales." A listing expires after four months, and auto-renew is another $0.20. The transaction fee is 6.5% of the total order amount, including shipping and gift wrap. Offsite Ads, if the order came from one, are 15% of the order total when the shop made under $10,000 on Etsy in the past 365 days, or 12% at or above that, and never more than $100 per order.

Payment processing, for a U.S. seller, is 3% + $0.25 USD, taken from the total sale price including shipping and any sales tax, and charged "in addition to the 6.5% transaction fee," according to Etsy's processing-fees help page. A one-time shop set-up fee also applies, and the cost "varies by location." This page does not invent a U.S. dollar figure for that set-up fee.

The 2026 changes that did land were at the edges. Regulatory Operating Fees changed in seven non-U.S. markets on June 22, 2026, a date taken from Growtsy's changelog. An Etsy Community announcement on that change appeared in search results; the announcement itself was not opened for this piece. None of those apply to U.S. sellers.

## What eBay charges, without a Store subscription

eBay's Seller Center fees page, also opened 10 November 2026, is free to list for most casual sellers, then $0.35 per listing after 250 in a month. In most categories the final value fee is 13.6% of the total sale — item, shipping, sales tax, and other fees — up to $7,500, plus $0.30 per order at $10 or less, or $0.40 above. Promoted Listings and optional upgrades cost extra.

## One $40 order, four outcomes

The table below is our arithmetic from each platform's published fees, 10 November 2026, rounded to the cent. It is not a platform statement, and it is not a savings guarantee.

| Platform | What gets charged | Fees | Seller keeps |
|---|---|---|---|
| Etsy, no Offsite Ad | $0.20 listing + 6.5% ($2.60) + 3% + $0.25 ($1.45) | $4.25 (10.6%) | $35.75 |
| Etsy, order came from an Offsite Ad (shop under $10k) | the above + 15% ($6.00) | $10.25 (25.6%) | $29.75 |
| eBay, most categories | 13.6% ($5.44) + $0.40 | $5.84 (14.6%) | $34.16 |
| Aevani | 8% ($3.20), processing included | $3.20 (8%) | $36.80 |

A few limits belong next to those numbers. The Etsy listing fee is per listing, not per order, so a multi-item listing that sells many times spreads the $0.20 out — but each extra quantity sold is another $0.20. Sales tax raises the base for Etsy processing and for the eBay fee. Shipping labels and ads are extra everywhere.

Selling on Aevani is one line: a flat 8% on each sale, with card processing included and absorbed by Aevani, and no listing, monthly, or ad fees. That is the whole published rate. Etsy and eBay bring a buyer audience that Aevani does not have yet. That is the honest trade, and it is the part of the comparison that a headline rate will not tell you.

This is not a claim that Etsy or eBay are a bad deal. They are large markets with real buyers. The useful critique is of a fee bill with many lines, not of the companies. It is also not a pitch to buyers. If you grow or make tools that belong here, [applications to sell](https://aevani.com/sell) are open.

## Sources

1. Etsy Help, “What are the Fees and Taxes for Selling on Etsy,” opened 10 November 2026. https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy
2. Etsy Help, “What are Payment Processing Fees for Selling on Etsy,” opened 10 November 2026. https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy
3. eBay Seller Center, “Seller fees,” opened 10 November 2026. https://www.ebay.com/sellercenter/selling/start-selling-on-ebay/seller-fees
4. Growtsy, Etsy changes changelog, opened 10 November 2026. Used only for the October 5 revision date and the June 22 non-U.S. Regulatory Operating Fee date. https://www.growtsy.com/etsy-changes
5. Sell on Aevani, flat 8% with card processing included and no other fees. https://aevani.com/sell

## Related

- [The seller fee is a flat 8%](/blog/a-flat-eight-percent) — the published Aevani rate, in one place.
- [In a dry climate, cooling can use more water than the plants](/blog/cooling-can-use-more-water-than-the-crop)
- [Sell on Aevani](/sell)`
	},
	{
		slug: 'dwc-vs-kratky-vs-nft',
		title: 'DWC vs. Kratky vs. NFT: Which First Hydroponic Setup Fits Your Kitchen or Spare Room?',
		excerpt:
			'Compare passive Kratky tubs, bubbling Deep Water Culture, and Nutrient Film channels side by side so you buy hardware once and keep roots bright white.',
		metaDescription:
			'Hands-on comparison of Kratky, Deep Water Culture (DWC), and Nutrient Film Technique (NFT) hydroponics for home growers—oxygen, summer heat, crop choice, and gear.',
		publishedAt: '2026-10-18T00:00:00.000Z',
		tags: ['hydroponics', 'Kratky', 'DWC', 'NFT', 'buyer guides'],
		sources: [
			{
				label:
					'Kratky, B.A. — A Suspended Net-Pot, Non-Circulating Hydroponic Method for Growing Commercial Crops and Leafy Vegetables (UH-CTAHR VC-1)',
				href: 'https://www3.ctahr.hawaii.edu/oc/freepubs/pdf/VC-1.pdf',
				datePublished: '2010-09'
			},
			{
				label:
					'Tyson, Hochmuth, and Cantliffe — Hydroponic Vegetable Production in Florida (UF/IFAS HS405)',
				href: 'https://ask.ifas.ufl.edu/publication/HS405/pdf'
			},
			{
				label:
					'Sharma et al. — Hydroponic Lettuce Production in Controlled Environments (University of Kentucky CCD-CP-63)',
				href: 'https://ccd.uky.edu/sites/default/files/2026-02/ccd-cp-63_hydrolettuce-updated_accessible.pdf'
			},
			{
				label: 'Cornell University CEA Program — Hydroponic Lettuce Handbook',
				href: 'https://cpb-us-e1.wpmucdn.com/blogs.cornell.edu/dist/8/8824/files/2019/06/Cornell-CEA-Lettuce-Handbook-.pdf'
			}
		],
		body: `Walk into any spare-room grow or sunlit kitchen counter and you will usually find one of two scenes: thriving leaf lettuce that cost next to nothing to raise, or a cloudy plastic tote full of brown, slimy tomato roots. Almost every beginner setback in indoor hydro comes down to buying a setup engineered for 35-day lettuce and asking it to carry a thirsty, heavy-rooting fruiting plant for four months.

Here is how the three classic starter systems actually behave once you put water, fertilizer, and roots in them.

## 1. Kratky (passive, zero electricity): unbeatable for quick greens, picky about refills

In B.A. Kratky's non-circulating method at the University of Hawaiʻi (CTAHR VC-1), you fill a light-tight tub once, seat net pots so seedling roots barely kiss the solution, and leave it undisturbed. As lettuce drinks, the water level falls naturally—leaving upper roots suspended in damp air where they pull in oxygen without an aquarium pump.

Where beginners trip: topping the tub back to the brim mid-crop drowns those specialized air roots and triggers rot, and setting passive tubs outdoors lets rain overflow the reservoir. For fast 30-to-40-day greens, basil, and baby kale in a cool room, it is the simplest, quietest entry point around. Check our full [Kratky method guide](/guides/kratky-method) before drilling tote lids.

## 2. Deep Water Culture (DWC): one aquarium air pump solves most headaches

Deep Water Culture uses the same light-blocking tub and net pots as Kratky, but adds a reliable air pump and fine-bubble air stone on the bottom. Continuous bubbles keep dissolved oxygen circulating straight through the water column—even when you top up nutrients or when summer spare rooms hit the mid-70s and warm water holds less oxygen.

If you want steady butterhead lettuce harvests, perennial culinary herbs, or even a compact fruiting pepper indoors, aerated DWC is dramatically more forgiving than stagnant water. See dissolved-oxygen floors in our [Deep Water Culture guide](/guides/deep-water-culture).

## 3. Nutrient Film Technique (NFT): sleek channels, thin margin for power hiccups

White PVC gullies look clean along a bright wall because roots sit inside a shallow trickle of recirculating solution while the top of the root mat breathes moist channel air. For orderly rows of salad greens and herbs, harvesting and sanitizing channels between cycles is quick.

The catch, noted in UF/IFAS HS405, is twofold: heavy fruiting crops like full-sized tomatoes and cucumbers pack thick root mats that quickly dam narrow channels, and because there is almost no standing water reserve inside the pipe, a tripped GFCI breaker or clogged submersible pump leaves plants wilting within hours on a warm afternoon. Compare capacities in [choosing a hydroponic system](/guides/choosing-hydroponic-system) and our [NFT guide](/guides/nutrient-film-technique).

## Match the bench to your room and crops

- **Zero outlets, cool room, 30-day greens:** Go passive Kratky with light-tight lids and clean net cups.
- **One outlet, herbs, big lettuce heads, or warm rooms:** Run bubbling DWC with a dependable air pump and calibrated EC/pH meter.
- **Row after row of greens with backup power habits:** Step into NFT channels—or use drip Dutch buckets for tomatoes and cucumbers.

Ready to build your setup? Browse [hydroponic systems, meters, and pumps](/products/hydroponics) or lay out water and power access in [PlantGeo](https://plantgeo.aevani.com/). Build light-tight tubs, custom manifolds, or hobbyist dosing kits? Open a storefront on [Sell on Aevani](/sell) with a flat 8% commission, card processing included, and zero listing, monthly, or ad fees.`
	},
	{
		slug: 'raised-beds-for-heavy-clay-and-hot-summers',
		title: 'How to Build a Raised Bed That Works in Heavy Clay and Hot Summers',
		excerpt:
			'Skip five-foot-wide boxes you cannot reach across. Practical bed widths, drainage depths over clay, and drip irrigation rules for backyard plots.',
		metaDescription:
			'Size backyard raised beds cleanly for reach, drainage over heavy clay, and low-evaporation drip lines using OSU, USU, UF/IFAS, and Cornell extension benchmarks.',
		publishedAt: '2026-10-25T00:00:00.000Z',
		tags: ['raised beds', 'soil & compost', 'irrigation', 'buyer guides'],
		sources: [
			{
				label:
					'Heflebower, Wagner, Gunnell, and Condrat — Raised Bed Gardening (Utah State University Extension)',
				href: 'https://extension.usu.edu/yardandgarden/research/raised-bed-gardening',
				datePublished: '2012-02'
			},
			{
				label: 'UF/IFAS Gardening Solutions — Building Raised Beds',
				href: 'https://gardeningsolutions.ifas.ufl.edu/design/types-of-gardens/building-raised-beds/'
			},
			{
				label:
					'Schaible, Kopp, and Hoover — Irrigation System Maintenance (Utah State University Extension)',
				href: 'https://extension.usu.edu/yardandgarden/research/irrigation-system-maintenance/',
				datePublished: '2021-07'
			},
			{
				label:
					'Cornell Cooperative Extension St. Lawrence County — How to Build a Raised Garden Bed',
				href: 'https://stlawrence.cce.cornell.edu/resources/how-to-build-a-raised-garden-bed'
			}
		],
		body: `Most backyard raised-bed regrets happen in the first twenty minutes at the lumber rack. Someone grabs 10-foot boards, screws together a handsome five-foot-wide box in the middle of the lawn, hauls in forty bags of soil mix, and spends the next five summers kneeling on the very compost they paid to keep fluffy just to reach weeds down the middle.

Two straightforward sizing habits—shared across Utah State, Cornell, and Florida extension guides—protect your back, your soil loft, and half your summer water bill.

## Keep width to 3 or 4 feet—no exceptions

Every raised-bed manual lands on human arm reach: if you can work from both long sides, **4 feet wide** is the practical ceiling (or **3 feet** if one edge sits against a fence or house wall). Leave **18 to 24 inches** between beds to kneel cleanly, or widen main paths to **3 to 4 feet** wherever you want a loaded wheelbarrow to clear the corners.

## Pick depth around your native soil below

- **6 to 8 inches** handles shallow greens, radishes, bush beans, and culinary herbs nicely when native soil underneath drains steadily.
- **10 to 12+ inches** pays off fast when setting frames straight on packed yard clay, coarse gravel, or tree-root turf where spring melt water stands after storms.
- Remember the summer trade-off: raised boxes drain well and warm sooner in March, which also means they dry out noticeably faster during 95°F July afternoons than in-ground rows.

For soil blends, no-dig cardboard layering over turf, and timber safety notes, read our guides on [raised bed width, depth, and soil](/guides/raised-beds) and [no-dig sheet mulching](/guides/no-dig-sheet-mulch).

## Trade overhead sprinklers for drip under mulch

Waving a hose nozzle at dusk feels relaxing until gusty heat steals half the spray before it cools a root and wet foliage invites mildew overnight. Running simple 1/4-inch emitter line or drip tape along plant rows—tucked beneath 2 inches of clean straw, shredded leaves, or coarse compost—keeps root zones evenly damp without watering path weeds. Adding an inline filter screen and flushing line ends once or twice a season stops hard-water scale from plugging emitters mid-August, as USU Extension's irrigation maintenance bulletin underscores. See full emitter spacing notes in our [soil drip irrigation guide](/guides/soil-drip-irrigation).

## Sketch sun, slope, and hose reach before buying lumber

Walk your yard's summer sun arc and hose layout first on [PlantGeo's interactive 3D map](https://plantgeo.aevani.com/plan/sample-ada-county) so shade from garages or trees doesn't surprise you in May. Ready to break ground? Browse [starter kits and collections](/products?category=kits-collections) and [seeds and growing supplies](/products?category=seeds-supplies)—and if your workshop or nursery builds bed brackets, regional compost blends, or irrigation manifolds, apply at [Sell on Aevani](/sell) for one flat 8% commission with card processing included and zero listing, monthly, or ad fees.`
	},
	{
		slug: 'pre-spring-grower-checklist',
		title: 'Before You Buy Seed Packets: A Five-Step Pre-Spring Checklist',
		excerpt:
			'Stop leggy windowsill seedlings, cooked March trays, and pH drift before planting season hits with five practical bench checks.',
		metaDescription:
			'Pre-spring grower checklist: test source-water alkalinity, size LED grow lights by DLI, vent sunny hoop houses early, check frost calendars, and source independent gear.',
		publishedAt: '2026-11-02T00:00:00.000Z',
		tags: ['seed starting', 'lighting', 'water', 'season extension'],
		sources: [
			{
				label:
					'Torres and Lopez — Measuring Daily Light Integral in a Greenhouse (Purdue Extension HO-238-W)',
				href: 'https://www.extension.purdue.edu/extmedia/HO/HO-238-W.pdf'
			},
			{
				label:
					'Singh and Dunn — Electrical Conductivity and pH Guide for Hydroponics (Oklahoma State Extension HLA-6722)',
				href: 'https://extension.okstate.edu/fact-sheets/print-publications/hla/hydroponics-hla-6722.pdf'
			},
			{
				label: 'USDA Agricultural Research Service — 2023 Plant Hardiness Zone Map',
				href: 'https://planthardiness.ars.usda.gov/'
			},
			{
				label: 'Utah State University Extension — Utah Vegetable Planting Date Calculator',
				href: 'https://extension.usu.edu/yardandgarden/utah-planting-date-calculator'
			}
		],
		body: `January seed catalogs land right when winter cabin fever peaks, which is why so many indoor trays wind up pale, four inches tall, and leaning desperately toward a chilly kitchen pane by February. Before tearing open fresh packets—or ordering an oversized lighting kit—run five quick checks across your water, lights, and shelters.

## 1. Check your tap or well water before buying fertilizer bottles

Hard well water and alkaline city supplies silently push liquid nutrients out of range. Oklahoma State Extension (HLA-6722) warns that elevated starting EC or high carbonate alkalinity forces pH upward day after day, locking iron and phosphorus away from seedling roots even when bottle ratios look spotless on paper. One quick baseline test (detailed in our [source-water testing guide](/guides/source-water-testing)) tells you whether straight tap water is fine, needs mild acid adjustment, or mixes best with captured rainwater.

## 2. Ignore inflated "watt-equivalent" stickers—size lights for DLI

Box labels shout 1000W equivalents that measure little useful leaf light. Purdue Extension (HO-238-W) frames indoor output cleanly via **Daily Light Integral (DLI)**—the total stream of photosynthetic photons landing on foliage over your timer's run hours. A crisp, cool-running LED bar mounted a few inches cleanly above trays—guided by our [indoor lighting and DLI guide](/guides/indoor-lighting-dli) and [soilless seed-starting guide](/guides/soilless-seed-starting)—grows sturdy seedlings instead of stretched stems reaching for a distant ceiling bulb.

## 3. Respect how fast a closed hoop house overheats on a sunny 45°F day

It surprises backyard growers and small market gardens every single spring: overnight frost lingers at 28°F, so you latch the plastic hoop house shut—and a calm, bright March noon turns the inside into a heat trap well above 100°F. Review simple venting habits and side-curtain timing in our [high tunnels and hoop houses guide](/guides/high-tunnels-hoop-houses) and [season-extension covers guide](/guides/season-extension-covers-frames) before leaving flats zipped up while you go to work.

## 4. Never mistake a USDA Hardiness Zone for a spring planting calendar

The 2023 USDA Plant Hardiness Zone Map averages 30 years of lowest *winter* nights—indispensable when picking perennial fruit trees, berry canes, and garlic, not for deciding when May warm-season transplants survive outdoors. Always pair your zone with local spring frost calculators (such as USU Extension's planting date tool) highlighted in our [frost dates and hardiness guide](/guides/frost-dates-hardiness).

## 5. Map your site early and source from independent makers

Sketch winter shadows, terrace slopes, and spigot reach on [PlantGeo](https://plantgeo.aevani.com/) before ordering beds or bulk flats. Browse gear across [Aevani's growing categories](/products)—and if your seed house, nursery, or fab shop sells regional seeds, heat mats, or irrigation hardware, apply at [Sell on Aevani](/sell) to list under a flat 8% commission with card processing included and zero listing, monthly, or ad fees.`
	},
	{
		slug: 'cycling-your-first-aquaponics-loop',
		title:
			'The Patient First Month of Backyard Aquaponics: Cycling Your Biofilter Without Losing Fish',
		excerpt:
			'Why adding fish on day one wrecks new aquaponics loops—and how a four-to-six-week fishless cycle builds biofilter bacteria that keep fish alive.',
		metaDescription:
			'Cycle a backyard aquaponics biofilter safely over 4 to 6 weeks using FAO Technical Paper 589 ranges for ammonia, nitrites, pH 6.8–7.0, and dissolved oxygen.',
		publishedAt: '2026-11-09T00:00:00.000Z',
		tags: ['aquaponics', 'water', 'biofilter', 'beginner guides'],
		sources: [
			{
				label:
					'Somerville, Cohen, Pantanella, Stankus, and Lovatelli — Small-Scale Aquaponic Food Production (FAO Fisheries Technical Paper No. 589)',
				href: 'https://www.fao.org/4/i4021e/i4021e.pdf'
			},
			{
				label:
					'University of Arizona Cooperative Extension — Aquaponics Basics: How Fish, Plants, and Microbes Work Together',
				href: 'https://www.extension.arizona.edu/publication/aquaponics-basics-how-fish-plants-and-microbes-work-together'
			},
			{
				label: 'DeLong and Losordo — How to Start a Biofilter (SRAC Publication No. 4502)',
				href: 'https://srac.msstate.edu/pdfs/Fact%20Sheets/4502%20How%20to%20Start%20a%20Biofilter.pdf',
				datePublished: '2012-02'
			}
		],
		body: `There is a classic backyard aquaponics mistake that plays out every spring: someone spends two Saturday afternoons cutting and plumbing an IBC tote, washes expanded clay pebbles until their knuckles sting, fires up the pump, and drives straight to the hatchery or pond shop so the fish tank "looks finished." Five days later, the water smells sharp, fish gasp at the surface, and half the tank is dead.

Nothing went wrong with the plumbing. The invisible middle crew just had not moved into the grow bed yet.

## Fish don't feed greens directly—nitrifying bacteria bridge the loop

Every aquaponic setup is a three-partner team: fish, beneficial microbes, and plants. Fish gills and waste release toxic ammonia (**NH₃ / NH₄⁺**). Inside wet gravel, expanded clay, or biofilter media, *Nitrosomonas*-type bacteria oxidize ammonia into **nitrite** (still harmful to fish), and *Nitrobacter*-group bacteria convert nitrite into **nitrate**—the safe nitrogen greens absorb smoothly.

According to the FAO's *Small-Scale Aquaponic Food Production* manual (Technical Paper No. 589), establishing an active biofilm dense enough to clear daily fish waste normally takes **4 to 6 weeks**. Dropping fish into brand-new water on day one forces livestock to swim inside their own spiking ammonia and nitrite before bacteria exist to process it.

## How a calm fishless cycle runs

Instead of risking live fish to feed new biofilter media, circulate aerated water and dose small measured amounts of pure, unscented ammonia while checking water daily with a standard freshwater test kit:

- **Weeks 1–2:** Dose to roughly 2–3 mg/L ammonia, run steady aeration, and keep water temperatures comfortable (cold garage or winter air slows bacterial growth noticeably).
- **Weeks 2–4:** Watch daily ammonia fall while **nitrite** spikes vivid purple—proof colony one has settled onto your media.
- **Weeks 4–6:** Wait until a fresh test dose converts all the way down to **zero ammonia and zero nitrite** within 24 hours, showing measurable **nitrate** instead. Only then transplant greens and introduce hardy fish slowly.

See detailed cycling tables and startup ratios in our [aquaponic biofilter cycling guide](/guides/aquaponic-biofilter-cycling) and [small-scale aquaponics overview](/guides/small-scale-aquaponics).

## Hold the pH truce and never skimp on aeration

Aquaponics always balances three distinct preferences: fish stay comfortable near pH 6.5–8.5, nitrifiers prefer slightly above 7.0 and slow sharply below 6.0, and greens absorb micronutrients best around 6.0–6.5. Aiming right down the middle at **pH 6.8 to 7.0** keeps every partner productive without frantic swings, alongside continuous bubbling aeration (FAO targets **5 mg/L or higher** dissolved oxygen). Respect stocking limits too—FAO's conservative small-scale ceiling sits around **20 kg of fish per 1,000 liters** of system volume paired with balanced grow beds.

Compare media beds, floating rafts, and NFT channels in [aquaponic system types](/guides/aquaponic-system-types) and match species to real seasonal water temperatures in [aquaponic fish species](/guides/aquaponic-fish-species) and map greenhouse or shed utility zones on [PlantGeo](https://plantgeo.aevani.com/). Browse [aquaponics tanks, siphons, and water test kits](/products/aquaponics)—or if you fabricate bell siphons, media frames, or solids filters, apply at [Sell on Aevani](/sell) for a flat 8% commission with card processing included and zero listing, monthly, or ad fees.`
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

function formatEssayInline(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/(?!\/)[^)\s]+)\)/g, '<a href="$2">$1</a>')
		.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}

/** Semantic blog blocks (headings, lists, emphasis, bold, links). The blog renderer sanitizes the result. */
export function cornerstoneEssayHtml(body: string): string {
	return body
		.trim()
		.split(/\n\s*\n/)
		.map((block) => {
			const trimmed = block.trim();
			if (trimmed.startsWith('### ')) {
				return `<h3>${formatEssayInline(trimmed.slice(4).trim())}</h3>`;
			}
			if (trimmed.startsWith('## ')) {
				return `<h2>${formatEssayInline(trimmed.slice(3).trim())}</h2>`;
			}
			const lines = trimmed.split('\n').map((line) => line.trim());
			if (lines.every((line) => line.startsWith('- '))) {
				const items = lines.map((line) => `<li>${formatEssayInline(line.slice(2))}</li>`).join('');
				return `<ul>${items}</ul>`;
			}
			if (lines.every((line) => /^\d+\.\s+/.test(line))) {
				const items = lines
					.map((line) => `<li>${formatEssayInline(line.replace(/^\d+\.\s+/, ''))}</li>`)
					.join('');
				return `<ol>${items}</ol>`;
			}
			if (lines.length >= 2 && lines.every((line) => line.startsWith('|') && line.endsWith('|'))) {
				return lines
					.filter((line) => {
						const cells = line.split('|').slice(1, -1);
						return !cells.every((cell) => /^:?-+:?$/.test(cell.trim()));
					})
					.map((line) => {
						const cells = line
							.split('|')
							.slice(1, -1)
							.map((cell) => formatEssayInline(cell.trim()));
						return `<p>${cells.join(' ')}</p>`;
					})
					.join('');
			}
			return `<p>${formatEssayInline(trimmed)}</p>`;
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
			documentTitle: essay.seoTitle ?? `${essay.title} — Aevani`,
			metaDescription: essay.metaDescription ?? essay.excerpt,
			publishedAt: essay.publishedAt,
			tags: JSON.stringify(essay.tags)
		},
		author: null,
		sources: essay.sources
	};
}
