import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { cornerstoneEssayBySlug, cornerstoneEssayRecord } from '$lib/content/essays';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const essay = cornerstoneEssayBySlug(event.params.slug);
	if (essay) {
		return { post: cornerstoneEssayRecord(essay) };
	}

	try {
		const post = await createCallerClient(event.fetch).content.getPage.query({
			slug: event.params.slug
		});
		if (post.page.type !== 'blog_post') throw error(404, 'Post not found');
		return { post: { ...post, sources: [] } };
	} catch (cause) {
		if (cause && typeof cause === 'object' && 'status' in cause) throw cause;
		throw error(404, 'Post not found');
	}
};
