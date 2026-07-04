import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const pending = await trpc.admin.getPendingAffiliates.query({ limit: 100 });
		const all = await trpc.admin.getAllAffiliates.query({ limit: 100 });
		return { pending, all };
	} catch (error) {
		console.error('Error loading affiliates:', error);
		return { pending: [], all: [] };
	}
};
