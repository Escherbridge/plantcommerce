import type { PageLoad } from './$types';

/** Static guidance page; the layout guard already enforces an active affiliate. */
export const load: PageLoad = async () => ({});
