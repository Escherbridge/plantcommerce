import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AffiliateAttributionService } from '$lib/server/affiliateAttribution';

export const load: PageServerLoad = async ({ params, cookies, locals }) => {
	const { linkCode } = params;
	const affiliateLink = await AffiliateAttributionService.recordRedirect(
		linkCode,
		cookies,
		locals.user?.id
	);

	if (!affiliateLink) {
		throw redirect(302, '/');
	}

	throw redirect(302, affiliateLink.originalUrl);
};
