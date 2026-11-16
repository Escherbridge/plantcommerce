import { describe, expect, it, vi } from 'vitest';
import {
	firstRegistrationError,
	focusRegistrationField,
	registrationFieldErrors
} from './validation';

const valid = {
	username: 'grower',
	email: 'grower@example.com',
	password: 'long-enough',
	confirmPassword: 'long-enough'
};

describe('firstRegistrationError', () => {
	it('points an empty submit at the password and keeps the existing message', () => {
		expect(
			firstRegistrationError({
				username: '',
				email: '',
				password: '',
				confirmPassword: ''
			})
		).toEqual({
			field: 'password',
			message: 'Password must be at least 8 characters'
		});
	});

	it('keeps the short-password message on the password field', () => {
		expect(
			firstRegistrationError({
				...valid,
				password: 'short',
				confirmPassword: 'short'
			})
		).toEqual({
			field: 'password',
			message: 'Password must be at least 8 characters'
		});
	});

	it('puts a mismatch on the password field, which is first', () => {
		expect(
			firstRegistrationError({
				...valid,
				password: 'short',
				confirmPassword: 'other'
			})
		).toEqual({ field: 'password', message: 'Passwords do not match' });

		expect(
			firstRegistrationError({
				...valid,
				confirmPassword: 'different-password'
			})
		).toEqual({ field: 'password', message: 'Passwords do not match' });
	});

	it('reports the username, then the email, using the existing messages', () => {
		expect(firstRegistrationError({ ...valid, username: 'ab' })).toEqual({
			field: 'username',
			message: 'Username must be at least 3 characters'
		});
		expect(firstRegistrationError({ ...valid, username: '  a  ' })).toEqual({
			field: 'username',
			message: 'Username must be at least 3 characters'
		});
		expect(firstRegistrationError({ ...valid, email: 'not-an-email' })).toEqual({
			field: 'email',
			message: 'Enter a valid email address'
		});
	});

	it('accepts a complete registration', () => {
		expect(firstRegistrationError(valid)).toBeNull();
		expect(firstRegistrationError({ ...valid, email: '  grower@example.com  ' })).toBeNull();
	});
});

describe('registrationFieldErrors', () => {
	it('lists every failing field with the existing messages', () => {
		expect(
			registrationFieldErrors({
				username: '',
				email: '',
				password: '',
				confirmPassword: ''
			})
		).toEqual([
			{ field: 'firstName', message: 'Enter your first name' },
			{ field: 'lastName', message: 'Enter your last name' },
			{ field: 'username', message: 'Username must be at least 3 characters' },
			{ field: 'email', message: 'Enter a valid email address' },
			{ field: 'password', message: 'Password must be at least 8 characters' },
			{ field: 'confirmPassword', message: 'Confirm your password' }
		]);
	});

	it('flags a blank first name, last name, and confirm password', () => {
		expect(
			registrationFieldErrors({
				...valid,
				firstName: '  ',
				lastName: '',
				confirmPassword: ''
			})
		).toEqual([
			{ field: 'firstName', message: 'Enter your first name' },
			{ field: 'lastName', message: 'Enter your last name' },
			{ field: 'confirmPassword', message: 'Confirm your password' }
		]);
	});

	it('keeps a mismatch on the password when confirmation is filled', () => {
		expect(
			registrationFieldErrors({
				...valid,
				firstName: 'Ada',
				lastName: 'Lovelace',
				confirmPassword: 'different-password'
			})
		).toEqual([{ field: 'password', message: 'Passwords do not match' }]);
	});

	it('accepts names and a matching confirmation', () => {
		expect(
			registrationFieldErrors({
				...valid,
				firstName: 'Ada',
				lastName: 'Lovelace'
			})
		).toEqual([]);
	});
});

describe('focusRegistrationField', () => {
	it('focuses only the invalid field', () => {
		const password = { focus: vi.fn() };
		const username = { focus: vi.fn() };

		focusRegistrationField('password', { password, username });

		expect(password.focus).toHaveBeenCalledOnce();
		expect(username.focus).not.toHaveBeenCalled();
	});

	it('does nothing when the field is not mounted', () => {
		expect(() => focusRegistrationField('email', {})).not.toThrow();
	});
});
