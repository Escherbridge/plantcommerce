# Implementation Plan: Platform Shell & Sidebar Component

## Overview

This track delivers the foundational platform layout system in 4 phases:

1. **Types & Navigation Configs** -- TypeScript types and role-specific nav data
2. **PlatformSidebar** -- Core sidebar component with collapse, mobile overlay, route highlighting
3. **PlatformShell & Breadcrumbs** -- Shell wrapper and context-aware breadcrumbs
4. **Design Tokens & Polish** -- Generalized CSS tokens extracted from profile page patterns

Estimated total effort: 8-12 hours across 16 tasks.

---

## Phase 1: Types & Navigation Configs

**Goal:** Establish the TypeScript foundation and navigation data that all components depend on.

### Task 1.1: Define navigation types
- [ ] Write test: Unit test in `src/lib/components/platform/nav-configs.test.ts` verifying `NavItem`, `NavGroup`, and `NavigationConfig` types compile correctly. Test that a sample config satisfies the type constraints.
- [ ] Implement: Create `src/lib/components/platform/types.ts` with:
  - `NavItem { label: string; href: string; icon: string; badge?: number | string }`
  - `NavGroup { title: string; items: NavItem[] }`
  - `NavigationConfig = NavGroup[]`
  - `PlatformUser { name: string; email: string; role: 'admin' | 'customer' | 'affiliate'; avatarUrl?: string }`
- [ ] Verify: Types import cleanly, no TypeScript errors.

### Task 1.2: Build account navigation config
- [ ] Write test: Assert `accountNavigation` has expected groups, item count, all items have non-empty label/href/icon fields, and hrefs start with `/account`.
- [ ] Implement: Create account section in `src/lib/components/platform/nav-configs.ts` with items: Profile, Orders, Wishlist, Addresses, Settings. Each item gets an SVG path data string for its icon.
- [ ] Verify: Test passes.

### Task 1.3: Build affiliate and admin navigation configs
- [ ] Write test: Assert `affiliateNavigation` items have `/affiliate` prefixed hrefs. Assert `adminNavigation` items have `/admin` prefixed hrefs. Verify all configs have unique hrefs within their config.
- [ ] Implement: Add `affiliateNavigation` (Dashboard, Links, Earnings, Materials, Payouts) and `adminNavigation` (Dashboard, SEO, Products, Orders, Users, Content, Analytics, Settings -- grouped into "Main", "Management", "System").
- [ ] Verify: All tests pass, no duplicate hrefs.

### Task 1.4: Verification
- [ ] Run `npx vitest run src/lib/components/platform/` -- all tests pass.
- [ ] Run `npx svelte-check` -- no type errors in new files.
- [ ] [checkpoint marker]

---

## Phase 2: PlatformSidebar Component

**Goal:** Build the core sidebar with user widget, navigation rendering, collapse state, and mobile overlay.

### Task 2.1: Sidebar desktop layout and navigation rendering
- [ ] Write test: Component test that mounts PlatformSidebar with a mock NavigationConfig and PlatformUser. Assert: user name rendered, role badge rendered, all nav item labels rendered, nav items are `<a>` elements with correct hrefs.
- [ ] Implement: Create `src/lib/components/platform/PlatformSidebar.svelte` with:
  - Props: `navigation: NavigationConfig`, `user: PlatformUser`, `currentPath: string`
  - User profile widget (initials avatar via CSS, name, role badge)
  - Section-grouped nav items with inline SVG icons
  - Footer with "Back to Store" link and logout button
  - Scoped CSS using Aevani theme tokens (oklch, --input-border, --radius-lg, etc.)
- [ ] Refactor: Extract initials-generation into a utility function.

### Task 2.2: Active route highlighting
- [ ] Write test: Mount sidebar with `currentPath="/account/orders"`. Assert the "Orders" nav link has the active class/aria-current. Assert other links do not.
- [ ] Implement: Add `$derived` computation comparing each item's `href` against `currentPath` prop. Apply `.sidebar-nav__link--active` class and `aria-current="page"`. Support both exact match and prefix match (e.g., `/admin/products/123` highlights `/admin/products`).
- [ ] Verify: Test passes.

### Task 2.3: Collapse/expand with localStorage persistence
- [ ] Write test: (a) Mount sidebar, click collapse toggle, assert labels are hidden and only icons show. (b) Mock localStorage, mount sidebar, verify it reads initial state. (c) Click toggle, verify localStorage is written.
- [ ] Implement: Add `collapsed` state via `$state`, read from localStorage on mount (`onMount`). Toggle button with collapse/expand SVG icon. CSS transition on sidebar width (16rem -> 4rem). Labels get `opacity: 0` and `width: 0` when collapsed. `aria-expanded` on toggle button.
- [ ] Refactor: Ensure transitions use `transform`/`opacity` only (no layout thrash).

### Task 2.4: Mobile overlay
- [ ] Write test: (a) Mount sidebar at mobile viewport, assert sidebar is not visible by default. (b) Trigger open, assert overlay and sidebar are visible. (c) Press Escape, assert overlay closes.
- [ ] Implement: Add `mobileOpen` state. Render sidebar inside a fixed overlay `<div>` on mobile. Backdrop click and Escape key close the overlay. Slide-in animation from left. Focus trap when open. Expose `toggleMobile()` for external trigger (the shell's hamburger button).
- [ ] Verify: All sidebar tests pass.

### Task 2.5: Badge support on nav items
- [ ] Write test: Pass a nav config with `badge: 5` on one item. Assert badge element renders with text "5".
- [ ] Implement: Conditionally render a small badge pill next to the nav label. Badge hides when sidebar is collapsed. Style with primary color background.
- [ ] Verify: Test passes.

### Task 2.6: Verification
- [ ] Run full sidebar test suite -- all pass.
- [ ] Manual check: import PlatformSidebar in a scratch route, verify visual rendering in browser with light and dark themes.
- [ ] Keyboard navigation: Tab through all items, Enter activates links, Escape closes mobile.
- [ ] [checkpoint marker]

---

## Phase 3: PlatformShell & Breadcrumbs

**Goal:** Build the shell wrapper and context-aware breadcrumbs component.

### Task 3.1: PlatformBreadcrumbs component
- [ ] Write test: (a) Pass `path="/admin/products"` and assert breadcrumb renders "Admin > Products". (b) Pass custom label overrides `{ products: "Product Catalog" }` and assert override is used. (c) Assert last item has `aria-current="page"`.
- [ ] Implement: Create `src/lib/components/platform/PlatformBreadcrumbs.svelte`. Parse path segments, titlecase them, apply overrides. Reuse chevron separator pattern from existing Breadcrumbs component. Style with scoped CSS matching platform aesthetic.
- [ ] Verify: Tests pass.

### Task 3.2: PlatformShell component
- [ ] Write test: Mount PlatformShell with navigation, user, and child content. Assert: sidebar renders, breadcrumbs render, child content renders in main area. Assert mobile toggle button exists.
- [ ] Implement: Create `src/lib/components/platform/PlatformShell.svelte` with:
  - Props: `navigation: NavigationConfig`, `user: PlatformUser`, `currentPath: string`, `breadcrumbOverrides?: Record<string, string>`
  - Layout: sidebar on left, main content area on right
  - Top bar in content area: mobile hamburger toggle (hidden on desktop) + PlatformBreadcrumbs
  - Main content slot with max-w-6xl constraint and padding
  - CSS grid layout that adjusts to sidebar collapsed state
- [ ] Refactor: Clean up prop threading between Shell -> Sidebar.

### Task 3.3: Content area responsive behavior
- [ ] Write test: Assert main content area has appropriate max-width class. Assert mobile toggle is present.
- [ ] Implement: Content area uses `flex-1` with `overflow-y: auto` for independent scrolling. Smooth width transition when sidebar collapses. Mobile layout stacks vertically with full-width content.
- [ ] Verify: Tests pass.

### Task 3.4: Barrel export
- [ ] Write test: Import `{ PlatformShell, PlatformSidebar, PlatformBreadcrumbs }` from `$lib/components/platform` -- verify no import errors.
- [ ] Implement: Create `src/lib/components/platform/index.ts` barrel file exporting all components, types, and nav configs.
- [ ] Verify: Clean imports work.

### Task 3.5: Verification
- [ ] Run all platform component tests -- all pass.
- [ ] Run `npx svelte-check` -- zero errors.
- [ ] Manual: render PlatformShell in a test route with each nav config (account, affiliate, admin). Resize browser to verify responsive behavior.
- [ ] [checkpoint marker]

---

## Phase 4: Design Tokens & Polish

**Goal:** Extract reusable CSS tokens from the profile page patterns and finalize component quality.

### Task 4.1: Platform CSS tokens file
- [ ] Write test: Import the CSS file in a test component, assert `.platform-card` class applies expected border-radius and border styles (visual regression or snapshot test).
- [ ] Implement: Create `src/lib/components/platform/platform.css` with generalized classes:
  - `.platform-card` (background, border, radius, shadow -- from profile-card)
  - `.platform-card__header`, `.platform-card__title`, `.platform-card__actions`
  - `.platform-stat`, `.platform-stat__label`, `.platform-stat__value`
  - `.platform-form-grid`, `.platform-form-stack`
  - `.platform-action-btn`, `.platform-action-btn--danger`
  - All using existing CSS custom properties from app.css
- [ ] Verify: CSS file parses without errors.

### Task 4.2: Dark theme compatibility check
- [ ] Write test: Mount PlatformShell with `data-theme="dark"` on parent. Assert no hardcoded color values cause contrast issues (snapshot comparison or manual).
- [ ] Implement: Audit all scoped CSS in sidebar and shell components. Replace any hardcoded rgba values with oklch(var(--*)) equivalents. Verify --glass-bg and --input-border work in dark mode.
- [ ] Verify: Visual check in both light and dark themes.

### Task 4.3: Accessibility audit
- [ ] Write test: Run axe-core on mounted PlatformShell. Assert zero violations for ARIA, color contrast, and keyboard navigation categories.
- [ ] Implement: Fix any violations found. Ensure: `role="navigation"` on sidebar nav, `aria-label="Platform navigation"`, focus-visible styles on all interactive elements, skip-to-content link at top of shell.
- [ ] Verify: axe-core passes.

### Task 4.4: Final verification
- [ ] Run full test suite: `npx vitest run src/lib/components/platform/` -- all pass.
- [ ] Run `npx svelte-check` -- zero errors.
- [ ] Run `npx prettier --check src/lib/components/platform/` -- no formatting issues.
- [ ] Verify component file structure:
  ```
  src/lib/components/platform/
    index.ts
    types.ts
    nav-configs.ts
    nav-configs.test.ts
    PlatformSidebar.svelte
    PlatformShell.svelte
    PlatformBreadcrumbs.svelte
    platform.css
  ```
- [ ] [checkpoint marker]
