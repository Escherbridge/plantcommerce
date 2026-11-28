/** Account roles stored on `user.role`. `seller` is additive; existing rows stay as they are. */
export const userRoles = ['admin', 'customer', 'affiliate', 'instructor', 'seller'] as const;

export type UserRole = (typeof userRoles)[number];

/** Roles a manager may put on an invite. Admin is deliberately absent. */
export const inviteRoles = ['affiliate', 'seller', 'instructor'] as const;

export type InviteRole = (typeof inviteRoles)[number];

export function isInviteRole(value: string): value is InviteRole {
	return (inviteRoles as readonly string[]).includes(value);
}

export function isUserRole(value: string): value is UserRole {
	return (userRoles as readonly string[]).includes(value);
}
