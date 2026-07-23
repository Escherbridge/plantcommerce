export interface PublicProductImage {
	url: string;
	altText: string | null;
	isMock?: boolean;
}

/** Keep media provenance visible while allowing the catalogue to restore labeled imagery. */
export function getPublicProductImages(
	images: unknown,
	fallbackAltText: string | null | undefined
): PublicProductImage[] {
	if (!Array.isArray(images)) return [];

	return images.flatMap((image): PublicProductImage[] => {
		if (!image || typeof image !== 'object') return [];

		const { url, altText } = image as { url?: unknown; altText?: unknown };
		if (typeof url !== 'string' || !url.trim()) return [];
		if (url.startsWith('/src/')) return [];

		return [
			{
				url,
				altText: typeof altText === 'string' ? altText : (fallbackAltText ?? null),
				isMock: url.includes('AI-MockAssets')
			}
		];
	});
}
