/** Compatibility availability type; provider operations now own catalogue failures. */
export type PublicCatalogAvailability =
	| Readonly<{ status: 'available'; reason: null }>
	| Readonly<{ status: 'unavailable'; reason: string }>;

const availableCatalog: PublicCatalogAvailability = Object.freeze({
	status: 'available' as const,
	reason: null
});

/** The canonical database commerce provider is available unless its own operation fails. */
export function getPublicCatalogAvailability(): PublicCatalogAvailability {
	return availableCatalog;
}

/** Retained for service compatibility; provider selection now owns availability. */
export function assertPublicCatalogAvailable(): void {
	return;
}
