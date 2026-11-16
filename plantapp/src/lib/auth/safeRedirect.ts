const FALLBACK_PATH = '/account/profile';

/**
 * Login `redirect` may only become a same-origin path.
 * Absolute, protocol-relative, and backslash URLs fall back so they cannot leave the site.
 */
export function safeRedirectPath(
	value: string | null | undefined,
	origin: string,
	fallback = FALLBACK_PATH
): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
		return fallback;
	}

	let base: URL;
	let destination: URL;
	try {
		base = new URL(origin);
		destination = new URL(value, origin);
	} catch {
		return fallback;
	}

	if (destination.origin !== base.origin) return fallback;
	if (destination.username || destination.password) return fallback;

	const path = `${destination.pathname}${destination.search}${destination.hash}`;
	if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
		return fallback;
	}

	const again = new URL(path, origin);
	if (again.origin !== base.origin) return fallback;
	return path;
}

/** Login and registration keep a same-origin return path. The default account path adds no query. */
export function pathWithRedirect(
	path: string,
	redirectTo: string | null | undefined,
	origin: string
): string {
	const safe = safeRedirectPath(redirectTo, origin);
	if (safe === FALLBACK_PATH) return path;
	const joiner = path.includes('?') ? '&' : '?';
	return `${path}${joiner}redirect=${encodeURIComponent(safe)}`;
}

export function authHandoffHref(
	kind: 'login' | 'register',
	redirectTo: string | null | undefined,
	origin: string
): string {
	return pathWithRedirect(`/${kind}`, redirectTo, origin);
}
