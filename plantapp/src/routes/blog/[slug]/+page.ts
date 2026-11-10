import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	try {
		const post = await createCallerClient(event.fetch).content.getPage.query({
			slug: event.params.slug
		});
		if (post.page.type !== 'blog_post') throw error(404, 'Post not found');
		return { post };
	} catch (cause) {
		if (cause && typeof cause === 'object' && 'status' in cause) throw cause;
		throw error(404, 'Post not found');
	}
};
