import { writable } from 'svelte/store';

/**
 * Layout-owned document title for a client-only state.
 * Null keeps the route metadata title. Set only in the browser.
 */
export const documentTitleOverride = writable<string | null>(null);
