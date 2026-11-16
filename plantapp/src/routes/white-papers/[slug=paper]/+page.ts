import { error } from '@sveltejs/kit';
import { whitePaperBySlug } from '$lib/content/white-papers';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const paper = whitePaperBySlug(params.slug);
	if (!paper || !paper.published) throw error(404, 'White paper not found');
	return { paper };
};
