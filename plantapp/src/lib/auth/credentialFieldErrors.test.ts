import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import CredentialErrorSummary from '$lib/components/forms/CredentialErrorSummary.svelte';
import { LOGIN_MISSING_CREDENTIALS, loginFieldErrors } from '../../routes/login/validation';
import { registrationFieldErrors } from '../../routes/register/validation';
import LoginPage from '../../routes/login/+page.svelte';
import RegisterPage from '../../routes/register/+page.svelte';
import { credentialSummaryItems, describedByFor } from './credentialFieldErrors';

describe('credentialSummaryItems', () => {
	it('lists the shared empty-login message once and describes both fields', () => {
		const errors = loginFieldErrors({ usernameOrEmail: '  ', password: '' });
		const items = credentialSummaryItems(errors);

		expect(errors).toEqual([
			{ field: 'usernameOrEmail', message: LOGIN_MISSING_CREDENTIALS },
			{ field: 'password', message: LOGIN_MISSING_CREDENTIALS }
		]);
		expect(items.map((item) => item.message)).toEqual([LOGIN_MISSING_CREDENTIALS]);
		expect(describedByFor(errors, 'usernameOrEmail')).toBe(items[0]?.id);
		expect(describedByFor(errors, 'password')).toBe(items[0]?.id);
	});

	it('renders the shared login sentence once in the alert', () => {
		const errors = loginFieldErrors({ usernameOrEmail: '', password: '' });
		const { body } = render(CredentialErrorSummary, {
			props: {
				errors,
				fieldIds: { usernameOrEmail: 'email-address', password: 'password' }
			}
		});
		expect(body.match(/Please enter your email and password\./g)).toHaveLength(1);
		expect(body).toContain('role="alert"');
		expect(body).toContain('href="#email-address"');

		const login = render(LoginPage, {
			props: {
				form: { fieldErrors: loginFieldErrors({ usernameOrEmail: '', password: '' }) }
			}
		}).body;
		expect(login.match(/Please enter your email and password\./g)).toHaveLength(1);
		for (const id of ['email-address', 'password']) {
			const tag = login.match(new RegExp(`<input\\b[^>]*\\bid="${id}"[^>]*>`))?.[0] ?? '';
			expect(tag).toContain('aria-invalid="true"');
			expect(tag).toContain('aria-describedby="credential-error-usernameOrEmail-0"');
			expect(tag).toContain('value=""');
		}
	});

	it('renders blank register names and confirmation as described invalid fields', () => {
		const password = 'super-secret-value';
		const errors = registrationFieldErrors({
			firstName: '',
			lastName: ' ',
			username: 'grower',
			email: 'grower@example.com',
			password,
			confirmPassword: ''
		});
		const { body } = render(RegisterPage, { props: { form: { fieldErrors: errors } } });

		for (const id of ['firstName', 'lastName', 'confirmPassword']) {
			const tag = body.match(new RegExp(`<input\\b[^>]*\\bid="${id}"[^>]*>`))?.[0] ?? '';
			expect(tag).toContain('aria-invalid="true"');
			expect(tag).toMatch(/aria-describedby="credential-error-/);
		}
		for (const id of ['username', 'email', 'password']) {
			const tag = body.match(new RegExp(`<input\\b[^>]*\\bid="${id}"[^>]*>`))?.[0] ?? '';
			expect(tag).not.toContain('aria-invalid');
		}
		expect(body.match(/Enter your first name/g)).toHaveLength(1);
		expect(body.match(/Enter your last name/g)).toHaveLength(1);
		expect(body.match(/Confirm your password/g)).toHaveLength(1);
		expect(body).not.toContain(password);
		expect(body).not.toContain('grower@example.com');
	});

	it('keeps distinct messages that belong to one field', () => {
		const errors = [
			{ field: 'password', message: 'Password must be at least 8 characters' },
			{ field: 'password', message: 'Passwords do not match' }
		];

		expect(credentialSummaryItems(errors)).toHaveLength(2);
		expect(describedByFor(errors, 'password')?.split(' ')).toHaveLength(2);
		expect(describedByFor(errors, 'email')).toBeUndefined();
	});
});
