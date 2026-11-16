import { EMAIL_ADDRESS_ERROR } from '../register/validation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function forgotPasswordFieldErrors(email: string): { field: 'email'; message: string }[] {
	if (EMAIL_PATTERN.test(email.trim())) return [];
	return [{ field: 'email', message: EMAIL_ADDRESS_ERROR }];
}
