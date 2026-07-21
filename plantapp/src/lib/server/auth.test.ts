import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ dev: true }));
vi.mock('$env/dynamic/private', () => ({
	env: {
		AUTH_CAPABILITIES_ENABLED: 'true',
		AUTH_ATOMIC_THROTTLES_ENABLED: 'true'
	}
}));
vi.mock('$lib/server/db', () => ({
	db: {
		transaction: vi.fn(),
		insert: vi.fn(),
		delete: vi.fn()
	}
}));

import { db } from '$lib/server/db';
import {
	generateEmailVerificationToken,
	generateEmailChangeCapabilities,
	generatePasswordResetToken,
	toPublicSession,
	toPublicSessionUser
} from './auth';

function lockedUser(email: string, pendingEmail: string | null = null) {
	const forUpdate = vi.fn().mockResolvedValue([{ email, pendingEmail, isActive: true }]);
	const where = vi.fn().mockReturnValue({ for: forUpdate });
	const from = vi.fn().mockReturnValue({ where });
	return vi.fn().mockReturnValue({ from });
}

describe('account recovery capabilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('persists only a digest of an email-verification capability', async () => {
		const deleteWhere = vi.fn().mockResolvedValue(undefined);
		const insertValues = vi.fn().mockResolvedValue(undefined);
		vi.mocked(db.transaction).mockImplementation(async (callback: any) =>
			callback({
				select: lockedUser('person@example.net'),
				delete: vi.fn().mockReturnValue({ where: deleteWhere }),
				insert: vi.fn().mockReturnValue({ values: insertValues })
			})
		);

		const token = await generateEmailVerificationToken('user-1', 'person@example.net');
		const stored = insertValues.mock.calls[0][0];

		expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(stored.id).toMatch(/^[a-f0-9]{64}$/);
		expect(stored.id).not.toBe(token);
		expect(stored.userId).toBe('user-1');
	});

	it('uses the same hash-only representation for password-reset capabilities', async () => {
		const deleteWhere = vi.fn().mockResolvedValue(undefined);
		const insertValues = vi.fn().mockResolvedValue(undefined);
		vi.mocked(db.transaction).mockImplementation(async (callback: any) =>
			callback({
				select: lockedUser('person@example.net'),
				delete: vi.fn().mockReturnValue({ where: deleteWhere }),
				insert: vi.fn().mockReturnValue({ values: insertValues })
			})
		);

		const token = await generatePasswordResetToken('user-1', 'person@example.net');
		const stored = insertValues.mock.calls[0][0];

		expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(stored.id).toMatch(/^[a-f0-9]{64}$/);
		expect(stored.id).not.toBe(token);
		expect(stored.email).toBe('person@example.net');
	});

	it('requires distinct hash-only proofs before an email replacement can be confirmed', async () => {
		const deleteWhere = vi.fn().mockResolvedValue(undefined);
		const insertValues = vi.fn().mockResolvedValue(undefined);
		vi.mocked(db.transaction).mockImplementation(async (callback: any) =>
			callback({
				select: lockedUser('current@example.net', 'next@example.net'),
				delete: vi.fn().mockReturnValue({ where: deleteWhere }),
				insert: vi.fn().mockReturnValue({ values: insertValues })
			})
		);

		const capabilities = await generateEmailChangeCapabilities(
			'user-1',
			'current@example.net',
			'next@example.net'
		);
		const stored = insertValues.mock.calls[0][0];

		expect(capabilities?.newEmailToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(capabilities?.existingEmailToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(capabilities?.newEmailToken).not.toBe(capabilities?.existingEmailToken);
		expect(stored.newEmailTokenHash).toMatch(/^[a-f0-9]{64}$/);
		expect(stored.previousEmailTokenHash).toMatch(/^[a-f0-9]{64}$/);
		expect(stored.newEmailTokenHash).not.toBe(capabilities?.newEmailToken);
		expect(stored.previousEmailTokenHash).not.toBe(capabilities?.existingEmailToken);
	});

	it('serializes only the public session identity fields', () => {
		const publicUser = toPublicSessionUser({
			id: 'user-1',
			username: 'grower',
			email: 'person@example.net',
			firstName: null,
			lastName: null,
			role: 'customer',
			isActive: true,
			passwordHash: 'argon2-hash',
			pendingEmail: 'pending@example.net',
			avatarFileId: null,
			emailVerified: false,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		expect(publicUser).not.toHaveProperty('passwordHash');
		expect(publicUser).not.toHaveProperty('pendingEmail');
		expect(
			toPublicSession({
				id: 'session-secret',
				userId: 'user-1',
				expiresAt: new Date(),
				rememberMe: false,
				createdAt: new Date(),
				lastAccessedAt: new Date()
			})
		).not.toHaveProperty('id');
	});
});
