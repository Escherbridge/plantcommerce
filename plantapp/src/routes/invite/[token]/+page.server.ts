import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { authHandoffHref, pathWithRedirect } from '$lib/auth/safeRedirect';
import { invitePath } from '$lib/invites/urls';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';
import { recordInviteUse, resolveInviteVisit } from '$lib/server/services/managerInvite';

function viewerFrom(user: App.Locals['user']) {
	if (!user) return null;
	return {
		id: user.id,
		email: user.email,
		emailVerified: user.emailVerified
	};
}

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const token = params.token;
	const visit = await resolveInviteVisit({
		token,
		viewer: viewerFrom(locals.user)
	});
	const here = invitePath(token);
	return {
		visit,
		registerHref: authHandoffHref('register', here, url.origin),
		loginHref: authHandoffHref('login', here, url.origin),
		resendHref: pathWithRedirect('/resend-verification', here, url.origin)
	};
};

export const actions = {
	continue: async ({ params, locals, url }) => {
		if (!locals.user) {
			throw redirect(303, authHandoffHref('login', invitePath(params.token), url.origin));
		}
		await recordInviteUse({
			token: params.token,
			viewer: {
				id: locals.user.id,
				email: locals.user.email,
				emailVerified: locals.user.emailVerified
			}
		});
		throw redirect(303, invitePath(params.token));
	},
	signout: async (event) => {
		if (event.locals.session) {
			await invalidateSession(event.locals.session.id);
		}
		deleteSessionTokenCookie(event);
		throw redirect(303, invitePath(event.params.token));
	}
} satisfies Actions;
