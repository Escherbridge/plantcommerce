import { describe, expect, it } from 'vitest';
import { firstEmptyLoginField, loginFieldErrors } from './validation';

describe('firstEmptyLoginField', () => {
	it('focuses the email field when both credentials are empty', () => {
		expect(firstEmptyLoginField({ usernameOrEmail: '', password: '' })).toBe('usernameOrEmail');
		expect(firstEmptyLoginField({ usernameOrEmail: '   ', password: '' })).toBe('usernameOrEmail');
	});

	it('focuses the password when only it is missing', () => {
		expect(firstEmptyLoginField({ usernameOrEmail: 'ada@example.com', password: '' })).toBe(
			'password'
		);
	});

	it('attaches the existing message to each empty field', () => {
		expect(loginFieldErrors({ usernameOrEmail: '  ', password: '' })).toEqual([
			{ field: 'usernameOrEmail', message: 'Please enter your email and password.' },
			{ field: 'password', message: 'Please enter your email and password.' }
		]);
		expect(loginFieldErrors({ usernameOrEmail: 'ada', password: '' })).toEqual([
			{ field: 'password', message: 'Please enter your email and password.' }
		]);
		expect(loginFieldErrors({ usernameOrEmail: 'ada', password: 'secret' })).toEqual([]);
	});

	it('returns nothing when both credentials are present', () => {
		expect(
			firstEmptyLoginField({ usernameOrEmail: 'ada@example.com', password: 'secret' })
		).toBeNull();
	});
});
