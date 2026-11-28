import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import RegisterPage from './+page.svelte';

const pageSource = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '+page.svelte'),
	'utf8'
);

function submitHandler(): string {
	const start = pageSource.indexOf('async function handleSubmit');
	return pageSource.slice(start);
}

describe('register failure focus', () => {
	it('focuses the error after a server-side sign-up failure, once the message is rendered', () => {
		const submit = submitHandler();
		const server = submit.slice(submit.indexOf('let serverFailed = false'));

		expect(server.match(/errorMessage = accountCreationFailureCopy/g)).toHaveLength(2);
		expect(server.match(/serverFailed = true/g)).toHaveLength(2);
		expect(server.indexOf('errorMessage = accountCreationFailureCopy')).toBeLessThan(
			server.indexOf('serverFailed = true')
		);
		expect(server.indexOf('isLoading = false')).toBeLessThan(server.indexOf('focusFailure(null)'));
		expect(server).toContain('await tick()');
		expect(server).toContain('focusFailure(null)');
		expect(pageSource).toContain('bind:this={registerError}');
		expect(pageSource).toContain('focusRegistrationFailure(field');
	});

	it('still moves a field-level failure to that field before the request', () => {
		const submit = submitHandler();
		const client = submit.slice(0, submit.indexOf('trpc.auth.register.mutate'));

		expect(client.indexOf('invalidField = failure.field')).toBeLessThan(
			client.indexOf('focusFailure(failure.field)')
		);
		expect(client.indexOf('await tick()')).toBeLessThan(
			client.indexOf('focusFailure(failure.field)')
		);
		expect(client.indexOf('focusFailure(failure.field)')).toBeLessThan(client.indexOf('return'));
	});

	it('renders the server error as a focusable alert', () => {
		const body = render(RegisterPage, {
			props: {
				form: { message: 'Please try again.', fieldErrors: [] }
			}
		}).body;
		const error = body.match(/<div\b[^>]*\bid="register-form-error"[^>]*>/)?.[0] ?? '';

		expect(error).toContain('role="alert"');
		expect(error).toContain('aria-live="assertive"');
		expect(error).toContain('tabindex="-1"');
		expect(body).toContain('Please try again.');
	});

	it('keeps aria-invalid and aria-describedby on the first invalid field', () => {
		const body = render(RegisterPage, {
			props: {
				form: {
					message: undefined,
					fieldErrors: [{ field: 'email', message: 'Enter a valid email address' }]
				}
			}
		}).body;
		const email = body.match(/<input\b[^>]*\bid="email"[^>]*>/)?.[0] ?? '';

		expect(email).toContain('aria-invalid="true"');
		expect(email).toContain('aria-describedby="credential-error-email-0"');
		expect(body).toContain('role="alert"');
		expect(body).toContain('tabindex="-1"');
	});
});
