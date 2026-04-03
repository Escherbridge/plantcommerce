# Specification: Admin Dashboard Enhancement

## Overview

Upgrade the existing admin dashboard and all admin pages to use the PlatformShell layout component, replacing the current DaisyUI drawer. Enhance every admin page with improved data visualization, better UX patterns (search, filter, bulk actions, inline editing), and additional functionality (audit log, settings, CSV export).

## Background

The admin section currently uses a basic DaisyUI drawer layout with minimal data tables. Pages lack search/filter capabilities, inline editing, bulk operations, and detailed views. The admin dashboard shows basic stats but has no time-period breakdowns, activity feed, or system health indicators. A new PlatformShell component (from track `platform-shell_20260402`) will provide a unified sidebar/header/content layout that this track will adopt for the admin area.

## Dependencies

- **platform-shell_20260402** -- PlatformShell component must be implemented first. This track consumes `PlatformShell`, `adminNavigation` config, sidebar slots, and badge count APIs from that track.

## Functional Requirements

### FR-1: Admin Layout Migration
**Description:** Replace the DaisyUI drawer in `/admin/+layout.svelte` with PlatformShell configured for admin navigation.
**Priority:** P0 (blocker for all other FRs)
**Acceptance Criteria:**
- PlatformShell renders with admin-specific sidebar containing all nav links (Dashboard, SEO, Products, Orders, Users, Content, Analytics, Settings)
- Sidebar header displays "Admin Panel" branding with Aevani sub-label
- Nav items show badge counts for actionable items (pending orders count, new users in last 7 days)
- "Back to Store" link in sidebar navigates to storefront
- Mobile: sidebar collapses behind hamburger toggle, all nav items accessible
- Admin layout passes `requireAdmin()` loader check (existing behavior preserved)

### FR-2: Enhanced Admin Dashboard
**Description:** Upgrade `/admin/+page.svelte` with richer KPI cards, time-period selectors, recent activity feed, and quick actions.
**Priority:** P0
**Acceptance Criteria:**
- KPI cards display: Revenue (with today/this week/this month toggle), Total Orders, New Users (last 7 days), Active Affiliates count
- Each KPI card shows trend indicator (up/down arrow with percentage vs. previous period) -- can be placeholder data initially
- Recent orders table shows last 5 orders with status badge, customer name, amount, and inline status-change dropdown
- Activity feed section displays recent admin actions (order status changes, user role changes, product updates) -- reads from audit log if available, otherwise placeholder
- Quick action buttons: Add Product, View Orders, Manage Users, Create Content
- Revenue chart placeholder area with "Last 30 Days" label (actual charting library out of scope)
- System health section with placeholder indicators (DB status, last deploy, error rate)

### FR-3: Enhanced Products Page
**Description:** Upgrade `/admin/products/+page.svelte` with search, filters, bulk actions, and better table UX.
**Priority:** P1
**Acceptance Criteria:**
- Search input filters products by name in real-time (debounced, 300ms)
- Category dropdown filter uses actual categories from DB
- Status filter: All / Active / Inactive
- Product table shows: thumbnail (48x48), name, SKU, category, price, stock quantity with color-coded level indicator (green > 20, yellow 10-20, red < 10), status badge, action buttons
- Bulk select via checkboxes with "Select All" header checkbox
- Bulk actions toolbar appears when items selected: Activate, Deactivate, Delete (with confirmation modal)
- Pagination controls (prev/next) with items-per-page selector (10/25/50)
- Inline edit: clicking price or stock opens an input field; pressing Enter or blur saves via tRPC mutation

### FR-4: Enhanced Orders Page
**Description:** Upgrade `/admin/orders/+page.svelte` with tab-based status filtering, expandable detail rows, status updates with notes, and CSV export.
**Priority:** P1
**Acceptance Criteria:**
- Tab bar filters orders by status: All, Pending, Processing, Shipped, Delivered, Cancelled -- each tab shows count badge
- Order rows are expandable (click to reveal): order items list, shipping address, payment info, affiliate attribution (if any), status history timeline
- Status update dropdown on each row with optional note textarea; calls `updateOrderStatus` tRPC mutation
- Affiliate attribution column shows affiliate name/code if order was referred
- "Export CSV" button exports currently filtered orders as CSV download (client-side generation)
- Search by order ID or customer email
- Date range filter (from/to date inputs)
- Pagination with items-per-page selector

### FR-5: Enhanced Users Page
**Description:** Upgrade `/admin/users/+page.svelte` with role management, search/filter, and expandable user details.
**Priority:** P1
**Acceptance Criteria:**
- Search input filters by name or email (debounced)
- Role filter dropdown: All, Admin, Customer, Affiliate
- Status filter: All, Active, Inactive
- User table shows: name, email, role badge (color-coded: admin=primary, affiliate=secondary, customer=ghost), status badge, join date, action buttons
- Inline role change: clicking role badge opens dropdown to change role; calls `updateUserRole` tRPC mutation with confirmation
- Expandable row shows: full profile info, order count, total spent, affiliate status/earnings (if affiliate), account creation date, last login
- Affiliate indicator column shows checkmark or link to affiliate dashboard for affiliate users

### FR-6: Admin Settings Page
**Description:** Create `/admin/settings/+page.svelte` with store configuration, commission defaults, and audit log viewer.
**Priority:** P2
**Acceptance Criteria:**
- Store settings section: store name, default currency display, tax rate percentage -- form saves via new tRPC mutation
- Commission rate defaults section: base rate, tier thresholds display (read-only reference from affiliate system config)
- Notification preferences section: toggle switches for email notifications (new order, low stock, new user signup) -- saves to admin preferences
- Audit log viewer: paginated table showing recent admin actions (action type, actor, target, timestamp, details) -- reads from audit_log table or placeholder if table does not exist yet
- All form sections have save buttons with loading states and success/error feedback

## Non-Functional Requirements

### NFR-1: Performance
- Admin pages must load initial data in under 500ms (tRPC query response time)
- Debounced search inputs must not fire more than 1 request per 300ms
- Tables with 100+ rows must not cause visible jank (use virtual scrolling or pagination)
- Bulk operations must show progress indicator for operations on 10+ items

### NFR-2: Accessibility
- All interactive elements must be keyboard accessible
- Data tables must use proper `<thead>`, `<tbody>`, `<th scope>` semantics
- Status badges must not rely solely on color (include text labels)
- Modal dialogs must trap focus and support Escape to close

### NFR-3: Style Consistency
- All pages use aevani theme CSS variables
- No emoji anywhere -- use inline SVG icons only
- Headers use `font-display uppercase tracking-tight`
- Cards use `rounded-3xl border border-base-200/30 shadow-md` pattern
- Data tables use consistent spacing, `table-sm` or `table` class with alternating row hints

### NFR-4: Security
- All admin routes protected by `requireAdmin()` server-side check
- Bulk delete operations require confirmation modal
- Role changes require confirmation
- No sensitive data (passwords, tokens) displayed in admin UI

## User Stories

### US-1: Admin reviews daily performance
**As** an admin, **I want** to see today's revenue, order count, and new user signups on the dashboard, **so that** I can quickly assess daily business health.
- **Given** I am logged in as admin and navigate to /admin
- **When** the dashboard loads
- **Then** I see KPI cards with today's revenue, total orders, new users, and active affiliates with trend indicators

### US-2: Admin searches for a product
**As** an admin, **I want** to search products by name and filter by category, **so that** I can quickly find and manage specific products.
- **Given** I am on /admin/products
- **When** I type "hydro" in the search field
- **Then** the table filters to show only products with "hydro" in the name within 300ms

### US-3: Admin bulk deactivates products
**As** an admin, **I want** to select multiple products and deactivate them at once, **so that** I can efficiently manage seasonal inventory.
- **Given** I am on /admin/products with multiple products selected
- **When** I click "Deactivate" in the bulk actions toolbar
- **Then** all selected products are set to inactive and the table refreshes

### US-4: Admin processes an order
**As** an admin, **I want** to expand an order row to see full details and update its status with a note, **so that** I can process orders without navigating away.
- **Given** I am on /admin/orders
- **When** I click an order row to expand it, change status to "Shipped", and add a tracking note
- **Then** the order status updates, the note is saved, and the status history shows the change

### US-5: Admin exports orders
**As** an admin, **I want** to export filtered orders as CSV, **so that** I can analyze order data in a spreadsheet.
- **Given** I am on /admin/orders with status filter set to "Delivered"
- **When** I click "Export CSV"
- **Then** a CSV file downloads containing only delivered orders with columns: Order ID, Customer, Email, Date, Total, Status, Items

### US-6: Admin changes user role
**As** an admin, **I want** to change a user's role inline from the users table, **so that** I can promote customers to affiliates quickly.
- **Given** I am on /admin/users
- **When** I click a user's role badge and select "Affiliate" from the dropdown
- **Then** a confirmation dialog appears, and upon confirming, the role updates and the badge color changes

### US-7: Admin configures store settings
**As** an admin, **I want** to update store settings and notification preferences, **so that** I can control business configuration without code changes.
- **Given** I am on /admin/settings
- **When** I update the tax rate and toggle off low-stock email notifications, then click Save
- **Then** settings are persisted and a success message confirms the save

## Technical Considerations

- **PlatformShell Integration:** The layout migration depends on the PlatformShell component API from `platform-shell_20260402`. The admin layout must pass navigation config, sidebar header slot content, and badge count data to PlatformShell.
- **tRPC Mutations Needed:** Several new tRPC mutations are required: `updateProductStatus` (bulk), `updateOrderStatusWithNote`, `getAuditLog`, `getStoreSettings`, `updateStoreSettings`, `updateNotificationPreferences`. These extend the existing `adminRouter`.
- **CSV Export:** Client-side CSV generation using Blob API -- no server-side file generation needed.
- **Inline Editing:** Use Svelte 5 runes (`$state`, `$derived`) for local edit state management. Optimistic UI updates with rollback on error.
- **Badge Counts:** Dashboard stats query already returns `recentOrders` and could be extended. Badge counts in nav should use a lightweight polling or load-time fetch, not WebSocket.
- **Audit Log Table:** If `audit_log` table does not exist in schema, create it as part of this track (action, actorId, targetType, targetId, details JSON, createdAt).

## Out of Scope

- Charting library integration (revenue charts are placeholder areas only)
- Real-time WebSocket updates for order notifications
- Advanced analytics (PostHog integration is in Track 12)
- Email sending for notifications (settings UI only, no email dispatch)
- Product create/edit form redesign (existing forms remain)
- Content and SEO page enhancements (separate tracks)
- Affiliate payout management UI
- Virtual scrolling for very large datasets (pagination is sufficient)

## Open Questions

1. **Audit Log Schema:** Should the audit_log table be created in this track, or does it belong to a shared infrastructure track? (Assumed: create here as minimal schema)
2. **Store Settings Storage:** Should store settings use a dedicated `settings` table with key-value pairs, or a single `store_config` JSON column? (Assumed: key-value `settings` table)
3. **PlatformShell API:** What is the exact prop/slot interface of PlatformShell? This spec assumes: `navigation` prop (array of nav items with label, href, icon, badge), `sidebarHeader` snippet slot, and default content slot. Will be confirmed when platform-shell track is complete.
4. **Notification Preferences:** Are notification preferences per-admin-user or global? (Assumed: global store-level settings for MVP)
