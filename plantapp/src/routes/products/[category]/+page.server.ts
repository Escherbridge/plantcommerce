import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';

export const load: PageServerLoad = async (event) => {
	const adapter = await getCommerceAdapter(event);
	const categories = await adapter.getCategories();
	const category = categories.find((candidate) => candidate.slug === event.params.category);
	if (!category) throw error(404, 'Category not found');
	const search = event.url.searchParams.get('search')?.trim() ?? '';
	const sort = event.url.searchParams.get('sort') ?? 'created-desc';
	const [sortBy, sortDirection] = sort.split('-');
	const products = await adapter.getProducts({
		categorySlug: category.slug,
		search: search || undefined,
		limit: 50,
		sortBy: ['name', 'price', 'created'].includes(sortBy)
			? (sortBy as 'name' | 'price' | 'created')
			: 'created',
		sortOrder: sortDirection === 'asc' ? 'asc' : 'desc'
	});
	return {
		context: adapter.context,
		products,
		categories,
		search,
		selectedCategory: category.slug,
		sort
	};
};
