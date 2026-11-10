import type { PageLoad } from './$types';
import { cornerstoneEssays, essayRedirectTarget } from '$lib/content/essays';
import { createCallerClient } from '$lib/trpc/client';

const unsourcedCornerstoneSlugs = new Set([
	'what-is-silvopasture',
	'monoculture-to-polyculture',
	'introduction-to-aquaponics'
]);

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const category = url.searchParams.get('category');
	const essays = category
		? []
		: cornerstoneEssays.map((essay) => ({
				title: essay.title,
				slug: essay.slug,
				excerpt: essay.excerpt,
				publishedAt: essay.publishedAt,
				type: 'blog_post' as const
			}));

	try {
		const posts = await trpc.content.getPublishedPages.query({
			type: 'blog_post',
			search: category || undefined
		});

		return {
			posts: [
				...essays,
				...(posts || []).filter(
					(post) => !unsourcedCornerstoneSlugs.has(post.slug) && !essayRedirectTarget(post.slug)
				)
			],
			selectedCategory: category
		};
	} catch (error) {
		console.error('Error loading blog posts:', error);
		return {
			posts: essays,
			selectedCategory: category
		};
	}
};
