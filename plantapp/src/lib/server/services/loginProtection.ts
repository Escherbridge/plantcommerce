import { and, eq, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const RESET_WINDOW_MS = 60 * 60 * 1000;
const RESET_LOCK_MS = 60 * 60 * 1000;

type IdentifierType = 'ip' | 'user';

type ThrottleSubject = {
	identifier: string;
	identifierType: IdentifierType;
	maxAttempts: number;
	windowMs: number;
	lockMs: number;
};

function hashIdentifier(scope: string, value: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(`${scope}:${value.trim().toLowerCase()}`)));
}

function subject(
	scope: string,
	identifierType: IdentifierType,
	value: string,
	maxAttempts: number,
	windowMs: number,
	lockMs: number
): ThrottleSubject {
	return {
		identifier: hashIdentifier(scope, value),
		identifierType,
		maxAttempts,
		windowMs,
		lockMs
	};
}

function loginSubjects(ipAddress: string, usernameOrEmail: string): ThrottleSubject[] {
	return [
		subject('login-ip', 'ip', ipAddress, 20, LOGIN_WINDOW_MS, LOGIN_LOCK_MS),
		loginAccountSubject(usernameOrEmail)
	];
}

function loginAccountSubject(usernameOrEmail: string): ThrottleSubject {
	return subject('login-account', 'user', usernameOrEmail, 5, LOGIN_WINDOW_MS, LOGIN_LOCK_MS);
}

function passwordResetSubjects(ipAddress: string, email: string): ThrottleSubject[] {
	return [
		subject('reset-ip', 'ip', ipAddress, 10, RESET_WINDOW_MS, RESET_LOCK_MS),
		subject('reset-account', 'user', email, 3, RESET_WINDOW_MS, RESET_LOCK_MS)
	];
}

function emailVerificationSubjects(ipAddress: string, email: string): ThrottleSubject[] {
	return [
		subject('verify-ip', 'ip', ipAddress, 10, RESET_WINDOW_MS, RESET_LOCK_MS),
		subject('verify-account', 'user', email, 3, RESET_WINDOW_MS, RESET_LOCK_MS)
	];
}

async function recordSubjectAttempt(subject: ThrottleSubject): Promise<boolean> {
	if (
		env.AUTH_CAPABILITIES_ENABLED !== 'true' ||
		env.AUTH_ATOMIC_THROTTLES_ENABLED !== 'true'
	) {
		return recordLegacySubjectAttempt(subject);
	}

	const now = new Date();
	const windowStartedAt = new Date(now.getTime() - subject.windowMs);
	const blockedUntil = new Date(now.getTime() + subject.lockMs);
	const activeBlock = sql`(${table.loginAttempts.blockedUntil} IS NOT NULL AND ${table.loginAttempts.blockedUntil} > ${now})`;
	const nextAttempts = sql<number>`CASE
		WHEN ${activeBlock} THEN ${table.loginAttempts.attempts}
		WHEN ${table.loginAttempts.lastAttempt} < ${windowStartedAt} THEN 1
		ELSE ${table.loginAttempts.attempts} + 1
	END`;
	const nextLastAttempt = sql<Date>`CASE
		WHEN ${activeBlock} THEN ${table.loginAttempts.lastAttempt}
		ELSE ${now}
	END`;
	const nextBlockedUntil = sql<Date | null>`CASE
		WHEN ${activeBlock} THEN ${table.loginAttempts.blockedUntil}
		WHEN ${nextAttempts} >= ${subject.maxAttempts} THEN ${blockedUntil}
		ELSE NULL
	END`;

	const [attempt] = await db
		.insert(table.loginAttempts)
		.values({
			identifier: subject.identifier,
			identifierType: subject.identifierType,
			attempts: 1,
			lastAttempt: now
		})
		.onConflictDoUpdate({
			target: [table.loginAttempts.identifier, table.loginAttempts.identifierType],
		set: {
			attempts: nextAttempts,
			lastAttempt: nextLastAttempt,
			blockedUntil: nextBlockedUntil
			}
		})
		.returning();

	return !attempt?.blockedUntil || attempt.blockedUntil.getTime() <= now.getTime();
}

/** Compatibility path serializes each hashed subject until the unique throttle index from 0004 is activated. */
async function recordLegacySubjectAttempt(subject: ThrottleSubject): Promise<boolean> {
	return await db.transaction(async (tx) => {
		await tx.execute(
			sql`SELECT pg_advisory_xact_lock(hashtext(${`login-throttle:${subject.identifierType}:${subject.identifier}`}))`
		);
		const now = new Date();
		const attempts = await tx
			.select()
			.from(table.loginAttempts)
			.where(
				and(
					eq(table.loginAttempts.identifier, subject.identifier),
					eq(table.loginAttempts.identifierType, subject.identifierType)
				)
			)
			.for('update');
		if (attempts.length > 1) {
			console.error('Duplicate legacy throttle subjects require the 0004 recovery migration before use');
			return false;
		}
		const attempt = attempts[0];
		if (attempt?.blockedUntil && attempt.blockedUntil.getTime() > now.getTime()) {
			return false;
		}

		if (!attempt) {
			await tx.insert(table.loginAttempts).values({
				identifier: subject.identifier,
				identifierType: subject.identifierType,
				attempts: 1,
				lastAttempt: now
			});
			return true;
		}

		const attemptCount = now.getTime() - attempt.lastAttempt.getTime() >= subject.windowMs
			? 1
			: attempt.attempts + 1;
		const blockedUntil = attemptCount >= subject.maxAttempts ? new Date(now.getTime() + subject.lockMs) : null;
		await tx
			.update(table.loginAttempts)
			.set({ attempts: attemptCount, lastAttempt: now, blockedUntil })
			.where(eq(table.loginAttempts.id, attempt.id));
		return blockedUntil === null;
	});
}

async function beginAttempt(subjects: ThrottleSubject[]): Promise<boolean> {
	const outcomes = await Promise.all(subjects.map((item) => recordSubjectAttempt(item)));
	return outcomes.every(Boolean);
}

async function clearSubjects(subjects: ThrottleSubject[]): Promise<void> {
	await Promise.all(
		subjects.map((item) =>
			db
				.delete(table.loginAttempts)
				.where(
					and(
						eq(table.loginAttempts.identifier, item.identifier),
						eq(table.loginAttempts.identifierType, item.identifierType)
					)
				)
		)
	);
}

/** Database-backed login and recovery throttles; see `src/lib/server/AGENTS.md`. */
export class LoginProtectionService {
	static async beginLoginAttempt(ipAddress: string, accountIdentity: string): Promise<boolean> {
		return beginAttempt(loginSubjects(ipAddress, accountIdentity));
	}

	static async clearSuccessfulLogin(accountIdentity: string): Promise<void> {
		await clearSubjects([loginAccountSubject(accountIdentity)]);
	}

	static async beginPasswordResetRequest(ipAddress: string, email: string): Promise<boolean> {
		return beginAttempt(passwordResetSubjects(ipAddress, email));
	}

	static async beginPasswordResetCompletion(ipAddress: string, token: string): Promise<boolean> {
		return beginAttempt([
			subject('reset-completion-ip', 'ip', ipAddress, 10, RESET_WINDOW_MS, RESET_LOCK_MS),
			subject('reset-completion-token', 'user', token, 5, RESET_WINDOW_MS, RESET_LOCK_MS)
		]);
	}

	static async beginEmailVerificationRequest(ipAddress: string, email: string): Promise<boolean> {
		return beginAttempt(emailVerificationSubjects(ipAddress, email));
	}
}
