import type { Actions } from './$types';
import { formText, noJsCredentialPost, noJsFieldErrors } from '$lib/server/noJsCredentialPost';
import { registrationFieldErrors } from './validation';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const fieldErrors = registrationFieldErrors({
			firstName: formText(data, 'firstName'),
			lastName: formText(data, 'lastName'),
			username: formText(data, 'username'),
			email: formText(data, 'email'),
			password: formText(data, 'password'),
			confirmPassword: formText(data, 'confirmPassword')
		});
		if (fieldErrors.length > 0) return noJsFieldErrors(fieldErrors);
		return noJsCredentialPost();
	}
};
