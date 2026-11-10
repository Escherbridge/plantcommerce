import { describe, expect, it } from 'vitest';
import { isPubliclyReadableCourse, publishedCurriculumView } from './publicRead';

describe('published course visibility', () => {
	it('opens published free courses and keeps paid or draft courses gated', () => {
		expect(
			isPubliclyReadableCourse({ status: 'published', pricingType: 'free', price: null })
		).toBe(true);
		expect(
			isPubliclyReadableCourse({ status: 'published', pricingType: 'one_time', price: '49.00' })
		).toBe(false);
		expect(isPubliclyReadableCourse({ status: 'draft', pricingType: 'free', price: null })).toBe(
			false
		);
	});

	it('hides unpublished modules and lessons', () => {
		const view = publishedCurriculumView({
			modules: [
				{
					isPublished: true,
					title: 'Visible',
					lessons: [
						{ isPublished: true, title: 'Open' },
						{ isPublished: false, title: 'Hidden lesson' }
					]
				},
				{
					isPublished: false,
					title: 'Hidden',
					lessons: [{ isPublished: true, title: 'Still hidden' }]
				}
			]
		});

		expect(view.modules).toEqual([
			{
				isPublished: true,
				title: 'Visible',
				lessons: [{ isPublished: true, title: 'Open' }]
			}
		]);
	});
});
