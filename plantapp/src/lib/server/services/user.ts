import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { accountCapabilitiesEnabled } from '../auth';
import {
	assertPublicCatalogAvailable,
	getPublicCatalogAvailability
} from '../catalogTruth/publicCatalog';

// Generate a random ID
function generateId(length: number = 15): string {
	const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil((length * 3) / 4)));
	return encodeBase64url(bytes).slice(0, length);
}

async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

let missingAccountPasswordHash: Promise<string> | null = null;

function missingAccountHash(): Promise<string> {
	missingAccountPasswordHash ??= hashPassword('not-a-valid-aevani-password');
	return missingAccountPasswordHash;
}

const recoveryTokenPattern = /^[A-Za-z0-9_-]{43}$/;
const emailIdentifierPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email-shaped identifiers always belong to the email login namespace. */
export function isEmailLoginIdentifier(value: string): boolean {
	return emailIdentifierPattern.test(value.trim());
}

/** Email identity is compared and persisted in one lowercase, trimmed form. */
export function normalizeEmailAddress(value: string): string {
	return value.trim().toLowerCase();
}

function hashRecoveryToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export interface UserProfile {
	id: string;
	username: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: 'admin' | 'customer' | 'affiliate' | 'instructor';
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
	role?: 'admin' | 'customer' | 'affiliate' | 'instructor';
}

export interface UpdateUserParams {
	firstName?: string;
	lastName?: string;
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
}

export class UserService {
	/**
	 * Create new user account
	 */
	static async createUser(params: CreateUserParams): Promise<UserProfile> {
		const { username, email, password, firstName, lastName, role = 'customer' } = params;
		const normalizedEmail = normalizeEmailAddress(email);
		if (isEmailLoginIdentifier(username)) {
			throw new Error('Username cannot be an email address');
		}
		const passwordHash = await hashPassword(password);

		const user = await db.transaction(async (tx) => {
			for (const identifier of [username, normalizedEmail].sort()) {
				await tx.execute(
					sql`SELECT pg_advisory_xact_lock(hashtext(${`login-identifier:${identifier}`}))`
				);
			}

			const [existingUser] = await tx
				.select()
				.from(table.user)
				.where(
					or(
						eq(table.user.username, username),
						sql`lower(${table.user.username}) = ${normalizedEmail}`,
						eq(table.user.email, username),
						sql`lower(${table.user.email}) = ${normalizedEmail}`,
						eq(table.user.pendingEmail, username),
						sql`lower(${table.user.pendingEmail}) = ${normalizedEmail}`
					)
				)
				.limit(1);
			if (existingUser) {
				throw new Error('Username or email already exists');
			}

			const newUser: typeof table.user.$inferInsert = {
				id: generateId(15),
				username,
				email: normalizedEmail,
				passwordHash,
				firstName: firstName || null,
				lastName: lastName || null,
				role,
				isActive: true
			};

			const [createdUser] = await tx.insert(table.user).values(newUser).returning();
			if (!createdUser) throw new Error('Failed to create user');
			return createdUser;
		});

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
		const loginByEmail = isEmailLoginIdentifier(usernameOrEmail);
		const loginIdentifier = loginByEmail ? normalizeEmailAddress(usernameOrEmail) : usernameOrEmail;
		const loginCondition = loginByEmail
			? sql`lower(${table.user.email}) = ${loginIdentifier}`
			: eq(table.user.username, loginIdentifier);

		const userResult = await db
			.select()
			.from(table.user)
			.where(and(loginCondition, eq(table.user.isActive, true)))
			.limit(2);

		const user = userResult.length === 1 ? userResult[0] : null;
		const passwordHash = user?.passwordHash ?? (await missingAccountHash());
		const isValidPassword = await verify(passwordHash, password);
		if (!user || !isValidPassword) {
			throw new Error('Invalid credentials');
		}

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
			}
		};
	}

	/**
	 * Get user profile by ID
	 */
	static async getUserById(userId: string): Promise<UserProfile | null> {
		const userResult = await db.select().from(table.user).where(eq(table.user.id, userId)).limit(1);

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

	static async getUserByEmail(email: string): Promise<UserProfile | null> {
		const normalizedEmail = normalizeEmailAddress(email);
		const userResult = await db
			.select()
			.from(table.user)
			.where(sql`lower(${table.user.email}) = ${normalizedEmail}`)
			.limit(2);

		if (userResult.length !== 1) {
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

	/** Canonical account key prevents separate username and email throttle budgets. */
	static async getLoginThrottleIdentity(usernameOrEmail: string): Promise<string> {
		const loginByEmail = isEmailLoginIdentifier(usernameOrEmail);
		const loginIdentifier = loginByEmail ? normalizeEmailAddress(usernameOrEmail) : usernameOrEmail;
		const loginCondition = loginByEmail
			? sql`lower(${table.user.email}) = ${loginIdentifier}`
			: eq(table.user.username, loginIdentifier);
		const users = await db
			.select({ id: table.user.id })
			.from(table.user)
			.where(loginCondition)
			.limit(2);
		const [user] = users;

		return users.length === 1 && user
			? `user:${user.id}`
			: `input:${loginIdentifier.trim().toLowerCase()}`;
	}

	static async isUsernameAvailable(username: string): Promise<boolean> {
		if (isEmailLoginIdentifier(username)) return false;
		const [existing] = await db
			.select()
			.from(table.user)
			.where(
				or(
					eq(table.user.username, username),
					eq(table.user.email, username),
					eq(table.user.pendingEmail, username)
				)
			)
			.limit(1);
		return !existing;
	}

	static async isEmailAvailable(email: string): Promise<boolean> {
		const normalizedEmail = normalizeEmailAddress(email);
		const [existing] = await db
			.select()
			.from(table.user)
			.where(
				or(
					sql`lower(${table.user.username}) = ${normalizedEmail}`,
					sql`lower(${table.user.email}) = ${normalizedEmail}`,
					sql`lower(${table.user.pendingEmail}) = ${normalizedEmail}`
				)
			)
			.limit(1);
		return !existing;
	}

	static async updateProfile(userId: string, params: UpdateUserParams): Promise<UserProfile> {
		const { firstName, lastName, username } = params;

		const updatedUser = await db.transaction(async (tx) => {
			const [currentUser] = await tx
				.select({ id: table.user.id })
				.from(table.user)
				.where(eq(table.user.id, userId))
				.for('update');
			if (!currentUser) throw new Error('User not found');

			if (username !== undefined) {
				if (isEmailLoginIdentifier(username)) {
					throw new Error('Username cannot be an email address');
				}
				await tx.execute(
					sql`SELECT pg_advisory_xact_lock(hashtext(${`login-identifier:${username}`}))`
				);

				const [existing] = await tx
					.select()
					.from(table.user)
					.where(
						or(
							eq(table.user.username, username),
							eq(table.user.email, username),
							eq(table.user.pendingEmail, username)
						)
					)
					.limit(1);

				if (existing && existing.id !== userId) {
					throw new Error('Username already exists');
				}
			}

			const updateData: Partial<typeof table.user.$inferInsert> = { updatedAt: new Date() };
			if (firstName !== undefined) updateData.firstName = firstName;
			if (lastName !== undefined) updateData.lastName = lastName;
			if (username !== undefined) updateData.username = username;

			const [result] = await tx
				.update(table.user)
				.set(updateData)
				.where(eq(table.user.id, userId))
				.returning();
			if (!result) throw new Error('User not found');

			return result;
		});

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

	/** Atomically stage an email replacement and any accompanying profile edit. */
	static async requestEmailChange(
		userId: string,
		newEmail: string,
		currentPassword: string,
		profile: UpdateUserParams = {}
	) {
		const normalizedNewEmail = normalizeEmailAddress(newEmail);
		const { firstName, lastName, username } = profile;
		if (username !== undefined && isEmailLoginIdentifier(username)) {
			throw new Error('Username cannot be an email address');
		}

		return db.transaction(async (tx) => {
			const [currentUser] = await tx
				.select()
				.from(table.user)
				.where(eq(table.user.id, userId))
				.for('update');
			if (!currentUser) throw new Error('User not found');
			if (!(await verify(currentUser.passwordHash, currentPassword))) {
				throw new Error('Current password is incorrect');
			}

			const identifiers = [
				...new Set([normalizedNewEmail, ...(username === undefined ? [] : [username])])
			].sort();
			for (const identifier of identifiers) {
				await tx.execute(
					sql`SELECT pg_advisory_xact_lock(hashtext(${`login-identifier:${identifier}`}))`
				);
			}

			const conflictingIdentifiers = [
				sql`lower(${table.user.username}) = ${normalizedNewEmail}`,
				sql`lower(${table.user.email}) = ${normalizedNewEmail}`,
				sql`lower(${table.user.pendingEmail}) = ${normalizedNewEmail}`
			];
			if (username !== undefined) {
				conflictingIdentifiers.push(
					eq(table.user.username, username),
					eq(table.user.email, username),
					eq(table.user.pendingEmail, username)
				);
			}
			const [existing] = await tx
				.select({ id: table.user.id })
				.from(table.user)
				.where(or(...conflictingIdentifiers))
				.limit(1);
			if (existing && existing.id !== userId) {
				throw new Error('Username or email already exists');
			}

			const updateData: Partial<typeof table.user.$inferInsert> = {
				pendingEmail: normalizedNewEmail,
				updatedAt: new Date()
			};
			if (firstName !== undefined) updateData.firstName = firstName;
			if (lastName !== undefined) updateData.lastName = lastName;
			if (username !== undefined) updateData.username = username;
			const [updatedUser] = await tx
				.update(table.user)
				.set(updateData)
				.where(eq(table.user.id, userId))
				.returning();
			if (!updatedUser) throw new Error('User not found');

			await tx
				.delete(table.emailVerificationToken)
				.where(eq(table.emailVerificationToken.userId, userId));
			await tx
				.delete(table.emailChangeCapability)
				.where(eq(table.emailChangeCapability.userId, userId));
			await tx.delete(table.passwordResetToken).where(eq(table.passwordResetToken.userId, userId));

			return {
				user: {
					id: updatedUser.id,
					username: updatedUser.username,
					email: updatedUser.email,
					firstName: updatedUser.firstName,
					lastName: updatedUser.lastName,
					role: updatedUser.role,
					isActive: updatedUser.isActive,
					createdAt: updatedUser.createdAt,
					updatedAt: updatedUser.updatedAt
				},
				previousEmail: currentUser.email
			};
		});
	}

	/**
	 * Change user password
	 */
	static async changePassword(userId: string, params: ChangePasswordParams): Promise<void> {
		const { currentPassword, newPassword } = params;

		await db.transaction(async (tx) => {
			const [user] = await tx
				.select()
				.from(table.user)
				.where(eq(table.user.id, userId))
				.for('update');
			if (!user) throw new Error('User not found');
			if (!(await verify(user.passwordHash, currentPassword))) {
				throw new Error('Current password is incorrect');
			}

			await tx
				.update(table.user)
				.set({
					passwordHash: await hashPassword(newPassword),
					pendingEmail: null,
					updatedAt: new Date()
				})
				.where(eq(table.user.id, userId));
			await tx.delete(table.session).where(eq(table.session.userId, userId));
			if (accountCapabilitiesEnabled()) {
				await tx
					.delete(table.passwordResetToken)
					.where(eq(table.passwordResetToken.userId, userId));
				await tx
					.delete(table.emailChangeCapability)
					.where(eq(table.emailChangeCapability.userId, userId));
			}
			await tx
				.delete(table.emailVerificationToken)
				.where(eq(table.emailVerificationToken.userId, userId));
		});
	}

	/** Consume a recovery capability and reset the password in one transaction. */
	static async resetPasswordWithRecoveryToken(
		token: string,
		newPassword: string
	): Promise<string | null> {
		if (!recoveryTokenPattern.test(token)) {
			return null;
		}

		const tokenId = hashRecoveryToken(token);
		return await db.transaction(async (tx) => {
			const [candidateToken] = await tx
				.select({ userId: table.passwordResetToken.userId })
				.from(table.passwordResetToken)
				.where(eq(table.passwordResetToken.id, tokenId))
				.limit(1);

			if (!candidateToken) {
				return null;
			}
			const [currentUser] = await tx
				.select({ id: table.user.id, email: table.user.email, isActive: table.user.isActive })
				.from(table.user)
				.where(eq(table.user.id, candidateToken.userId))
				.for('update');
			if (!currentUser) {
				return null;
			}

			const [storedToken] = await tx
				.select()
				.from(table.passwordResetToken)
				.where(eq(table.passwordResetToken.id, tokenId))
				.for('update');
			if (!storedToken || storedToken.userId !== currentUser.id) {
				return null;
			}

			if (Date.now() >= storedToken.expiresAt.getTime()) {
				await tx
					.delete(table.passwordResetToken)
					.where(eq(table.passwordResetToken.id, storedToken.id));
				return null;
			}
			if (!currentUser.isActive || currentUser.email !== storedToken.email) {
				await tx
					.delete(table.passwordResetToken)
					.where(eq(table.passwordResetToken.id, storedToken.id));
				return null;
			}

			const passwordHash = await hashPassword(newPassword);

			const [updatedUser] = await tx
				.update(table.user)
				.set({ passwordHash, pendingEmail: null, updatedAt: new Date() })
				.where(eq(table.user.id, storedToken.userId))
				.returning({ id: table.user.id });

			if (!updatedUser) {
				return null;
			}

			await tx.delete(table.session).where(eq(table.session.userId, storedToken.userId));
			await tx
				.delete(table.passwordResetToken)
				.where(eq(table.passwordResetToken.userId, storedToken.userId));
			await tx
				.delete(table.emailVerificationToken)
				.where(eq(table.emailVerificationToken.userId, storedToken.userId));
			await tx
				.delete(table.emailChangeCapability)
				.where(eq(table.emailChangeCapability.userId, storedToken.userId));
			return storedToken.userId;
		});
	}

	/**
	 * Get all users for admin management
	 */
	static async getAllUsers(
		limit: number = 50,
		offset: number = 0,
		role?: 'admin' | 'customer' | 'affiliate' | 'instructor',
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

		const users =
			conditions.length > 0
				? await baseQuery
						.where(and(...conditions))
						.orderBy(desc(table.user.createdAt))
						.limit(limit)
						.offset(offset)
				: await baseQuery.orderBy(desc(table.user.createdAt)).limit(limit).offset(offset);

		return users.map((user) => ({
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
		await db.transaction(async (tx) => {
			await tx
				.update(table.user)
				.set({ isActive, updatedAt: new Date() })
				.where(eq(table.user.id, userId));
			await tx.delete(table.session).where(eq(table.session.userId, userId));
			if (!isActive) {
				if (accountCapabilitiesEnabled()) {
					await tx
						.delete(table.passwordResetToken)
						.where(eq(table.passwordResetToken.userId, userId));
					await tx
						.delete(table.emailChangeCapability)
						.where(eq(table.emailChangeCapability.userId, userId));
				}
				await tx
					.delete(table.emailVerificationToken)
					.where(eq(table.emailVerificationToken.userId, userId));
			}
		});
	}

	/**
	 * Update user role (admin only)
	 */
	static async updateUserRole(
		userId: string,
		role: 'admin' | 'customer' | 'affiliate' | 'instructor'
	): Promise<void> {
		await db.transaction(async (tx) => {
			await tx
				.update(table.user)
				.set({ role, updatedAt: new Date() })
				.where(eq(table.user.id, userId));
			await tx.delete(table.session).where(eq(table.session.userId, userId));
			if (accountCapabilitiesEnabled()) {
				await tx
					.delete(table.passwordResetToken)
					.where(eq(table.passwordResetToken.userId, userId));
				await tx
					.delete(table.emailChangeCapability)
					.where(eq(table.emailChangeCapability.userId, userId));
			}
		});
	}

	/**
	 * Delete user account (admin only)
	 */
	static async deleteUser(userId: string): Promise<void> {
		// Note: This will cascade delete related records due to foreign key constraints
		await db.delete(table.user).where(eq(table.user.id, userId));
	}

	/**
	 * Get user's wishlist items with product details
	 */
	static async getWishlist(userId: string) {
		if (getPublicCatalogAvailability().status !== 'available') {
			return [];
		}
		const items = await db
			.select({
				id: table.wishlistItem.id,
				productId: table.wishlistItem.productId,
				createdAt: table.wishlistItem.createdAt,
				product: {
					id: table.product.id,
					name: table.product.name,
					slug: table.product.slug,
					price: table.product.price,
					comparePrice: table.product.comparePrice,
					shortDescription: table.product.shortDescription,
					categoryId: table.product.categoryId,
					isActive: table.product.isActive
				}
			})
			.from(table.wishlistItem)
			.innerJoin(table.product, eq(table.wishlistItem.productId, table.product.id))
			.where(eq(table.wishlistItem.userId, userId))
			.orderBy(desc(table.wishlistItem.createdAt));

		return items;
	}

	/**
	 * Add product to wishlist
	 */
	static async addToWishlist(userId: string, productId: number) {
		assertPublicCatalogAvailable();
		const [item] = await db
			.insert(table.wishlistItem)
			.values({ userId, productId })
			.onConflictDoNothing()
			.returning();

		return item || null;
	}

	/**
	 * Remove product from wishlist
	 */
	static async removeFromWishlist(userId: string, productId: number) {
		await db
			.delete(table.wishlistItem)
			.where(
				and(eq(table.wishlistItem.userId, userId), eq(table.wishlistItem.productId, productId))
			);
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
