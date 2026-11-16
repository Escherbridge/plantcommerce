import type { Actions } from './$types';
import { formText, noJsCredentialPost, noJsFieldErrors } from '$lib/server/noJsCredentialPost';
import { forgotPasswordFieldErrors } from './validation';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const fieldErrors = forgotPasswordFieldErrors(formText(data, 'email'));
		if (fieldErrors.length > 0) return noJsFieldErrors(fieldErrors);
		return noJsCredentialPost();
	}
};
