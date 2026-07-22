import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth';
import { readGuestCartSessionId } from '$lib/server/guestCart';
import { handleError } from '$lib/utils/errorHandler';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Guest cart identities are server-issued and never accepted from request payloads.
	event.locals.guestCartSessionId = readGuestCartSessionId(event.cookies);

	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	try {
		const { session, user } = await auth.validateSessionToken(sessionToken);

		if (session) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			auth.deleteSessionTokenCookie(event);
		}

		event.locals.user = user;
		event.locals.session = session;
	} catch (error) {
		console.error('🔐 hooks.server.ts: Error:', error);
		await handleError(error, 'hooks.server.ts:handleAuth');
	}

	return resolve(event);
};

const securityHeaders = {
	'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY'
} as const;

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	for (const [name, value] of Object.entries(securityHeaders)) {
		response.headers.set(name, value);
	}
	if (event.url.protocol === 'https:') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000');
	}
	return response;
};

export const handle: Handle = sequence(handleAuth, handleSecurityHeaders);
