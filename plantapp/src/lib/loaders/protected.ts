import type { LoadEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { trpc } from '$lib/trpc/client';

/**
 * Check if user is authenticated and return user data
 * Redirects to signin if not authenticated
 */
export async function requireAuth(event: LoadEvent, redirectTo?: string) {
	try {
		const user = await trpc(event).users.getProfile.query();

		if (!user) {
			const redirectPath = redirectTo || event.url.pathname;
			throw redirect(303, `/auth/signin?redirect=${encodeURIComponent(redirectPath)}`);
		}

		return user;
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}
		const redirectPath = redirectTo || event.url.pathname;
		throw redirect(303, `/auth/signin?redirect=${encodeURIComponent(redirectPath)}`);
	}
}

/**
 * Check if user is admin
 * Redirects to home if not admin
 */
export async function requireAdmin(event: LoadEvent) {
	const user = await requireAuth(event);

	if (user.role !== 'admin') {
		throw redirect(303, '/');
	}

	return user;
}

/**
 * Check if user is affiliate
 * Redirects to affiliate/join if not an affiliate
 */
export async function requireAffiliate(event: LoadEvent) {
	const user = await requireAuth(event);

	if (user.role !== 'affiliate' && user.role !== 'admin') {
		throw redirect(303, '/affiliate/join');
	}

	return user;
}

/**
 * Get user if authenticated, return null if not (no redirect)
 */
export async function getUser(event: LoadEvent) {
	try {
		const user = await trpc(event).users.getProfile.query();
		return user || null;
	} catch (error) {
		return null;
	}
}
