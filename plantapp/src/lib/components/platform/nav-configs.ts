import type { NavigationConfig } from './types';

export const accountNavigation: NavigationConfig = [
  {
    title: 'Account',
    items: [
      {
        label: 'Profile',
        href: '/account/profile',
        icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20v-1a8 8 0 0116 0v1'
      },
      {
        label: 'Orders',
        href: '/account/orders',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4'
      },
      {
        label: 'Wishlist',
        href: '/account/wishlist',
        icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z'
      },
      {
        label: 'Addresses',
        href: '/account/addresses',
        icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z'
      },
      {
        label: 'Settings',
        href: '/account/settings',
        icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'
      }
    ]
  }
];

export const affiliateNavigation: NavigationConfig = [
  {
    title: 'Affiliate',
    items: [
      {
        label: 'Dashboard',
        href: '/affiliate/dashboard',
        icon: 'M4 20h16M8 16V8M12 16V4M16 16v-6'
      },
      {
        label: 'Links',
        href: '/affiliate/links',
        icon: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'
      },
      {
        label: 'Earnings',
        href: '/affiliate/earnings',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07C9.39 16.57 8 15.4 8 14c0-.55.45-1 1-1s1 .45 1 1c0 .28.37.57 1 .57.63 0 1-.29 1-.57 0-.29-.28-.56-1-.75-1.45-.37-3-.99-3-2.68 0-1.37 1.13-2.44 2.5-2.75V7h2v1.07c1.38.31 2.5 1.38 2.5 2.75 0 .55-.45 1-1 1s-1-.45-1-1c0-.28-.37-.57-1-.57-.63 0-1 .29-1 .57 0 .29.28.56 1 .75 1.45.37 3 .99 3 2.68 0 1.37-1.13 2.44-2.5 2.75V16h-1V16z'
      },
      {
        label: 'Materials',
        href: '/affiliate/materials',
        icon: 'M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11'
      },
      {
        label: 'Payouts',
        href: '/affiliate/payouts',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
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
        icon: 'M4 20h16M8 16V8M12 16V4M16 16v-6'
      },
      {
        label: 'SEO',
        href: '/admin/seo',
        icon: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z'
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Products',
        href: '/admin/products',
        icon: 'M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11'
      },
      {
        label: 'Orders',
        href: '/admin/orders',
        icon: 'M3 3h2l3 12h10l3-9H6M8 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z'
      },
      {
        label: 'Users',
        href: '/admin/users',
        icon: 'M16 11a4 4 0 10-8 0 4 4 0 008 0zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2'
      },
      {
        label: 'Content',
        href: '/admin/content',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
      },
      {
        label: 'Affiliates',
        href: '/admin/affiliates',
        icon: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: 'M3 17l6-6 4 4 8-8M14 7h7v7'
      },
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'
      }
    ]
  }
];
