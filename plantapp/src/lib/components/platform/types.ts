import type { IconName } from '$lib/components/icons';
import type { UserRole } from '$lib/auth/userRole';

export interface NavItem {
	label: string;
	href: string;
	icon: IconName;
	badge?: number | string;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
}

export type NavigationConfig = NavGroup[];

export interface PlatformUser {
	name: string;
	email: string;
	role: UserRole;
	avatarUrl?: string;
}
