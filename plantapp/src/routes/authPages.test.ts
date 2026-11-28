import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { layoutOwnsDocumentMeta, publicRouteMetadata } from '$lib/config/site';
import { registrationFieldErrors } from './register/validation';
import LoginPage from './login/+page.svelte';
import RegisterPage from './register/+page.svelte';
import ForgotPasswordPage from './forgot-password/+page.svelte';
import ResendPage from './resend-verification/+page.svelte';
import VerifyEmailPage from './verify-email/+page.svelte';

const routesDir = dirname(fileURLToPath(import.meta.url));

const titles = [
	['login/+page.svelte', 'Sign in — Aevani'],
	['forgot-password/+page.svelte', 'Reset your password — Aevani'],
	['reset-password/+page.svelte', 'Choose a new password — Aevani'],
	['resend-verification/+page.svelte', 'Verify your email — Aevani'],
	['verify-email/+page.svelte', 'Verify your email — Aevani']
] as const;

function inputTag(html: string, id: string): string {
	return html.match(new RegExp(`<input\\b[^>]*\\bid="${id}"[^>]*>`))?.[0] ?? '';
}

describe('auth page titles and register hints', () => {
	it('uses the Aevani titles', () => {
		const rendered = [
			[LoginPage, { form: null }, 'Sign in — Aevani'],
			[ForgotPasswordPage, { form: null }, 'Reset your password — Aevani'],
			[ResendPage, { data: { user: null } }, 'Verify your email — Aevani'],
			[VerifyEmailPage, { data: { token: null }, form: null }, 'Verify your email — Aevani']
		] as const;

		for (const [component, props, title] of rendered) {
			expect(render(component as never, { props: props as never }).head).toContain(
				`<title>${title}</title>`
			);
		}

		for (const [file, title] of titles) {
			expect(readFileSync(join(routesDir, file), 'utf8')).toContain(`<title>${title}</title>`);
		}

		// Register's title lives in route metadata so client navigation keeps it.
		// A static <title> in the page was empty after that navigation.
		const register = readFileSync(join(routesDir, 'register/+page.svelte'), 'utf8');
		expect(register).not.toContain('<title');
		expect(publicRouteMetadata('/register').title).toBe('Create an account — Aevani');
		expect(layoutOwnsDocumentMeta('/register')).toBe(true);
	});

	it('describes the username and password hints and marks names optional', () => {
		const { body } = render(RegisterPage, { props: { form: null } });
		expect(inputTag(body, 'username')).toContain('aria-describedby="username-hint"');
		expect(inputTag(body, 'password')).toContain('aria-describedby="password-hint"');
		expect(body).toContain('id="username-hint"');
		expect(body).toContain('Your username needs 3 to 50 characters.');
		expect(body).toContain('id="password-hint"');
		expect(body).toContain('Your password needs at least 8 characters.');
		expect(body).toContain('First name (optional)');
		expect(body).toContain('Last name (optional)');
	});

	it('keeps the hints on the fields when the server also reports errors', () => {
		const errors = registrationFieldErrors({
			firstName: 'Ada',
			lastName: 'Grower',
			username: 'ab',
			email: 'ada@example.com',
			password: 'short',
			confirmPassword: 'short'
		});
		const body = render(RegisterPage, {
			props: { form: { message: undefined, fieldErrors: errors, returnPath: '', invite: '' } }
		}).body;

		expect(inputTag(body, 'username')).toContain('username-hint');
		expect(inputTag(body, 'username')).toMatch(/aria-describedby="[^"]*credential-error-username-/);
		expect(inputTag(body, 'password')).toContain('password-hint');
		expect(inputTag(body, 'password')).toMatch(/aria-describedby="[^"]*credential-error-password-/);
	});

	it('asks a signed-out visitor to sign in before resending verification', () => {
		const signedOut = render(ResendPage, { props: { data: { user: null } as never } }).body;
		expect(signedOut).toContain('Sign in first, then come back here for a new link.');
		expect(signedOut.indexOf('Sign in first, then come back here for a new link.')).toBeLessThan(
			signedOut.indexOf('href="/login?redirect=/resend-verification"')
		);
		expect(signedOut).not.toContain(
			'Request a new verification email for the address on your signed-in account.'
		);
		expect(signedOut).toContain('href="/login?redirect=/resend-verification"');
		expect(signedOut).toContain('>Sign in<');
		expect(signedOut).not.toContain('Send verification email');

		const signedIn = render(ResendPage, {
			props: { data: { user: { id: 'user_1' } } as never }
		}).body;
		expect(signedIn).toContain(
			'Request a new verification email for the address on your signed-in account.'
		);
		expect(signedIn.indexOf('Request a new verification email')).toBeLessThan(
			signedIn.indexOf('Send verification email')
		);
		expect(signedIn).toContain('Send verification email');
		expect(signedIn).not.toContain('Sign in first, then come back here for a new link.');
		expect(signedIn).not.toContain('Back to login');
		expect(signedIn).not.toContain('Sign in to');

		expect(signedOut).toContain('>Back to login<');
	});

	it('sends login through the same-origin redirect helper', () => {
		const source = readFileSync(join(routesDir, 'login/+page.svelte'), 'utf8');
		expect(source).toContain('safeRedirectPath');
		expect(source).toContain('authHandoffHref');
		expect(source).toContain('class="login-target link font-semibold link-primary"');
		expect(source).toContain('min-height: 24px');
		expect(source).toContain('min-width: 24px');
	});
});
