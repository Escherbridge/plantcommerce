import { eq, and, or, like, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { encodeBase64url } from '@oslojs/encoding';
import { createSession } from '../auth';

// Generate a random ID
function generateId(length: number = 15): string {
	const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length * 3 / 4)));
	return encodeBase64url(bytes).slice(0, length);
}

export interface UserProfile {
	id: string;
	username: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: 'admin' | 'customer' | 'affiliate';
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserParams {
	username: string;
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	role?: 'admin' | 'customer' | 'affiliate';
}

export interface UpdateUserParams {
	firstName?: string;
	lastName?: string;
	email?: string;
	username?: string;
}

export interface ChangePasswordParams {
	currentPassword: string;
	newPassword: string;
}

export interface LoginParams {
	usernameOrEmail: string;
	password: string;
}

export interface LoginResult {
	user: UserProfile;
	sessionToken: string;
}

export class UserService {
	/**
	 * Create new user account
	 */
	static async createUser(params: CreateUserParams): Promise<UserProfile> {
		const { username, email, password, firstName, lastName, role = 'customer' } = params;

		// Check if username or email already exists
		const existingUser = await db
			.select()
			.from(table.user)
			.where(
				or(
					eq(table.user.username, username),
					eq(table.user.email, email)
				)
			)
			.limit(1);

		if (existingUser.length > 0) {
			if (existingUser[0].username === username) {
				throw new Error('Username already exists');
			}
			if (existingUser[0].email === email) {
				throw new Error('Email already exists');
			}
		}

		// Hash password
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		// Generate user ID
		const userId = generateId(15);

		// Create user
		const newUser: typeof table.user.$inferInsert = {
			id: userId,
			username,
			email,
			passwordHash,
			firstName: firstName || null,
			lastName: lastName || null,
			role,
			isActive: true
		};

		const [user] = await db.insert(table.user).values(newUser).returning();

		return {
			id: user.id,
			username: user.username,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
	}

	/**
	 * Authenticate user login
	 */
	static async login(params: LoginParams): Promise<LoginResult> {
		const { usernameOrEmail, password } = params;

		// Find user by username or email
		const userResult = await db
			.select()
			.from(table.user)
			.where(
				and(
					or(
						eq(table.user.username, usernameOrEmail),
						eq(table.user.email, usernameOrEmail)
					),
					eq(table.user.isActive, true)
				)
			)
			.limit(1);

		if (userResult.length === 0) {
			throw new Error('Invalid credentials');
		}

		const user = userResult[0];

		// Verify password
		const isValidPassword = await verify(user.passwordHash, password);
		if (!isValidPassword) {
			throw new Error('Invalid credentials');
		}

		// Create session
		const sessionToken = generateId(40);
		await createSession(sessionToken, user.id);

		return {
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				isActive: user.isActive,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			},
			sessionToken
		};
	}

	/**
	 * Get user profile by ID
	 */
	static async getUserById(userId: string): Promise<UserProfile | null> {
		const userResult = await db
			.select()
			.from(table.user)
			.where(eq(table.user.id, userId))
			.limit(1);

		if (userResult.length === 0) {
			return null;
		}

		const user = userResult[0];
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
	}

	static async isUsernameAvailable(username: string): Promise<boolean> {
		const [existing] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, username))
			.limit(1);
		return !existing;
	}

	static async isEmailAvailable(email: string): Promise<boolean> {
		const [existing] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, email))
			.limit(1);
		return !existing;
	}

	static async updateProfile(userId: string, params: UpdateUserParams): Promise<UserProfile> {
		const { firstName, lastName, email, username } = params;

		if (email || username) {
			const conditions = [];
			if (email) conditions.push(eq(table.user.email, email));
			if (username) conditions.push(eq(table.user.username, username));

			const [existing] = await db
				.select()
				.from(table.user)
				.where(and(or(...conditions)))
				.limit(1);

			if (existing && existing.id !== userId) {
				if (existing.email === email) throw new Error('Email already exists');
				if (existing.username === username) throw new Error('Username already exists');
			}
		}

		const updateData: Partial<typeof table.user.$inferInsert> = { updatedAt: new Date() };
		if (firstName !== undefined) updateData.firstName = firstName;
		if (lastName !== undefined) updateData.lastName = lastName;
		if (email !== undefined) updateData.email = email;
		if (username !== undefined) updateData.username = username;

		const [updatedUser] = await db
			.update(table.user)
			.set(updateData)
			.where(eq(table.user.id, userId))
			.returning();

		if (!updatedUser) throw new Error('User not found');

		return {
			id: updatedUser.id,
			username: updatedUser.username,
			email: updatedUser.email,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			role: updatedUser.role,
			isActive: updatedUser.isActive,
			createdAt: updatedUser.createdAt,
			updatedAt: updatedUser.updatedAt
		};
	}

	/**
	 * Change user password
	 */
	static async changePassword(userId: string, params: ChangePasswordParams): Promise<void> {
		const { currentPassword, newPassword } = params;

		// Get current user
		const userResult = await db
			.select()
			.from(table.user)
			.where(eq(table.user.id, userId))
			.limit(1);

		if (userResult.length === 0) {
			throw new Error('User not found');
		}

		const user = userResult[0];

		// Verify current password
		const isValidPassword = await verify(user.passwordHash, currentPassword);
		if (!isValidPassword) {
			throw new Error('Current password is incorrect');
		}

		// Hash new password
		const newPasswordHash = await hash(newPassword, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		// Update password
		await db
			.update(table.user)
			.set({ 
				passwordHash: newPasswordHash,
				updatedAt: new Date()
			})
			.where(eq(table.user.id, userId));
	}

	/**
	 * Get all users for admin management
	 */
	static async getAllUsers(
		limit: number = 50,
		offset: number = 0,
		role?: 'admin' | 'customer' | 'affiliate',
		search?: string,
		isActive?: boolean
	): Promise<UserProfile[]> {
		// Apply filters
		const conditions = [];
		if (role) {
			conditions.push(eq(table.user.role, role));
		}
		if (search) {
			conditions.push(
				or(
					like(table.user.username, `%${search}%`),
					like(table.user.email, `%${search}%`),
					like(table.user.firstName, `%${search}%`),
					like(table.user.lastName, `%${search}%`)
				)
			);
		}
		if (isActive !== undefined) {
			conditions.push(eq(table.user.isActive, isActive));
		}

		const baseQuery = db.select().from(table.user);

		const users = conditions.length > 0 
			? await baseQuery
				.where(and(...conditions))
				.orderBy(desc(table.user.createdAt))
				.limit(limit)
				.offset(offset)
			: await baseQuery
				.orderBy(desc(table.user.createdAt))
				.limit(limit)
				.offset(offset);

		return users.map(user => ({
			id: user.id,
			username: user.username,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isActive: user.isActive,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		}));
	}

	/**
	 * Update user status (admin only)
	 */
	static async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
		await db
			.update(table.user)
			.set({ 
				isActive,
				updatedAt: new Date()
			})
			.where(eq(table.user.id, userId));
	}

	/**
	 * Update user role (admin only)
	 */
	static async updateUserRole(userId: string, role: 'admin' | 'customer' | 'affiliate'): Promise<void> {
		await db
			.update(table.user)
			.set({ 
				role,
				updatedAt: new Date()
			})
			.where(eq(table.user.id, userId));
	}

	/**
	 * Delete user account (admin only)
	 */
	static async deleteUser(userId: string): Promise<void> {
		// Note: This will cascade delete related records due to foreign key constraints
		await db.delete(table.user).where(eq(table.user.id, userId));
	}

	/**
	 * Get user statistics for admin dashboard
	 */
	static async getUserStats(): Promise<{
		totalUsers: number;
		activeUsers: number;
		adminUsers: number;
		customerUsers: number;
		affiliateUsers: number;
	}> {
		// This would be more efficient with a single query using conditional aggregation,
		// but for simplicity, we'll use multiple queries
		const [totalUsers, activeUsers, adminUsers, customerUsers, affiliateUsers] = await Promise.all([
			db.select().from(table.user),
			db.select().from(table.user).where(eq(table.user.isActive, true)),
			db.select().from(table.user).where(eq(table.user.role, 'admin')),
			db.select().from(table.user).where(eq(table.user.role, 'customer')),
			db.select().from(table.user).where(eq(table.user.role, 'affiliate'))
		]);

		return {
			totalUsers: totalUsers.length,
			activeUsers: activeUsers.length,
			adminUsers: adminUsers.length,
			customerUsers: customerUsers.length,
			affiliateUsers: affiliateUsers.length
		};
	}
}

export default UserService;
