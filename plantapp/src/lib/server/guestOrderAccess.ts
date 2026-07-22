import { dev } from '$app/environment';
import { encodeBase64url } from '@oslojs/encoding';
import type { Cookies } from '@sveltejs/kit';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const guestOrderAccessCookieName = 'aevani_order_access';

const GRANT_LIFETIME_MS = 24 * 60 * 60 * 1000;
const capabilityPattern = /^[A-Za-z0-9_-]{43}$/;
const cookieOptions = {
	path: '/',
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax' as const
};

export interface GuestOrderAccessGrant {
	token: string;
	expiresAt: Date;
}

function newOpaqueId(prefix: string): string {
	return `${prefix}_${encodeBase64url(crypto.getRandomValues(new Uint8Array(24)))}`;
}

function hashGrantToken(token: string): string {
	return createHash('sha256')
		.update('aevani:guest-order-confirmation\0')
		.update(token)
		.digest('hex');
}

function readCapability(cookies: Cookies): string | null {
	const token = cookies.get(guestOrderAccessCookieName);
	return token && capabilityPattern.test(token) ? token : null;
}

export class GuestOrderAccessService {
	/** Issue a short-lived confirmation capability for a guest draft; only its digest is persisted. */
	static async issueForDraft(draftId: string, now = new Date()): Promise<GuestOrderAccessGrant> {
		return await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, draftId))
				.for('update');
			if (!draft || draft.userId !== null || !draft.guestSubjectHash) {
				throw new Error(
					'Guest order confirmation access is only available for a guest checkout draft'
				);
			}
			if (draft.status !== 'checkout_created' && draft.status !== 'pending_session') {
				throw new Error('Guest order confirmation access is not available for this checkout state');
			}

			const expiresAt = new Date(now.getTime() + GRANT_LIFETIME_MS);
			await tx
				.update(table.guestOrderAccessGrant)
				.set({ revokedAt: now })
				.where(
					and(
						eq(table.guestOrderAccessGrant.draftId, draft.id),
						isNull(table.guestOrderAccessGrant.revokedAt),
						gt(table.guestOrderAccessGrant.expiresAt, now)
					)
				);

			const token = encodeBase64url(crypto.getRandomValues(new Uint8Array(32)));
			await tx.insert(table.guestOrderAccessGrant).values({
				id: newOpaqueId('guest_grant'),
				draftId: draft.id,
				tokenHash: hashGrantToken(token),
				expiresAt,
				createdAt: now
			});

			return { token, expiresAt };
		});
	}

	static setCookie(cookies: Cookies, grant: GuestOrderAccessGrant): void {
		cookies.set(guestOrderAccessCookieName, grant.token, {
			...cookieOptions,
			expires: grant.expiresAt
		});
	}

	static clearCookie(cookies: Cookies): void {
		cookies.delete(guestOrderAccessCookieName, { path: '/' });
	}

	/** Verify that the current browser holds a non-revoked confirmation capability for this guest draft. */
	static async hasDraftAccess(
		cookies: Cookies,
		draftId: string,
		now = new Date()
	): Promise<boolean> {
		const token = readCapability(cookies);
		if (!token) {
			return false;
		}

		const [grant] = await db
			.select({ id: table.guestOrderAccessGrant.id })
			.from(table.guestOrderAccessGrant)
			.innerJoin(
				table.checkoutDraft,
				eq(table.guestOrderAccessGrant.draftId, table.checkoutDraft.id)
			)
			.where(
				and(
					eq(table.guestOrderAccessGrant.draftId, draftId),
					eq(table.guestOrderAccessGrant.tokenHash, hashGrantToken(token)),
					eq(table.guestOrderAccessGrant.scope, 'confirmation'),
					isNull(table.guestOrderAccessGrant.revokedAt),
					gt(table.guestOrderAccessGrant.expiresAt, now),
					isNull(table.checkoutDraft.userId)
				)
			)
			.limit(1);

		return Boolean(grant);
	}
}

export default GuestOrderAccessService;
