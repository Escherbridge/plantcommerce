import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const templates = await trpc.lms.certificate.listTemplates.query({});
		return { templates };
	} catch (error) {
		console.error('Error loading certificate templates:', error);
		return { templates: [] };
	}
};
