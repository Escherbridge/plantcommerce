import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const category = url.searchParams.get('category');

	try {
		const posts = await trpc.content.getPublishedPages.query({
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
