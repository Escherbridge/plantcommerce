import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { presentSoilHealthGuide } from '$lib/content/soilHealthGuide';
import { publishedGuideSectors } from '$lib/content/writing';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const sector = publishedGuideSectors.find((entry) => entry.slug === event.params.slug) ?? null;
	if (sector) return { sector, guide: null };

	try {
		const guide = await createCallerClient(event.fetch).content.getPage.query({
			slug: event.params.slug
		});
		if (guide.page.type !== 'guide') throw error(404, 'Guide not found');
		// `content_page` is not rewritten in place. This return value is the
		// data SvelteKit serializes into the hydration payload.
		return { sector: null, guide: presentSoilHealthGuide(guide) };
	} catch (cause) {
		if (cause && typeof cause === 'object' && 'status' in cause) throw cause;
		throw error(404, 'Guide not found');
	}
};
