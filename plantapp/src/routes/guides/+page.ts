import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const category = url.searchParams.get('category');

	try {
		const guides = await trpc(event).content.getByType.query({
			type: 'guide',
			category: category || undefined
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
