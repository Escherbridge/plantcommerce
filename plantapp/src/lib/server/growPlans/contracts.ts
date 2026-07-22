export const growPlanActivationGates = [
	'catalogMedia',
	'guestAndAuthCart',
	'checkout',
	'affiliateAttribution'
] as const;

export type GrowPlanActivationGate = (typeof growPlanActivationGates)[number];

export type GrowPlanActivationState = Readonly<Record<GrowPlanActivationGate, boolean>>;

export type GrowPlanItem = Readonly<{
	catalogSlug: string;
	requirement: 'required' | 'optional';
	quantity: number;
	action: 'aevani_cart' | 'affiliate_outbound';
	note: string;
	affiliateDisclosure: string | null;
}>;

export type GrowPlan = Readonly<{
	id: string;
	slug: string;
	title: string;
	status: 'specified' | 'active';
	outcome: string;
	experienceLevel: 'beginner' | 'intermediate';
	space: string;
	setupTime: string;
	compatibility: string;
	nextSteps: readonly string[];
	items: readonly GrowPlanItem[];
}>;

export type GrowPlanCartRequest = Readonly<{
	planId: string;
	items: readonly Readonly<{ catalogSlug: string; quantity: number }>[];
}>;

function requireText(value: string, label: string): void {
	if (!value.trim()) {
		throw new Error(`${label} is required`);
	}
}

/** Validate a plan before it is used by a server-owned cart or outbound action. */
export function assertGrowPlan(plan: GrowPlan): void {
	requireText(plan.id, 'grow plan id');
	requireText(plan.slug, 'grow plan slug');
	requireText(plan.title, 'grow plan title');
	requireText(plan.outcome, 'grow plan outcome');
	requireText(plan.space, 'grow plan space');
	requireText(plan.setupTime, 'grow plan setup time');
	requireText(plan.compatibility, 'grow plan compatibility');

	if (plan.items.length === 0 || plan.nextSteps.length === 0) {
		throw new Error('grow plan requires items and next steps');
	}

	const seenSlugs = new Set<string>();
	for (const item of plan.items) {
		requireText(item.catalogSlug, 'grow plan item catalog slug');
		requireText(item.note, 'grow plan item note');
		if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
			throw new Error('grow plan item quantity must be a positive integer');
		}
		if (seenSlugs.has(item.catalogSlug)) {
			throw new Error(`grow plan contains a duplicate catalog slug: ${item.catalogSlug}`);
		}
		seenSlugs.add(item.catalogSlug);

		if (item.action === 'affiliate_outbound' && !item.affiliateDisclosure?.trim()) {
			throw new Error('affiliate grow plan items require a disclosure');
		}
		if (item.action === 'aevani_cart' && item.affiliateDisclosure !== null) {
			throw new Error('Aevani cart items may not carry an affiliate disclosure');
		}
	}
}

/** Grow Plans stay non-public until every dependent production contract is proven. */
export function mayActivateGrowPlans(gates: GrowPlanActivationState): boolean {
	return growPlanActivationGates.every((gate) => gates[gate]);
}

/** Build an identity-only request; the cart service resolves offer, price, and availability. */
export function createRequiredItemsCartRequest(
	plan: GrowPlan,
	gates: GrowPlanActivationState
): GrowPlanCartRequest {
	assertGrowPlan(plan);
	if (plan.status !== 'active' || !mayActivateGrowPlans(gates)) {
		throw new Error('Grow Plans are not active until all commerce gates are verified');
	}

	return {
		planId: plan.id,
		items: plan.items
			.filter((item) => item.requirement === 'required' && item.action === 'aevani_cart')
			.map((item) => ({ catalogSlug: item.catalogSlug, quantity: item.quantity }))
	};
}
