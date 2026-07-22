import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

type CatalogPreview = {
	categorySlug?: string | null;
	category?: { slug: string | null } | null;
	description?: string | null;
	images?: Array<{ url: string | null; altText: string | null }>;
	name: string;
	price: string;
	shortDescription?: string | null;
	slug: string;
};

type CatalogCategory = {
	id: string;
	name: string;
};

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const searchQuery = event.url.searchParams.get('search');
	const selectedCategory = event.url.searchParams.get('category');

	try {
		return {
			products: [] as CatalogPreview[],
			categories: [] as CatalogCategory[],
			selectedCategory,
			searchQuery,
			catalogAvailability: await trpc.products.getCatalogAvailability.query()
		};
	} catch (error) {
		console.error('Error checking public catalog availability:', error);
		return {
			products: [] as CatalogPreview[],
			categories: [] as CatalogCategory[],
			selectedCategory,
			searchQuery,
			catalogAvailability: {
				status: 'unavailable' as const,
				reason: 'The catalog could not be checked. Please try again later or contact support.'
			}
		};
	}
};
