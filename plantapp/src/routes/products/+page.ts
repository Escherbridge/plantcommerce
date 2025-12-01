import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';
import { getMockProducts, getMockCategories } from '$lib/utils/mockProducts';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const search = url.searchParams.get('search');
	const category = url.searchParams.get('category');

	try {
		// Get all categories
		const categories = await trpc(event).products.getCategories.query();

		// Get products with optional filters
		const products = await trpc(event).products.getProducts.query({
			search: search || undefined,
			categoryId: category ? parseInt(category) : undefined,
			limit: 50
		});

		return {
			products: Array.isArray(products) ? products : [],
			categories: categories || [],
			selectedCategory: category,
			searchQuery: search
		};
	} catch (error) {
		console.error('Error loading products from database, using mock data:', error);

		// Fallback to mock data
		const mockCategories = getMockCategories();
		const mockProducts = getMockProducts({
			search: search || undefined,
			categoryId: category ? parseInt(category) : undefined,
			limit: 50
		});

		return {
			products: mockProducts,
			categories: mockCategories,
			selectedCategory: category,
			searchQuery: search
		};
	}
};
