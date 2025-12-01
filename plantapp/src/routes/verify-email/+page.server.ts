import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateEmailVerificationToken } from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
    const token = url.searchParams.get('token');
    if (!token) {
        return {
            success: false,
            message: 'Invalid verification link.'
        };
    }

    const userId = await validateEmailVerificationToken(token);
    if (!userId) {
        return {
            success: false,
            message: 'Invalid or expired verification link.'
        };
    }

    await db.update(table.user).set({ emailVerified: true }).where(eq(table.user.id, userId));

    // If user is logged in and verifying their own email, update session/local state if needed
    // But mostly we just want to show success.
    // If the user was not logged in, they are still not logged in, but their account is verified.

    return {
        success: true,
        message: 'Email verified successfully!'
    };
};
