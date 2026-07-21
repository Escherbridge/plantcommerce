import { describe, expect, it } from 'vitest';
import {
	calculateCheckoutTotals,
	decimalToMinorUnits,
	hashGuestCheckoutSubject,
	minorUnitsToDecimal
} from './checkoutDraft';

describe('checkout draft money helpers', () => {
	it('converts decimal prices without floating-point rounding', () => {
		expect(decimalToMinorUnits('19.99')).toBe(1999);
		expect(decimalToMinorUnits('0.01')).toBe(1);
		expect(minorUnitsToDecimal(1999)).toBe('19.99');
	});

	it('rejects fractions smaller than a currency minor unit', () => {
		expect(() => decimalToMinorUnits('19.999')).toThrow('at most 2 fractional digits');
	});

	it('calculates tax and total in minor units', () => {
		expect(calculateCheckoutTotals(19990)).toEqual({
			subtotalMinor: 19990,
			taxMinor: 1599,
			shippingMinor: 500,
			discountMinor: 0,
			totalMinor: 22089
		});
	});
});

describe('guest checkout subject hashing', () => {
	it('is deterministic without retaining the guest capability itself', () => {
		const capability = 'opaque-server-issued-guest-capability';
		const subjectHash = hashGuestCheckoutSubject(capability);

		expect(subjectHash).toHaveLength(64);
		expect(subjectHash).not.toContain(capability);
		expect(hashGuestCheckoutSubject(capability)).toBe(subjectHash);
	});
});
