export const catalogOfferingKinds = [
	'stocked_product',
	'dropship_white_label',
	'external_affiliate_offer',
	'course',
	'service',
	'subscription',
	'marketplace'
] as const;

export type CatalogOfferingKind = (typeof catalogOfferingKinds)[number];

export const catalogTruthStatuses = [
	'unverified',
	'verified',
	'not_applicable',
	'unavailable'
] as const;
export type CatalogTruthStatus = (typeof catalogTruthStatuses)[number];

export type CatalogTruthEvidence = Readonly<{
	id: string;
	assertion: string;
	verificationStatus: 'unverified' | 'verified';
	source: Readonly<{
		file: string;
		lineStart: number;
		lineEnd: number;
	}>;
}>;

export type CatalogTruthFact<T> = Readonly<{
	status: CatalogTruthStatus;
	value: T | null;
	evidence: readonly CatalogTruthEvidence[];
	verifiedAt: string | null;
}>;

export type CatalogOperationalTruth = Readonly<{
	supplier: CatalogTruthFact<
		Readonly<{
			name: string;
			relationship: 'manufacturer' | 'merchant' | 'provider' | 'wholesaler';
		}>
	>;
	offer: CatalogTruthFact<
		Readonly<{ currency: string; priceMinor: number; offerReference: string }>
	>;
	cost: CatalogTruthFact<Readonly<{ currency: string; amountMinor: number }>>;
	minimumOrderQuantity: CatalogTruthFact<Readonly<{ quantity: number; unit: string }>>;
	leadTime: CatalogTruthFact<Readonly<{ minimumDays: number; maximumDays: number }>>;
	fulfillment: CatalogTruthFact<
		Readonly<{ model: 'merchant' | 'partner' | 'supplier' | 'digital'; regions: readonly string[] }>
	>;
	returns: CatalogTruthFact<Readonly<{ policyReference: string; windowDays: number | null }>>;
	compliance: CatalogTruthFact<
		Readonly<{ standards: readonly string[]; reviewNote: string | null }>
	>;
}>;

export type CatalogTruthRecord = Readonly<{
	id: string;
	title: string;
	offeringKind: CatalogOfferingKind;
	lifecycle: 'research_only' | 'operationally_verified' | 'retired';
	customerVisibility: 'not_customer_facing' | 'customer_facing';
	sellability: 'not_sellable' | 'sellable';
	sourceEvidence: readonly CatalogTruthEvidence[];
	operationalTruth: CatalogOperationalTruth;
}>;

export type ResearchOnlyCandidateInput = Readonly<{
	id: string;
	title: string;
	offeringKind: CatalogOfferingKind;
	sourceEvidence: readonly CatalogTruthEvidence[];
}>;

const operationalFactNames = [
	'supplier',
	'offer',
	'cost',
	'minimumOrderQuantity',
	'leadTime',
	'fulfillment',
	'returns',
	'compliance'
] as const;

function assertNonEmpty(value: string, label: string): void {
	if (!value.trim()) {
		throw new Error(`${label} is required`);
	}
}

function assertEvidence(evidence: readonly CatalogTruthEvidence[], label: string): void {
	if (evidence.length === 0) {
		throw new Error(`${label} requires provenance evidence`);
	}

	for (const item of evidence) {
		assertNonEmpty(item.id, `${label} evidence id`);
		assertNonEmpty(item.assertion, `${label} evidence assertion`);
		assertNonEmpty(item.source.file, `${label} evidence file`);
		if (
			!Number.isSafeInteger(item.source.lineStart) ||
			!Number.isSafeInteger(item.source.lineEnd) ||
			item.source.lineStart <= 0 ||
			item.source.lineEnd < item.source.lineStart
		) {
			throw new Error(`${label} evidence requires a valid local file line range`);
		}
	}
}

function truthFacts(truth: CatalogOperationalTruth): readonly CatalogTruthFact<unknown>[] {
	return [
		truth.supplier,
		truth.offer,
		truth.cost,
		truth.minimumOrderQuantity,
		truth.leadTime,
		truth.fulfillment,
		truth.returns,
		truth.compliance
	];
}

function assertTruthFact(fact: CatalogTruthFact<unknown>, name: string): void {
	if (!catalogTruthStatuses.includes(fact.status)) {
		throw new Error(`${name} has an unknown truth status`);
	}
	assertEvidence(fact.evidence, name);

	if (fact.status === 'verified') {
		if (fact.value === null || fact.verifiedAt === null) {
			throw new Error(`${name} must have a value and timestamp when verified`);
		}
		if (!fact.evidence.some((item) => item.verificationStatus === 'verified')) {
			throw new Error(`${name} requires verified evidence before it can be marked verified`);
		}
		return;
	}

	if (fact.status === 'not_applicable') {
		if (
			fact.value !== null ||
			fact.verifiedAt === null ||
			!fact.evidence.some((item) => item.verificationStatus === 'verified')
		) {
			throw new Error(`${name} requires verified evidence before it can be marked not applicable`);
		}
		return;
	}

	if (fact.value !== null || fact.verifiedAt !== null) {
		throw new Error(`${name} may not expose a value before it is verified`);
	}
}

/** Validate truth, sellability, and publication guards before a record can leave a research workflow. */
export function assertCatalogTruthRecord(record: CatalogTruthRecord): void {
	assertNonEmpty(record.id, 'catalog truth id');
	assertNonEmpty(record.title, 'catalog truth title');
	if (!catalogOfferingKinds.includes(record.offeringKind)) {
		throw new Error('catalog truth record has an unknown offering kind');
	}
	assertEvidence(record.sourceEvidence, 'catalog truth record');

	const facts = truthFacts(record.operationalTruth);
	facts.forEach((fact, index) => assertTruthFact(fact, operationalFactNames[index]));

	if (record.lifecycle === 'research_only') {
		if (
			record.customerVisibility !== 'not_customer_facing' ||
			record.sellability !== 'not_sellable'
		) {
			throw new Error('research-only records must remain not customer-facing and not sellable');
		}
		if (facts.some((fact) => fact.status === 'verified')) {
			throw new Error('research-only records cannot contain verified operational facts');
		}
	}
}

function unverifiedFact(evidence: readonly CatalogTruthEvidence[]): CatalogTruthFact<never> {
	return { status: 'unverified', value: null, evidence, verifiedAt: null };
}

/** Create an internal lead with no offer, inventory, or operational claim. */
export function createResearchOnlyCandidate(input: ResearchOnlyCandidateInput): CatalogTruthRecord {
	const unresolved = () => unverifiedFact(input.sourceEvidence);
	const record: CatalogTruthRecord = {
		id: input.id,
		title: input.title,
		offeringKind: input.offeringKind,
		lifecycle: 'research_only',
		customerVisibility: 'not_customer_facing',
		sellability: 'not_sellable',
		sourceEvidence: input.sourceEvidence,
		operationalTruth: {
			supplier: unresolved(),
			offer: unresolved(),
			cost: unresolved(),
			minimumOrderQuantity: unresolved(),
			leadTime: unresolved(),
			fulfillment: unresolved(),
			returns: unresolved(),
			compliance: unresolved()
		}
	};

	assertCatalogTruthRecord(record);
	return record;
}

/** A public catalog must filter through this guard; research leads always produce an empty result. */
export function isCustomerFacingCatalogRecord(record: CatalogTruthRecord): boolean {
	assertCatalogTruthRecord(record);
	const facts = truthFacts(record.operationalTruth);
	return (
		record.lifecycle === 'operationally_verified' &&
		record.customerVisibility === 'customer_facing' &&
		record.sellability === 'sellable' &&
		facts.some((fact) => fact.status === 'verified') &&
		facts.every((fact) => fact.status === 'verified' || fact.status === 'not_applicable')
	);
}

export function customerFacingCatalogRecords(
	records: readonly CatalogTruthRecord[]
): CatalogTruthRecord[] {
	return records.filter(isCustomerFacingCatalogRecord);
}
