import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import { encodeBase64url } from '@oslojs/encoding';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const guestCartCookieName = 'aevani_guest_cart';

const guestCartCookiePattern = /^([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{43})$/;

const guestCartCookieOptions = {
	path: '/',
	maxAge: 60 * 60 * 24 * 30,
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax' as const
};

function getConfiguredGuestCartCookieSecret(): string | null {
	const secret = env.GUEST_CART_COOKIE_SECRET;
	if (
		!secret ||
		secret.startsWith('replace-with-') ||
		Buffer.byteLength(secret) < 32
	) {
		return null;
	}

	return secret;
}

function requireGuestCartCookieSecret(): string {
	const secret = getConfiguredGuestCartCookieSecret();
	if (!secret) {
		throw new Error('GUEST_CART_COOKIE_SECRET must be set to a private value of at least 32 bytes');
	}

	return secret;
}

function signGuestCartSessionId(sessionId: string, secret: string): Buffer {
	return createHmac('sha256', secret).update(sessionId).digest();
}

function serializeGuestCartCookie(sessionId: string, secret: string): string {
	return `${sessionId}.${signGuestCartSessionId(sessionId, secret).toString('base64url')}`;
}

/** Read a valid, server-authenticated guest cart identity without creating one. */
export function readGuestCartSessionId(cookies: Cookies): string | null {
	const secret = getConfiguredGuestCartCookieSecret();
	if (!secret) {
		return null;
	}

	const cookieValue = cookies.get(guestCartCookieName);
	if (!cookieValue) {
		return null;
	}

	const match = guestCartCookiePattern.exec(cookieValue);
	if (!match) {
		return null;
	}

	const [, sessionId, signature] = match;
	const expectedSignature = signGuestCartSessionId(sessionId, secret);
	const providedSignature = Buffer.from(signature, 'base64url');
	return providedSignature.length === expectedSignature.length &&
		timingSafeEqual(providedSignature, expectedSignature)
		? sessionId
		: null;
}

/** Issue an opaque guest cart identity when the request does not already have one. */
export function getOrCreateGuestCartSessionId(cookies: Cookies): string {
	const secret = requireGuestCartCookieSecret();
	const existingSessionId = readGuestCartSessionId(cookies);
	if (existingSessionId) {
		return existingSessionId;
	}

	const sessionId = encodeBase64url(crypto.getRandomValues(new Uint8Array(32)));
	cookies.set(guestCartCookieName, serializeGuestCartCookie(sessionId, secret), guestCartCookieOptions);
	return sessionId;
}

export function deleteGuestCartSessionCookie(cookies: Cookies): void {
	cookies.delete(guestCartCookieName, { path: '/' });
}
