import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$lib/server/api/root';

export const load: PageLoad = async (event) => {
    // Get user from parent (layout)
    const parentData = await event.parent();
    if (!parentData?.user) {
        throw redirect(303, `/login?redirect=${encodeURIComponent(event.url.pathname)}`);
    }

    try {
        // Create a direct tRPC client using event.fetch
        const trpcClient = createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: '/api/trpc',
                    fetch: (url, options) => {
                        // Use event.fetch for server-side requests
                        return event.fetch(url, {
                            ...options,
                            credentials: 'include'
                        });
                    }
                })
            ]
        });

        // Try to get user orders
        const orders = await trpcClient.orders.getUserOrders.query({
            limit: 100,
            offset: 0
        });

        return {
            user: parentData.user,
            stats: {
                totalOrders: Array.isArray(orders) ? orders.length : 0,
                wishlistItems: 0 // TODO: Implement wishlist functionality
            }
        };
    } catch (error) {
        console.error('Error loading profile statistics:', error);
        // Fallback to zero values if there's an error
        return {
            user: parentData.user,
            stats: {
                totalOrders: 0,
                wishlistItems: 0
            }
        };
    }
};
