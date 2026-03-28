import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const type = url.searchParams.get('type');

	try {
		const resources = await trpc(event).content.getPublishedPages.query({
			type: 'page',
			search: undefined
		});

		return {
			resources: resources || [],
			selectedType: type
		};
	} catch (error) {
		console.error('Error loading resources:', error);
		return {
			resources: [],
			selectedType: type
		};
	}
};
