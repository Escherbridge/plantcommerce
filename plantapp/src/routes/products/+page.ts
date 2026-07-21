import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const searchQuery = event.url.searchParams.get('search');
	const selectedCategory = event.url.searchParams.get('category');

	try {
		return {
			products: [],
			categories: [],
			selectedCategory,
			searchQuery,
			catalogAvailability: await trpc.products.getCatalogAvailability.query()
		};
	} catch (error) {
		console.error('Error checking public catalog availability:', error);
		return {
			products: [],
			categories: [],
			selectedCategory,
			searchQuery,
			catalogAvailability: {
				status: 'unavailable' as const,
				reason: 'The catalog could not be checked. Please try again later or contact support.'
			}
		};
	}
};
