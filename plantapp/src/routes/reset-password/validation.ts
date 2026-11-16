export const RESET_LINK_INVALID = 'This password reset link is invalid or expired.';
export const RESET_PASSWORD_TOO_SHORT = 'Password must be at least 8 characters.';
export const RESET_PASSWORDS_DO_NOT_MATCH = 'Passwords do not match.';

export type ResetField = 'token' | 'password' | 'confirmation';

export interface ResetFieldError {
	field: ResetField;
	message: string;
}

export function resetPasswordFieldErrors(input: {
	token: string;
	password: string;
	confirmation: string;
}): ResetFieldError[] {
	if (!input.token) {
		return [{ field: 'token', message: RESET_LINK_INVALID }];
	}

	const errors: ResetFieldError[] = [];
	if (input.password.length < 8) {
		errors.push({ field: 'password', message: RESET_PASSWORD_TOO_SHORT });
	}
	if (input.password !== input.confirmation) {
		errors.push({ field: 'confirmation', message: RESET_PASSWORDS_DO_NOT_MATCH });
	}
	return errors;
}
