import { env } from '$env/dynamic/public';

const origin = (env.PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');

export const publicIndexablePaths = ['/', '/size-guide', '/support'] as const;

/** Shared public identity and canonical origin for customer-facing metadata. */
export const publicSite = {
	name: 'Aevani',
	defaultTitle: 'Aevani | Sustainable Growing Tools & Learning',
	description: 'Practical tools and learning for more resilient growing systems.',
	origin
} as const;

export function publicSiteUrl(pathname = '/', fallbackOrigin = ''): string {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const baseUrl = (publicSite.origin || fallbackOrigin).replace(/\/+$/, '');
	return baseUrl ? `${baseUrl}${path}` : path;
}

export function isPublicIndexablePath(pathname: string): boolean {
	const normalized = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
	return publicIndexablePaths.some((path) => path === normalized);
}
