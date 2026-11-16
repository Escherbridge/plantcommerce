/** True when this nav link is the current page. The first, most specific href wins. */
export function navLinkIsCurrent(
	pathname: string,
	hrefs: readonly string[],
	index: number
): boolean {
	const path =
		pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname || '/';
	let bestIndex = -1;
	let bestLength = -1;
	hrefs.forEach((href, hrefIndex) => {
		const matches = href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
		if (!matches || href.length <= bestLength) return;
		bestIndex = hrefIndex;
		bestLength = href.length;
	});
	return bestIndex === index;
}
