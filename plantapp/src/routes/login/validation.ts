export type LoginField = 'usernameOrEmail' | 'password';

/** First credential field that an empty login submit should focus. */
export function firstEmptyLoginField(input: {
	usernameOrEmail: string;
	password: string;
}): LoginField | null {
	if (!input.usernameOrEmail.trim()) return 'usernameOrEmail';
	if (!input.password) return 'password';
	return null;
}
