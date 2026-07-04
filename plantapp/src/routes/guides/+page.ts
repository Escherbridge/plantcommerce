import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const category = url.searchParams.get('category');

	try {
		const guides = await trpc.content.getPublishedPages.query({
			type: 'guide',
			search: category || undefined
		});

		return {
			guides: guides || [],
			selectedCategory: category
		};
	} catch (error) {
		console.error('Error loading guides:', error);
		return {
			guides: [],
			selectedCategory: category
		};
	}
};
