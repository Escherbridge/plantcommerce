import { error, fail, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isInviteRole } from '$lib/auth/userRole';
import {
	createManagerInvite,
	InviteForbiddenError,
	listManagerInvites,
	revokeManagerInvite
} from '$lib/server/services/managerInvite';
import type { InviteFieldError, InviteFormInput } from '$lib/invites/validation';

function formText(data: FormData, name: string): string {
	const value = data.get(name);
	return typeof value === 'string' ? value : '';
}

function readForm(data: FormData): InviteFormInput {
	return {
		role: formText(data, 'role'),
		label: formText(data, 'label'),
		expires: formText(data, 'expires'),
		useLimit: formText(data, 'useLimit'),
		note: formText(data, 'note')
	};
}

function forbidUnlessAdmin(user: App.Locals['user']) {
	if (!user || user.role !== 'admin') error(403, 'Forbidden');
	return user;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const actor = forbidUnlessAdmin(locals.user);
	try {
		const invites = await listManagerInvites({ actor });
		const createdId = url.searchParams.get('created');
		return {
			invites,
			created: createdId ? (invites.find((invite) => invite.id === createdId) ?? null) : null,
			roleQuery: url.searchParams.get('role') ?? '',
			revokedNotice: url.searchParams.get('revoked') === '1'
		};
	} catch (caught) {
		if (caught instanceof InviteForbiddenError) error(403, 'Forbidden');
		throw caught;
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const actor = forbidUnlessAdmin(locals.user);
		const form = readForm(await request.formData());
		try {
			const result = await createManagerInvite({
				actor,
				actorId: actor.id,
				form
			});
			if (!result.ok) {
				return fail(400, {
					fieldErrors: result.fieldErrors satisfies InviteFieldError[],
					values: form
				});
			}
			throw redirect(303, `/admin/invites?created=${encodeURIComponent(result.invite.id)}`);
		} catch (caught) {
			if (isRedirect(caught) || isHttpError(caught)) throw caught;
			if (caught instanceof InviteForbiddenError) error(403, 'Forbidden');
			return fail(500, { transport: true, values: form });
		}
	},
	revoke: async ({ request, locals }) => {
		const actor = forbidUnlessAdmin(locals.user);
		const id = formText(await request.formData(), 'id');
		try {
			const result = await revokeManagerInvite({ actor, id });
			if (!result.ok) error(404, "We couldn't find this invite.");
			throw redirect(303, '/admin/invites?revoked=1');
		} catch (caught) {
			if (isRedirect(caught) || isHttpError(caught)) throw caught;
			if (caught instanceof InviteForbiddenError) error(403, 'Forbidden');
			return fail(500, { transport: true });
		}
	}
} satisfies Actions;
