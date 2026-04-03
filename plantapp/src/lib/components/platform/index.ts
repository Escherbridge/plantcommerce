// Platform Shell Components
export { default as PlatformShell } from './PlatformShell.svelte';
export { default as PlatformSidebar } from './PlatformSidebar.svelte';
export { default as PlatformBreadcrumbs } from './PlatformBreadcrumbs.svelte';
export { default as PortalSwitcher } from './PortalSwitcher.svelte';
export { default as NotificationBell } from './NotificationBell.svelte';
export { default as CommandPalette } from './CommandPalette.svelte';

// Types
export type { NavItem, NavGroup, NavigationConfig, PlatformUser } from './types';

// Navigation Configs
export {
	accountNavigation,
	affiliateNavigation,
	adminNavigation
} from './nav-configs';
