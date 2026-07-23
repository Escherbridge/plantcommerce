import type { PageServerLoad } from './$types';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';

function sortInput(value: string | null) {
	const [sortBy, sortOrder] = (value ?? 'created-desc').split('-');
	return {
		sortBy: ['name', 'price', 'created'].includes(sortBy)
			? (sortBy as 'name' | 'price' | 'created')
			: ('created' as const),
		sortOrder: sortOrder === 'asc' ? ('asc' as const) : ('desc' as const)
	};
}

export const load: PageServerLoad = async (event) => {
	const adapter = await getCommerceAdapter(event);
	const search = event.url.searchParams.get('search')?.trim() ?? '';
	const selectedCategory = event.url.searchParams.get('category')?.trim() ?? '';
	const selectedTag = event.url.searchParams.get('tag')?.trim() ?? '';
	const sort = event.url.searchParams.get('sort') ?? 'created-desc';
	const [categories, tags, products] = await Promise.all([
		adapter.getCategories(),
		adapter.getTags(),
		adapter.getProducts({
			search: search || undefined,
			categorySlug: selectedCategory || undefined,
			tag: selectedTag || undefined,
			limit: 50,
			...sortInput(sort)
		})
	]);
	return {
		context: adapter.context,
		products,
		categories,
		tags,
		search,
		selectedCategory,
		selectedTag,
		sort
	};
};
