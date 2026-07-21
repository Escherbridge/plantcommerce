import { createHmac } from 'node:crypto';

export const plantGeoContractVersion = 'v1' as const;

export type PlantGeoProductId = `product_${number}`;
export type PlantGeoAvailability = 'in_stock' | 'out_of_stock' | 'preorder' | 'unavailable';
export type PlantGeoFulfillment = 'merchant_fulfilled' | 'supplier_fulfilled' | 'digital';
export type PlantGeoImageRights = 'owned' | 'licensed' | 'supplier_authorized';
export type PlantGeoChannel = 'agent' | 'content' | 'email' | 'search' | 'social';

export type PlantGeoEvidence = Readonly<{
	id: string;
	sourceUrl: string;
	retrievedAt: string;
	revision: string | null;
}>;

export type PlantGeoCatalogClaim = Readonly<{
	statement: string;
	evidence: readonly PlantGeoEvidence[];
}>;

export type PlantGeoCatalogImage = Readonly<{
	url: string;
	alt: string;
	rights: PlantGeoImageRights;
	rightsEvidence: readonly PlantGeoEvidence[];
}>;

export type PlantGeoCatalogProduct = Readonly<{
	id: PlantGeoProductId;
	canonicalUrl: string;
	title: string;
	summary: string | null;
	price: Readonly<{ amountMinor: number; currency: string }>;
	availability: PlantGeoAvailability;
	availabilityCheckedAt: string;
	category: Readonly<{ id: string; name: string; slug: string }>;
	merchant: Readonly<{ id: string; fulfillment: PlantGeoFulfillment }>;
	suitability: Readonly<{
		geography: readonly string[];
		climate: readonly string[];
		evidence: readonly PlantGeoEvidence[];
	}>;
	claims: readonly PlantGeoCatalogClaim[];
	images: readonly PlantGeoCatalogImage[];
	updatedAt: string;
}>;

export type PlantGeoCatalogSource = Readonly<{
	productId: number;
	canonicalUrl: string;
	title: string;
	summary: string | null;
	price: Readonly<{ amountMinor: number; currency: string }>;
	availability: PlantGeoAvailability;
	availabilityCheckedAt: Date;
	category: Readonly<{ id: number; name: string; slug: string }>;
	merchant: Readonly<{ id: string; fulfillment: PlantGeoFulfillment }>;
	suitability: Readonly<{
		geography: readonly string[];
		climate: readonly string[];
		evidence: readonly PlantGeoEvidence[];
	}>;
	claims: readonly PlantGeoCatalogClaim[];
	images: readonly PlantGeoCatalogImage[];
	updatedAt: Date;
}>;

export type PlantGeoCatalogProjection = Readonly<{
	contractVersion: typeof plantGeoContractVersion;
	generatedAt: string;
	cursor: string | null;
	nextCursor: string | null;
	products: readonly PlantGeoCatalogProduct[];
}>;

export type PlantGeoCatalogProjectionSource = Readonly<{
	generatedAt: Date;
	cursor: string | null;
	nextCursor: string | null;
	products: readonly PlantGeoCatalogSource[];
}>;

declare const plantGeoSubjectHashBrand: unique symbol;
export type PlantGeoSubjectHash = string & {
	readonly [plantGeoSubjectHashBrand]: 'PlantGeoSubjectHash';
};

export type PlantGeoSubject = Readonly<{
	kind: 'account' | 'anonymous';
	id: PlantGeoSubjectHash;
}> | null;

export type PlantGeoRecommendation = Readonly<{
	id: string;
	candidateProductIds: readonly PlantGeoProductId[];
	selectedProductIds: readonly PlantGeoProductId[];
	rationaleCodes: readonly string[];
	constraintCodes: readonly string[];
	confidence: number;
	sourceEvidence: readonly PlantGeoEvidence[];
	agent: Readonly<{ id: string; modelVersion: string }>;
	contentContextId: string;
	disclosureVersion: string;
}>;

export type PlantGeoAttributionReference = Readonly<{
	publisherPropertyId: string;
	campaignId: string | null;
	placementId: string | null;
	subId: string | null;
	channel: PlantGeoChannel;
	recommendationId: string;
}>;

type PlantGeoEventBase = Readonly<{
	eventId: string;
	occurredAt: string;
	subject: PlantGeoSubject;
}>;

export type PlantGeoCommerceEvent =
	| (PlantGeoEventBase &
		Readonly<{
			type: 'recommendation.recorded';
			recommendation: PlantGeoRecommendation;
		}>)
	| (PlantGeoEventBase &
		Readonly<{
			type: 'recommendation.clicked';
			recommendationId: string;
			productId: PlantGeoProductId;
			attribution: PlantGeoAttributionReference;
		}>)
	| (PlantGeoEventBase &
		Readonly<{
			type: 'commerce.attributed';
			order: Readonly<{
				id: string;
				currency: string;
				totalMinor: number;
				items: readonly Readonly<{ productId: PlantGeoProductId; quantity: number }>[];
			}>;
			attribution: PlantGeoAttributionReference;
		}>);

const opaqueReferencePattern = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const productIdPattern = /^product_[1-9][0-9]*$/;
const subjectHashPattern = /^pgh1_[a-f0-9]{64}$/;
const internalSubjectIdPattern = /^[A-Za-z0-9_-]{8,128}$/;
const currencyPattern = /^[A-Z]{3}$/;

function requiredText(value: string, label: string): string {
	const normalized = value.trim();
	if (!normalized || normalized.length > 512) {
		throw new Error(`${label} must be a non-empty value of at most 512 characters`);
	}
	return normalized;
}

function opaqueReference(value: string, label: string): string {
	const normalized = value.trim();
	if (!opaqueReferencePattern.test(normalized)) {
		throw new Error(`${label} must be an opaque identifier`);
	}
	return normalized;
}

function nullableOpaqueReference(value: string | null, label: string): string | null {
	return value === null ? null : opaqueReference(value, label);
}

function isoDate(value: Date | string, label: string): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error(`${label} must be a valid date`);
	}
	return date.toISOString();
}

function publicHttpsUrl(value: string, label: string): string {
	try {
		const url = new URL(value);
		if (url.protocol !== 'https:' || url.username || url.password) {
			throw new Error();
		}
		return url.toString();
	} catch {
		throw new Error(`${label} must be an absolute HTTPS URL without credentials`);
	}
}

function currency(value: string): string {
	const normalized = value.trim().toUpperCase();
	if (!currencyPattern.test(normalized)) {
		throw new Error('currency must be an ISO 4217 three-letter code');
	}
	return normalized;
}

function minorAmount(value: number, label: string): number {
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new Error(`${label} must be a non-negative integer in minor currency units`);
	}
	return value;
}

function copyProductId(value: PlantGeoProductId): PlantGeoProductId {
	if (!productIdPattern.test(value)) {
		throw new Error('product ids must be stable published product identifiers');
	}
	return value;
}

function copyEvidence(evidence: readonly PlantGeoEvidence[]): PlantGeoEvidence[] {
	return evidence.map((item) => ({
		id: opaqueReference(item.id, 'evidence id'),
		sourceUrl: publicHttpsUrl(item.sourceUrl, 'evidence source URL'),
		retrievedAt: isoDate(item.retrievedAt, 'evidence retrieval time'),
		revision: item.revision === null ? null : requiredText(item.revision, 'evidence revision')
	}));
}

function copyClaims(claims: readonly PlantGeoCatalogClaim[]): PlantGeoCatalogClaim[] {
	return claims.map((claim) => {
		if (claim.evidence.length === 0) {
			throw new Error('catalog claims require verified source evidence');
		}
		return { statement: requiredText(claim.statement, 'claim statement'), evidence: copyEvidence(claim.evidence) };
	});
}

function copyImages(images: readonly PlantGeoCatalogImage[]): PlantGeoCatalogImage[] {
	return images.map((image) => {
		if (image.rightsEvidence.length === 0) {
			throw new Error('catalog images require rights evidence');
		}
		return {
			url: publicHttpsUrl(image.url, 'image URL'),
			alt: requiredText(image.alt, 'image alt text'),
			rights: image.rights,
			rightsEvidence: copyEvidence(image.rightsEvidence)
		};
	});
}

export function plantGeoProductId(productId: number): PlantGeoProductId {
	if (!Number.isSafeInteger(productId) || productId <= 0) {
		throw new Error('product id must be a positive integer');
	}
	return `product_${productId}` as PlantGeoProductId;
}

/** Project only provenance-bearing, publishable catalog fields for PlantGeo. */
export function projectPlantGeoCatalogProduct(source: PlantGeoCatalogSource): PlantGeoCatalogProduct {
	return {
		id: plantGeoProductId(source.productId),
		canonicalUrl: publicHttpsUrl(source.canonicalUrl, 'canonical URL'),
		title: requiredText(source.title, 'catalog title'),
		summary: source.summary === null ? null : requiredText(source.summary, 'catalog summary'),
		price: { amountMinor: minorAmount(source.price.amountMinor, 'price'), currency: currency(source.price.currency) },
		availability: source.availability,
		availabilityCheckedAt: isoDate(source.availabilityCheckedAt, 'availability freshness'),
		category: {
			id: `category_${minorAmount(source.category.id, 'category id')}`,
			name: requiredText(source.category.name, 'category name'),
			slug: opaqueReference(source.category.slug, 'category slug')
		},
		merchant: {
			id: opaqueReference(source.merchant.id, 'merchant id'),
			fulfillment: source.merchant.fulfillment
		},
		suitability: {
			geography: source.suitability.geography.map((value) => requiredText(value, 'geography suitability')),
			climate: source.suitability.climate.map((value) => requiredText(value, 'climate suitability')),
			evidence: copyEvidence(source.suitability.evidence)
		},
		claims: copyClaims(source.claims),
		images: copyImages(source.images),
		updatedAt: isoDate(source.updatedAt, 'catalog update time')
	};
}

export function projectPlantGeoCatalog(source: PlantGeoCatalogProjectionSource): PlantGeoCatalogProjection {
	return {
		contractVersion: plantGeoContractVersion,
		generatedAt: isoDate(source.generatedAt, 'catalog generation time'),
		cursor: source.cursor === null ? null : opaqueReference(source.cursor, 'catalog cursor'),
		nextCursor: source.nextCursor === null ? null : opaqueReference(source.nextCursor, 'catalog next cursor'),
		products: source.products.map(projectPlantGeoCatalogProduct)
	};
}

/** Derive a non-reversible subject reference from a stable internal account or anonymous identity. */
export function hashPlantGeoSubject(stableInternalSubjectId: string, hashSecret: string): PlantGeoSubjectHash {
	if (!internalSubjectIdPattern.test(stableInternalSubjectId)) {
		throw new Error('PlantGeo subjects require an opaque internal identifier, not email, IP, or session data');
	}
	if (Buffer.byteLength(hashSecret) < 32) {
		throw new Error('PlantGeo subject hashing requires a secret of at least 32 bytes');
	}
	return `pgh1_${createHmac('sha256', hashSecret)
		.update('aevani:plantgeo:subject:v1\0')
		.update(stableInternalSubjectId)
		.digest('hex')}` as PlantGeoSubjectHash;
}

function copySubject(subject: PlantGeoSubject): PlantGeoSubject {
	if (subject === null) {
		return null;
	}
	if (!subjectHashPattern.test(subject.id)) {
		throw new Error('PlantGeo event subjects must be HMAC-derived hashes');
	}
	return { kind: subject.kind, id: subject.id };
}

function copyRecommendation(recommendation: PlantGeoRecommendation): PlantGeoRecommendation {
	const candidateProductIds = recommendation.candidateProductIds.map(copyProductId);
	const selectedProductIds = recommendation.selectedProductIds.map(copyProductId);
	if (
		candidateProductIds.length === 0 ||
		selectedProductIds.length === 0 ||
		selectedProductIds.some((productId) => !candidateProductIds.includes(productId))
	) {
		throw new Error('recommendations require selected products from the recorded candidate set');
	}
	if (!Number.isFinite(recommendation.confidence) || recommendation.confidence < 0 || recommendation.confidence > 1) {
		throw new Error('recommendation confidence must be between zero and one');
	}
	if (recommendation.rationaleCodes.length === 0 || recommendation.sourceEvidence.length === 0) {
		throw new Error('recommendations require rationale codes and source evidence');
	}
	return {
		id: opaqueReference(recommendation.id, 'recommendation id'),
		candidateProductIds,
		selectedProductIds,
		rationaleCodes: recommendation.rationaleCodes.map((value) => opaqueReference(value, 'rationale code')),
		constraintCodes: recommendation.constraintCodes.map((value) => opaqueReference(value, 'constraint code')),
		confidence: recommendation.confidence,
		sourceEvidence: copyEvidence(recommendation.sourceEvidence),
		agent: {
			id: opaqueReference(recommendation.agent.id, 'agent id'),
			modelVersion: requiredText(recommendation.agent.modelVersion, 'agent model version')
		},
		contentContextId: opaqueReference(recommendation.contentContextId, 'content context id'),
		disclosureVersion: opaqueReference(recommendation.disclosureVersion, 'disclosure version')
	};
}

function copyAttribution(attribution: PlantGeoAttributionReference): PlantGeoAttributionReference {
	return {
		publisherPropertyId: opaqueReference(attribution.publisherPropertyId, 'publisher property id'),
		campaignId: nullableOpaqueReference(attribution.campaignId, 'campaign id'),
		placementId: nullableOpaqueReference(attribution.placementId, 'placement id'),
		subId: nullableOpaqueReference(attribution.subId, 'sub-id'),
		channel: attribution.channel,
		recommendationId: opaqueReference(attribution.recommendationId, 'attribution recommendation id')
	};
}

/** Clone the contract allowlist before dispatch so cast or extra runtime fields cannot leave the process. */
export function serializePlantGeoCommerceEvent(event: PlantGeoCommerceEvent): PlantGeoCommerceEvent {
	const base = {
		eventId: opaqueReference(event.eventId, 'event id'),
		occurredAt: isoDate(event.occurredAt, 'event time'),
		subject: copySubject(event.subject)
	};

	switch (event.type) {
		case 'recommendation.recorded':
			return { type: event.type, ...base, recommendation: copyRecommendation(event.recommendation) };
		case 'recommendation.clicked':
			return {
				type: event.type,
				...base,
				recommendationId: opaqueReference(event.recommendationId, 'recommendation id'),
				productId: copyProductId(event.productId),
				attribution: copyAttribution(event.attribution)
			};
		case 'commerce.attributed':
			return {
				type: event.type,
				...base,
				order: {
					id: opaqueReference(event.order.id, 'order id'),
					currency: currency(event.order.currency),
					totalMinor: minorAmount(event.order.totalMinor, 'order total'),
					items: event.order.items.map((item) => {
						if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
							throw new Error('order item quantity must be a positive integer');
						}
						return { productId: copyProductId(item.productId), quantity: item.quantity };
					})
				},
				attribution: copyAttribution(event.attribution)
			};
	}
}
