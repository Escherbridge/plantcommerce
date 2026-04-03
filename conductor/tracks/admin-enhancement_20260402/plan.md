# Implementation Plan: Admin Dashboard Enhancement

## Overview

This plan migrates the admin layout to PlatformShell and enhances all admin pages across 6 phases. Phase 1 handles the layout migration (blocker). Phases 2-5 enhance individual pages in parallel-safe order. Phase 6 adds the settings page and audit log. Each task follows TDD (Red-Green-Refactor).

**Dependency:** Phase 1 requires `platform-shell_20260402` to be complete.

**Estimated Duration:** 4-5 weeks (6 phases, ~35 tasks)

---

## Phase 1: Admin Layout Migration to PlatformShell

**Goal:** Replace DaisyUI drawer layout with PlatformShell component. All admin pages render correctly within the new shell.

### Task 1.1: Define admin navigation config
- [ ] Write test: unit test for `adminNavigation` config array -- validates all 8 nav items have label, href, icon (SVG string), and optional badge field
- [ ] Implement: create `src/lib/config/adminNavigation.ts` exporting typed navigation config array
- [ ] Refactor: extract SVG icon strings into a shared admin icons module if >3 icons reused

### Task 1.2: Create admin badge counts loader
- [ ] Write test: integration test for new tRPC procedure `getAdminBadgeCounts` -- returns `{ pendingOrders: number, newUsers: number }`
- [ ] Implement: add `getAdminBadgeCounts` to `adminRouter` querying pending order count and users created in last 7 days
- [ ] Refactor: ensure query uses indexed columns for performance

### Task 1.3: Migrate admin layout to PlatformShell
- [ ] Write test: component test -- admin layout renders PlatformShell with sidebar containing all nav links, "Admin Panel" header, and "Back to Store" link
- [ ] Implement: rewrite `src/routes/admin/+layout.svelte` to use PlatformShell with `adminNavigation` config, sidebarHeader snippet with branding, badge counts from loader
- [ ] Refactor: remove old DaisyUI drawer markup, ensure mobile hamburger toggle works via PlatformShell

### Task 1.4: Update admin layout server loader
- [ ] Write test: test that `+layout.server.ts` calls `requireAdmin()` and fetches badge counts
- [ ] Implement: update or create `src/routes/admin/+layout.server.ts` to load badge counts alongside auth check
- [ ] Refactor: ensure badge count data flows to layout component via `data` prop

### Task 1.5: Verification -- Layout migration
- [ ] Verify: all admin pages render within PlatformShell, sidebar navigation works, mobile responsive, no regressions in existing page content
- [ ] Verify: `npm run check` passes with no TypeScript errors [checkpoint marker]

---

## Phase 2: Enhanced Admin Dashboard

**Goal:** Upgrade the dashboard overview page with richer KPIs, recent activity, and quick actions.

### Task 2.1: Extend dashboard stats tRPC procedure
- [ ] Write test: integration test for extended `getDashboardStats` -- returns additional fields: `todayRevenue`, `weekRevenue`, `monthRevenue`, `newUsersThisWeek`, `activeAffiliates`
- [ ] Implement: extend the existing `getDashboardStats` query with date-filtered revenue aggregations, new user count, and affiliate count
- [ ] Refactor: consolidate multiple DB queries into fewer round-trips where possible

### Task 2.2: Build KPI card component
- [ ] Write test: component test -- `AdminKpiCard` renders title, value, trend arrow (up/down), trend percentage, and SVG icon; no emoji
- [ ] Implement: create `src/lib/components/admin/AdminKpiCard.svelte` with props: title, value, trend (number), icon (SVG snippet), color
- [ ] Refactor: ensure card styling matches aevani theme (`rounded-3xl`, `border-base-200/30`, `shadow-md`, `font-display uppercase tracking-tight` for title)

### Task 2.3: Build recent orders table with inline status
- [ ] Write test: component test -- `AdminRecentOrders` renders order rows with status badge and status-change dropdown; emits status change event
- [ ] Implement: create `src/lib/components/admin/AdminRecentOrders.svelte` using `data.recentOrders`, inline `<select>` for status change calling tRPC `updateOrderStatus`
- [ ] Refactor: add loading state during status update, optimistic UI

### Task 2.4: Build activity feed component
- [ ] Write test: component test -- `AdminActivityFeed` renders list of activity items with icon, description, timestamp; shows placeholder when empty
- [ ] Implement: create `src/lib/components/admin/AdminActivityFeed.svelte` -- initially renders placeholder items; will connect to audit log in Phase 6
- [ ] Refactor: ensure consistent timestamp formatting (relative: "2 hours ago")

### Task 2.5: Assemble enhanced dashboard page
- [ ] Write test: component test -- dashboard page renders 4 KPI cards, recent orders table, activity feed, and quick action buttons
- [ ] Implement: rewrite `src/routes/admin/+page.svelte` composing AdminKpiCard, AdminRecentOrders, AdminActivityFeed, quick actions grid, and system health placeholder
- [ ] Refactor: ensure responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)

### Task 2.6: Verification -- Dashboard
- [ ] Verify: dashboard loads with real data from tRPC, KPI cards display correctly, quick actions navigate to correct pages
- [ ] Verify: mobile layout stacks properly, no horizontal overflow [checkpoint marker]

---

## Phase 3: Enhanced Products Page

**Goal:** Add search, filters, bulk actions, inline editing, and pagination to the products page.

### Task 3.1: Add product bulk status mutation
- [ ] Write test: integration test for `updateProductsBulkStatus` tRPC mutation -- accepts array of product IDs and target status (active/inactive), returns updated count
- [ ] Implement: add `updateProductsBulkStatus` to `adminRouter`
- [ ] Refactor: validate input array length (max 100 items)

### Task 3.2: Add inline product field update mutation
- [ ] Write test: integration test for `updateProductField` tRPC mutation -- accepts product ID, field name (price or stockQuantity), and new value
- [ ] Implement: add `updateProductField` to `adminRouter` with Zod validation for allowed fields
- [ ] Refactor: ensure decimal handling for price field

### Task 3.3: Build product search and filter controls
- [ ] Write test: component test -- `AdminProductFilters` renders search input, category dropdown (from data), status dropdown; emits filter change events
- [ ] Implement: create `src/lib/components/admin/AdminProductFilters.svelte` with debounced search (300ms), category select populated from tRPC categories query, status select
- [ ] Refactor: use Svelte 5 `$state` for filter values, `$derived` for combined filter object

### Task 3.4: Build product table with bulk select and inline edit
- [ ] Write test: component test -- product table renders checkboxes, "Select All" header, image thumbnails, stock level color indicators; inline edit mode activates on cell click
- [ ] Implement: create `src/lib/components/admin/AdminProductTable.svelte` with bulk selection state, inline edit for price/stock cells, stock level color coding (green/yellow/red thresholds)
- [ ] Refactor: extract bulk action toolbar into sub-component

### Task 3.5: Build pagination component
- [ ] Write test: component test -- `AdminPagination` renders prev/next buttons, current page indicator, items-per-page selector; emits page change events
- [ ] Implement: create `src/lib/components/admin/AdminPagination.svelte` -- reusable across all admin tables
- [ ] Refactor: disable prev on page 1, next on last page; show "Showing X-Y of Z"

### Task 3.6: Assemble enhanced products page
- [ ] Write test: component test -- products page renders filters, table with bulk actions, pagination; search filters data correctly
- [ ] Implement: rewrite `src/routes/admin/products/+page.svelte` composing filters, table, pagination; wire tRPC queries with filter/pagination params
- [ ] Refactor: add confirmation modal for bulk delete, loading skeleton during data fetch

### Task 3.7: Verification -- Products page
- [ ] Verify: search filters work, bulk actions update products, inline edit saves correctly, pagination navigates, stock indicators display proper colors
- [ ] Verify: page handles empty results gracefully [checkpoint marker]

---

## Phase 4: Enhanced Orders Page

**Goal:** Add tab-based status filtering, expandable order details, status update with notes, affiliate attribution, and CSV export.

### Task 4.1: Add order status update with note mutation
- [ ] Write test: integration test for `updateOrderStatusWithNote` tRPC mutation -- accepts orderId, newStatus, optional note string; persists note
- [ ] Implement: add `updateOrderStatusWithNote` to `adminRouter`; store note in order record or separate order_notes relation
- [ ] Refactor: validate status transitions (cannot go from delivered back to pending)

### Task 4.2: Add order count by status query
- [ ] Write test: integration test for `getOrderCountsByStatus` tRPC query -- returns object with count per status value
- [ ] Implement: add `getOrderCountsByStatus` to `adminRouter` using GROUP BY query
- [ ] Refactor: cache result for badge display in tab bar

### Task 4.3: Build order status tabs component
- [ ] Write test: component test -- `AdminOrderTabs` renders tab for each status with count badge; active tab is highlighted; emits status filter change
- [ ] Implement: create `src/lib/components/admin/AdminOrderTabs.svelte`
- [ ] Refactor: use URL search params for tab state so it survives page refresh

### Task 4.4: Build expandable order row component
- [ ] Write test: component test -- `AdminOrderRow` renders summary row; clicking expands to show order items, shipping address, payment info, affiliate info, status history
- [ ] Implement: create `src/lib/components/admin/AdminOrderRow.svelte` with expand/collapse state, status update dropdown with note textarea
- [ ] Refactor: animate expand/collapse with CSS transition

### Task 4.5: Build CSV export utility
- [ ] Write test: unit test for `exportOrdersCsv` function -- accepts order array, returns valid CSV string with correct headers and escaped values
- [ ] Implement: create `src/lib/utils/csvExport.ts` with `exportOrdersCsv` function; trigger download via Blob URL
- [ ] Refactor: handle special characters (commas, quotes, newlines) in field values

### Task 4.6: Assemble enhanced orders page
- [ ] Write test: component test -- orders page renders tabs, search bar, date range filter, order table with expandable rows, CSV export button, pagination
- [ ] Implement: rewrite `src/routes/admin/orders/+page.svelte` composing tabs, filters, expandable table, export button, pagination
- [ ] Refactor: ensure URL params sync (status, search, page) for bookmarkable state

### Task 4.7: Verification -- Orders page
- [ ] Verify: tab filtering works with correct counts, order expansion shows details, status update with note persists, CSV exports correctly, affiliate attribution displays when present
- [ ] Verify: date range filter returns correct results [checkpoint marker]

---

## Phase 5: Enhanced Users Page

**Goal:** Add search, role/status filters, inline role management, and expandable user details.

### Task 5.1: Extend getAllUsers with search parameter
- [ ] Write test: integration test -- `getAllUsers` with `search` param filters by name or email (case-insensitive ILIKE)
- [ ] Implement: add `search` string param to `getAllUsers` input schema and query
- [ ] Refactor: use parameterized query to prevent SQL injection

### Task 5.2: Add user detail stats query
- [ ] Write test: integration test for `getUserDetailStats` tRPC query -- given userId, returns order count, total spent, affiliate earnings (if applicable), last login
- [ ] Implement: add `getUserDetailStats` to `adminRouter`
- [ ] Refactor: use a single query with LEFT JOINs for efficiency

### Task 5.3: Build user filters component
- [ ] Write test: component test -- `AdminUserFilters` renders search input, role dropdown (All/Admin/Customer/Affiliate), status dropdown (All/Active/Inactive)
- [ ] Implement: create `src/lib/components/admin/AdminUserFilters.svelte` with debounced search
- [ ] Refactor: sync filters to URL search params

### Task 5.4: Build user table with inline role change
- [ ] Write test: component test -- user table renders role badges (color-coded per role), clicking badge opens role-change dropdown, confirmation dialog appears before mutation
- [ ] Implement: create `src/lib/components/admin/AdminUserTable.svelte` with inline role editing, expandable detail rows loading `getUserDetailStats` on expand
- [ ] Refactor: add affiliate indicator icon for affiliate users, link to affiliate dashboard

### Task 5.5: Assemble enhanced users page
- [ ] Write test: component test -- users page renders filters, user table, pagination
- [ ] Implement: rewrite `src/routes/admin/users/+page.svelte` composing filters, table, pagination
- [ ] Refactor: handle edge cases (deleting own admin account should be prevented)

### Task 5.6: Verification -- Users page
- [ ] Verify: search filters by name and email, role filter works, inline role change persists with confirmation, expandable rows show user stats
- [ ] Verify: cannot demote last remaining admin [checkpoint marker]

---

## Phase 6: Admin Settings and Audit Log

**Goal:** Create settings page with store config, notification preferences, and audit log viewer. Wire audit log to activity feed.

### Task 6.1: Create audit log database schema
- [ ] Write test: integration test -- inserting and querying audit_log records works; fields: id, action, actorId, targetType, targetId, details (JSONB), createdAt
- [ ] Implement: add `auditLog` table to `src/lib/server/db/schema.ts`, generate migration
- [ ] Refactor: add index on `createdAt` and `actorId` columns

### Task 6.2: Create audit log service
- [ ] Write test: unit test for `AuditLogService.log()` -- accepts action, actorId, target info, details; inserts record. Test `AuditLogService.getRecent()` -- returns paginated entries
- [ ] Implement: create `src/lib/server/services/auditLog.ts` with `log()` and `getRecent()` methods
- [ ] Refactor: add audit log calls to existing admin mutations (updateOrderStatus, updateUserRole, updateProductsBulkStatus)

### Task 6.3: Create store settings schema and service
- [ ] Write test: integration test -- `SettingsService.get(key)` returns value, `SettingsService.set(key, value)` persists, `SettingsService.getAll()` returns all settings
- [ ] Implement: add `settings` table (key VARCHAR PK, value TEXT, updatedAt) to schema; create `src/lib/server/services/settings.ts`
- [ ] Refactor: seed default settings (storeName, currency, taxRate, commissionBaseRate)

### Task 6.4: Add settings and audit log tRPC procedures
- [ ] Write test: integration test for `getStoreSettings`, `updateStoreSettings`, `getAuditLog` tRPC procedures
- [ ] Implement: add procedures to `adminRouter`; `updateStoreSettings` accepts key-value pairs, `getAuditLog` accepts pagination params
- [ ] Refactor: validate setting keys against allowed list

### Task 6.5: Build settings page UI
- [ ] Write test: component test -- settings page renders store settings form, commission rates display, notification toggles, audit log table
- [ ] Implement: create `src/routes/admin/settings/+page.svelte` with form sections, save buttons with loading/success states, audit log table with pagination
- [ ] Refactor: group settings into collapsible sections, add form validation

### Task 6.6: Wire audit log to dashboard activity feed
- [ ] Write test: component test -- `AdminActivityFeed` receives audit log data and renders real entries instead of placeholders
- [ ] Implement: update dashboard loader to fetch recent audit log entries; pass to `AdminActivityFeed` component
- [ ] Refactor: format audit log entries into human-readable activity descriptions

### Task 6.7: Create settings server loader
- [ ] Write test: test that `settings/+page.server.ts` loads store settings and recent audit log entries
- [ ] Implement: create `src/routes/admin/settings/+page.server.ts` with `requireAdmin()` and data loading
- [ ] Refactor: ensure settings page is added to admin navigation config

### Task 6.8: Verification -- Settings and audit log
- [ ] Verify: settings save and persist across page reloads, audit log records admin actions, activity feed on dashboard shows real entries
- [ ] Verify: all admin pages pass `npm run check` with no errors
- [ ] Verify: full admin flow walkthrough -- navigate all pages, perform CRUD operations, verify audit trail [checkpoint marker]
