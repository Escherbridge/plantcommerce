# Specification: Platform Shell & Sidebar Component

## Overview

Build foundational, reusable `PlatformSidebar` and `PlatformShell` layout components that all authenticated/internal pages (account, affiliate, admin) share. This replaces the current fragmented approach where each section maintains its own ad-hoc sidebar and layout code.

## Background

The codebase currently has three separate internal page areas with inconsistent layout approaches:

- **Admin** (`/admin/+layout.svelte`): Uses a DaisyUI drawer with hardcoded SVG nav items, no collapse state, no user widget.
- **Account** (`/account/profile/+page.svelte`): Has well-designed scoped CSS (profile-card, profile-nav, profile-stat patterns) with a sidebar nav duplicated per page rather than shared via a layout.
- **Affiliate** (`/affiliate/*`): Has no shared layout or sidebar at all.

All three areas currently render inside the public storefront header/footer, which is inappropriate for dashboard-style pages.

The profile page's scoped CSS patterns (oklch color functions, `--input-border`, `--radius-lg`, `--shadow-glow-sm`, `--font-display`) represent the target visual quality and must be preserved and generalized.

## Functional Requirements

### FR-1: PlatformSidebar Component
**Priority:** P0 (Critical)
**Description:** A collapsible sidebar navigation component that renders role-specific navigation, user profile info, and utility links.

**Acceptance Criteria:**
- AC-1.1: Renders a user profile widget at the top showing avatar placeholder (initials-based), display name, and role badge (customer/affiliate/admin).
- AC-1.2: Renders navigation items grouped by section, each with an inline SVG icon and label.
- AC-1.3: Highlights the currently active route using `$page.url.pathname`.
- AC-1.4: Supports two visual states: expanded (icon + label, ~16rem width) and collapsed (icon-only, ~4rem width).
- AC-1.5: Persists collapse state to `localStorage` under key `aevani-sidebar-collapsed`.
- AC-1.6: Renders a footer area containing a "Back to Store" link and a logout action.
- AC-1.7: On mobile (below `lg` breakpoint), renders as a full-screen overlay triggered by a hamburger button.
- AC-1.8: On desktop (at or above `lg` breakpoint), renders as a persistent sidebar.
- AC-1.9: Accepts a `navigation` prop typed as `NavigationConfig` (array of section groups with items).
- AC-1.10: Supports optional badge counts on navigation items (e.g., "3 new orders").
- AC-1.11: Uses no emoji anywhere -- all icons are inline SVGs.
- AC-1.12: Collapse/expand transition is smooth (CSS transition on width, opacity on labels).

### FR-2: PlatformShell Component
**Priority:** P0 (Critical)
**Description:** A wrapper component that combines PlatformSidebar with a main content area, replacing the storefront header for internal pages.

**Acceptance Criteria:**
- AC-2.1: Renders PlatformSidebar on the left and a scrollable main content area on the right.
- AC-2.2: Main content area includes a top bar with breadcrumbs and a mobile sidebar toggle button.
- AC-2.3: Main content area has proper max-width constraints (max-w-6xl) with horizontal padding.
- AC-2.4: Content area adjusts width smoothly when sidebar collapses/expands.
- AC-2.5: Accepts `navigation`, `user`, and `breadcrumbs` props.
- AC-2.6: Renders a `{@render children()}` slot for page content.

### FR-3: Navigation Configurations
**Priority:** P0 (Critical)
**Description:** TypeScript module exporting role-specific navigation configurations.

**Acceptance Criteria:**
- AC-3.1: Exports `accountNavigation` with sections: Profile, Orders, Wishlist, Addresses, Settings.
- AC-3.2: Exports `affiliateNavigation` with sections: Dashboard, Links, Earnings, Materials, Payouts.
- AC-3.3: Exports `adminNavigation` with sections: Dashboard, SEO, Products, Orders, Users, Content, Analytics, Settings.
- AC-3.4: Each navigation item has: `label: string`, `href: string`, `icon: string` (SVG path data), and optional `badge?: number | string`.
- AC-3.5: Navigation items are organized into named groups (e.g., "Main", "Management", "System").
- AC-3.6: TypeScript types (`NavItem`, `NavGroup`, `NavigationConfig`) are exported for reuse.

### FR-4: PlatformBreadcrumbs Component
**Priority:** P1 (High)
**Description:** Context-aware breadcrumbs for internal pages, building on the existing Breadcrumbs component pattern.

**Acceptance Criteria:**
- AC-4.1: Automatically generates breadcrumb trail from the current route path segments.
- AC-4.2: Maps route segments to human-readable labels (e.g., "account" -> "Account", "order-history" -> "Order History").
- AC-4.3: Supports custom label overrides passed as props.
- AC-4.4: Uses the chevron separator style consistent with the existing Breadcrumbs component.
- AC-4.5: Styled to match the platform shell aesthetic (scoped CSS, Aevani theme tokens).

### FR-5: Platform Design Tokens
**Priority:** P1 (High)
**Description:** Generalized CSS classes/tokens extracted from the profile page patterns for reuse across all platform pages.

**Acceptance Criteria:**
- AC-5.1: Provides `.platform-card` class matching profile-card styling (oklch background, input-border, radius-lg, shadow-glow-sm).
- AC-5.2: Provides `.platform-card__header` and `.platform-card__title` classes.
- AC-5.3: Provides `.platform-stat` and related classes for metric display.
- AC-5.4: Provides `.platform-form-grid` and `.platform-form-stack` layout classes.
- AC-5.5: All classes use existing CSS custom properties from app.css (no new color values).
- AC-5.6: Delivered as a CSS file importable by platform pages.

## Non-Functional Requirements

### NFR-1: Performance
- Sidebar collapse/expand animations must not cause layout thrashing (use CSS transforms/opacity, not width changes on content).
- Component must not re-render navigation items on every route change -- only active state updates.
- localStorage reads happen once on mount, not reactively.

### NFR-2: Accessibility
- Sidebar must be navigable via keyboard (Tab, Enter, Escape to close mobile overlay).
- Mobile overlay must trap focus when open.
- All interactive elements must have visible focus indicators.
- ARIA attributes: `aria-label` on nav, `aria-current="page"` on active link, `aria-expanded` on collapse toggle.

### NFR-3: Responsiveness
- Mobile breakpoint: below `1024px` (lg).
- Touch targets: minimum 44x44px on mobile.
- No horizontal overflow at any viewport width down to 320px.

### NFR-4: Maintainability
- Components use Svelte 5 runes (`$state`, `$derived`, `$props`).
- Scoped CSS following the profile page pattern (no global style leakage).
- TypeScript strict mode compatible.

## User Stories

### US-1: Customer navigating account pages
**As a** logged-in customer,
**I want** a consistent sidebar with all my account sections,
**So that** I can easily navigate between profile, orders, and settings.

**Given** I am on any `/account/*` page,
**When** I look at the sidebar,
**Then** I see my name, avatar initials, and "Customer" badge, with all account nav items visible and the current page highlighted.

### US-2: Affiliate accessing dashboard
**As an** approved affiliate,
**I want** a dedicated sidebar with affiliate-specific navigation,
**So that** I can access my dashboard, links, and earnings without confusion.

**Given** I am on any `/affiliate/*` page,
**When** the PlatformShell renders,
**Then** the sidebar shows affiliate-specific navigation (Dashboard, Links, Earnings, Materials, Payouts) with appropriate icons.

### US-3: Admin managing the platform
**As an** admin,
**I want** the admin sidebar to support collapsing for more content space,
**So that** I can focus on data-heavy pages like analytics.

**Given** I am on any `/admin/*` page and the sidebar is expanded,
**When** I click the collapse toggle,
**Then** the sidebar shrinks to icon-only mode, my preference is saved, and the content area expands smoothly.

### US-4: Mobile user
**As a** user on a mobile device,
**I want** to access the sidebar via a hamburger menu,
**So that** the full screen width is available for content.

**Given** I am on any internal page on a mobile device,
**When** I tap the hamburger icon in the top bar,
**Then** the sidebar opens as a full-screen overlay with all navigation items, and I can close it by tapping outside or pressing Escape.

## Technical Considerations

- **Existing Breadcrumbs component** at `src/lib/components/navigation/Breadcrumbs.svelte` should be reused or extended, not duplicated.
- **Layout integration**: Each role area (`/admin/+layout.svelte`, `/account/+layout.svelte`, `/affiliate/+layout.svelte`) will import PlatformShell with the appropriate nav config. The actual layout file changes are part of a follow-up integration task, not this track.
- **Auth data flow**: User/session data is already available via `event.locals` in layout server loads. PlatformShell receives user data as a prop.
- **SVG icon approach**: Icons use inline `<svg>` with path data strings stored in nav config. The component renders them via `{@html}` or direct path elements.
- **Theme compatibility**: Must work with both light and dark Aevani theme variants using oklch color functions.
- **File location**: All new components go in `src/lib/components/platform/`.

## Out of Scope

- Migrating existing admin/account/affiliate layouts to use PlatformShell (separate integration track).
- Notification system or real-time badge updates.
- User avatar image upload (initials-only for now).
- Search functionality within the sidebar.
- Multi-level nested navigation (single level with groups only).
- Storybook stories (can be a follow-up).

## Open Questions

1. Should the sidebar support pinning/unpinning on desktop (auto-hide on hover vs always visible)? -- Current decision: always visible on desktop, collapse to icon-only.
2. Should the mobile overlay have a slide-in animation from the left or a full fade? -- Current decision: slide-in from left with backdrop fade.
3. Should breadcrumbs show the role area root (e.g., "Admin > Products") or start from a generic "Dashboard"? -- Current decision: show role area root.
