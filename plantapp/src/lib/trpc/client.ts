import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$lib/server/api/root';
import { browser } from '$app/environment';

function getBaseUrl() {
	if (browser) return '';
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/api/trpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: 'include'
				});
			}
		})
	]
});
