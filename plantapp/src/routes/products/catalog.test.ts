import { describe, expect, it } from 'vitest';
import {
	catalogChipMatches,
	legacyCatalogueIndexRedirect,
	productBreadcrumbLabel,
	productCategoryHref
} from './catalog';

describe('product category links', () => {
	it('redirects the old kit and supply indexes to the catalogue filters', () => {
		expect(legacyCatalogueIndexRedirect('/products/kits')).toBe(
			'/products?category=kits-collections'
		);
		expect(legacyCatalogueIndexRedirect('/products/supplies')).toBe(
			'/products?category=seeds-supplies'
		);
		expect(legacyCatalogueIndexRedirect('/products/hydroponics')).toBeNull();
	});

	it('points kit and supply breadcrumbs at the catalogue filters', () => {
		expect(productCategoryHref('kits')).toBe('/products?category=kits-collections');
		expect(productCategoryHref('supplies')).toBe('/products?category=seeds-supplies');
		expect(productCategoryHref('starter-kits')).toBe('/products?category=kits-collections');
		expect(productCategoryHref('heirloom-seeds')).toBe('/products?category=seeds-supplies');
		expect(productCategoryHref('hydroponics')).toBe('/products/hydroponics');
		expect(productCategoryHref('hydroponic-systems')).toBe('/products/hydroponics');
		expect(productCategoryHref('soil-testing')).toBe('/products/hydroponics');
		expect(productCategoryHref('missing-shelf')).toBeNull();
	});

	it('labels the soil-testing shelf with the hydroponics listing it opens', () => {
		expect(
			productBreadcrumbLabel('hydroponics', { slug: 'soil-testing', name: 'Soil Testing' })
		).toBe('Hydroponics');
		expect(
			productBreadcrumbLabel('hydroponics', {
				slug: 'nutrients-media',
				name: 'Nutrients & Media'
			})
		).toBe('Nutrients & Media');
		expect(productBreadcrumbLabel('kits', { slug: 'starter-kits', name: 'Starter Kits' })).toBe(
			'Starter Kits'
		);
		expect(productBreadcrumbLabel('hydroponics', null)).toBe('hydroponics');
	});

	it('matches starter kits and seeds to their parent systems', () => {
		expect(catalogChipMatches('kits-collections', 'kits')).toBe(true);
		expect(catalogChipMatches('seeds-supplies', 'supplies')).toBe(true);
		expect(catalogChipMatches('kits-collections', 'hydroponics')).toBe(false);
		expect(catalogChipMatches('hydroponics', 'hydroponics')).toBe(true);
	});
});
