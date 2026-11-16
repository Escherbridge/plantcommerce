import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogueSearchRedirect, publicAliasRedirect } from './publicRedirects';

describe('public alias redirects', () => {
	it('sends sign-up aliases to register and seller aliases to sell', () => {
		expect(publicAliasRedirect('/signup')).toBe('/register');
		expect(publicAliasRedirect('/sign-up')).toBe('/register');
		expect(publicAliasRedirect('/seller')).toBe('/sell');
		expect(publicAliasRedirect('/sellers')).toBe('/sell');
		expect(publicAliasRedirect('/sell/apply')).toBe('/sell');
		expect(publicAliasRedirect('/apply')).toBe('/sell');
		expect(publicAliasRedirect('/signup/')).toBe('/register');
	});

	it('308s the retired beginner notes onto the live pages', () => {
		expect(publicAliasRedirect('/blog/hydroponics-for-beginners')).toBe(
			'/blog/dwc-vs-kratky-vs-nft'
		);
		expect(publicAliasRedirect('/blog/introduction-to-aquaponics')).toBe(
			'/guides/small-scale-aquaponics'
		);
		expect(publicAliasRedirect('/blog/what-is-silvopasture')).toBe(
			'/guides/temperate-silvopasture'
		);
		expect(publicAliasRedirect('/blog/hydroponics-for-beginners/')).toBe(
			'/blog/dwc-vs-kratky-vs-nft'
		);
		expect(publicAliasRedirect('/blog/dwc-vs-kratky-vs-nft')).toBeNull();
		expect(publicAliasRedirect('/guides/small-scale-aquaponics')).toBeNull();
		expect(publicAliasRedirect('/blog/monoculture-to-polyculture')).toBeNull();
	});

	it('308s /products?q=... to /search and keeps the query', () => {
		expect(catalogueSearchRedirect(new URL('https://aevani.com/products?q=basil'))).toBe(
			'/search?q=basil'
		);
		expect(
			catalogueSearchRedirect(
				new URL('https://aevani.com/products?q=red+basil&category=hydroponics')
			)
		).toBe('/search?q=red+basil&category=hydroponics');
		expect(catalogueSearchRedirect(new URL('https://aevani.com/products/?q=mint'))).toBe(
			'/search?q=mint'
		);
		expect(catalogueSearchRedirect(new URL('https://aevani.com/products?q='))).toBe('/search?q=');
		expect(catalogueSearchRedirect(new URL('https://aevani.com/products'))).toBeNull();
		expect(catalogueSearchRedirect(new URL('https://aevani.com/search?q=basil'))).toBeNull();
		expect(
			catalogueSearchRedirect(new URL('https://aevani.com/products?category=hydroponics'))
		).toBeNull();
	});

	it('308s /products?search=... to /search?q= and keeps the other params', () => {
		expect(catalogueSearchRedirect(new URL('https://aevani.com/products?search=basil'))).toBe(
			'/search?q=basil'
		);
		expect(
			catalogueSearchRedirect(
				new URL('https://aevani.com/products?search=red+basil&category=hydroponics')
			)
		).toBe('/search?q=red+basil&category=hydroponics');
		expect(catalogueSearchRedirect(new URL('https://aevani.com/products/?search=mint'))).toBe(
			'/search?q=mint'
		);
		expect(catalogueSearchRedirect(new URL('https://aevani.com/products?search='))).toBe(
			'/search?q='
		);
		expect(
			catalogueSearchRedirect(
				new URL('https://aevani.com/products?category=hydroponics&search=basil')
			)
		).toBe('/search?category=hydroponics&q=basil');
		expect(
			catalogueSearchRedirect(new URL('https://aevani.com/products/hydroponics?search=basil'))
		).toBeNull();

		const hooks = readFileSync(
			join(dirname(fileURLToPath(import.meta.url)), '../../hooks.server.ts'),
			'utf8'
		);
		expect(hooks).toContain('catalogueSearchRedirect(event.url)');
		expect(hooks).toContain('redirect(308, target)');
	});

	it('leaves the real pages alone', () => {
		expect(publicAliasRedirect('/register')).toBeNull();
		expect(publicAliasRedirect('/sell')).toBeNull();
		expect(publicAliasRedirect('/products')).toBeNull();
		expect(publicAliasRedirect('/login')).toBeNull();
	});
});
