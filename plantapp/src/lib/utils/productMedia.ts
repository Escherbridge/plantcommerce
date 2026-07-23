export interface PublicProductImage {
	url: string;
	altText: string | null;
}

/** Normalize public product image DTOs, serving real assets (incl. AI-MockAssets / $lib) as-is. */
export function getPublicProductImages(
	images: unknown,
	fallbackAltText: string | null | undefined
): PublicProductImage[] {
	if (!Array.isArray(images)) return [];

	return images.flatMap((image): PublicProductImage[] => {
		if (!image || typeof image !== 'object') return [];

		const { url, altText } = image as { url?: unknown; altText?: unknown };
		if (typeof url !== 'string' || !url.trim()) return [];

		return [{ url, altText: typeof altText === 'string' ? altText : (fallbackAltText ?? null) }];
	});
}
