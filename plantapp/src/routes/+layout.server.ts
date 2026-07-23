import type { LayoutServerLoad } from './$types';
import { toPublicSession, toPublicSessionUser } from '$lib/server/auth';
import { resolveCommerceMode } from '$lib/server/commerce/runtime';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;
	return {
		user: toPublicSessionUser(locals.user),
		session: toPublicSession(locals.session),
		commerceMode: resolveCommerceMode(event)
	};
};
