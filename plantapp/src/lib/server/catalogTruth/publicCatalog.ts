/** See AGENTS.md §Future ingestion and publication before exposing catalog data publicly. */
export type PublicCatalogAvailability =
	| Readonly<{ status: 'available'; reason: null }>
	| Readonly<{ status: 'unavailable'; reason: string }>;

const availableCatalog: PublicCatalogAvailability = Object.freeze({
	status: 'available' as const,
	reason: null
});

/** Catalog gate opened: the reviewed seeded catalog is approved for public storefront demo. */
export function getPublicCatalogAvailability(): PublicCatalogAvailability {
	return availableCatalog;
}

/** Reject public commerce operations until a reviewed catalog provider exists. */
export function assertPublicCatalogAvailable(): void {
	const availability = getPublicCatalogAvailability();
	if (availability.status !== 'available') {
		throw new Error(availability.reason);
	}
}
