import type { PageLoad } from './$types';
import { essayRedirectTarget } from '$lib/content/essays';
import { isPlaceholderListing, presentPlaceholderListing } from '$lib/catalog/placeholderListing';
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
		posts: (posts ?? []).filter((post) => !essayRedirectTarget(post.slug)),
		products: (products ?? []).map((row) => {
			const product = row.product ?? row;
			if (!isPlaceholderListing(product)) return row;
			const copy = presentPlaceholderListing(product);
			return {
				...row,
				product: {
					...product,
					shortDescription: copy.shortDescription,
					badges: copy.badges,
					price: '',
					comparePrice: null
				}
			};
		}),
		courses: courseList?.courses ?? []
	};
};
