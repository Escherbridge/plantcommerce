// Platform Shell Components
export { default as PlatformShell } from './PlatformShell.svelte';
export { default as PlatformSidebar } from './PlatformSidebar.svelte';
export { default as PlatformBreadcrumbs } from './PlatformBreadcrumbs.svelte';

// Types
export type { NavItem, NavGroup, NavigationConfig, PlatformUser } from './types';

// Navigation Configs
export {
	accountNavigation,
	affiliateNavigation,
	adminNavigation
} from './nav-configs';
