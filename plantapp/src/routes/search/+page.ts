import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const q = event.url.searchParams.get('q')?.trim() ?? '';
	if (!q) {
		return { q, guides: [], posts: [], products: [], courses: [] };
	}

	const trpc = createCallerClient(event.fetch);
	const [guides, posts, products, courseList] = await Promise.all([
		trpc.content.getPublishedPages.query({ type: 'guide', search: q, limit: 20 }).catch(() => []),
		trpc.content.getPublishedPages
			.query({ type: 'blog_post', search: q, limit: 20 })
			.catch(() => []),
		trpc.products.getProducts.query({ search: q, limit: 20 }).catch(() => []),
		trpc.lms.course.list.query({ search: q, limit: 20 }).catch(() => ({ courses: [], total: 0 }))
	]);

	return {
		q,
		guides: guides ?? [],
		posts: posts ?? [],
		products: products ?? [],
		courses: courseList?.courses ?? []
	};
};
