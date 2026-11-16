/** Permanent aliases for sign-up and seller URLs. Q152 / A-05. */
export const PUBLIC_ALIAS_REDIRECTS: Record<string, string> = {
	'/signup': '/register',
	'/sign-up': '/register',
	'/seller': '/sell',
	'/sellers': '/sell',
	'/sell/apply': '/sell',
	'/apply': '/sell'
};

export function publicAliasRedirect(pathname: string): string | null {
	const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	return PUBLIC_ALIAS_REDIRECTS[path] ?? null;
}
