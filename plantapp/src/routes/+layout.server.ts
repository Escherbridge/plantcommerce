import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user ? {
			id: locals.user.id,
			username: locals.user.username,
			email: locals.user.email,
			firstName: locals.user.firstName,
			lastName: locals.user.lastName,
			role: locals.user.role
		} : null
	};
};
