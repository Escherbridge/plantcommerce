import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ResendPage from '../../routes/resend-verification/+page.svelte';
import {
	VERIFICATION_ACCOUNT_PATH,
	VERIFICATION_CONTACT_PATH,
	VERIFICATION_SHOP_PATH,
	postRegisterHref,
	verificationEmailUnavailableCopy
} from './verificationEmail';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function source(path: string): string {
	return readFileSync(join(srcDir, path), 'utf8');
}

describe('verification email unavailable copy', () => {
	it('says the account exists, email can be retried later, and names no rate or address', () => {
		expect(verificationEmailUnavailableCopy).toBe(
			"Your account is created. We couldn't send the verification email right now. You'll be able to verify once email is back. Try resending it later."
		);
		expect(verificationEmailUnavailableCopy).not.toMatch(
			/commission|payout|share|rate|contact support|street|avenue|boulevard/i
		);
		expect(verificationEmailUnavailableCopy).not.toMatch(/\d{5}/);
	});

	it('sends a failed registration away from the verify gate', () => {
		expect(postRegisterHref(false, '/affiliate/join')).toBe(VERIFICATION_SHOP_PATH);
		expect(postRegisterHref(false, '/resend-verification?redirect=%2Faffiliate%2Fjoin')).toBe(
			VERIFICATION_SHOP_PATH
		);
		expect(postRegisterHref(false, '/account/profile')).toBe(VERIFICATION_SHOP_PATH);
		expect(postRegisterHref(true, '/affiliate/join')).toBe('/affiliate/join');
		expect(postRegisterHref(true, '/account/profile')).toBe('/account/profile');
		expect(VERIFICATION_CONTACT_PATH).toBe('/contact');
		expect(VERIFICATION_ACCOUNT_PATH).toBe('/account/profile');
	});

	it('uses that copy and a real contact route on register, join, and resend', () => {
		const register = source('routes/register/+page.svelte');
		const join = source('routes/affiliate/join/+page.svelte');
		const resend = source('routes/resend-verification/+page.svelte');
		const availability = source('lib/server/verificationEmailAvailable.ts');

		for (const page of [register, join, resend]) {
			expect(page).toContain('verificationEmailUnavailableCopy');
			expect(page).toContain('href="/contact"');
			expect(page).toContain('href="/products"');
			expect(page).toContain('href="/account/profile"');
		}

		expect(join).not.toMatch(/contact support/i);
		expect(resend).not.toMatch(/contact support/i);
		expect(register).not.toContain(
			'verification email delivery is not available yet. Please contact support'
		);

		expect(register).toContain('postRegisterHref(verificationEmailSent, continuePath)');
		expect(register).not.toContain('href={continuePath}');
		expect(join).toContain('data.verificationEmailAvailable === false');
		expect(join).toContain('Resend verification email');
		expect(resend).toContain('data.verificationEmailAvailable === false');

		expect(availability).toContain(
			'return accountCapabilitiesEnabled() && EmailService.isConfigured();'
		);
		expect(availability).not.toMatch(/process\.env|AUTH_CAPABILITIES_ENABLED\s*=/);
		expect(source('lib/server/api/auth.ts')).toContain(
			"message: 'Verification email is temporarily unavailable. Please contact support.'"
		);
	});

	it('shows the honest resend state, with a way out, when email cannot be sent', () => {
		const body = render(ResendPage, {
			props: {
				data: { user: { id: 'user_1' }, verificationEmailAvailable: false }
			} as never
		}).body;

		expect(body).toContain(verificationEmailUnavailableCopy);
		expect(body).toContain('href="/contact"');
		expect(body).toContain('>Contact us<');
		expect(body).toContain('href="/products"');
		expect(body).toContain('href="/account/profile"');
		expect(body).not.toContain('contact support');
		expect(body).not.toContain('Verification email is temporarily unavailable');
		expect(body).not.toContain('Request a new verification email');
	});
});
