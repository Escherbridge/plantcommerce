import type { Actions } from './$types';
import { formText, noJsCredentialPost, noJsFieldErrors } from '$lib/server/noJsCredentialPost';
import { loginFieldErrors } from './validation';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const fieldErrors = loginFieldErrors({
			usernameOrEmail: formText(data, 'usernameOrEmail'),
			password: formText(data, 'password')
		});
		if (fieldErrors.length > 0) return noJsFieldErrors(fieldErrors);
		return noJsCredentialPost();
	}
};
