import { env } from '$env/dynamic/public';

const origin = (env.PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');

/** Shared public identity and canonical origin for customer-facing metadata. */
export const publicSite = {
	name: 'Aevani',
	defaultTitle: 'Aevani | Sustainable Growing Tools & Learning',
	description: 'Practical tools and learning for more resilient growing systems.',
	origin
} as const;

export function publicSiteUrl(pathname = '/'): string {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return publicSite.origin ? `${publicSite.origin}${path}` : path;
}
