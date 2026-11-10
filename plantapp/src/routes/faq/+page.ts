import type { PageLoad } from './$types';
import { isRetiredLiveGoodsFaq } from '$lib/content/retiredClaims';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const category = url.searchParams.get('category');

	try {
		const faqs = await trpc.content.getPublishedPages.query({
			type: 'faq',
			search: category || undefined
		});

		return {
			faqs: (faqs || []).filter((faq) => !isRetiredLiveGoodsFaq(faq)),
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
