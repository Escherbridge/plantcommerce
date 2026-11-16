import { describe, expect, it } from 'vitest';
import { cornerstoneEssayRecord, cornerstoneEssays } from './essays';
import { shortDocumentTitles } from './documentTitles';
import { publishedGuideSectors } from './research';

const proposed = {
	'/blog/cycling-your-first-aquaponics-loop': 'Cycling your first aquaponics biofilter — Aevani',
	'/blog/dwc-vs-kratky-vs-nft': 'DWC vs. Kratky vs. NFT for a first setup — Aevani',
	'/guides/aquaponic-system-types': 'Aquaponic types: media beds, NFT, DWC — Guides | Aevani',
	'/blog/raised-beds-for-heavy-clay-and-hot-summers':
		'Raised beds for heavy clay and hot summers — Aevani',
	'/guides/outdoor-bed-ipm': 'Outdoor bed and container pest management — Guides | Aevani',
	'/guides/hydroponic-troubleshooting-root-rot':
		'Hydroponic root rot, algae, and pH drift — Guides | Aevani',
	'/guides/nutrient-film-technique': 'Nutrient film technique: slope and flow — Guides | Aevani',
	'/guides/temperate-food-forest': 'Temperate food forests: layers and guilds — Guides | Aevani',
	'/guides/hydroponic-media': 'Hydroponic media: perlite, rockwool, coir — Guides | Aevani',
	'/guides/greenhouse-ipm': 'Greenhouse and tunnel pest management — Guides | Aevani',
	'/guides/source-water-testing': 'Testing source water for hydroponics — Guides | Aevani',
	'/guides/indoor-lighting-dli': 'Daily light integral (DLI) for greens — Guides | Aevani',
	'/blog/pre-spring-grower-checklist': 'A five-step pre-spring grower checklist — Aevani',
	'/guides/hydroponic-nutrient-disorders':
		'Hydroponic nutrient disorders: pH and EC — Guides | Aevani',
	'/guides/greenhouse-pollination': 'Pollinating greenhouse and tunnel tomatoes — Guides | Aevani',
	'/guides/winterizing-growing-systems':
		'Winterizing tunnels, irrigation, and pots — Guides | Aevani',
	'/guides/frost-dates-hardiness': 'Frost dates and hardiness zones — Guides | Aevani',
	'/guides/soilless-seed-starting': 'Seeds and transplants for soilless systems — Guides | Aevani',
	'/guides/container-gardening': 'Container gardening: size, media, watering — Guides | Aevani',
	'/guides/aquaponic-fish-species': 'Aquaponic fish by species and temperature — Guides | Aevani',
	'/guides/deep-water-culture': 'Deep water culture: aeration and oxygen — Guides | Aevani',
	'/guides/understanding-soil-health': 'Soil health: the foundation of a garden — Aevani',
	'/guides/soil-drip-irrigation': 'Drip irrigation for beds and high tunnels — Guides | Aevani',
	'/guides/greenhouse-ventilation-heat':
		'Greenhouse and tunnel ventilation and heat — Guides | Aevani',
	'/guides/kratky-method': 'Kratky method: non-circulating hydroponics — Guides | Aevani',
	'/guides/vertical-growing': 'Vertical hydroponics: density and light — Guides | Aevani',
	'/blog/monoculture-to-polyculture': 'From monoculture to polyculture — Aevani'
} as const;

describe('short document titles', () => {
	it('keeps every shipped title at 60 characters or fewer', () => {
		for (const [path, title] of Object.entries(proposed)) {
			expect(title.length, path).toBeLessThanOrEqual(60);
			expect(title.length, path).toBeGreaterThan(0);
		}
	});

	it('uses the short title for the document head and leaves essay headings alone', () => {
		for (const essay of cornerstoneEssays) {
			const expected = proposed[`/blog/${essay.slug}` as keyof typeof proposed];
			if (!expected) continue;
			expect(cornerstoneEssayRecord(essay).page.documentTitle).toBe(expected);
			expect(essay.title).not.toBe(expected.replace(/ — Aevani$/, ''));
		}
		expect(shortDocumentTitles['understanding-soil-health']).toBe(
			proposed['/guides/understanding-soil-health']
		);
		expect(shortDocumentTitles['monoculture-to-polyculture']).toBe(
			proposed['/blog/monoculture-to-polyculture']
		);
	});

	it('matches the researched guide document titles', () => {
		for (const guide of publishedGuideSectors) {
			const expected = proposed[`/guides/${guide.slug}` as keyof typeof proposed];
			if (!expected) continue;
			expect(guide.seoTitle, guide.slug).toBe(expected);
			expect(guide.title).not.toBe(expected);
		}
	});
});
