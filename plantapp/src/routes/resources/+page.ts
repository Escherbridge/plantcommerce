import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const type = url.searchParams.get('type');

	try {
		const resources = await trpc.content.getPublishedPages.query({
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
