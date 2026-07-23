import type { NavigationConfig } from './types';

export const accountNavigation: NavigationConfig = [
	{
		title: 'Account',
		items: [
			{
				label: 'Profile',
				href: '/account/profile',
				icon: 'user'
			},
			{
				label: 'Orders',
				href: '/account/orders',
				icon: 'clipboard-list'
			},
			{
				label: 'Wishlist',
				href: '/account/wishlist',
				icon: 'heart'
			},
			{
				label: 'Addresses',
				href: '/account/addresses',
				icon: 'map-pin'
			},
			{
				label: 'Settings',
				href: '/account/settings',
				icon: 'settings'
			}
		]
	}
];

export const affiliateNavigation: NavigationConfig = [
	{
		title: 'Affiliate Program',
		items: [
			{
				label: 'Program Status',
				href: '/affiliate/terms',
				icon: 'bar-chart'
			},
			{
				label: 'Application',
				href: '/affiliate/join',
				icon: 'link'
			}
		]
	}
];

export const adminNavigation: NavigationConfig = [
	{
		title: 'Main',
		items: [
			{
				label: 'Dashboard',
				href: '/admin',
				icon: 'bar-chart'
			},
			{
				label: 'SEO',
				href: '/admin/seo',
				icon: 'search'
			}
		]
	},
	{
		title: 'Management',
		items: [
			{
				label: 'Products',
				href: '/admin/products',
				icon: 'package'
			},
			{
				label: 'Orders',
				href: '/admin/orders',
				icon: 'shopping-cart'
			},
			{
				label: 'Users',
				href: '/admin/users',
				icon: 'user'
			},
			{
				label: 'Content',
				href: '/admin/content',
				icon: 'clipboard-list'
			},
			{
				label: 'Affiliates',
				href: '/admin/affiliates',
				icon: 'link'
			}
		]
	},
	{
		title: 'System',
		items: [
			{
				label: 'Analytics',
				href: '/admin/analytics',
				icon: 'trending-up'
			},
			{
				label: 'Settings',
				href: '/admin/settings',
				icon: 'settings'
			}
		]
	}
];
