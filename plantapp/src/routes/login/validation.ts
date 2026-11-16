export type LoginField = 'usernameOrEmail' | 'password';

export const LOGIN_MISSING_CREDENTIALS = 'Please enter your email and password.';

export interface LoginFieldError {
	field: LoginField;
	message: string;
}

/** First credential field that an empty login submit should focus. */
export function firstEmptyLoginField(input: {
	usernameOrEmail: string;
	password: string;
}): LoginField | null {
	if (!input.usernameOrEmail.trim()) return 'usernameOrEmail';
	if (!input.password) return 'password';
	return null;
}

/** Same missing-credential message the JavaScript form shows, on each empty field. */
export function loginFieldErrors(input: {
	usernameOrEmail: string;
	password: string;
}): LoginFieldError[] {
	const errors: LoginFieldError[] = [];
	if (!input.usernameOrEmail.trim()) {
		errors.push({ field: 'usernameOrEmail', message: LOGIN_MISSING_CREDENTIALS });
	}
	if (!input.password) {
		errors.push({ field: 'password', message: LOGIN_MISSING_CREDENTIALS });
	}
	return errors;
}
