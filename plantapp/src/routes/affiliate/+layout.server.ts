import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { AffiliateService } from '$lib/server/services/affiliate';
import { toPublicSessionUser } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (['/affiliate', '/affiliate/join', '/affiliate/terms'].includes(url.pathname)) {
		return { user: toPublicSessionUser(user) };
	}

	if (!user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	if (user.role !== 'admin') {
		try {
			await AffiliateService.requireActiveAffiliateByUserId(user.id);
		} catch {
			throw redirect(303, '/affiliate/join');
		}
	}

	return { user: toPublicSessionUser(user) };
};
