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

	it('answers a no-JS post with the form and does not redirect the secret', async () => {
		const pages = [
			['https://aevani.com/login', loginActions],
			['https://aevani.com/register', registerActions],
			['https://aevani.com/reset-password?token=opaque', resetPasswordActions],
			['https://aevani.com/forgot-password', forgotPasswordActions]
		] as const;

		for (const [href, actions] of pages) {
			const request = new Request(href, {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					usernameOrEmail: 'ada@example.com',
					email: 'ada@example.com',
					password: secret,
					confirmPassword: secret,
					confirmation: secret
				})
			});
			const result = await actions.default({
				request,
				url: new URL(href)
			} as never);
			expect(result).toMatchObject({ status: 400, data: { message: 'Please try again.' } });
			const serialized = JSON.stringify(result);
			expect(serialized).not.toContain(secret);
			expect(serialized).not.toContain('ada@example.com');
			expect(serialized).not.toMatch(/location|redirect/i);
		}

		expect(noJsCredentialPost().data.message).toBe('Please try again.');
	});
});
