import { describe, expect, it } from 'vitest';
import { catalogueFilterAnnouncement } from './filterAnnouncement';

describe('catalogue filter announcement', () => {
	it('names the real count and category', () => {
		expect(catalogueFilterAnnouncement(6, 'Aquaponics')).toBe('Showing 6 aquaponics items.');
		expect(catalogueFilterAnnouncement(1, 'Hydroponics')).toBe('Showing 1 hydroponics item.');
		expect(catalogueFilterAnnouncement(4, 'Starter kits')).toBe('Showing 4 starter kits items.');
	});

	it('says the full count when every product is showing', () => {
		expect(catalogueFilterAnnouncement(40, 'All products')).toBe('Showing all 40 items.');
		expect(catalogueFilterAnnouncement(1, 'All products')).toBe('Showing all 1 item.');
	});
});
