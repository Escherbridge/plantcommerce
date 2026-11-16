import { describe, expect, it } from 'vitest';
import { firstEmptyLoginField } from './validation';

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

	it('returns nothing when both credentials are present', () => {
		expect(
			firstEmptyLoginField({ usernameOrEmail: 'ada@example.com', password: 'secret' })
		).toBeNull();
	});
});
