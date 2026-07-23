export type CommerceMode = 'database' | 'demo';

export type CommerceDataClass = 'database' | 'mock_test';

export interface CommerceContext {
	mode: CommerceMode;
	dataClass: CommerceDataClass;
	isMock: boolean;
	label: string;
}

export interface Money {
	amountMinor: number;
	currency: 'USD';
}

export interface CommerceCategory {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	parentSlug: string | null;
}

export interface CommerceTag {
	slug: string;
	name: string;
}

export interface CommerceManufacturer {
	name: string;
	status: 'unverified' | 'verified' | 'retired';
	websiteUrl?: string | null;
}

export interface CommerceContentArea {
	slug: string;
	name: string;
}

export interface CommerceFacet {
	key: string;
	name: string;
	value: string;
}

export interface CommerceGuide {
	slug: string;
	title: string;
	type: 'guide' | 'faq' | 'recommended' | 'required' | 'mentioned';
}

export interface CommerceProductImage {
	url: string;
	altText: string;
	isMock?: boolean;
	caption?: string | null;
	role?: 'primary' | 'gallery' | 'diagram' | 'manual';
}

export interface CommerceProduct {
	id: string;
	slug: string;
	name: string;
	description: string;
	shortDescription: string;
	sku: string;
	category: CommerceCategory;
	price: Money;
	comparePrice: Money | null;
	availableQuantity: number;
	inStock: boolean;
	featured: boolean;
	images: CommerceProductImage[];
	dataClass: CommerceDataClass;
	catalogDataClass?: 'verified' | 'research' | 'mock_test';
	catalogDisclosure?: string | null;
	categories?: CommerceCategory[];
	tags?: CommerceTag[];
	manufacturers?: CommerceManufacturer[];
	contentAreas?: CommerceContentArea[];
	facets?: CommerceFacet[];
	guides?: CommerceGuide[];
}

export interface ProductSearchInput {
	search?: string;
	categorySlug?: string;
	categoryIds?: number[];
	featured?: boolean;
	tag?: string;
	limit?: number;
	offset?: number;
	sortBy?: 'name' | 'price' | 'created';
	sortOrder?: 'asc' | 'desc';
}

export interface CommerceCartItem {
	id: string;
	productId: string;
	quantity: number;
	unitPrice: Money;
	product: CommerceProduct;
}

export interface CommerceCart {
	id: string;
	items: CommerceCartItem[];
	totalItems: number;
	subtotal: Money;
}

export interface CheckoutReview {
	idempotencyKey: string;
	canSubmit: boolean;
	unavailableReason: string | null;
	cart: CommerceCart;
	subtotal: Money;
	tax: Money;
	shipping: Money;
	discount: Money;
	total: Money;
	contactLabel: string;
	shippingLabel: string;
}

export interface CommerceOrder {
	reference: string;
	status: 'simulated' | 'complete' | 'processing';
	items: CommerceCartItem[];
	subtotal: Money;
	tax: Money;
	shipping: Money;
	discount: Money;
	total: Money;
	contactLabel: string;
	createdAt: string;
	dataClass: CommerceDataClass;
}

export type CheckoutSubmission =
	| { kind: 'redirect'; url: string }
	| { kind: 'simulated'; reference: string };

export const DATABASE_COMMERCE_CONTEXT: CommerceContext = Object.freeze({
	mode: 'database',
	dataClass: 'database',
	isMock: false,
	label: 'Database catalogue'
});

export const DEMO_COMMERCE_CONTEXT: CommerceContext = Object.freeze({
	mode: 'demo',
	dataClass: 'mock_test',
	isMock: true,
	label: 'Local demo · Mock/test data · No real commerce'
});

export function assertMinorUnits(value: number, field: string): number {
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new Error(`${field} must be a non-negative safe integer`);
	}
	return value;
}

export function decimalToMinorUnits(value: string): number {
	const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
	if (!match) throw new Error('Currency amount must have at most two decimal places');
	const whole = BigInt(match[1]);
	const fraction = BigInt((match[2] ?? '').padEnd(2, '0') || '0');
	const result = whole * 100n + fraction;
	if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Currency amount is too large');
	return Number(result);
}

export function money(amountMinor: number): Money {
	return { amountMinor: assertMinorUnits(amountMinor, 'Money amount'), currency: 'USD' };
}

export function formatMoney(value: Money): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: value.currency
	}).format(value.amountMinor / 100);
}
