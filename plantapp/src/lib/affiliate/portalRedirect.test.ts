import { describe, expect, it } from 'vitest';
import { affiliatePortalRedirect } from './portalRedirect';

const verified = { role: 'customer', emailVerified: true };
const unverified = { role: 'customer', emailVerified: false };

describe('affiliatePortalRedirect', () => {
	it('leaves the public hold pages and the join page in place', () => {
		for (const pathname of ['/affiliate', '/affiliate/', '/affiliate/terms', '/affiliate/join']) {
			expect(affiliatePortalRedirect({ pathname, user: null, affiliateActive: false })).toBeNull();
		}
	});

	it('sends a signed-out visitor to login and keeps the affiliate path', () => {
		expect(
			affiliatePortalRedirect({
				pathname: '/affiliate/dashboard',
				user: null,
				affiliateActive: false
			})
		).toBe('/login?redirect=%2Faffiliate%2Fdashboard');
	});

	it('sends an unverified account to join before the dashboard or links', () => {
		expect(
			affiliatePortalRedirect({
				pathname: '/affiliate/links',
				user: unverified,
				affiliateActive: false
			})
		).toBe('/affiliate/join');
	});

	it('sends a verified non-affiliate to join and lets an active affiliate through', () => {
		expect(
			affiliatePortalRedirect({
				pathname: '/affiliate/dashboard',
				user: verified,
				affiliateActive: false
			})
		).toBe('/affiliate/join');
		expect(
			affiliatePortalRedirect({
				pathname: '/affiliate/dashboard',
				user: { role: 'affiliate', emailVerified: true },
				affiliateActive: true
			})
		).toBeNull();
	});
});
