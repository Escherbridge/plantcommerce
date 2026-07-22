import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const users = await trpc.admin.getAllUsers.query({
			limit: 50,
			offset: 0
		});
		return { users };
	} catch (error) {
		console.error('Error loading users:', error);
		return { users: [] };
	}
};
