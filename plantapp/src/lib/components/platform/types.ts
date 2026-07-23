import type { IconName } from '$lib/components/icons';

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
	role: 'admin' | 'customer' | 'affiliate' | 'instructor';
	avatarUrl?: string;
}
