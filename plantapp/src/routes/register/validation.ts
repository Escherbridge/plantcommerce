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

export const FIRST_NAME_REQUIRED = 'Enter your first name';
export const LAST_NAME_REQUIRED = 'Enter your last name';
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
 * Every failing register field on a no-JS post.
 * Username, email, and password keep the JavaScript messages.
 * A blank first name, last name, or confirm password is flagged as well.
 */
export function registrationFieldErrors(input: RegisterInput): RegisterFieldError[] {
	const errors: RegisterFieldError[] = [];
	if (!(input.firstName ?? '').trim()) {
		errors.push({ field: 'firstName', message: FIRST_NAME_REQUIRED });
	}
	if (!(input.lastName ?? '').trim()) {
		errors.push({ field: 'lastName', message: LAST_NAME_REQUIRED });
	}
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
