import { describe, expect, it, beforeEach } from 'vitest';
import {
	allowSellerApplication,
	resetSellerApplicationLimits,
	sellerApplicationFieldErrors,
	sellerApplicationSchema
} from './intake';

const valid = {
	name: 'Ada Grower',
	email: 'Ada@Example.com',
	businessName: 'North Bed Farm',
	websiteOrSocial: 'https://example.com/ada',
	offerings: 'Salad greens and herb starts',
	location: 'Hudson Valley, NY',
	message: 'I would like to sell seasonal starts.'
};

describe('seller application intake', () => {
	beforeEach(() => resetSellerApplicationLimits());

	it('accepts a complete application and normalizes the email', () => {
		const parsed = sellerApplicationSchema.parse(valid);
		expect(parsed.email).toBe('ada@example.com');
		expect(parsed.websiteOrSocial).toBe('https://example.com/ada');
	});

	it('stores a blank website as null and reports the first field error', () => {
		const parsed = sellerApplicationSchema.parse({ ...valid, websiteOrSocial: '   ' });
		expect(parsed.websiteOrSocial).toBeNull();

		const result = sellerApplicationSchema.safeParse({ ...valid, name: '', email: 'not-an-email' });
		expect(result.success).toBe(false);
		if (!result.success) {
			const errors = sellerApplicationFieldErrors(result.error);
			expect(errors.name).toBe('Enter your name.');
			expect(errors.email).toBe('Enter a valid email address.');
		}
	});

	it('allows five submissions an hour and blocks the sixth', () => {
		for (let attempt = 0; attempt < 5; attempt += 1) {
			expect(allowSellerApplication('subject', 1_000 + attempt)).toBe(true);
		}
		expect(allowSellerApplication('subject', 1_010)).toBe(false);
		expect(allowSellerApplication('subject', 1_000 + 60 * 60 * 1000)).toBe(true);
	});
});
