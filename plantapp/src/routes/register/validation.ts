export type RegisterField =
	| 'firstName'
	| 'lastName'
	| 'username'
	| 'email'
	| 'password'
	| 'confirmPassword';

export interface RegisterInput {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	firstName?: string;
	lastName?: string;
}

export interface RegisterFieldError {
	field: RegisterField;
	message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const USERNAME_TOO_SHORT = 'Username must be at least 3 characters';
export const EMAIL_ADDRESS_ERROR = 'Enter a valid email address';
export const PASSWORD_TOO_SHORT = 'Password must be at least 8 characters';
export const PASSWORDS_DO_NOT_MATCH = 'Passwords do not match';
export const CONFIRM_PASSWORD_REQUIRED = 'Confirm your password';

/**
 * Client-side registration checks, in the same order the form already uses.
 * The returned field is the one that message describes, so focus and
 * aria-invalid land on it.
 */
export function firstRegistrationError(input: RegisterInput): RegisterFieldError | null {
	if (input.password !== input.confirmPassword) {
		// Password is the first of the two fields, and the form already prints this message there.
		return { field: 'password', message: PASSWORDS_DO_NOT_MATCH };
	}

	if (input.password.length < 8) {
		return { field: 'password', message: PASSWORD_TOO_SHORT };
	}

	const username = input.username.trim();
	if (username.length < 3) {
		return { field: 'username', message: USERNAME_TOO_SHORT };
	}

	if (!EMAIL_PATTERN.test(input.email.trim())) {
		return { field: 'email', message: EMAIL_ADDRESS_ERROR };
	}

	return null;
}

/**
 * `user.first_name` and `user.last_name` are nullable text.
 * A blank or whitespace-only name is stored as null, not rejected.
 */
export function optionalRegisterName(value: string | null | undefined): string | null {
	const trimmed = (value ?? '').trim();
	return trimmed.length > 0 ? trimmed : null;
}

/**
 * Every failing register field on a no-JS post.
 * Username, email, and password keep the JavaScript messages.
 * First name and last name are optional. A blank confirm password is flagged.
 */
export function registrationFieldErrors(input: RegisterInput): RegisterFieldError[] {
	const errors: RegisterFieldError[] = [];
	if (input.username.trim().length < 3) {
		errors.push({ field: 'username', message: USERNAME_TOO_SHORT });
	}
	if (!EMAIL_PATTERN.test(input.email.trim())) {
		errors.push({ field: 'email', message: EMAIL_ADDRESS_ERROR });
	}
	if (input.password.length < 8) {
		errors.push({ field: 'password', message: PASSWORD_TOO_SHORT });
	}
	if (!input.confirmPassword) {
		errors.push({ field: 'confirmPassword', message: CONFIRM_PASSWORD_REQUIRED });
	} else if (input.password !== input.confirmPassword) {
		errors.push({ field: 'password', message: PASSWORDS_DO_NOT_MATCH });
	}
	return errors;
}

export function focusRegistrationField(
	field: RegisterField,
	elements: Partial<Record<RegisterField, { focus(): void } | null | undefined>>
): void {
	elements[field]?.focus();
}

type Focusable = { focus(): void };

/**
 * After sign-up fails, move focus to the invalid field.
 * A server failure that does not name a field moves focus to the error summary.
 */
export function focusRegistrationFailure(
	field: RegisterField | null,
	targets: {
		fields: Partial<Record<RegisterField, Focusable | null | undefined>>;
		error: Focusable | null | undefined;
	}
): void {
	if (field && targets.fields[field]) {
		focusRegistrationField(field, targets.fields);
		return;
	}
	targets.error?.focus();
}
