import { error } from '@sveltejs/kit';

/** Server-side admin check. Layout loads do not run for form actions or +server routes, so every admin server entry point calls this. */
export function requireAdminUser<T extends { role: string }>(user: T | null | undefined): T {
	if (!user || user.role !== 'admin') error(403, 'Forbidden');
	return user;
}
