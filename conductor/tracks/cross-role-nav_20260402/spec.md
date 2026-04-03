# Specification: Cross-Role Navigation & Unified Experience

## Overview

Build the cross-cutting features that unify the account (`/account/*`), affiliate (`/affiliate/*`), and admin (`/admin/*`) portals into a cohesive internal platform experience. This track delivers role switching, notifications, activity feeds, a command palette, and enhanced breadcrumbs -- the connective tissue between all portal surfaces.

## Background

The Aevani platform currently has three separate portal areas with no navigational connection between them. A user with the `admin` role must manually navigate to `/admin` via the storefront header dropdown; affiliate users have no shortcut at all beyond the top-level "Affiliate" nav link. There is no notification system, no activity feed, and no keyboard-driven navigation. The existing `Breadcrumbs` component is generic and has no portal-aware context.

### Current State

- Header user dropdown shows "Admin Dashboard" link for admins; no affiliate portal link.
- No portal switcher inside any portal sidebar.
- `AuditLogService` writes to the `audit_log` table but has no read/display UI.
- `Breadcrumbs.svelte` accepts manual items array with no automatic route inference.
- No notification database table, service, or UI.
- No command palette or keyboard shortcut system.

### Dependencies

This track depends on:

| Track | What it provides |
|-------|-----------------|
| `platform-shell_20260402` | PlatformSidebar, PlatformHeader layout shells used by all portals |
| `account-dashboard_20260402` | Account portal routes and layout |
| `affiliate-portal_20260402` | Affiliate portal routes and layout |
| `admin-enhancement_20260402` | Admin portal routes and layout |

## Functional Requirements

### FR-1: Role-Aware Header Integration

**Description:** The main site header dynamically shows portal quick-links based on the authenticated user's role.

**Acceptance Criteria:**
- AC-1.1: Unauthenticated users see Login/Register links only (no change from current).
- AC-1.2: Customers see Account link in user dropdown.
- AC-1.3: Affiliate users see both Account and Affiliate Portal links.
- AC-1.4: Admin users see Account, Affiliate Portal, and Admin links.
- AC-1.5: The currently active portal link is visually distinguished (e.g., bold or accent color).
- AC-1.6: Links are ordered: Account, Affiliate Portal, Admin.

**Priority:** P0

### FR-2: Portal Switcher Component

**Description:** A component rendered in the PlatformSidebar footer that lets users jump between portals they have access to.

**Acceptance Criteria:**
- AC-2.1: Component file at `src/lib/components/platform/PortalSwitcher.svelte`.
- AC-2.2: All authenticated users see the "Account" portal option.
- AC-2.3: Users with role `affiliate` or `admin` also see "Affiliate Portal".
- AC-2.4: Users with role `admin` also see "Admin".
- AC-2.5: The current portal is indicated with a visual highlight (active state).
- AC-2.6: Clicking a portal navigates to its root route (`/account`, `/affiliate/dashboard`, `/admin`).
- AC-2.7: Each portal entry has a distinct inline SVG icon.

**Priority:** P0

### FR-3: Notification Bell Component

**Description:** A bell icon with unread count badge in the platform header area, with a dropdown panel listing notifications.

**Acceptance Criteria:**
- AC-3.1: Component file at `src/lib/components/platform/NotificationBell.svelte`.
- AC-3.2: Bell icon renders an inline SVG (no emoji).
- AC-3.3: Unread count badge appears when count > 0; hidden when 0.
- AC-3.4: Badge uses the accent color from the aevani theme.
- AC-3.5: Clicking the bell toggles a dropdown panel with a scrollable notification list.
- AC-3.6: Each notification shows: icon by type, title, message preview (truncated), relative timestamp.
- AC-3.7: Individual "mark as read" action per notification.
- AC-3.8: "Mark all as read" button at the top of the panel.
- AC-3.9: "View all" link at the bottom navigates to a full notifications page.
- AC-3.10: Dropdown closes when clicking outside.
- AC-3.11: Dropdown has subtle open/close animation.

**Priority:** P0

### FR-4: Notifications Infrastructure

**Description:** Database table, tRPC router, and service layer for the notification system.

**Acceptance Criteria:**
- AC-4.1: `notification` table in schema with columns: id, userId, type (enum: `order`, `affiliate`, `admin`, `system`), title, message, isRead (default false), link (nullable), createdAt.
- AC-4.2: Index on `(userId, isRead)` for fast unread queries.
- AC-4.3: tRPC router `notification` with procedures: `getUnread`, `getAll` (paginated), `markRead` (single), `markAllRead`.
- AC-4.4: `NotificationService` class with `create(userId, type, title, message, link?)` method.
- AC-4.5: Service methods are called from order, affiliate, and admin services when relevant events occur.
- AC-4.6: `getUnread` returns notifications ordered by `createdAt` descending.
- AC-4.7: `getAll` supports cursor-based pagination with a default page size of 20.

**Priority:** P0

### FR-5: Activity Feed Component

**Description:** A reusable feed component that displays recent actions relevant to the current user and portal context.

**Acceptance Criteria:**
- AC-5.1: Component file at `src/lib/components/platform/ActivityFeed.svelte`.
- AC-5.2: Accepts a `context` prop: `'admin'`, `'affiliate'`, or `'account'`.
- AC-5.3: Admin context: shows audit log entries (leverages existing `audit_log` table).
- AC-5.4: Affiliate context: shows recent clicks, conversions, and earnings events.
- AC-5.5: Account context: shows recent orders and wishlist changes.
- AC-5.6: Each entry shows: action icon (inline SVG), description text, relative timestamp (e.g., "2 hours ago").
- AC-5.7: Feed loads the most recent 10 entries by default with a "Load more" button.
- AC-5.8: tRPC procedure `activity.getFeed` returns context-appropriate entries.

**Priority:** P1

### FR-6: Command Palette

**Description:** A keyboard-triggered overlay for quickly searching and navigating to pages, products, orders, and users.

**Acceptance Criteria:**
- AC-6.1: Component file at `src/lib/components/platform/CommandPalette.svelte`.
- AC-6.2: Opens with `Ctrl+K` (or `Cmd+K` on macOS).
- AC-6.3: Frosted glass backdrop overlay.
- AC-6.4: Input field with auto-focus and placeholder "Search pages, products, orders...".
- AC-6.5: Results grouped by category: Pages, Products, Orders, Users.
- AC-6.6: "Recent" section shown when input is empty.
- AC-6.7: Results are role-filtered: customers cannot see admin pages or user management.
- AC-6.8: Fuzzy matching on labels using a simple scoring algorithm (no external library required).
- AC-6.9: Keyboard navigation: arrow keys to select, Enter to navigate, Escape to close.
- AC-6.10: Selecting a result navigates to its URL and closes the palette.
- AC-6.11: Recent items persisted in localStorage (last 5 items).
- AC-6.12: tRPC procedure `search.command` returns filtered results by query and role.

**Priority:** P1

### FR-7: Breadcrumb System Enhancement

**Description:** Context-aware breadcrumbs that automatically reflect the portal, section, and page hierarchy.

**Acceptance Criteria:**
- AC-7.1: New `PlatformBreadcrumbs.svelte` component at `src/lib/components/platform/PlatformBreadcrumbs.svelte`.
- AC-7.2: Automatically infers portal context from the current URL path.
- AC-7.3: Generates breadcrumb trail: Portal Name > Section > Page (e.g., "Account > Orders > Order #1234").
- AC-7.4: Each level is a clickable link except the current (last) item.
- AC-7.5: Supports override via an `items` prop for custom breadcrumb trails.
- AC-7.6: Uses the existing `Breadcrumbs.svelte` component internally for rendering.
- AC-7.7: Portal names map: `/account/*` = "Account", `/affiliate/*` = "Affiliate Portal", `/admin/*` = "Admin".

**Priority:** P1

## Non-Functional Requirements

### NFR-1: Performance

- Notification unread count query must complete in < 50ms.
- Command palette search results must render within 150ms of keystroke (debounced at 200ms).
- Activity feed initial load must complete in < 300ms.
- No layout shift when notification badge appears/disappears.

### NFR-2: Accessibility

- All interactive elements must be keyboard navigable.
- Command palette must trap focus while open.
- Notification dropdown must announce new notifications to screen readers via aria-live.
- All SVG icons must have appropriate aria-label or aria-hidden attributes.
- Color contrast ratios must meet WCAG AA (4.5:1 for text).

### NFR-3: Security

- Notification queries must be scoped to the authenticated user (server-side enforcement).
- Command palette search results must be server-filtered by role (never expose admin data to customers).
- Activity feed data must be role-gated at the tRPC procedure level.

### NFR-4: Consistency

- All new components must use aevani theme CSS custom properties.
- No emoji anywhere in UI -- inline SVGs only.
- Animations must respect `prefers-reduced-motion`.

## User Stories

### US-1: Portal Navigation

**As** an admin user,
**I want** to quickly switch between the admin panel, affiliate portal, and my account,
**So that** I can manage different aspects of the platform without navigating through the storefront.

**Scenarios:**
- **Given** I am logged in as an admin and viewing `/admin/products`, **When** I click "Account" in the portal switcher, **Then** I am navigated to `/account`.
- **Given** I am logged in as a customer, **When** I view the portal switcher, **Then** I only see the "Account" option.

### US-2: Notification Awareness

**As** an affiliate user,
**I want** to see a notification badge when I have new earnings or conversions,
**So that** I can stay informed without constantly checking the earnings page.

**Scenarios:**
- **Given** I have 3 unread notifications, **When** I view any portal page, **Then** the bell icon shows a badge with "3".
- **Given** I click "Mark all as read", **When** the action completes, **Then** the badge disappears and all notifications show as read.

### US-3: Quick Navigation

**As** a power user,
**I want** to press Ctrl+K and search for any page or entity,
**So that** I can navigate the platform efficiently without clicking through menus.

**Scenarios:**
- **Given** the command palette is open, **When** I type "hydro", **Then** I see results including "Hydroponics" category page and matching products.
- **Given** I am a customer, **When** I search in the command palette, **Then** admin-only pages do not appear in results.

### US-4: Activity Awareness

**As** an admin,
**I want** to see a feed of recent platform activity,
**So that** I can monitor what is happening across the system at a glance.

**Scenarios:**
- **Given** I am on the admin dashboard, **When** the activity feed loads, **Then** I see recent audit log entries with action descriptions and timestamps.

## Technical Considerations

- The `notification` table should be added to `src/lib/server/db/schema.ts` alongside the existing `auditLog` table.
- The `NotificationService` follows the same static-method pattern as `AuditLogService`.
- Command palette search should use a server-side tRPC procedure for security, with debounced client-side calls.
- The fuzzy matching algorithm can be a simple substring + position-weighted scoring function (no need for fuse.js).
- Portal switcher role logic should derive from `$page.data.user.role` which is already available globally.
- Activity feed for admin context should query the existing `audit_log` table; for affiliate/account contexts, it should query relevant domain tables (orders, affiliate clicks, etc.).
- All dropdown/overlay components should use Svelte 5 `$effect` for click-outside handling.
- Breadcrumb route inference should use a static mapping object, not dynamic route parsing.

## Out of Scope

- Real-time/WebSocket notification push (polling or page-load fetch is sufficient for v1).
- Email notifications (handled by a separate track).
- Notification preferences/settings UI.
- Command palette actions (e.g., "Create product" from palette -- only navigation for v1).
- Multi-tenant or team-based notification scoping.
- Activity feed filtering or search.

## Open Questions

1. Should the command palette be available on storefront pages or only within portal layouts?
2. What is the desired notification retention period? (Suggest 90 days with automatic cleanup.)
3. Should the activity feed auto-refresh on an interval, or only refresh on page navigation?
