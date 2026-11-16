import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { accountCapabilitiesEnabled, verifyEmailWithCapability } from '$lib/server/auth';
import { safeRedirectPath } from '$lib/auth/safeRedirect';

export const load: PageServerLoad = async ({ url }) => ({
	token: url.searchParams.get('token'),
	redirectTo: safeRedirectPath(url.searchParams.get('redirect'), url.origin)
});

export const actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const redirectField = formData.get('redirect');
		const redirectTo = safeRedirectPath(
			typeof redirectField === 'string' ? redirectField : url.searchParams.get('redirect'),
			url.origin
		);
		if (!accountCapabilitiesEnabled()) {
			return fail(503, { message: 'Email verification is temporarily unavailable.', redirectTo });
		}

		const token = formData.get('token');
		if (typeof token !== 'string') {
			return fail(400, { message: 'Invalid verification link.', redirectTo });
		}

		const userId = await verifyEmailWithCapability(token);
		if (!userId) {
			return fail(400, { message: 'This verification link is invalid or expired.', redirectTo });
		}

		return {
			success: true,
			redirectTo,
			message:
				'Email confirmation recorded. A staged email change takes effect only after both email addresses confirm it.'
		};
	}
} satisfies Actions;
