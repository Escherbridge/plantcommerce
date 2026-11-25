import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { colors } from '$lib/styles/colors';
import { PASSWORD_TOO_SHORT } from '../../routes/register/validation';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function source(path: string): string {
	return readFileSync(join(srcDir, path), 'utf8');
}

function channel(value: number): number {
	const c = value / 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
	const value = hex.replace('#', '');
	const r = channel(parseInt(value.slice(0, 2), 16));
	const g = channel(parseInt(value.slice(2, 4), 16));
	const b = channel(parseInt(value.slice(4, 6), 16));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
	const lighter = Math.max(luminance(foreground), luminance(background));
	const darker = Math.min(luminance(foreground), luminance(background));
	return (lighter + 0.05) / (darker + 0.05);
}

/** Composite a white overlay on the page, matching the translucent field fill. */
function compositeWhite(page: string, alpha: number): string {
	const value = page.replace('#', '');
	const channels = [0, 2, 4].map((index) => {
		const base = parseInt(value.slice(index, index + 2), 16);
		return Math.round(255 * alpha + base * (1 - alpha))
			.toString(16)
			.padStart(2, '0');
	});
	return `#${channels.join('')}`;
}

describe('focus and sticky-header targets', () => {
	const appCss = source('app.css');
	const header = source('lib/components/navigation/Header.svelte');
	const register = source('routes/register/+page.svelte');
	const login = source('routes/login/+page.svelte');
	const sell = source('routes/sell/+page.svelte');

	it('uses the brand green focus ring at 3:1 against the page and the field', () => {
		const match = appCss.match(/--aevani-focus:\s*(#[0-9a-fA-F]{6})/);
		expect(match?.[1]?.toLowerCase()).toBe(colors.primary.toLowerCase());
		const focus = match?.[1] ?? '';

		expect(appCss).toContain('background: #f4f1ea');
		expect(appCss).toContain('--input-bg: rgba(255, 255, 255, 0.6)');
		expect(appCss).toContain(`
.register-page input.input:focus,
.login-page input.input:focus,
.sell-page input.input:focus,
.sell-page textarea.textarea:focus {
	outline: 2px solid var(--aevani-focus) !important;
	outline-offset: 2px !important;
}`);
		expect(appCss).toContain(`
.register-page #register-form-error:focus,
.register-page #register-form-error:focus-visible {
	outline: 2px solid var(--aevani-focus) !important;
	outline-offset: 2px !important;
}`);

		const page = '#f4f1ea';
		const field = compositeWhite(page, 0.6);
		expect(contrast(focus, page)).toBeGreaterThanOrEqual(3);
		expect(contrast(focus, field)).toBeGreaterThanOrEqual(3);
		expect(contrast(focus, '#ffffff')).toBeGreaterThanOrEqual(3);

		expect(register).toContain('class="register-page"');
		expect(login).toContain('class="login-page"');
		expect(sell).toContain('sell-page');
		expect(login).toContain('class="input-bordered input w-full"');
		expect(sell).toContain('class="input-bordered input w-full"');
		expect(sell).toContain('class="textarea-bordered textarea w-full"');
	});

	it('sets scroll-padding-top to the sticky header height', () => {
		expect(appCss).toContain(
			'--aevani-header-height: calc(var(--aevani-header-offset) + var(--aevani-header-bar-height))'
		);
		expect(appCss).toContain('--aevani-header-offset: 14px');
		expect(appCss).toContain('--aevani-header-bar-height: 64px');
		expect(appCss).toContain('--aevani-header-bar-height: calc(44px + 0.9rem + 2px)');
		expect(appCss).toMatch(/html\s*\{[^}]*scroll-padding-top:\s*var\(--aevani-header-height\)/);
		expect(header).toContain('top: var(--aevani-header-offset)');
		expect(header).toContain('min-height: var(--aevani-header-bar-height)');
		expect(header).not.toContain('min-height: 58px');
	});

	it('gives the account and menu buttons a 24px target, and 44px on mobile', () => {
		for (const rule of ['.account-btn', '.hamburger']) {
			const block = header.match(new RegExp(`${rule.replace('.', '\\.')} \\{[^}]*\\}`));
			expect(block?.[0]).toContain('min-width: 24px');
			expect(block?.[0]).toContain('min-height: 24px');
		}

		const mobile = [...header.matchAll(/@media \(max-width: 767px\) \{([\s\S]*?)\n\t\}/g)].map(
			(match) => match[1]
		);
		const account = mobile.find((block) => block.includes('.account-btn'));
		const menu = mobile.find((block) => block.includes('.hamburger'));
		expect(account).toContain('width: 44px');
		expect(account).toContain('height: 44px');
		expect(menu).toContain('width: 44px');
		expect(menu).toContain('height: 44px');
	});

	it('ties the register submit error to the invalid field and moves focus there', () => {
		expect(register).toContain('focusRegistrationFailure');
		expect(register).toContain('focusFailure(failure.field)');
		expect(register).toContain('tabindex="-1"');
		expect(register).toContain('id="register-form-error"');
		expect(register).toContain('id="register-password-errors"');
		for (const field of ['username', 'email', 'password']) {
			expect(register).toContain(`aria-invalid={${field}Invalid}`);
			expect(register).toContain(`aria-describedby={${field}DescribedBy}`);
		}
		expect(register).toContain('aria-invalid={confirmInvalid}');
		expect(register).toContain('aria-describedby={confirmDescribedBy}');
		expect(PASSWORD_TOO_SHORT).toBe('Password must be at least 8 characters');
		expect(register).toContain('PASSWORD_TOO_SHORT');
	});

	it('moves an empty login submit to the first missing credential', () => {
		expect(login).toContain('firstEmptyLoginField');
		expect(login).toContain('aria-invalid={emailInvalid}');
		expect(login).toContain('aria-describedby={emailDescribedBy}');
		expect(login).toContain('passwordInput)?.focus()');
		expect(login).toContain('LOGIN_MISSING_CREDENTIALS');
		expect(login).toContain('method="post"');
	});
});
