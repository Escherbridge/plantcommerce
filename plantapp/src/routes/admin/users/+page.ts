import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	try {
		const users = await trpc(event).admin.getAllUsers.query();
		return { users };
	} catch (error) {
		return { users: [] };
	}
};
