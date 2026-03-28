import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const category = url.searchParams.get('category');

	try {
		const posts = await trpc(event).content.getPublishedPages.query({
			type: 'blog_post',
			search: category || undefined
		});

		return {
			posts: posts || [],
			selectedCategory: category
		};
	} catch (error) {
		console.error('Error loading blog posts:', error);
		return {
			posts: [],
			selectedCategory: category
		};
	}
};
