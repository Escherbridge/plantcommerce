import { describe, expect, it } from 'vitest';
import { requireAdminUser } from './adminGuard';

describe('requireAdminUser', () => {
	it.each([null, undefined, { role: 'customer' }, { role: 'seller' }, { role: 'affiliate' }])(
		'refuses %j with a 403',
		(user) => {
			expect(() => requireAdminUser(user)).toThrowError(expect.objectContaining({ status: 403 }));
		}
	);

	it('returns the admin user', () => {
		const admin = { role: 'admin', id: 'a' };
		expect(requireAdminUser(admin)).toBe(admin);
	});
});
