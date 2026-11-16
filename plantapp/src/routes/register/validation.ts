export type RegisterField = 'username' | 'email' | 'password' | 'confirmPassword';

export interface RegisterInput {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface RegisterFieldError {
	field: RegisterField;
	message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Client-side registration checks, in the same order the form already uses.
 * The returned field is the one that message describes, so focus and
 * aria-invalid land on it.
 */
export function firstRegistrationError(input: RegisterInput): RegisterFieldError | null {
	if (input.password !== input.confirmPassword) {
		// Password is the first of the two fields, and the form already prints this message there.
		return { field: 'password', message: 'Passwords do not match' };
	}

	if (input.password.length < 8) {
		return { field: 'password', message: 'Password must be at least 8 characters' };
	}

	const username = input.username.trim();
	if (username.length < 3) {
		return { field: 'username', message: 'Username must be at least 3 characters' };
	}

	if (!EMAIL_PATTERN.test(input.email.trim())) {
		return { field: 'email', message: 'Enter a valid email address' };
	}

	return null;
}

export function focusRegistrationField(
	field: RegisterField,
	elements: Partial<Record<RegisterField, { focus(): void } | null | undefined>>
): void {
	elements[field]?.focus();
}
