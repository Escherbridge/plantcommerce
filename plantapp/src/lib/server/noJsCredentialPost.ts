import { fail } from '@sveltejs/kit';

/**
 * Fallback for a credential form submitted before JavaScript runs.
 * It does not log in, register, reset a password, or copy the body anywhere.
 */
export function noJsCredentialPost() {
	return fail(400, { message: 'Please try again.' });
}
