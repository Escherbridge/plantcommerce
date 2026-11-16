import { describe, expect, it } from 'vitest';
import { publicAliasRedirect } from './publicRedirects';

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

	it('leaves the real pages alone', () => {
		expect(publicAliasRedirect('/register')).toBeNull();
		expect(publicAliasRedirect('/sell')).toBeNull();
		expect(publicAliasRedirect('/products')).toBeNull();
		expect(publicAliasRedirect('/login')).toBeNull();
	});
});
