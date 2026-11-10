import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('course detail load', () => {
	it('returns a published course when curriculum is unavailable', async () => {
		const fetchMock: typeof fetch = async (input) => {
			const url = String(input);
			if (url.includes('getBySlug')) {
				return new Response(
					JSON.stringify([
						{
							result: {
								data: {
									id: 'course-1',
									title: 'Hydroponics Field Guide',
									slug: 'hydroponics-field-guide',
									pricingType: 'free',
									price: null
								}
							}
						}
					]),
					{ status: 200, headers: { 'content-type': 'application/json' } }
				);
			}
			return new Response(
				JSON.stringify([
					{
						error: {
							message: 'An active enrollment is required',
							code: -32603,
							data: { code: 'FORBIDDEN', httpStatus: 403 }
						}
					}
				]),
				{ status: 403, headers: { 'content-type': 'application/json' } }
			);
		};

		const result = await load({
			fetch: fetchMock,
			params: { slug: 'hydroponics-field-guide' }
		} as never);
		if (!result) throw new Error('expected course data');

		expect(result.course.slug).toBe('hydroponics-field-guide');
		expect(result.curriculum.modules).toEqual([]);
	});
});
