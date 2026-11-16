/**
 * Permanent aliases. Sign-up and seller paths are Q152. The blog paths are
 * retired notes (Q164) and must not stay listed as current pages.
 */
export const PUBLIC_ALIAS_REDIRECTS: Record<string, string> = {
	'/signup': '/register',
	'/sign-up': '/register',
	'/seller': '/sell',
	'/sellers': '/sell',
	'/sell/apply': '/sell',
	'/apply': '/sell',
	'/blog/hydroponics-for-beginners': '/blog/dwc-vs-kratky-vs-nft',
	'/blog/introduction-to-aquaponics': '/guides/small-scale-aquaponics',
	'/blog/what-is-silvopasture': '/guides/temperate-silvopasture'
};

export function publicAliasRedirect(pathname: string): string | null {
	const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	return PUBLIC_ALIAS_REDIRECTS[path] ?? null;
}

/** `/products?q=` and `/products?search=` belong on the search page. Other params stay. */
export function catalogueSearchRedirect(url: URL): string | null {
	const path =
		url.pathname.length > 1 && url.pathname.endsWith('/')
			? url.pathname.slice(0, -1)
			: url.pathname;
	if (path !== '/products') return null;
	if (url.searchParams.has('q')) return `/search${url.search}`;
	if (!url.searchParams.has('search')) return null;

	const params = new URLSearchParams();
	for (const [key, value] of url.searchParams) {
		params.append(key === 'search' ? 'q' : key, value);
	}
	return `/search?${params.toString()}`;
}
