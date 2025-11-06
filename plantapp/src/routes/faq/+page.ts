import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const category = url.searchParams.get('category');

	try {
		const faqs = await trpc(event).content.getByType.query({
			type: 'faq',
			category: category || undefined
		});

		return {
			faqs: faqs || [],
			selectedCategory: category
		};
	} catch (error) {
		console.error('Error loading FAQs:', error);
		return {
			faqs: [],
			selectedCategory: category
		};
	}
};
