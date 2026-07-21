import type { LoadEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

/**
 * Check public parent data for an authenticated identity.
 * Redirects to login if not authenticated
 */
export async function requireAuth(event: LoadEvent, redirectTo?: string) {
	const parentData = await event.parent();
	if (parentData?.user) {
		return parentData.user;
	}
	const redirectPath = redirectTo || event.url.pathname;
	throw redirect(303, `/login?redirect=${encodeURIComponent(redirectPath)}`);
}

/**
 * Get user if authenticated, return null if not (no redirect)
 */
export async function getUser(event: LoadEvent) {
	const parentData = await event.parent();
	return parentData?.user ?? null;
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
