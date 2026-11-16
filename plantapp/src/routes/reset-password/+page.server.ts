import type { Actions } from './$types';
import { formText, noJsCredentialPost, noJsFieldErrors } from '$lib/server/noJsCredentialPost';
import { resetPasswordFieldErrors } from './validation';

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const fieldErrors = resetPasswordFieldErrors({
			token: url.searchParams.get('token') ?? '',
			password: formText(data, 'password'),
			confirmation: formText(data, 'confirmation')
		});
		if (fieldErrors.length > 0) return noJsFieldErrors(fieldErrors);
		return noJsCredentialPost();
	}
};
