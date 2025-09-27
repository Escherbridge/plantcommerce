import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import AffiliateService from '$lib/server/services/affiliate';

export const load: PageServerLoad = async ({ params, request, getClientAddress, cookies }) => {
	const { linkCode } = params;

	// Get affiliate link
	const affiliateLink = await AffiliateService.getLinkByCode(linkCode);
	
	if (!affiliateLink) {
		// Redirect to homepage if affiliate link not found
		throw redirect(302, '/');
	}

	// Extract tracking data from request
	const userAgent = request.headers.get('user-agent') || '';
	const referer = request.headers.get('referer') || '';
	const ipAddress = getClientAddress();
	const sessionId = cookies.get('session-id') || crypto.randomUUID();
	
	// Set session cookie if not exists
	if (!cookies.get('session-id')) {
		cookies.set('session-id', sessionId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});
	}

	// Track the click (fire and forget)
	AffiliateService.trackClick(linkCode, {
		ipAddress,
		userAgent,
		referer,
		sessionId
	}).catch(console.error);

	// Set affiliate attribution cookie for potential future purchase
	cookies.set('affiliate-link', String(affiliateLink.id), {
		path: '/',
		maxAge: 60 * 60 * 24 * 30, // 30 days
		httpOnly: true,
		secure: true,
		sameSite: 'lax'
	});

	// Redirect to the original product page
	throw redirect(302, affiliateLink.originalUrl);
};
