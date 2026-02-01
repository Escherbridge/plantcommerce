import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
    // Get user from parent (layout)
    const parentData = await event.parent();
    if (!parentData?.user) {

        throw redirect(303, `/login?redirect=${encodeURIComponent(event.url.pathname)}`);
    }

    // Get account stats
    const stats = {
        totalOrders: 0,
        wishlistItems: 0
    };

    return {
        user: parentData.user,
        stats
    };
};
