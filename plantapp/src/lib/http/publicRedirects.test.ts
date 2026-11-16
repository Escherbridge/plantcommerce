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

	it('leaves the real pages alone', () => {
		expect(publicAliasRedirect('/register')).toBeNull();
		expect(publicAliasRedirect('/sell')).toBeNull();
		expect(publicAliasRedirect('/products')).toBeNull();
		expect(publicAliasRedirect('/login')).toBeNull();
	});
});
