import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { accountCapabilitiesEnabled, verifyEmailWithCapability } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url }) => ({
	token: url.searchParams.get('token')
});

export const actions = {
	default: async ({ request }) => {
		if (!accountCapabilitiesEnabled()) {
			return fail(503, { message: 'Email verification is temporarily unavailable.' });
		}

		const formData = await request.formData();
		const token = formData.get('token');
		if (typeof token !== 'string') {
			return fail(400, { message: 'Invalid verification link.' });
		}

		const userId = await verifyEmailWithCapability(token);
		if (!userId) {
			return fail(400, { message: 'This verification link is invalid or expired.' });
		}

		return {
			success: true,
			message: 'Email confirmation recorded. A staged email change takes effect only after both email addresses confirm it.'
		};
	}
} satisfies Actions;
