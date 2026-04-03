# Implementation Plan: Cross-Role Navigation & Unified Experience

## Overview

This track is organized into 6 phases, progressing from foundational infrastructure (notifications DB + service) through UI components (portal switcher, notification bell, activity feed, command palette) to integration and polish (breadcrumbs, header updates). Each phase builds on the prior one. Total estimated effort: 5-7 days.

**Dependencies:** This track assumes `platform-shell_20260402` (PlatformSidebar, PlatformHeader), `account-dashboard_20260402`, `affiliate-portal_20260402`, and `admin-enhancement_20260402` are complete or at least have their layout shells in place.

---

## Phase 1: Notifications Infrastructure

**Goal:** Establish the notification database table, service layer, and tRPC router so all subsequent UI work has data to consume.

### Task 1.1: Notification Schema

- [ ] Write test: Verify `notification` table schema has required columns (id, userId, type enum, title, message, isRead, link, createdAt) and index on `(userId, isRead)`.
- [ ] Implement: Add `notification` table to `src/lib/server/db/schema.ts` with proper types, defaults, and foreign key to `user.id`. Add relation to `userRelations`.
- [ ] Verify: `npm run db:generate` produces a clean migration. Schema types compile without errors.

### Task 1.2: NotificationService

- [ ] Write test: Unit tests for `NotificationService.create()` -- verify it inserts correct values. Test with and without optional `link` parameter.
- [ ] Implement: Create `src/lib/server/services/notification.ts` with static `create(userId, type, title, message, link?)` method following the `AuditLogService` pattern.
- [ ] Verify: Tests pass.

### Task 1.3: Notification tRPC Router

- [ ] Write test: Integration tests for `notification.getUnread`, `notification.getAll`, `notification.markRead`, `notification.markAllRead`. Verify user-scoping (cannot read other users' notifications).
- [ ] Implement: Create `src/lib/server/api/notification.ts` with the four procedures. `getAll` uses cursor-based pagination (default 20). `getUnread` returns descending by `createdAt`. Wire into `src/lib/server/api/root.ts`.
- [ ] Verify: All tests pass. tRPC types compile. Router is accessible from client.

### Task 1.4: Verification

- [ ] Manual: Start dev server, verify notification router is callable via tRPC devtools or a test page. Insert a test notification via the service and confirm it appears in `getUnread` response. [checkpoint marker]

---

## Phase 2: Portal Switcher & Role-Aware Header

**Goal:** Build the portal navigation components that let users move between portals based on their role.

### Task 2.1: Portal Switcher Component

- [ ] Write test: Component test verifying: customer sees only "Account"; affiliate sees "Account" + "Affiliate Portal"; admin sees all three. Verify active state highlights current portal.
- [ ] Implement: Create `src/lib/components/platform/PortalSwitcher.svelte`. Use `$page.data.user.role` to determine visible portals. Use `$page.url.pathname` to determine active portal. Each portal has an inline SVG icon. Style with aevani theme variables.
- [ ] Verify: Tests pass. Component renders correctly for all three roles.

### Task 2.2: Role-Aware Header Links

- [ ] Write test: Component test verifying the Header user dropdown shows correct links per role (customer: Account; affiliate: Account + Affiliate Portal; admin: Account + Affiliate Portal + Admin). Verify active link styling.
- [ ] Implement: Update `src/lib/components/navigation/Header.svelte` -- refactor `userNavigation` to be derived from user role. Add Affiliate Portal link for affiliate/admin roles. Add visual distinction for the currently active portal link.
- [ ] Verify: Tests pass. No regression in existing header behavior.

### Task 2.3: Verification

- [ ] Manual: Log in as each role (customer, affiliate, admin). Verify header dropdown shows correct portal links. Verify portal switcher shows correct options and highlights the current portal. Navigate between portals using both mechanisms. [checkpoint marker]

---

## Phase 3: Notification Bell UI

**Goal:** Build the notification bell component with dropdown panel, connecting to the tRPC router from Phase 1.

### Task 3.1: NotificationBell Component - Bell & Badge

- [ ] Write test: Component test verifying: bell SVG icon renders; badge shows with correct count when > 0; badge hidden when count is 0; badge uses accent color.
- [ ] Implement: Create `src/lib/components/platform/NotificationBell.svelte`. Fetch unread count via `trpc.notification.getUnread`. Render bell SVG with conditional badge. Style badge with `oklch(var(--a))`.
- [ ] Verify: Tests pass.

### Task 3.2: NotificationBell Component - Dropdown Panel

- [ ] Write test: Component test verifying: clicking bell toggles dropdown; dropdown shows notification list with icon, title, message preview, relative timestamp; "mark as read" per item; "mark all as read" button; "View all" link; dropdown closes on outside click.
- [ ] Implement: Add dropdown panel to `NotificationBell.svelte`. Implement click-outside via `$effect`. Add subtle open/close animation (opacity + translateY). Truncate message to ~80 chars. Use relative time formatting utility. Respect `prefers-reduced-motion`.
- [ ] Verify: Tests pass.

### Task 3.3: Relative Time Utility

- [ ] Write test: Unit tests for `formatRelativeTime(date)` -- verify "just now", "5 minutes ago", "2 hours ago", "3 days ago", "2 weeks ago" outputs.
- [ ] Implement: Create `src/lib/utils/relativeTime.ts` with a pure function that converts a Date to a human-readable relative string. No external dependency.
- [ ] Verify: Tests pass.

### Task 3.4: Verification

- [ ] Manual: Insert test notifications via service. Verify bell shows correct count. Open dropdown, verify entries display correctly with relative timestamps. Mark one as read -- verify count decrements. Mark all as read -- verify badge disappears. Click outside -- dropdown closes. [checkpoint marker]

---

## Phase 4: Activity Feed

**Goal:** Build the reusable activity feed component that shows context-appropriate recent actions.

### Task 4.1: Activity Feed tRPC Procedure

- [ ] Write test: Integration tests for `activity.getFeed` with each context (`admin`, `affiliate`, `account`). Verify admin gets audit log entries, affiliate gets click/conversion data, account gets order data. Verify role authorization.
- [ ] Implement: Create `src/lib/server/api/activity.ts` with `getFeed` procedure. Accept `context` and `cursor` params. Query appropriate tables based on context. Normalize results into a common shape: `{ id, action, description, timestamp, icon }`. Wire into root router.
- [ ] Verify: Tests pass.

### Task 4.2: ActivityFeed Component

- [ ] Write test: Component test verifying: renders feed entries with icon, description, relative timestamp; shows "Load more" button; handles empty state with a message; accepts `context` prop.
- [ ] Implement: Create `src/lib/components/platform/ActivityFeed.svelte`. Fetch data via `trpc.activity.getFeed`. Render entries with inline SVG icons per action type. Use `formatRelativeTime` from Phase 3. Default to 10 entries. "Load more" fetches next page.
- [ ] Verify: Tests pass.

### Task 4.3: Verification

- [ ] Manual: Place `ActivityFeed` on admin dashboard with `context="admin"`. Verify audit log entries appear. Test "Load more". Test empty state by using a user with no activity. [checkpoint marker]

---

## Phase 5: Command Palette

**Goal:** Build the keyboard-triggered command palette with search, fuzzy matching, and role-filtered results.

### Task 5.1: Fuzzy Search Utility

- [ ] Write test: Unit tests for `fuzzyMatch(query, label)` -- verify scoring: exact match scores highest, prefix match scores high, substring match scores lower, no match returns 0. Test case insensitivity.
- [ ] Implement: Create `src/lib/utils/fuzzySearch.ts` with `fuzzyMatch(query: string, label: string): number` function. Position-weighted substring scoring.
- [ ] Verify: Tests pass.

### Task 5.2: Command Search tRPC Procedure

- [ ] Write test: Integration tests for `search.command` -- verify it returns pages, products, orders, and users filtered by role. Verify customers cannot see admin pages or user results.
- [ ] Implement: Create `src/lib/server/api/search.ts` with `command` procedure. Accept `query` and use caller's role for filtering. Build searchable index from: static page list (role-filtered), products table (name search), orders table (order number, scoped to user or all for admin), users table (admin only). Return grouped results.
- [ ] Verify: Tests pass.

### Task 5.3: CommandPalette Component - Core UI

- [ ] Write test: Component test verifying: Ctrl+K opens palette; Escape closes; frosted glass backdrop renders; input auto-focuses; empty state shows recent items.
- [ ] Implement: Create `src/lib/components/platform/CommandPalette.svelte`. Register global keydown listener for Ctrl+K / Cmd+K. Render modal overlay with `backdrop-filter: blur(12px)`. Auto-focus input. Load recent items from localStorage.
- [ ] Verify: Tests pass.

### Task 5.4: CommandPalette Component - Search & Navigation

- [ ] Write test: Component test verifying: typing triggers search (debounced); results appear grouped by category; arrow keys navigate results; Enter navigates to selected result; selecting stores item in recent history.
- [ ] Implement: Add search functionality -- debounce input at 200ms, call `trpc.search.command`. Render grouped results. Implement keyboard navigation (arrow up/down, Enter, Escape). On selection, push to localStorage recents (max 5) and navigate. Focus trap while open.
- [ ] Verify: Tests pass.

### Task 5.5: Verification

- [ ] Manual: Open command palette with Ctrl+K. Type a product name -- verify results appear within 200ms. Navigate with arrow keys and Enter. Verify recent items appear on next open. Log in as customer -- verify admin pages do not appear. [checkpoint marker]

---

## Phase 6: Breadcrumbs & Integration

**Goal:** Enhance breadcrumbs with portal awareness and integrate all components into the portal layouts.

### Task 6.1: PlatformBreadcrumbs Component

- [ ] Write test: Component test verifying: `/account/orders` generates "Account > Orders"; `/admin/products` generates "Admin > Products"; `/affiliate/earnings` generates "Affiliate Portal > Earnings"; supports `items` override prop; uses existing `Breadcrumbs` component for rendering.
- [ ] Implement: Create `src/lib/components/platform/PlatformBreadcrumbs.svelte`. Build route-to-breadcrumb mapping object. Infer portal from `$page.url.pathname`. Parse path segments into breadcrumb items. Pass to existing `Breadcrumbs` component. Support `items` prop override.
- [ ] Verify: Tests pass.

### Task 6.2: Integration into Portal Layouts

- [ ] Write test: Smoke tests verifying that each portal layout (account, affiliate, admin) renders: PlatformBreadcrumbs, NotificationBell (in header area), PortalSwitcher (in sidebar footer), CommandPalette (globally available).
- [ ] Implement: Update the portal layout files to include the new components. Add `NotificationBell` to the PlatformHeader slot. Add `PortalSwitcher` to the PlatformSidebar footer slot. Add `PlatformBreadcrumbs` to the content area top. Mount `CommandPalette` once in the root layout (or platform layout wrapper).
- [ ] Verify: Tests pass. All components render in correct positions across all portals.

### Task 6.3: Notification Trigger Points

- [ ] Write test: Integration tests verifying that creating an order triggers a notification for the customer; affiliate conversion triggers a notification for the affiliate; admin actions (e.g., user role change) trigger admin notifications.
- [ ] Implement: Add `NotificationService.create()` calls to relevant service methods: order creation (notify customer), affiliate conversion (notify affiliate), admin user management (notify admins). Use appropriate notification types.
- [ ] Verify: Tests pass.

### Task 6.4: Final Verification

- [ ] Manual: Full end-to-end walkthrough as each role. Verify all components render, function correctly, and respect role boundaries. Test keyboard navigation through command palette. Verify breadcrumbs update on navigation. Verify notifications appear when triggering events. Check `prefers-reduced-motion` behavior. Verify no emoji anywhere in the UI. [checkpoint marker]
