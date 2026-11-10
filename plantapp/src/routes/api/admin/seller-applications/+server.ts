import { env } from '$env/dynamic/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import {
	decideSellerApplicationsAdminAccess,
	parseSellerApplicationSince
} from '$lib/server/sellerApplication/adminAccess';
import { SellerApplicationService } from '$lib/server/sellerApplication/service';

/**
 * Owner forwarder for applications stored from /sell.
 * GET is outside SvelteKit's form CSRF origin check, so a cross-origin poll is not rejected for Origin.
 * The path is omitted from the public sitemap and robots already disallow /api.
 */
const privateHeaders = {
	'Cache-Control': 'no-store',
	'X-Robots-Tag': 'noindex',
	Vary: 'Authorization'
} as const;

export const GET: RequestHandler = async ({ request, url }) => {
	const decision = decideSellerApplicationsAdminAccess(
		request.headers.get('authorization'),
		env.SELLER_APPLICATIONS_ADMIN_TOKEN
	);
	if (decision.status === 503) {
		return json({ error: 'unavailable' }, { status: 503, headers: privateHeaders });
	}
	if (decision.status === 401) {
		return json(
			{ error: 'unauthorized' },
			{
				status: 401,
				headers: { ...privateHeaders, 'WWW-Authenticate': 'Bearer' }
			}
		);
	}

	const sinceParam = url.searchParams.get('since');
	let since: Date | undefined;
	if (sinceParam !== null) {
		const parsed = parseSellerApplicationSince(sinceParam);
		if (!parsed) {
			return json({ error: 'invalid_since' }, { status: 400, headers: privateHeaders });
		}
		since = parsed;
	}

	const applications = await SellerApplicationService.list(since);
	return json(
		{
			applications: applications.map((application) => ({
				id: application.id,
				name: application.name,
				email: application.email,
				businessName: application.businessName,
				websiteOrSocial: application.websiteOrSocial,
				offerings: application.offerings,
				location: application.location,
				message: application.message,
				createdAt: application.createdAt.toISOString()
			}))
		},
		{ headers: privateHeaders }
	);
};
