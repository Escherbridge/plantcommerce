import { describe, expect, it } from 'vitest';
import { isRetiredLiveGoodsFaq } from './retiredClaims';

describe('isRetiredLiveGoodsFaq', () => {
	it('hides the retired live-goods shipping FAQ by slug', () => {
		expect(
			isRetiredLiveGoodsFaq({
				type: 'faq',
				slug: 'faq-shipping-live-products',
				title: 'Shipping question',
				excerpt: 'Retired.'
			})
		).toBe(true);
	});

	it('hides a FAQ whose text still names the retired species', () => {
		expect(
			isRetiredLiveGoodsFaq({
				type: 'faq',
				slug: 'old-fish-faq',
				title: 'Which fish do you ship?',
				excerpt: ['We ship', ['tila', 'pia'].join('')].join(' ')
			})
		).toBe(true);
	});

	it('keeps ordinary horticulture questions', () => {
		expect(
			isRetiredLiveGoodsFaq({
				type: 'faq',
				slug: 'faq-watering-seedlings',
				title: 'How often should I water my seedlings?',
				excerpt: 'Seedling watering depends on container size, soil mix, and environment.'
			})
		).toBe(false);
	});
});
