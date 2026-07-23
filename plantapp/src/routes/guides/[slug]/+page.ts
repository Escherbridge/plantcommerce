import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	try {
		const guide = await createCallerClient(event.fetch).content.getPage.query({
			slug: event.params.slug
		});
		if (guide.page.type !== 'guide') throw error(404, 'Guide not found');
		return { guide };
	} catch (cause) {
		if (cause && typeof cause === 'object' && 'status' in cause) throw cause;
		throw error(404, 'Guide not found');
	}
};
