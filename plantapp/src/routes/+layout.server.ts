import type { LayoutServerLoad } from './$types';
import { toPublicSession, toPublicSessionUser } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: toPublicSessionUser(locals.user),
		session: toPublicSession(locals.session)
	};
};
