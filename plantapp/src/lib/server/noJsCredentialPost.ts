import { fail } from '@sveltejs/kit';
import type { CredentialFieldError } from '$lib/auth/credentialFieldErrors';

/**
 * Fallback for a credential form submitted before JavaScript runs.
 * It does not log in, register, reset a password, or copy the submitted body.
 * Passwords are never returned to the form.
 */
export function noJsCredentialPost() {
	return fail(400, {
		message: 'Please try again.' as string | undefined,
		fieldErrors: [] as CredentialFieldError[]
	});
}

export function noJsFieldErrors(fieldErrors: CredentialFieldError[]) {
	return fail(400, {
		message: undefined as string | undefined,
		fieldErrors
	});
}

export function formText(data: FormData, name: string): string {
	const value = data.get(name);
	return typeof value === 'string' ? value : '';
}
