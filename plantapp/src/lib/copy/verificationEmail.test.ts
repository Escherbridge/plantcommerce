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
	verificationEmailResendUnavailableMessage,
	verificationEmailUnavailableCopy,
	verificationResendHref,
	verificationResendPageCopy,
	verificationResendTransportError
} from './verificationEmail';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function source(path: string): string {
	return readFileSync(join(srcDir, path), 'utf8');
}

describe('verification email unavailable copy', () => {
	it('says the account exists, email can be retried later, and names no rate or address', () => {
		expect(verificationEmailUnavailableCopy).toBe(
			"Your account is ready, but we couldn't send the verification email. You can resend it from the verification page later."
		);
		expect(verificationResendPageCopy).toBe(
			"Your account is ready, but we couldn't send the verification email."
		);
		expect(verificationResendPageCopy).not.toContain(
			'You can resend it from the verification page later.'
		);
		expect(verificationEmailResendUnavailableMessage).toBe(
			"We couldn't send the verification email. Try again later."
		);
		expect(verificationResendTransportError).toBe(
			"That didn't send. Check your connection and try again."
		);
		for (const copy of [verificationEmailUnavailableCopy, verificationResendPageCopy]) {
			expect(copy).not.toMatch(
				/commission|payout|share|rate|contact support|street|avenue|boulevard/i
			);
			expect(copy).not.toMatch(/\d{5}/);
		}
		expect(verificationEmailResendUnavailableMessage).not.toMatch(/contact support/i);
	});

	it('sends a failed registration away from the verify gate', () => {
		expect(postRegisterHref(false, '/affiliate/join')).toBe(VERIFICATION_SHOP_PATH);
		expect(postRegisterHref(false, '/resend-verification?redirect=%2Faffiliate%2Fjoin')).toBe(
			VERIFICATION_SHOP_PATH
		);
		expect(postRegisterHref(false, '/account/profile')).toBe(VERIFICATION_SHOP_PATH);
		expect(postRegisterHref(true, '/affiliate/join')).toBe('/affiliate/join');
		expect(postRegisterHref(true, '/account/profile')).toBe('/account/profile');
		expect(verificationResendHref('/affiliate/join', 'https://aevani.com')).toBe(
			'/resend-verification?redirect=%2Faffiliate%2Fjoin'
		);
		expect(verificationResendHref('/account/orders?tab=open', 'https://aevani.com')).toBe(
			'/resend-verification?redirect=%2Faccount%2Forders%3Ftab%3Dopen'
		);
		expect(verificationResendHref(null, 'https://aevani.com')).toBe('/resend-verification');
		expect(verificationResendHref('https://evil.com', 'https://aevani.com')).toBe(
			'/resend-verification'
		);
		expect(VERIFICATION_CONTACT_PATH).toBe('/contact');
		expect(VERIFICATION_ACCOUNT_PATH).toBe('/account/profile');
	});

	it('uses that copy and a real contact route on register, join, and resend', () => {
		const register = source('routes/register/+page.svelte');
		const join = source('routes/affiliate/join/+page.svelte');
		const resend = source('routes/resend-verification/+page.svelte');
		const availability = source('lib/server/verificationEmailAvailable.ts');

		for (const page of [register, join, resend]) {
			expect(page).toContain('href="/contact"');
			expect(page).toContain('href="/products"');
			expect(page).toContain('href="/account/profile"');
		}
		for (const page of [register, join]) {
			expect(page).toContain('verificationEmailUnavailableCopy');
			expect(page).not.toContain('verificationResendPageCopy');
		}
		expect(resend).toContain('verificationResendPageCopy');
		expect(resend).not.toContain('verificationEmailUnavailableCopy');

		expect(join).not.toMatch(/contact support/i);
		expect(resend).not.toMatch(/contact support/i);
		expect(register).not.toContain(
			'verification email delivery is not available yet. Please contact support'
		);
		for (const page of [register, join, resend]) {
			expect(page).not.toContain('before then');
		}
		expect(register).toContain('>Contact us</a> if you need help.');
		expect(join).toContain('>Contact us</a> if you need help.');
		expect(resend).toContain('Try again later, or');
		expect(resend).toContain('>contact us</a>');
		expect(resend).toContain('if you need');
		expect(resend).not.toContain('Resend it later');
		expect(resend).not.toContain('You can resend it from the verification page later.');
		expect(resend).toContain('verificationResendTransportError');
		expect(resend).not.toContain('Sign in to request a verification email.');
		expect(resend).toContain('{#if !signedIn}');

		expect(register).toContain('postRegisterHref(verificationEmailSent, continuePath)');
		expect(register).not.toContain('href={continuePath}');
		expect(register).toContain('verificationResendHref(current.redirect, current.origin)');
		expect(register).not.toContain('href="/resend-verification"');
		expect(join).toContain('data.verificationEmailAvailable === false');
		expect(join).toContain('Resend verification email');
		expect(resend).toContain('data.verificationEmailAvailable === false');

		expect(availability).toContain(
			'return accountCapabilitiesEnabled() && EmailService.isConfigured();'
		);
		expect(availability).not.toMatch(/process\.env|AUTH_CAPABILITIES_ENABLED\s*=/);
		const auth = source('lib/server/api/auth.ts');
		expect(auth).toContain('verificationEmailResendUnavailableMessage');
		expect(auth.match(/message: verificationEmailResendUnavailableMessage/g)).toHaveLength(2);
		expect(auth).not.toContain('Verification email is temporarily unavailable');
		expect(auth).toContain(
			"'Password recovery email is temporarily unavailable. Please contact support.'"
		);
	});

	it('shows the honest resend state, with a way out, when email cannot be sent', () => {
		const body = render(ResendPage, {
			props: {
				data: { user: { id: 'user_1' }, verificationEmailAvailable: false }
			} as never
		}).body;

		const visible = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
		expect(body).toContain(verificationResendPageCopy);
		expect(body).not.toContain(verificationEmailUnavailableCopy);
		expect(body).not.toContain('You can resend it from the verification page later.');
		expect(body).toContain('href="/contact"');
		expect(visible).toContain('Try again later, or contact us if you need help.');
		expect(visible).not.toContain('Resend it later');
		expect(body).toContain('>contact us<');
		expect(body).toContain('href="/products"');
		expect(body).toContain('href="/account/profile"');
		expect(body).not.toContain('before then');
		expect(body).not.toContain('contact support');
		expect(body).not.toContain('Verification email is temporarily unavailable');
		expect(body).not.toContain('Request a new verification email');
		expect(body).not.toContain('Back to login');
		expect(body).not.toContain('Sign in to');
	});
});
