import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { safeRedirectPath } from '$lib/auth/safeRedirect';
import { isInviteToken } from '$lib/invites/token';
import { inviteTokenFromPath } from '$lib/invites/urls';
import { formText } from '$lib/server/noJsCredentialPost';
import { optionalRegisterName, registrationFieldErrors } from './validation';

function keptInvite(redirectTo: string, inviteField: string): string {
	if (isInviteToken(inviteField)) return inviteField;
	return inviteTokenFromPath(redirectTo);
}

export const load: PageServerLoad = async ({ url }) => {
	const requested = url.searchParams.get('redirect');
	const redirectTo = requested ? safeRedirectPath(requested, url.origin, '') : '';
	return {
		redirectTo,
		invite: keptInvite(redirectTo, url.searchParams.get('invite') ?? '')
	};
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const redirectTo = safeRedirectPath(formText(data, 'redirect'), url.origin, '');
		const invite = keptInvite(redirectTo, formText(data, 'invite'));
		const fieldErrors = registrationFieldErrors({
			firstName: optionalRegisterName(formText(data, 'firstName')) ?? '',
			lastName: optionalRegisterName(formText(data, 'lastName')) ?? '',
			username: formText(data, 'username'),
			email: formText(data, 'email'),
			password: formText(data, 'password'),
			confirmPassword: formText(data, 'confirmPassword')
		});
		if (fieldErrors.length > 0) {
			return fail(400, {
				message: undefined as string | undefined,
				fieldErrors,
				returnPath: redirectTo,
				invite
			});
		}
		return fail(400, {
			message: 'Please try again.' as string | undefined,
			fieldErrors: [],
			returnPath: redirectTo,
			invite
		});
	}
};
