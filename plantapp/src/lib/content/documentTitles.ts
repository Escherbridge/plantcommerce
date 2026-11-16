/**
 * Document `<title>` only. Visible headings stay on the page record.
 * Open Graph and Twitter titles follow this string when they are copied from it.
 */
export const shortDocumentTitles: Record<string, string> = {
	'understanding-soil-health': 'Soil health: the foundation of a garden — Aevani',
	'monoculture-to-polyculture': 'From monoculture to polyculture — Aevani'
};

export function shortDocumentTitle(slug: string | null | undefined): string | undefined {
	if (!slug) return undefined;
	return shortDocumentTitles[slug];
}
