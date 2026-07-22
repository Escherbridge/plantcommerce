import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { eq, or } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeBase64urlNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const CAPABILITY_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const sessionCookieName = 'auth-session';

export type PublicSessionUser = Pick<
	table.User,
	| 'id'
	| 'username'
	| 'email'
	| 'firstName'
	| 'lastName'
	| 'role'
	| 'isActive'
	| 'createdAt'
	| 'updatedAt'
>;

export type PublicSession = Pick<table.Session, 'expiresAt'>;

/** Convert server-only identity records before they cross a SvelteKit data boundary. */
export function toPublicSessionUser(user: table.User | null): PublicSessionUser | null {
	if (!user) return null;
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

export function toPublicSession(session: table.Session | null): PublicSession | null {
	return session ? { expiresAt: session.expiresAt } : null;
}

/** Account-email capabilities stay off until the source-only recovery migration is rehearsed. */
export function accountCapabilitiesEnabled(): boolean {
	return env.AUTH_CAPABILITIES_ENABLED === 'true' && env.AUTH_ATOMIC_THROTTLES_ENABLED === 'true';
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const createdAt = new Date();
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(createdAt.getTime() + DAY_IN_MS * 30),
		rememberMe: false,
		createdAt,
		lastAccessedAt: createdAt
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	return await db.transaction(async (tx) => {
		const [session] = await tx
			.select()
			.from(table.session)
			.where(eq(table.session.id, sessionId))
			.for('update');

		if (!session) {
			return { session: null, user: null };
		}

		// Lock only the session here; account mutations lock the user before revoking sessions.
		const [user] = await tx
			.select()
			.from(table.user)
			.where(eq(table.user.id, session.userId))
			.limit(1);
		if (!user) {
			await tx.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}

		const sessionExpired = Date.now() >= session.expiresAt.getTime();
		if (sessionExpired) {
			await tx.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}

		if (!user.isActive) {
			await tx.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}

		const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
		if (renewSession) {
			session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
			await tx
				.update(table.session)
				.set({ expiresAt: session.expiresAt })
				.where(eq(table.session.id, session.id));
		}

		return { session, user };
	});
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export async function invalidateUserSessions(userId: string) {
	await db.delete(table.session).where(eq(table.session.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

function generateCapabilityToken(): string {
	return encodeBase64urlNoPadding(crypto.getRandomValues(new Uint8Array(32)));
}

function hashCapabilityToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function generateEmailVerificationToken(
	userId: string,
	email: string
): Promise<string | null> {
	const token = generateCapabilityToken();
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 2);

	return await db.transaction(async (tx) => {
		const [currentUser] = await tx
			.select({
				email: table.user.email,
				pendingEmail: table.user.pendingEmail,
				isActive: table.user.isActive
			})
			.from(table.user)
			.where(eq(table.user.id, userId))
			.for('update');
		if (
			!currentUser ||
			!currentUser.isActive ||
			currentUser.pendingEmail !== null ||
			email !== currentUser.email
		) {
			return null;
		}

		await tx
			.delete(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.userId, userId));
		await tx.insert(table.emailVerificationToken).values({
			id: hashCapabilityToken(token),
			userId,
			email,
			expiresAt
		});
		return token;
	});
}

export type EmailChangeCapabilities = Readonly<{
	newEmailToken: string;
	existingEmailToken: string;
}>;

/** Issue both proofs required to replace an account's trusted recovery email. */
export async function generateEmailChangeCapabilities(
	userId: string,
	previousEmail: string,
	pendingEmail: string
): Promise<EmailChangeCapabilities | null> {
	const newEmailToken = generateCapabilityToken();
	const existingEmailToken = generateCapabilityToken();
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 2);

	return await db.transaction(async (tx) => {
		const [currentUser] = await tx
			.select({
				email: table.user.email,
				pendingEmail: table.user.pendingEmail,
				isActive: table.user.isActive
			})
			.from(table.user)
			.where(eq(table.user.id, userId))
			.for('update');
		if (
			!currentUser ||
			!currentUser.isActive ||
			currentUser.email !== previousEmail ||
			currentUser.pendingEmail !== pendingEmail
		) {
			return null;
		}

		await tx
			.delete(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.userId, userId));
		await tx
			.delete(table.emailChangeCapability)
			.where(eq(table.emailChangeCapability.userId, userId));
		await tx.insert(table.emailChangeCapability).values({
			userId,
			previousEmail,
			pendingEmail,
			newEmailTokenHash: hashCapabilityToken(newEmailToken),
			previousEmailTokenHash: hashCapabilityToken(existingEmailToken),
			expiresAt
		});
		return { newEmailToken, existingEmailToken };
	});
}

/** Consume one email-change proof; only both independent proofs can promote the pending address. */
async function verifyEmailChangeCapability(tokenId: string): Promise<string | null | undefined> {
	return await db.transaction(async (tx) => {
		const [candidate] = await tx
			.select({ userId: table.emailChangeCapability.userId })
			.from(table.emailChangeCapability)
			.where(
				or(
					eq(table.emailChangeCapability.newEmailTokenHash, tokenId),
					eq(table.emailChangeCapability.previousEmailTokenHash, tokenId)
				)
			)
			.limit(1);
		if (!candidate) {
			return undefined;
		}

		const [currentUser] = await tx
			.select({
				id: table.user.id,
				email: table.user.email,
				pendingEmail: table.user.pendingEmail,
				isActive: table.user.isActive
			})
			.from(table.user)
			.where(eq(table.user.id, candidate.userId))
			.for('update');
		if (!currentUser) {
			return null;
		}

		const [capability] = await tx
			.select()
			.from(table.emailChangeCapability)
			.where(eq(table.emailChangeCapability.userId, currentUser.id))
			.for('update');
		if (!capability || Date.now() >= capability.expiresAt.getTime()) {
			if (capability) {
				await tx
					.delete(table.emailChangeCapability)
					.where(eq(table.emailChangeCapability.userId, currentUser.id));
			}
			return null;
		}

		const provesNewEmail = capability.newEmailTokenHash === tokenId;
		const confirmsExistingEmail = capability.previousEmailTokenHash === tokenId;
		if (
			(!provesNewEmail && !confirmsExistingEmail) ||
			!currentUser.isActive ||
			currentUser.email !== capability.previousEmail ||
			currentUser.pendingEmail !== capability.pendingEmail
		) {
			await tx
				.delete(table.emailChangeCapability)
				.where(eq(table.emailChangeCapability.userId, currentUser.id));
			return null;
		}

		const confirmedAt = new Date();
		if (provesNewEmail) {
			await tx
				.update(table.emailChangeCapability)
				.set({ newEmailTokenHash: null, newEmailProvedAt: confirmedAt })
				.where(eq(table.emailChangeCapability.userId, currentUser.id));
		} else {
			await tx
				.update(table.emailChangeCapability)
				.set({ previousEmailTokenHash: null, previousEmailConfirmedAt: confirmedAt })
				.where(eq(table.emailChangeCapability.userId, currentUser.id));
		}

		const newEmailProved = provesNewEmail || capability.newEmailProvedAt !== null;
		const existingEmailConfirmed =
			confirmsExistingEmail || capability.previousEmailConfirmedAt !== null;
		if (!newEmailProved || !existingEmailConfirmed) {
			return currentUser.id;
		}

		await tx
			.update(table.user)
			.set({
				email: capability.pendingEmail,
				pendingEmail: null,
				emailVerified: true,
				updatedAt: confirmedAt
			})
			.where(eq(table.user.id, currentUser.id));
		await tx
			.delete(table.emailChangeCapability)
			.where(eq(table.emailChangeCapability.userId, currentUser.id));
		await tx
			.delete(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.userId, currentUser.id));
		await tx
			.delete(table.passwordResetToken)
			.where(eq(table.passwordResetToken.userId, currentUser.id));
		await tx.delete(table.session).where(eq(table.session.userId, currentUser.id));
		return currentUser.id;
	});
}

/** Verify the current account email and consume the capability atomically. */
export async function verifyEmailWithCapability(token: string): Promise<string | null> {
	if (!accountCapabilitiesEnabled() || !CAPABILITY_TOKEN_PATTERN.test(token)) {
		return null;
	}

	const tokenId = hashCapabilityToken(token);
	const emailChangeResult = await verifyEmailChangeCapability(tokenId);
	if (emailChangeResult !== undefined) {
		return emailChangeResult;
	}

	return await db.transaction(async (tx) => {
		const [candidateToken] = await tx
			.select({ userId: table.emailVerificationToken.userId })
			.from(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.id, tokenId))
			.limit(1);

		if (!candidateToken) {
			return null;
		}

		const [currentUser] = await tx
			.select({
				id: table.user.id,
				email: table.user.email,
				pendingEmail: table.user.pendingEmail,
				isActive: table.user.isActive
			})
			.from(table.user)
			.where(eq(table.user.id, candidateToken.userId))
			.for('update');
		if (!currentUser) {
			return null;
		}

		const [storedToken] = await tx
			.select()
			.from(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.id, tokenId))
			.for('update');
		if (!storedToken || storedToken.userId !== currentUser.id) {
			return null;
		}

		if (Date.now() >= storedToken.expiresAt.getTime()) {
			await tx
				.delete(table.emailVerificationToken)
				.where(eq(table.emailVerificationToken.id, storedToken.id));
			return null;
		}

		if (
			!currentUser.isActive ||
			currentUser.pendingEmail !== null ||
			storedToken.email !== currentUser.email
		) {
			await tx
				.delete(table.emailVerificationToken)
				.where(eq(table.emailVerificationToken.userId, storedToken.userId));
			return null;
		}
		await tx
			.update(table.user)
			.set({
				emailVerified: true,
				updatedAt: new Date()
			})
			.where(eq(table.user.id, storedToken.userId));

		await tx
			.delete(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.userId, storedToken.userId));
		return storedToken.userId;
	});
}

/** Issue a single-use reset capability; only its SHA-256 digest is persisted. */
export async function generatePasswordResetToken(
	userId: string,
	requestedEmail: string
): Promise<string | null> {
	const token = generateCapabilityToken();
	const expiresAt = new Date(Date.now() + DAY_IN_MS);

	return await db.transaction(async (tx) => {
		const [currentUser] = await tx
			.select({ email: table.user.email, isActive: table.user.isActive })
			.from(table.user)
			.where(eq(table.user.id, userId))
			.for('update');
		if (!currentUser || !currentUser.isActive || currentUser.email !== requestedEmail) {
			return null;
		}

		await tx.delete(table.passwordResetToken).where(eq(table.passwordResetToken.userId, userId));
		await tx.insert(table.passwordResetToken).values({
			id: hashCapabilityToken(token),
			userId,
			email: currentUser.email,
			expiresAt
		});
		return token;
	});
}
