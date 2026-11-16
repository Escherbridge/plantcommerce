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
