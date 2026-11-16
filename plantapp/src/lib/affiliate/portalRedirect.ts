const PUBLIC_AFFILIATE_PATHS = new Set(['/affiliate', '/affiliate/join', '/affiliate/terms']);

/** Where a request for an affiliate route should go, or null when the page may render. */
export function affiliatePortalRedirect(input: {
	pathname: string;
	user: { role: string; emailVerified: boolean } | null;
	affiliateActive: boolean;
}): string | null {
	const path = input.pathname.length > 1 ? input.pathname.replace(/\/+$/, '') : input.pathname;
	if (PUBLIC_AFFILIATE_PATHS.has(path)) return null;
	if (!path.startsWith('/affiliate')) return null;
	if (!input.user) return `/login?redirect=${encodeURIComponent(path)}`;
	if (!input.user.emailVerified) return '/affiliate/join';
	if (input.user.role === 'admin' || input.affiliateActive) return null;
	return '/affiliate/join';
}
