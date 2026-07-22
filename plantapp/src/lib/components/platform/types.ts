export interface NavItem {
	label: string;
	href: string;
	icon: string; // SVG path data (d attribute value)
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
