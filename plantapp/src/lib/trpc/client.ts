import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$lib/server/api/root';
import { browser } from '$app/environment';

function getBaseUrl() {
	if (browser) return '';
	// During SSR, use the Vite dev server port or the configured PORT
	return `http://localhost:${process.env.PORT ?? 5173}`;
}

// Shared tRPC client for browser-only or simple server calls
export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/api/trpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: 'include' // This ensures cookies are sent
				});
			}
		})
	]
});

/**
 * Create a tRPC client that uses SvelteKit's event.fetch for proper SSR support.
 * Use this in +page.ts / +page.server.ts load functions.
 */
export function createCallerClient(eventFetch: typeof fetch) {
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: '/api/trpc',
				fetch(url, options) {
					return eventFetch(
						url as any,
						{
							...options,
							credentials: 'include'
						} as any
					);
				}
			})
		]
	});
}
