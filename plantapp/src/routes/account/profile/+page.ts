import type { PageLoad } from './$types';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$lib/server/api/root';

export const load: PageLoad = async (event) => {
	// User is already authenticated via layout
	const parentData = await event.parent();

	try {
		const trpcClient = createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: '/api/trpc',
					fetch: (url, options) => {
						return event.fetch(url, {
							...options,
							credentials: 'include'
						});
					}
				})
			]
		});

		const orders = await trpcClient.orders.getUserOrders.query({
			limit: 100,
			offset: 0
		});

		return {
			user: parentData.user,
			stats: {
				totalOrders: Array.isArray(orders) ? orders.length : 0,
				wishlistItems: 0
			}
		};
	} catch (error) {
		console.error('Error loading profile statistics:', error);
		return {
			user: parentData.user,
			stats: {
				totalOrders: 0,
				wishlistItems: 0
			}
		};
	}
};
