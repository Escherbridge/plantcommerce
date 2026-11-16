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
