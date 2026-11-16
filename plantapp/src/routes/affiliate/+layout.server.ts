import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { AffiliateService } from '$lib/server/services/affiliate';
import { toPublicSessionUser } from '$lib/server/auth';
import { affiliatePortalRedirect } from '$lib/affiliate/portalRedirect';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
	let affiliateActive = false;
	if (
		user &&
		user.emailVerified &&
		user.role !== 'admin' &&
		path.startsWith('/affiliate') &&
		path !== '/affiliate' &&
		path !== '/affiliate/join' &&
		path !== '/affiliate/terms'
	) {
		try {
			await AffiliateService.requireActiveAffiliateByUserId(user.id);
			affiliateActive = true;
		} catch {
			affiliateActive = false;
		}
	}

	const destination = affiliatePortalRedirect({
		pathname: path,
		user: user ? { role: user.role, emailVerified: user.emailVerified } : null,
		affiliateActive
	});
	if (destination) throw redirect(303, destination);

	return { user: toPublicSessionUser(user) };
};
