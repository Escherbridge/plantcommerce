import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	affiliateApplicationErrors,
	affiliateApplicationPayload,
	affiliatePortalStatus,
	affiliateSignInHref,
	affiliateSignupHref,
	emptyAffiliateApplication
} from './application';
import { affiliateSharePath, affiliateShareUrl, normalizeAffiliateLinkCode } from './linkCode';

const validDraft = {
	...emptyAffiliateApplication(),
	audience: 'Garden readers',
	promotionMethod: 'website',
	monthlyTraffic: 'under-1000',
	whyJoin: 'I will share catalogue links with my readers.',
	agreeTerms: true
};

describe('affiliate application', () => {
	it('rejects an empty form and accepts a complete one', () => {
		const errors = affiliateApplicationErrors(emptyAffiliateApplication());
		expect(errors.audience).toBeTruthy();
		expect(errors.promotionMethod).toBeTruthy();
		expect(errors.monthlyTraffic).toBeTruthy();
		expect(errors.whyJoin).toBeTruthy();
		expect(errors.agreeTerms).toBeTruthy();
		expect(affiliateApplicationPayload(emptyAffiliateApplication())).toBeNull();

		expect(affiliateApplicationPayload(validDraft)).toEqual({
			website: undefined,
			socialMedia: undefined,
			audience: 'Garden readers',
			promotionMethod: 'website',
			monthlyTraffic: 'under-1000',
			whyJoin: 'I will share catalogue links with my readers.',
			agreeTerms: true
		});
	});

	it('trims optional profile fields and rejects unknown choices', () => {
		expect(
			affiliateApplicationPayload({
				...validDraft,
				website: '  https://example.com/garden  ',
				socialMedia: '   '
			})
		).toMatchObject({
			website: 'https://example.com/garden',
			socialMedia: undefined
		});

		expect(
			affiliateApplicationErrors({
				...validDraft,
				promotionMethod: 'paid-ads',
				monthlyTraffic: 'lots'
			}).promotionMethod
		).toBeTruthy();
	});

	it('sends a signed-out applicant to same-origin signup before creating an affiliate', () => {
		expect(affiliateSignupHref('http://localhost:5173')).toBe(
			'/register?redirect=%2Faffiliate%2Fjoin'
		);
		expect(affiliateSignInHref('http://localhost:5173')).toBe(
			'/login?redirect=%2Faffiliate%2Fjoin'
		);
	});

	it('treats only an active approved row as portal access', () => {
		expect(affiliatePortalStatus(null)).toBe('none');
		expect(affiliatePortalStatus({ status: 'active', isActive: true })).toBe('active');
		expect(affiliatePortalStatus({ status: 'active', isActive: false })).toBe('pending');
		expect(affiliatePortalStatus({ status: 'pending', isActive: false })).toBe('pending');
		expect(affiliatePortalStatus({ status: 'rejected', isActive: false })).toBe('rejected');
		expect(affiliatePortalStatus({ status: 'suspended', isActive: false })).toBe('suspended');
	});
});

describe('affiliate share links', () => {
	it('builds a single-segment /aff share URL and rejects unsafe codes', () => {
		expect(normalizeAffiliateLinkCode('  garden_kit-1  ')).toBe('garden_kit-1');
		expect(normalizeAffiliateLinkCode('   ')).toBeUndefined();
		expect(affiliateSharePath('garden_kit-1')).toBe('/aff/garden_kit-1');
		expect(affiliateShareUrl('https://aevani.com', 'garden_kit-1')).toBe(
			'https://aevani.com/aff/garden_kit-1'
		);
		expect(affiliateShareUrl('http://localhost:5173/', 'Ab12_cd')).toBe(
			'http://localhost:5173/aff/Ab12_cd'
		);

		for (const code of ['../admin', 'a/b', 'ab', 'has space', 'quote"', 'a'.repeat(65)]) {
			expect(() => affiliateSharePath(code)).toThrow(/Link code/);
		}
	});
});

describe('public affiliate wording that stays closed', () => {
	const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

	it('leaves the footer label and llms.txt line unchanged', () => {
		const layout = readFileSync(join(root, 'routes/+layout.svelte'), 'utf8');
		const llms = readFileSync(join(root, 'lib/content/llms.ts'), 'utf8');
		expect(layout).toContain("{ label: 'Affiliate program (not open)', href: '/affiliate' }");
		expect(llms).toContain('There are no affiliate programs.');
	});

	it('does not put a rate, share, or payout schedule on the self-serve pages', () => {
		const pages = [
			'routes/affiliate/join/+page.svelte',
			'routes/affiliate/dashboard/+page.svelte',
			'routes/affiliate/links/+page.svelte'
		];
		for (const page of pages) {
			const source = readFileSync(join(root, page), 'utf8');
			expect(source).not.toMatch(
				/commission|payout|cookie|platform fee|sprout|steward|\d+(\.\d+)?%/i
			);
		}
	});
});
