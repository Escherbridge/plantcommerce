import { describe, expect, it } from 'vitest';
import { catalogChipMatches, productCategoryHref } from './catalog';

describe('product category links', () => {
	it('points kit and supply breadcrumbs at the catalogue filters', () => {
		expect(productCategoryHref('kits')).toBe('/products?category=kits-collections');
		expect(productCategoryHref('supplies')).toBe('/products?category=seeds-supplies');
		expect(productCategoryHref('starter-kits')).toBe('/products?category=kits-collections');
		expect(productCategoryHref('heirloom-seeds')).toBe('/products?category=seeds-supplies');
		expect(productCategoryHref('hydroponics')).toBe('/products/hydroponics');
		expect(productCategoryHref('hydroponic-systems')).toBe('/products/hydroponics');
		expect(productCategoryHref('missing-shelf')).toBeNull();
	});

	it('matches starter kits and seeds to their parent systems', () => {
		expect(catalogChipMatches('kits-collections', 'kits')).toBe(true);
		expect(catalogChipMatches('seeds-supplies', 'supplies')).toBe(true);
		expect(catalogChipMatches('kits-collections', 'hydroponics')).toBe(false);
		expect(catalogChipMatches('hydroponics', 'hydroponics')).toBe(true);
	});
});
