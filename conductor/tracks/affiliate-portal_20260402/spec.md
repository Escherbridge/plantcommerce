# Specification: Affiliate Portal Layout & Enhancement

## Overview

Create a comprehensive affiliate portal using the PlatformShell component from the `platform-shell_20260402` track. Introduce a shared layout for all `/affiliate/*` routes with sidebar navigation and mini-stats, then enhance each existing page with richer data visualization, filtering, sorting, and export capabilities. Add a new settings page for payment and notification preferences.

## Background

The affiliate section currently has five standalone pages (dashboard, links, earnings, materials, join) that each import their own `Container`/`Section` wrappers and call `requireAffiliate()` independently. There is no shared layout, no sidebar navigation, and no visual cohesion between pages. The pages display basic data with minimal interactivity -- no period selectors, no sorting, no search, no CSV export, and no inline charts.

The `platform-shell_20260402` track will deliver a `PlatformShell` component that provides a responsive sidebar + content shell for authenticated portal sections. This track depends on that component being available.

## Functional Requirements

### FR-1: Shared Affiliate Layout
**Priority:** P0
**Description:** Create `src/routes/affiliate/+layout.svelte` that wraps all affiliate child routes in the PlatformShell component with affiliate-specific navigation configuration.

**Acceptance Criteria:**
- Layout uses PlatformShell with an `affiliateNavigation` config array
- Navigation items: Dashboard, Links, Earnings, Materials, Settings
- Each nav item uses an inline SVG icon (no emoji)
- Sidebar displays a mini-stats widget showing: earnings this month, pending payout
- Mini-stats data is loaded once at the layout level and available to child pages
- `requireAffiliate()` auth check is performed at the layout level, removing it from individual page loaders
- Non-affiliate users visiting any `/affiliate/*` route (except `/affiliate/join`) are redirected to `/affiliate/join`
- Layout loader (`+layout.ts`) fetches affiliate profile and mini-stats via tRPC
- Active nav item is visually highlighted based on current route

### FR-2: Enhanced Dashboard
**Priority:** P0
**Description:** Improve the existing dashboard page with period-based filtering, trend indicators, top-performing links, and commission tier progress.

**Acceptance Criteria:**
- Period selector buttons: 7d, 30d, 90d, All Time (default: 30d)
- Stats cards update reactively when period changes
- Each stat card shows a trend indicator (up/down arrow with percentage vs previous period) using inline SVG
- Pure CSS sparkline bars beneath each stat card showing last 7 data points
- Top performing links table (top 5 by earnings) with columns: Product, Clicks, Conversions, Earnings
- Commission tier progress indicator showing: current tier, earnings toward next tier, progress bar
  - Tiers: Base (8%), Silver ($500/mo, 12%), Gold ($2000/mo, 16%)
- Quick actions section retained but streamlined
- Affiliate code and commission rate cards retained
- Recent activity table retained with improved empty state

### FR-3: Enhanced Links Page
**Priority:** P0
**Description:** Improve link management with better creation flow, searchable/sortable table, copy with toast, and status toggling.

**Acceptance Criteria:**
- Create link form includes a product search/select dropdown with product names
- Custom slug field retained
- On link creation, a toast notification confirms success with the generated URL
- Link table columns: Product, Link URL (truncated), Clicks, Conversions, Earnings, Status, Actions
- Table supports client-side sorting by clicking column headers (clicks, conversions, earnings)
- Search input filters links by product name or custom slug
- Copy button on each link triggers a toast notification "Link copied to clipboard"
- Status toggle (active/inactive) per link using the existing `toggleLinkStatus` tRPC procedure
- Inactive links shown with reduced opacity and "Inactive" badge
- Link best practices card retained

### FR-4: Enhanced Earnings Page
**Priority:** P1
**Description:** Richer earnings view with summary cards, date range filter, payout status, and CSV export.

**Acceptance Criteria:**
- Four summary cards: This Month, Last Month, All Time, Pending Payout
- Each card uses success color (`text-success`) for monetary values
- Earnings history table with date range filter (start date, end date inputs)
- Payout status indicators: Paid (success badge), Pending (warning badge), Processing (ghost badge)
- "Export CSV" button downloads filtered earnings data as CSV file
- CSV includes columns: Date, Order ID, Product, Sale Amount, Commission Rate, Commission Earned, Status
- Payment method section and payment schedule section retained
- New tRPC procedures needed: `getEarningsByDateRange` with start/end date inputs

### FR-5: Enhanced Materials Page
**Priority:** P1
**Description:** Better organized marketing resource library with category tabs, preview, and copy functionality.

**Acceptance Criteria:**
- Category tabs: Banners, Social Posts, Email Templates, Brand Guidelines
- Active tab content shown, others hidden (client-side tab switching)
- Banner cards show image preview placeholder (dimensions badge) and download button
- Social post cards show full text with a "Copy" button and toast confirmation
- Email template cards show subject line and preview text with "Copy Template" and "View Full" buttons
- Brand guidelines section shows color swatches and do/don't rules
- Product-specific section: select a product to see promotional content tailored to it
- All copy operations trigger toast notification

### FR-6: Affiliate Settings Page
**Priority:** P1
**Description:** New page at `/affiliate/settings` for affiliate profile and preferences.

**Acceptance Criteria:**
- Payment method preferences form: PayPal email or bank transfer selection
- Notification preferences: toggles for earnings notifications, conversion alerts, monthly summary email
- Public profile settings: display name, bio text, website URL
- Save button with loading state and success toast
- New tRPC procedures: `getAffiliateSettings`, `updateAffiliateSettings`
- New DB columns or table needed for affiliate preferences (payment method, notifications, profile)

## Non-Functional Requirements

### NFR-1: Performance
- Layout-level data fetching should not add more than 100ms to page load
- Period selector on dashboard should update stats without full page reload (client-side fetch)
- CSV export should handle up to 10,000 rows without freezing the UI

### NFR-2: Accessibility
- All interactive elements must be keyboard navigable
- SVG icons must have appropriate `aria-label` or `aria-hidden="true"` attributes
- Color alone must not convey status -- always pair with text labels or badges
- Lighthouse accessibility score > 95

### NFR-3: Responsive Design
- Sidebar collapses on mobile (handled by PlatformShell)
- Stats cards stack to 2-column on tablet, 1-column on mobile
- Tables scroll horizontally on mobile with sticky first column
- Minimum supported width: 320px

### NFR-4: Style Consistency
- Aevani theme CSS variables throughout
- No emoji anywhere -- inline SVGs only
- `font-display uppercase tracking-tight` for all headings
- `font-mono text-xs uppercase tracking-widest` for table headers and labels
- Success/earnings values use `text-success`
- Cards use `bg-base-100 shadow-xl rounded-3xl border border-base-200/30` pattern

## User Stories

### US-1: Affiliate navigates between portal sections
**As** an affiliate user,
**I want** a persistent sidebar navigation across all affiliate pages,
**So that** I can quickly move between dashboard, links, earnings, materials, and settings.

**Scenarios:**
- **Given** I am logged in as an affiliate, **When** I visit `/affiliate/dashboard`, **Then** I see the PlatformShell sidebar with all nav items and Dashboard highlighted
- **Given** I am logged in as a non-affiliate, **When** I visit `/affiliate/dashboard`, **Then** I am redirected to `/affiliate/join`
- **Given** I am on the dashboard, **When** I click "Earnings" in the sidebar, **Then** I navigate to `/affiliate/earnings` and the sidebar highlights Earnings

### US-2: Affiliate views dashboard with period filtering
**As** an affiliate,
**I want** to filter my dashboard stats by time period,
**So that** I can understand my recent vs long-term performance.

**Scenarios:**
- **Given** I am on the dashboard, **When** I click "7d", **Then** stats cards update to show only last 7 days data
- **Given** I am viewing 7d stats, **When** I click "All Time", **Then** stats revert to all-time totals
- **Given** I have conversions in the last 30 days, **When** I view the 30d dashboard, **Then** I see trend arrows comparing to the prior 30 days

### US-3: Affiliate manages links
**As** an affiliate,
**I want** to search, sort, and toggle my affiliate links,
**So that** I can manage my promotional campaigns efficiently.

**Scenarios:**
- **Given** I have 20 links, **When** I type "hydro" in the search box, **Then** only links for hydroponic products appear
- **Given** I am viewing the links table, **When** I click the "Earnings" column header, **Then** links sort by earnings descending
- **Given** a link is active, **When** I toggle its status, **Then** it shows as "Inactive" with reduced opacity

### US-4: Affiliate exports earnings
**As** an affiliate,
**I want** to export my earnings data as CSV,
**So that** I can use it for tax reporting or personal records.

**Scenarios:**
- **Given** I have filtered earnings to January 2026, **When** I click "Export CSV", **Then** a CSV file downloads with only January 2026 data
- **Given** I have no earnings in the selected range, **When** I click "Export CSV", **Then** nothing downloads and I see a toast "No data to export"

## Technical Considerations

- **Dependency:** Requires `platform-shell_20260402` to be complete (PlatformShell component must exist)
- **Layout migration:** Moving `requireAffiliate()` to the layout level means removing it from all 4 child page loaders
- **tRPC additions:** New procedures needed for period-based stats, date-range earnings, settings CRUD
- **DB schema changes:** May need `affiliateSettings` table or additional columns on `affiliate` table for payment preferences, notification settings, and profile fields
- **Toast component:** Assumes a toast/notification component exists or will be created (could use DaisyUI toast pattern)
- **CSV generation:** Client-side using Blob and URL.createObjectURL -- no server-side rendering needed
- **Sparklines:** Pure CSS bar charts using `div` elements with percentage heights -- no charting library needed

## Out of Scope

- Real payment processing / payout execution (PayPal API, Stripe Connect)
- Email notification delivery infrastructure (just preference storage)
- Advanced analytics charts (line charts, pie charts) requiring charting libraries
- Affiliate-to-affiliate referral / sub-affiliate system
- A/B testing of marketing materials
- Real-time WebSocket updates for click/conversion events

## Open Questions

1. Should the mini-stats widget in the sidebar show a "View Dashboard" link or is the Dashboard nav item sufficient?
2. What is the minimum payout threshold -- the earnings page currently says $50, confirm this is correct.
3. Should the settings page allow affiliates to change their affiliate code, or is it immutable after creation?
4. Should inactive links still track clicks (but not attribute), or completely stop tracking?
5. Is there a maximum number of affiliate links per affiliate that should be enforced?
