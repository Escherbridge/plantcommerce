/** Share paths are a single URL segment so `/aff/[linkCode]` can resolve them. */
export const AFFILIATE_LINK_CODE_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

export function normalizeAffiliateLinkCode(value: string | undefined | null): string | undefined {
	const code = value?.trim() ?? '';
	if (!code) return undefined;
	if (!AFFILIATE_LINK_CODE_PATTERN.test(code)) {
		throw new Error('Link code must be 4–64 letters, numbers, hyphens, or underscores');
	}
	return code;
}

/** Relative share path. Callers add the request origin when they need an absolute URL. */
export function affiliateSharePath(linkCode: string): string {
	const code = normalizeAffiliateLinkCode(linkCode);
	if (!code) throw new Error('Link code must be 4–64 letters, numbers, hyphens, or underscores');
	return `/aff/${code}`;
}

export function affiliateShareUrl(origin: string, linkCode: string): string {
	return new URL(affiliateSharePath(linkCode), origin).toString();
}
