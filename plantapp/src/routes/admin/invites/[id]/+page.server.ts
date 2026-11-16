import { error, fail, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	InviteForbiddenError,
	getManagerInvite,
	removeInvitedRole,
	resendInviteVerification,
	reviewInviteUse,
	revokeManagerInvite
} from '$lib/server/services/managerInvite';

function admin(user: App.Locals['user']) {
	if (!user || user.role !== 'admin') error(403, 'Forbidden');
	return user;
}

function formText(data: FormData, name: string): string {
	const value = data.get(name);
	return typeof value === 'string' ? value : '';
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const actor = admin(locals.user);
	try {
		return {
			detail: await getManagerInvite({ actor, id: params.id }),
			notice: url.searchParams.get('notice'),
			noticeName: url.searchParams.get('name') ?? '',
			noticeEmail: url.searchParams.get('email') ?? '',
			noticeRole: url.searchParams.get('role') ?? ''
		};
	} catch (caught) {
		if (caught instanceof InviteForbiddenError) error(403, 'Forbidden');
		throw caught;
	}
};

export const actions = {
	revoke: async ({ locals, params }) => {
		const actor = admin(locals.user);
		const result = await revokeManagerInvite({ actor, id: params.id });
		if (!result.ok) error(404, "We couldn't find this invite.");
		throw redirect(303, `/admin/invites/${params.id}?notice=revoked`);
	},
	approve: async ({ request, locals, params }) => act(request, locals.user, params.id, 'approved'),
	reject: async ({ request, locals, params }) => act(request, locals.user, params.id, 'rejected'),
	remove: async ({ request, locals, params }) => {
		const actor = admin(locals.user);
		const useId = formText(await request.formData(), 'useId');
		try {
			const result = await removeInvitedRole({ actor, useId });
			if (!result.ok) return fail(404, { message: "We couldn't find that person." });
			const name = encodeURIComponent(result.name);
			throw redirect(
				303,
				`/admin/invites/${params.id}?notice=removed&name=${name}&role=${result.role}`
			);
		} catch (caught) {
			if (isRedirect(caught) || isHttpError(caught)) throw caught;
			if (caught instanceof InviteForbiddenError) error(403, 'Forbidden');
			return fail(500, { message: 'We could not remove the role. Try again in a few minutes.' });
		}
	},
	resend: async ({ request, locals, params }) => {
		const actor = admin(locals.user);
		const useId = formText(await request.formData(), 'useId');
		const result = await resendInviteVerification({ actor, useId });
		const email = encodeURIComponent(result.email ?? '');
		throw redirect(
			303,
			`/admin/invites/${params.id}?notice=${result.ok ? 'resent' : 'resend-failed'}&email=${email}`
		);
	}
} satisfies Actions;

async function act(
	request: Request,
	user: App.Locals['user'],
	inviteId: string,
	decision: 'approved' | 'rejected'
) {
	const actor = admin(user);
	const useId = formText(await request.formData(), 'useId');
	try {
		const result = await reviewInviteUse({ actor, useId, decision });
		if (!result.ok) return fail(404, { message: "We couldn't find that person." });
		const name = encodeURIComponent(result.name);
		throw redirect(
			303,
			`/admin/invites/${inviteId}?notice=${decision}&name=${name}&role=${result.role}`
		);
	} catch (caught) {
		if (isRedirect(caught) || isHttpError(caught)) throw caught;
		if (caught instanceof InviteForbiddenError) error(403, 'Forbidden');
		return fail(500, { message: 'We could not update this invite. Try again in a few minutes.' });
	}
}
