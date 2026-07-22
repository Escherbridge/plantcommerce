import { describe, expect, it } from 'vitest';

import {
	assertGrowPlan,
	createRequiredItemsCartRequest,
	mayActivateGrowPlans,
	type GrowPlanActivationState
} from './contracts';
import { growPlans } from './plans';

const enabledGates: GrowPlanActivationState = {
	catalogMedia: true,
	guestAndAuthCart: true,
	checkout: true,
	affiliateAttribution: true
};

describe('Grow Plan contract', () => {
	it('keeps every launch plan specified and validates its item boundary', () => {
		expect(growPlans).toHaveLength(4);
		for (const plan of growPlans) {
			expect(plan.status).toBe('specified');
			expect(() => assertGrowPlan(plan)).not.toThrow();
		}
	});

	it('requires every commerce gate before activation', () => {
		expect(mayActivateGrowPlans(enabledGates)).toBe(true);
		expect(mayActivateGrowPlans({ ...enabledGates, checkout: false })).toBe(false);
	});

	it('rejects cart requests until a plan is both active and gate-approved', () => {
		expect(() => createRequiredItemsCartRequest(growPlans[0], enabledGates)).toThrow(
			'Grow Plans are not active'
		);
	});

	it('rejects an undisclosed affiliate item', () => {
		const first = growPlans[0];
		const affiliate = first.items.find((item) => item.action === 'affiliate_outbound');
		expect(affiliate).toBeDefined();

		expect(() =>
			assertGrowPlan({
				...first,
				items: first.items.map((item) =>
					item === affiliate ? { ...item, affiliateDisclosure: null } : item
				)
			})
		).toThrow('affiliate grow plan items require a disclosure');
	});
});
