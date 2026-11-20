/** Slugs for /white-papers/[slug]. Dots stay free so static PDFs are not swallowed. */
export function match(param: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param);
}
