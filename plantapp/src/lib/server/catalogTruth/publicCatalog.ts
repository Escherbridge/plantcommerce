/** See AGENTS.md §Future ingestion and publication before exposing catalog data publicly. */
export type PublicCatalogAvailability =
	| Readonly<{ status: 'available'; reason: null }>
	| Readonly<{ status: 'unavailable'; reason: string }>;

const unavailableCatalog: PublicCatalogAvailability = Object.freeze({
	status: 'unavailable' as const,
	reason:
		'Product listings are unavailable while supplier, offer, fulfillment, and claim evidence are being verified.'
});

/** Prevent source-only research and UAT seed data from becoming a public catalog. */
export function getPublicCatalogAvailability(): PublicCatalogAvailability {
	return unavailableCatalog;
}

/** Reject public commerce operations until a reviewed catalog provider exists. */
export function assertPublicCatalogAvailable(): void {
	const availability = getPublicCatalogAvailability();
	if (availability.status !== 'available') {
		throw new Error(availability.reason);
	}
}
