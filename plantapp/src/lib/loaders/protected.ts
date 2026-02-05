import type { LoadEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { trpc } from '$lib/trpc/client';

/**
 * Check if user is authenticated and return user data
 * Redirects to signin if not authenticated
 */
import type { LoadEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

/**
 * Check if user is authenticated using event.locals
 * Redirects to login if not authenticated
 */
export async function requireAuth(event: LoadEvent, redirectTo?: string) {
    // TRY BOTH: parent data and locals
    try {
        // Try to get user from parent data first
        const parentData = await event.parent();

        if (parentData?.user) {

            return parentData.user;
        }
    } catch (error) {

    }

    // Fall back to checking locals

    if (event.locals?.user) {

        return event.locals.user;
    }
    const redirectPath = redirectTo || event.url.pathname;
    throw redirect(303, `/login?redirect=${encodeURIComponent(redirectPath)}`);
}

/**
 * Get user if authenticated, return null if not (no redirect)
 */
export async function getUser(event: LoadEvent) {
    return event.locals?.user || null;
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
