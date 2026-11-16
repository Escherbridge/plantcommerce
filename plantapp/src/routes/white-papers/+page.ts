import { publishedWhitePapers } from '$lib/content/white-papers';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return { papers: publishedWhitePapers() };
};
