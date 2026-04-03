# Implementation Plan: Account Dashboard & Customer Portal

## Overview

This plan is organized into 5 phases, progressing from foundational layout and data loading through each page enhancement, ending with new pages and polish. The dependency on `platform-shell_20260402` is handled by Phase 1 creating a PlatformShell-integrated layout (or a minimal fallback if PlatformShell is not yet available).

**Total estimated tasks:** 32
**Estimated duration:** 3-4 weeks

---

## Phase 1: Account Layout Foundation

**Goal:** Establish the shared layout with authentication, navigation, and data loading so all subsequent phases build within a consistent shell.

### Task 1.1: Account Layout Server Loader
- [ ] Write test: Verify `+layout.server.ts` redirects unauthenticated users to `/login?redirect=/account`
- [ ] Write test: Verify loader returns user profile data (id, firstName, lastName, email, role, avatarFileId, createdAt)
- [ ] Write test: Verify loader returns stats object with totalOrders and wishlistCount
- [ ] Implement: Create `src/routes/account/+layout.server.ts` using `requireAuth()` from `$lib/loaders/protected`
- [ ] Implement: Add tRPC call (or direct Drizzle query) to count user orders and wishlist items
- [ ] Verify: Loader returns correct shape, auth redirect works

### Task 1.2: Account Navigation Config
- [ ] Implement: Create `src/lib/config/accountNavigation.ts` defining sidebar nav items (Overview, Profile, Orders, Wishlist, Addresses, Settings) with paths, labels, and SVG icon references
- [ ] Write test: Verify navigation config exports correct structure with all 6 items
- [ ] Verify: Config matches PlatformShell navigation prop interface

### Task 1.3: Account Layout Component
- [ ] Implement: Create `src/routes/account/+layout.svelte` using PlatformShell with accountNavigation config
- [ ] Implement: Pass user data and navigation to PlatformShell, render `<slot>` for child content
- [ ] Implement: Display user name/initials in sidebar header area
- [ ] Verify: Layout renders with sidebar, child routes display in content area [checkpoint marker]

### Task 1.4: Remove Per-Page Auth Checks
- [ ] Refactor: Update `src/routes/account/profile/+page.ts` to use parent data instead of creating its own tRPC client
- [ ] Refactor: Update `src/routes/account/orders/+page.ts` to remove redundant `requireAuth()` call (layout handles it)
- [ ] Refactor: Update `src/routes/account/wishlist/+page.ts` to remove redundant `requireAuth()` call
- [ ] Verify: All three pages still load correctly with data from layout + their own loaders

---

## Phase 2: Account Overview Dashboard

**Goal:** Build the dashboard landing page at `/account` with welcome message, stats, recent orders, and quick actions.

### Task 2.1: Dashboard tRPC Procedure
- [ ] Write test: Verify `users.getDashboardData` returns recent orders (limit 3), total order count, wishlist count, and user createdAt
- [ ] Implement: Add `getDashboardData` procedure to users tRPC router
- [ ] Implement: Query joins orders with order items for recent order summaries
- [ ] Verify: Procedure returns correct data shape, handles users with zero orders

### Task 2.2: Dashboard Page Loader
- [ ] Write test: Verify `+page.ts` or `+page.server.ts` loads dashboard data from tRPC
- [ ] Implement: Create `src/routes/account/+page.ts` calling `users.getDashboardData`
- [ ] Verify: Page data includes recentOrders, stats

### Task 2.3: Dashboard UI - Stats Cards
- [ ] Implement: Create dashboard page `src/routes/account/+page.svelte`
- [ ] Implement: Welcome section with "Welcome back, {firstName}" heading
- [ ] Implement: Stats cards grid (Total Orders, Wishlist Items, Member Since) using profile-stat pattern
- [ ] Implement: SVG icons for each stat card (no emoji)
- [ ] Verify: Stats render with correct data, responsive layout works

### Task 2.4: Dashboard UI - Recent Orders & Actions
- [ ] Implement: Recent Orders section showing last 3 orders as compact cards with status badge, date, total, and "View" link
- [ ] Implement: Empty state for no orders (SVG illustration + "Browse Products" CTA)
- [ ] Implement: Quick Actions row: Browse Products, View Wishlist, Edit Profile buttons
- [ ] Implement: "Become an Affiliate" CTA card (conditionally rendered for `role === 'customer'`)
- [ ] Verify: Dashboard renders all sections correctly, CTA hidden for affiliates/admins [checkpoint marker]

---

## Phase 3: Enhanced Existing Pages

**Goal:** Refactor Profile, Orders, and Wishlist pages to work within the layout and improve their UX.

### Task 3.1: Profile Page Refactor
- [ ] Refactor: Remove hardcoded sidebar navigation from `src/routes/account/profile/+page.svelte`
- [ ] Refactor: Remove the `<Section><Container>` wrappers (PlatformShell provides content area)
- [ ] Refactor: Keep profile-card pattern, form fields, password change, stats, and action buttons
- [ ] Implement: Add avatar placeholder area (circular div with camera SVG overlay)
- [ ] Verify: Profile page renders correctly within PlatformShell layout, no duplicate navigation

### Task 3.2: Profile Update tRPC Procedure
- [ ] Write test: Verify `users.updateProfile` validates and updates firstName, lastName, email
- [ ] Write test: Verify `users.updateProfile` rejects duplicate email
- [ ] Write test: Verify `auth.changePassword` validates current password and updates hash
- [ ] Implement: Add `updateProfile` mutation to users tRPC router with Zod validation
- [ ] Implement: Add `changePassword` mutation to auth tRPC router
- [ ] Verify: Procedures work end-to-end, validation errors returned correctly

### Task 3.3: Profile Form Wiring
- [ ] Implement: Wire "Save Changes" button to call `users.updateProfile` via tRPC
- [ ] Implement: Wire "Update Password" button to call `auth.changePassword` via tRPC
- [ ] Implement: Show success toast on successful save, inline error messages on failure
- [ ] Implement: Loading state on submit buttons
- [ ] Verify: Profile edits persist, password change works, errors display correctly [checkpoint marker]

### Task 3.4: Orders Page Enhancement
- [ ] Refactor: Remove `<Section><Container>` wrappers from orders page
- [ ] Refactor: Restyle order cards using profile-card CSS pattern (consistent borders, shadows, radius)
- [ ] Implement: Active filter tab styling (highlight current status filter using URL search params)
- [ ] Implement: Order card shows item count summary (e.g., "3 items") alongside total
- [ ] Verify: Orders page renders within layout, filters work, cards are styled consistently

### Task 3.5: Wishlist Page Enhancement
- [ ] Refactor: Remove `<Section><Container>` wrappers from wishlist page
- [ ] Implement: Wire "Add to Cart" button to call `cart.addItem` via tRPC with success toast
- [ ] Implement: Wire "Remove" button to call `users.removeFromWishlist` with optimistic UI update
- [ ] Implement: Show item count in page header ("12 saved items")
- [ ] Implement: Improve empty state styling to match profile-card pattern
- [ ] Verify: Wishlist actions work, toast notifications appear, empty state renders [checkpoint marker]

---

## Phase 4: New Pages - Settings & Addresses

**Goal:** Build the Settings and Addresses pages with full CRUD functionality.

### Task 4.1: Settings Page - Theme & Preferences UI
- [ ] Implement: Create `src/routes/account/settings/+page.svelte`
- [ ] Implement: Theme preference section with Light/Dark/System radio group
- [ ] Implement: Theme toggle reads/writes localStorage and sets `data-theme` on `<html>`
- [ ] Implement: Email preferences section with toggle switches (Order Updates, Promotions, Newsletter)
- [ ] Implement: Notification settings section with toggle switches (placeholder UI)
- [ ] Verify: Theme toggle works immediately, preference persists across page loads

### Task 4.2: Settings Page - Delete Account
- [ ] Implement: Delete Account section with danger-styled profile-card
- [ ] Implement: Confirmation modal requiring user to type their email to confirm
- [ ] Write test: Verify `users.deactivateAccount` sets `isActive = false` and invalidates sessions
- [ ] Implement: Add `deactivateAccount` mutation to users tRPC router
- [ ] Implement: On successful deletion, redirect to `/` with session cleared
- [ ] Verify: Delete flow works end-to-end, modal validates email match [checkpoint marker]

### Task 4.3: Address Schema & Migration
- [ ] Implement: Add `address` table to Drizzle schema (id, userId, label, line1, line2, city, state, zipCode, country, isDefault, createdAt, updatedAt)
- [ ] Implement: Add relations and indexes
- [ ] Implement: Run `db:generate` and `db:push` to apply migration
- [ ] Write test: Verify address table CRUD operations work via Drizzle

### Task 4.4: Address tRPC Procedures
- [ ] Write test: Verify `addresses.list` returns all addresses for authenticated user
- [ ] Write test: Verify `addresses.create` validates required fields and creates address
- [ ] Write test: Verify `addresses.update` updates only the authenticated user's address
- [ ] Write test: Verify `addresses.delete` removes address and resets default if needed
- [ ] Implement: Create `src/lib/server/api/addresses.ts` tRPC router with list, create, update, delete procedures
- [ ] Implement: Register router in `root.ts`
- [ ] Verify: All CRUD operations pass tests

### Task 4.5: Addresses Page UI
- [ ] Implement: Create `src/routes/account/addresses/+page.svelte`
- [ ] Implement: Create `src/routes/account/addresses/+page.ts` loader calling `addresses.list`
- [ ] Implement: Address card list with edit/delete buttons and "Default" badge
- [ ] Implement: "Add New Address" form (inline or modal) with validation
- [ ] Implement: Edit mode for existing addresses (inline form)
- [ ] Implement: Set default address toggle
- [ ] Implement: Empty state with location SVG and "Add your first address" CTA
- [ ] Verify: Full CRUD cycle works from UI, default selection persists [checkpoint marker]

---

## Phase 5: Polish & Integration

**Goal:** Ensure consistency, responsive behavior, accessibility, and overall quality across all account pages.

### Task 5.1: Responsive & Mobile Polish
- [ ] Verify: All pages render correctly at 320px, 375px, 768px, 1024px, 1440px viewports
- [ ] Fix: Any overflow, touch target, or layout issues found during responsive testing
- [ ] Implement: Skeleton loading states for dashboard stats and order lists
- [ ] Verify: No layout shift when navigating between account sub-pages

### Task 5.2: Accessibility Audit
- [ ] Verify: All form inputs have associated `<label>` elements
- [ ] Verify: Status badges include `aria-label` text
- [ ] Verify: Modal focus trap works on delete account confirmation
- [ ] Verify: Tab navigation order is logical across all pages
- [ ] Fix: Any accessibility issues found

### Task 5.3: Style Consistency Pass
- [ ] Verify: All cards use profile-card CSS pattern (border, radius, shadow, padding)
- [ ] Verify: All headings use `font-display uppercase tracking-tight`
- [ ] Verify: All buttons use `font-display uppercase tracking-wider`
- [ ] Verify: No emoji anywhere in account pages -- all icons are inline SVGs
- [ ] Verify: Aevani theme CSS variables (oklch) used consistently
- [ ] Fix: Any styling inconsistencies found

### Task 5.4: Integration Testing
- [ ] Write test: Navigate from dashboard to each sub-page and verify data loads
- [ ] Write test: Complete profile edit flow end-to-end
- [ ] Write test: Complete address CRUD flow end-to-end
- [ ] Write test: Verify unauthenticated access redirects to login for all routes
- [ ] Verify: All tests pass, no TypeScript errors (`svelte-check`), formatting passes [checkpoint marker]
