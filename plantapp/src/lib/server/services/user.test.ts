import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isEmailLoginIdentifier, normalizeEmailAddress, UserService } from './user';
import { db } from '$lib/server/db';
import { hash, verify } from '@node-rs/argon2';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        transaction: vi.fn()
    }
}));

vi.mock('@node-rs/argon2', () => ({
    hash: vi.fn(),
    verify: vi.fn()
}));

vi.mock('../auth', () => ({
	accountCapabilitiesEnabled: vi.fn(() => false),
	invalidateUserSessions: vi.fn()
}));

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user if username and email are available', async () => {
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            const selectMock = vi.fn().mockReturnValue({ from: fromMock });

            (hash as any).mockResolvedValue('hashed_password');

            const returningMock = vi.fn().mockResolvedValue([{
                id: 'user123',
                username: 'testuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'customer',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
            const insertMock = vi.fn().mockReturnValue({ values: valuesMock });
            (db.transaction as any).mockImplementation(async (callback: any) =>
                callback({ execute: vi.fn(), select: selectMock, insert: insertMock })
            );

            const user = await UserService.createUser({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            });

            expect(user.id).toBe('user123');
            expect(hash).toHaveBeenCalled();
            expect(insertMock).toHaveBeenCalled();
        });

        it('should throw error if username exists', async () => {
            const limitMock = vi.fn().mockResolvedValue([{ username: 'testuser', email: 'other@example.com' }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            const selectMock = vi.fn().mockReturnValue({ from: fromMock });
            (db.transaction as any).mockImplementation(async (callback: any) =>
                callback({ execute: vi.fn(), select: selectMock, insert: vi.fn() })
            );

            await expect(UserService.createUser({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            })).rejects.toThrow('Username or email already exists');
        });

		it('keeps email-shaped usernames out of the username namespace', async () => {
			expect(isEmailLoginIdentifier('person@example.com')).toBe(true);
			expect(normalizeEmailAddress(' Person@Example.COM ')).toBe('person@example.com');
            await expect(UserService.createUser({
                username: 'person@example.com',
                email: 'other@example.com',
                password: 'password123'
            })).rejects.toThrow('Username cannot be an email address');
        });
    });

    describe('login', () => {
        it('should return a user without creating a session if credentials are valid', async () => {
            // Mock find user
            const limitMock = vi.fn().mockResolvedValue([{
                id: 'user123',
                username: 'testuser',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                isActive: true
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock verify
            (verify as any).mockResolvedValue(true);

            const result = await UserService.login({
                usernameOrEmail: 'testuser',
                password: 'password123'
            });

            expect(result.user.id).toBe('user123');
            expect(db.insert).not.toHaveBeenCalled();
        });

        it('should throw error if user not found', async () => {
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            await expect(UserService.login({
                usernameOrEmail: 'testuser',
                password: 'password123'
            })).rejects.toThrow('Invalid credentials');
        });
    });
});
