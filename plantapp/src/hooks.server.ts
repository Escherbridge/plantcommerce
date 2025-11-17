import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth';
import { handleError } from '$lib/utils/errorHandler';

const handleAuth: Handle = async ({ event, resolve }) => {
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
		await handleError(error, 'hooks.server.ts:handleAuth');
	}

	return resolve(event);
};

const handleCSP: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	// In a production environment, you should use a more restrictive CSP.
	// For example, instead of 'unsafe-inline', you could use a nonce-based approach.
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https:",
		"font-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);
	return response;
};

export const handle: Handle = sequence(handleAuth, handleCSP);
