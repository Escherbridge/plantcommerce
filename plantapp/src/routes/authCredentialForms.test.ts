import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';
import { noJsCredentialPost } from '$lib/server/noJsCredentialPost';
import { actions as forgotPasswordActions } from './forgot-password/+page.server';
import { actions as loginActions } from './login/+page.server';
import { actions as registerActions } from './register/+page.server';
import { actions as resetPasswordActions } from './reset-password/+page.server';

const routesDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(routesDir, '..');
const secret = 'credential-must-not-enter-the-query';

const credentialPages = ['login', 'register', 'reset-password'] as const;

function walkSvelte(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			files.push(...walkSvelte(path));
		} else if (entry.endsWith('.svelte')) {
			files.push(path);
		}
	}
	return files;
}

function formBlocks(source: string): { attrs: string; body: string }[] {
	return [...source.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)].map((match) => ({
		attrs: match[1] ?? '',
		body: match[2] ?? ''
	}));
}

function inputNames(body: string): string[] {
	return [...body.matchAll(/<input\b[^>]*>/g)]
		.map((match) => /name=["']([^"']+)["']/.exec(match[0])?.[1])
		.filter((name): name is string => Boolean(name));
}

/** What a browser does with a form before any script runs. */
function nativeSubmission(pageUrl: string, attrs: string, names: string[]) {
	const method = (/method=["']([^"']+)["']/i.exec(attrs)?.[1] ?? 'get').toLowerCase();
	const action = /action=["']([^"']+)["']/i.exec(attrs)?.[1] ?? pageUrl;
	const url = new URL(action, pageUrl);
	const params = new URLSearchParams();
	for (const name of names) params.set(name, secret);
	if (method === 'get') {
		for (const [name, value] of params) url.searchParams.set(name, value);
		return { method, url: url.toString(), body: '' };
	}
	return { method, url: url.toString(), body: params.toString() };
}

describe('credential forms', () => {
	it('renders login and register as method=post and keeps credentials out of a GET', () => {
		for (const page of ['login', 'register'] as const) {
			const source = readFileSync(join(routesDir, page, '+page.svelte'), 'utf8');
			const compiled = compile(source, {
				filename: `${page}/+page.svelte`,
				generate: 'server',
				css: 'external'
			});
			expect(compiled.js.code).toContain('<form method="post"');
			expect(compiled.js.code).not.toContain('<form method="get"');

			const forms = formBlocks(source);
			expect(forms).toHaveLength(1);
			const submission = nativeSubmission(
				`https://aevani.com/${page}`,
				forms[0].attrs,
				inputNames(forms[0].body)
			);
			expect(submission.method).toBe('post');
			expect(submission.url).toBe(`https://aevani.com/${page}`);
			expect(submission.url).not.toContain(secret);
			expect(submission.url).not.toMatch(/password=|usernameOrEmail=|email=/);
			expect(submission.body).toContain(secret);
		}
	});

	it('never places a password field in a GET form', () => {
		const offenders: string[] = [];
		for (const file of walkSvelte(srcDir)) {
			const source = readFileSync(file, 'utf8');
			for (const form of formBlocks(source)) {
				if (!/type=["']password["']/.test(form.body)) continue;
				const submission = nativeSubmission('https://aevani.com/form', form.attrs, ['password']);
				if (submission.method !== 'post' || submission.url.includes(secret)) {
					offenders.push(relative(srcDir, file));
				}
			}
		}
		expect(offenders).toEqual([]);

		for (const page of credentialPages) {
			const source = readFileSync(join(routesDir, page, '+page.svelte'), 'utf8');
			expect(source).toMatch(/type=["']password["']/);
			expect(formBlocks(source).every((form) => /method=["']post["']/i.test(form.attrs))).toBe(
				true
			);
		}
	});

	it('answers a complete no-JS post without echoing the secret or redirecting', async () => {
		const pages = [
			[
				'https://aevani.com/login',
				loginActions,
				{ usernameOrEmail: 'ada@example.com', password: secret }
			],
			[
				'https://aevani.com/register',
				registerActions,
				{
					firstName: 'Fern',
					lastName: 'Willow',
					username: 'grower',
					email: 'ada@example.com',
					password: secret,
					confirmPassword: secret
				}
			],
			[
				'https://aevani.com/reset-password?token=opaque',
				resetPasswordActions,
				{ password: secret, confirmation: secret }
			],
			['https://aevani.com/forgot-password', forgotPasswordActions, { email: 'ada@example.com' }]
		] as const;

		for (const [href, actions, fields] of pages) {
			const request = new Request(href, {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams(fields)
			});
			const result = await actions.default({
				request,
				url: new URL(href)
			} as never);
			expect(result).toMatchObject({ status: 400, data: { message: 'Please try again.' } });
			const serialized = JSON.stringify(result);
			expect(serialized).not.toContain(secret);
			expect(serialized).not.toContain('ada@example.com');
			expect(serialized).not.toContain('grower');
			expect(serialized).not.toContain('Fern');
			expect(serialized).not.toContain('Willow');
			expect(serialized).not.toMatch(/location|redirect/i);
		}

		expect(noJsCredentialPost().data.message).toBe('Please try again.');
	});

	it('returns the existing per-field errors and never the password', async () => {
		const password = 'super-secret-value';
		const cases = [
			{
				href: 'https://aevani.com/login',
				actions: loginActions,
				body: { usernameOrEmail: '', password: '' },
				errors: [
					{ field: 'usernameOrEmail', message: 'Please enter your email and password.' },
					{ field: 'password', message: 'Please enter your email and password.' }
				]
			},
			{
				href: 'https://aevani.com/register',
				actions: registerActions,
				body: {
					username: 'ab',
					email: 'not-an-email',
					password: 'short',
					confirmPassword: 'other'
				},
				errors: [
					{ field: 'username', message: 'Username must be at least 3 characters' },
					{ field: 'email', message: 'Enter a valid email address' },
					{ field: 'password', message: 'Password must be at least 8 characters' },
					{ field: 'password', message: 'Passwords do not match' }
				]
			},
			{
				href: 'https://aevani.com/register',
				actions: registerActions,
				body: {
					firstName: '',
					lastName: '',
					username: '',
					email: '',
					password: '',
					confirmPassword: ''
				},
				errors: [
					{ field: 'username', message: 'Username must be at least 3 characters' },
					{ field: 'email', message: 'Enter a valid email address' },
					{ field: 'password', message: 'Password must be at least 8 characters' },
					{ field: 'confirmPassword', message: 'Confirm your password' }
				]
			},
			{
				href: 'https://aevani.com/forgot-password',
				actions: forgotPasswordActions,
				body: { email: 'not-an-email' },
				errors: [{ field: 'email', message: 'Enter a valid email address' }]
			},
			{
				href: 'https://aevani.com/reset-password?token=opaque',
				actions: resetPasswordActions,
				body: { password: 'short', confirmation: 'other' },
				errors: [
					{ field: 'password', message: 'Password must be at least 8 characters.' },
					{ field: 'confirmation', message: 'Passwords do not match.' }
				]
			},
			{
				href: 'https://aevani.com/reset-password',
				actions: resetPasswordActions,
				body: { password, confirmation: password },
				errors: [{ field: 'token', message: 'This password reset link is invalid or expired.' }]
			}
		] as const;

		const summary = readFileSync(
			join(srcDir, 'lib/components/forms/CredentialErrorSummary.svelte'),
			'utf8'
		);
		expect(summary).toContain('role="alert"');
		expect(summary).toContain('autofocus');
		expect(summary).toContain('tabindex="-1"');
		expect(summary).toContain('credentialSummaryItems');
		expect(readFileSync(join(srcDir, 'lib/auth/credentialFieldErrors.ts'), 'utf8')).toContain(
			'Please review the following'
		);

		for (const page of ['login', 'register', 'forgot-password', 'reset-password']) {
			const source = readFileSync(join(routesDir, page, '+page.svelte'), 'utf8');
			const form = formBlocks(source)[0]?.body ?? '';
			expect(form.indexOf('CredentialErrorSummary')).toBeGreaterThanOrEqual(0);
			expect(form.indexOf('CredentialErrorSummary')).toBeLessThan(form.indexOf('<input'));
			expect(source).toContain('aria-invalid=');
			expect(source).toContain('aria-describedby=');
		}

		const register = readFileSync(join(routesDir, 'register', '+page.svelte'), 'utf8');
		expect(register).toContain('aria-invalid={firstNameInvalid}');
		expect(register).toContain('aria-describedby={firstNameDescribedBy}');
		expect(register).toContain('aria-invalid={lastNameInvalid}');
		expect(register).toContain('aria-describedby={lastNameDescribedBy}');
		expect(register).toContain('aria-invalid={confirmInvalid}');
		expect(register).toContain('aria-describedby={confirmDescribedBy}');
		expect(register).toContain("firstName: 'firstName'");
		expect(register).toContain("lastName: 'lastName'");
		expect(register).toContain("confirmPassword: 'confirmPassword'");

		for (const item of cases) {
			const result = await item.actions.default({
				request: new Request(item.href, {
					method: 'POST',
					headers: { 'content-type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams(item.body)
				}),
				url: new URL(item.href)
			} as never);
			expect(result).toMatchObject({ status: 400, data: { fieldErrors: item.errors } });
			const serialized = JSON.stringify(result);
			for (const value of Object.values(item.body)) {
				if (value) expect(serialized).not.toContain(value);
			}
			expect(serialized).not.toMatch(/location|redirect/i);
		}
	});

	it('lets a no-JS register post with blank names pass validation', async () => {
		const result = await registerActions.default({
			request: new Request('https://aevani.com/register', {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					firstName: '   ',
					lastName: '',
					username: 'grower',
					email: 'ada@example.com',
					password: secret,
					confirmPassword: secret
				})
			}),
			url: new URL('https://aevani.com/register')
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: { message: 'Please try again.', fieldErrors: [] }
		});
		const serialized = JSON.stringify(result);
		expect(serialized).not.toContain('Enter your first name');
		expect(serialized).not.toContain('Enter your last name');
		expect(serialized).not.toContain(secret);
		expect(serialized).not.toContain('ada@example.com');
		expect(serialized).not.toContain('grower');
	});
});
