# Implementation Plan: Affiliate Portal Layout & Enhancement

## Overview

Six phases covering: shared layout with PlatformShell, dashboard enhancements, links page enhancements, earnings page enhancements, materials page enhancements, and the new settings page. Each phase ends with a verification checkpoint.

**Dependency:** `platform-shell_20260402` must be complete before Phase 1 begins (PlatformShell component required).

**Estimated Duration:** 5-6 weeks (6 phases, ~35 tasks)

---

## Phase 1: Shared Affiliate Layout

**Goal:** Wrap all affiliate routes in PlatformShell with sidebar navigation, mini-stats widget, and centralized auth.

### Task 1.1: Create affiliate navigation config
- [ ] Write test: Unit test for `affiliateNavigation` array -- verify it exports 5 items (Dashboard, Links, Earnings, Materials, Settings) each with `label`, `href`, `icon` (SVG string)
- [ ] Implement: Create `src/lib/config/affiliateNavigation.ts` with the navigation config array
- [ ] Verify: Test passes, TypeScript compiles

### Task 1.2: Create layout loader with centralized auth
- [ ] Write test: Integration test for `+layout.ts` -- verify it calls `requireAffiliate()`, fetches affiliate profile and mini-stats via tRPC, redirects non-affiliates to `/affiliate/join`
- [ ] Implement: Create `src/routes/affiliate/+layout.ts` -- call `requireAffiliate()`, fetch `getMyAffiliate` and `getStats`, return data; handle redirect for non-affiliates
- [ ] Verify: Test passes

### Task 1.3: Create affiliate layout component
- [ ] Write test: Component test -- verify PlatformShell renders with sidebar containing 5 nav items, mini-stats widget shows earnings and pending values, active route is highlighted
- [ ] Implement: Create `src/routes/affiliate/+layout.svelte` -- use PlatformShell with `affiliateNavigation`, add mini-stats widget in sidebar slot, render `{@render children()}` in content area
- [ ] Verify: Test passes, layout renders in dev server

### Task 1.4: Remove redundant auth from child page loaders
- [ ] Write test: Verify each child loader (`dashboard/+page.ts`, `links/+page.ts`, `earnings/+page.ts`, `materials/+page.ts`) no longer calls `requireAffiliate()` directly
- [ ] Implement: Remove `requireAffiliate()` calls from all 4 child page loaders; remove unused imports; adjust data loading to rely on parent layout data where appropriate
- [ ] Verify: All pages still load correctly, auth still enforced via layout

### Task 1.5: Verification checkpoint
- [ ] Manual: Navigate to each affiliate page as an affiliate user -- sidebar appears, correct nav item highlighted
- [ ] Manual: Visit `/affiliate/dashboard` as non-affiliate -- redirected to `/affiliate/join`
- [ ] Manual: Mini-stats widget shows earnings this month and pending payout
- [ ] Manual: Responsive -- sidebar collapses on mobile
- [ ] Verify: All existing tests pass, no TypeScript errors [checkpoint marker]

---

## Phase 2: Enhanced Dashboard

**Goal:** Add period selector, trend indicators, CSS sparklines, top links table, and commission tier progress.

### Task 2.1: Add period-based stats tRPC procedure
- [ ] Write test: Integration test for `affiliate.getStatsByPeriod` -- accepts `period` enum (7d, 30d, 90d, all), returns stats with `current` and `previous` period data for trend calculation
- [ ] Implement: Add `getStatsByPeriod` to `src/lib/server/api/affiliate.ts` -- query affiliate clicks/conversions/earnings filtered by date range; compute previous period for comparison
- [ ] Verify: Test passes with various period values

### Task 2.2: Add top performing links tRPC procedure
- [ ] Write test: Integration test for `affiliate.getTopLinks` -- accepts `limit` (default 5), returns links sorted by earnings descending with product name
- [ ] Implement: Add `getTopLinks` to affiliate router -- join affiliateLink with product, order by earnings desc, limit
- [ ] Verify: Test passes

### Task 2.3: Implement period selector UI
- [ ] Write test: Component test -- verify 4 period buttons render, clicking one updates active state, triggers data refetch
- [ ] Implement: Add period selector to dashboard page -- `$state` for selected period, buttons with active styling, refetch stats via tRPC on period change
- [ ] Verify: Test passes

### Task 2.4: Implement trend indicators and CSS sparklines
- [ ] Write test: Component test for `TrendIndicator` -- given current=100 and previous=80, renders up arrow with "+25.0%"; given current=60 and previous=80, renders down arrow with "-25.0%"
- [ ] Implement: Create `TrendIndicator.svelte` component (inline SVG arrows, green for up, red for down); create `CssSparkline.svelte` component (7 `div` bars with percentage heights); integrate both into dashboard stat cards
- [ ] Verify: Tests pass

### Task 2.5: Implement top links table and commission tier progress
- [ ] Write test: Component test -- top links table renders 5 rows with product, clicks, conversions, earnings columns; tier progress bar shows current tier name and fill percentage
- [ ] Implement: Add top performing links table below stat cards; add `CommissionTierProgress.svelte` component -- calculates tier based on monthly earnings (Base < $500, Silver < $2000, Gold >= $2000), shows progress bar toward next tier
- [ ] Verify: Tests pass

### Task 2.6: Update dashboard page loader
- [ ] Write test: Verify dashboard loader fetches period-based stats and top links
- [ ] Implement: Update `dashboard/+page.ts` to use `getStatsByPeriod` (default 30d) and `getTopLinks`; pass data to page
- [ ] Verify: Test passes

### Task 2.7: Verification checkpoint
- [ ] Manual: Dashboard loads with 30d selected by default, stats cards show values
- [ ] Manual: Switch to 7d -- stats update without page reload
- [ ] Manual: Trend arrows appear (up/down) with correct percentage
- [ ] Manual: Top links table shows top 5 links by earnings
- [ ] Manual: Commission tier progress bar fills correctly based on monthly earnings
- [ ] Verify: All tests pass, svelte-check clean [checkpoint marker]

---

## Phase 3: Enhanced Links Page

**Goal:** Add searchable/sortable table, copy-with-toast, and link status toggling.

### Task 3.1: Create Toast component
- [ ] Write test: Component test -- toast appears with message, auto-dismisses after 3 seconds, supports success/error variants
- [ ] Implement: Create `src/lib/components/ui/Toast.svelte` -- uses DaisyUI toast classes, manages a reactive toast queue via a shared store; create `src/lib/stores/toast.ts` with `addToast(message, type)` function
- [ ] Verify: Test passes

### Task 3.2: Implement sortable table headers
- [ ] Write test: Component test -- clicking "Earnings" header sorts links descending; clicking again sorts ascending; sort indicator SVG appears on active column
- [ ] Implement: Add `$state` for `sortColumn` and `sortDirection` to links page; create `$derived` sorted/filtered links array; render clickable table headers with sort indicator SVG
- [ ] Verify: Test passes

### Task 3.3: Implement search/filter
- [ ] Write test: Component test -- typing "hydro" in search input filters links to those matching product name or custom slug
- [ ] Implement: Add search input above table; create `$derived` filtered links using case-insensitive string match on product name and customSlug
- [ ] Verify: Test passes

### Task 3.4: Implement copy-with-toast and status toggle
- [ ] Write test: Component test -- clicking copy button calls clipboard API and shows toast; toggling status calls `toggleLinkStatus` tRPC mutation and updates UI
- [ ] Implement: Wire copy button to `navigator.clipboard.writeText()` + `addToast()`; wire status toggle button to `trpc().affiliate.toggleLinkStatus.mutate()` with optimistic UI update; inactive links get `opacity-50` and "Inactive" badge
- [ ] Verify: Tests pass

### Task 3.5: Verification checkpoint
- [ ] Manual: Create a new link -- toast confirms creation
- [ ] Manual: Copy a link URL -- toast says "Link copied to clipboard"
- [ ] Manual: Search for a product name -- table filters correctly
- [ ] Manual: Click "Earnings" header -- table sorts by earnings
- [ ] Manual: Toggle a link inactive -- opacity reduces, badge shows "Inactive"
- [ ] Verify: All tests pass [checkpoint marker]

---

## Phase 4: Enhanced Earnings Page

**Goal:** Add date range filter, improved summary cards, payout status, and CSV export.

### Task 4.1: Add date-range earnings tRPC procedure
- [ ] Write test: Integration test for `affiliate.getEarningsByDateRange` -- accepts `startDate` and `endDate`, returns filtered earnings history with payout status
- [ ] Implement: Add `getEarningsByDateRange` to affiliate router -- query orders with affiliate attribution within date range, join with product for name, return commission data with status
- [ ] Verify: Test passes

### Task 4.2: Implement enhanced summary cards
- [ ] Write test: Component test -- four cards render: This Month, Last Month, All Time, Pending Payout with correct values and `text-success` styling
- [ ] Implement: Update earnings page to show 4 stat cards in a 4-column grid; compute last month from earnings data; use layout data for pending payout
- [ ] Verify: Test passes

### Task 4.3: Implement date range filter
- [ ] Write test: Component test -- setting start and end date inputs triggers data refetch; table updates to show only earnings within range
- [ ] Implement: Add date inputs above earnings table; on change, call `getEarningsByDateRange` via tRPC; update table reactively
- [ ] Verify: Test passes

### Task 4.4: Implement CSV export
- [ ] Write test: Unit test for `exportEarningsCsv(data)` utility -- given earnings array, returns valid CSV string with header row and data rows; handles empty array gracefully
- [ ] Implement: Create `src/lib/utils/csvExport.ts` with `exportEarningsCsv()` function; create `downloadCsv(csvString, filename)` that creates Blob and triggers download; wire "Export CSV" button on earnings page; show toast "No data to export" if empty
- [ ] Verify: Tests pass

### Task 4.5: Verification checkpoint
- [ ] Manual: Earnings page shows 4 summary cards with correct values
- [ ] Manual: Set date range -- table filters to matching earnings
- [ ] Manual: Click "Export CSV" -- downloads file with correct data
- [ ] Manual: Click "Export CSV" with no data -- toast shows "No data to export"
- [ ] Manual: Payout status badges display correctly (Paid/Pending/Processing)
- [ ] Verify: All tests pass [checkpoint marker]

---

## Phase 5: Enhanced Materials Page

**Goal:** Add category tabs, preview/copy functionality, and product-specific promotional content.

### Task 5.1: Implement category tabs
- [ ] Write test: Component test -- 4 tabs render (Banners, Social Posts, Email Templates, Brand Guidelines); clicking a tab shows its content and hides others; default tab is Banners
- [ ] Implement: Refactor materials page to use DaisyUI tabs component; `$state` for `activeTab`; conditionally render content sections based on active tab
- [ ] Verify: Test passes

### Task 5.2: Enhance banner and social post sections
- [ ] Write test: Component test -- banner cards show size/format badges and download button; social post cards show full text with copy button; copy triggers toast
- [ ] Implement: Update banner cards with preview placeholder (colored div with dimensions text); update social post cards with prominent copy button wired to clipboard + toast
- [ ] Verify: Tests pass

### Task 5.3: Add product-specific promotional content
- [ ] Write test: Component test -- product selector dropdown renders products; selecting a product shows tailored promotional text snippets
- [ ] Implement: Add product selector at top of materials page; when product selected, show suggested social captions and link text; "Copy" button with toast for each snippet
- [ ] Verify: Test passes

### Task 5.4: Verification checkpoint
- [ ] Manual: Tabs switch correctly between categories
- [ ] Manual: Copy social post text -- toast confirms
- [ ] Manual: Select a product -- product-specific content appears
- [ ] Manual: All existing material sections render correctly
- [ ] Verify: All tests pass [checkpoint marker]

---

## Phase 6: Affiliate Settings Page

**Goal:** New settings page for payment preferences, notification settings, and public profile.

### Task 6.1: Add affiliate settings schema and tRPC procedures
- [ ] Write test: Integration tests for `getAffiliateSettings` and `updateAffiliateSettings` -- verify default settings returned for new affiliates; verify update persists changes
- [ ] Implement: Add `affiliateSettings` columns to `affiliate` table (or create `affiliateSettings` table) with fields: `paymentMethod` (enum: paypal, bank_transfer), `paymentEmail`, `notifyEarnings` (boolean), `notifyConversions` (boolean), `notifyMonthlySummary` (boolean), `displayName`, `bio`, `websiteUrl`; add tRPC procedures; run DB migration
- [ ] Verify: Tests pass, migration applies cleanly

### Task 6.2: Create settings page layout
- [ ] Write test: Component test -- settings page renders three sections: Payment Method, Notifications, Profile; save button exists
- [ ] Implement: Create `src/routes/affiliate/settings/+page.svelte` with three card sections; create `src/routes/affiliate/settings/+page.ts` loader calling `getAffiliateSettings`
- [ ] Verify: Test passes

### Task 6.3: Implement payment method form
- [ ] Write test: Component test -- radio buttons for PayPal/Bank Transfer; selecting PayPal shows email input; form validates email format
- [ ] Implement: Payment method radio group with conditional email input; bind to `$state` variables; Zod validation on submit
- [ ] Verify: Test passes

### Task 6.4: Implement notifications and profile forms
- [ ] Write test: Component test -- three toggle switches render for notification preferences; profile fields (display name, bio, website) render with current values; save button triggers mutation
- [ ] Implement: DaisyUI toggle components for notifications; text inputs for profile; wire save button to `updateAffiliateSettings` mutation with loading state and success toast
- [ ] Verify: Tests pass

### Task 6.5: Verification checkpoint
- [ ] Manual: Navigate to Settings via sidebar -- page loads with current settings
- [ ] Manual: Change payment method to PayPal, enter email, save -- toast confirms
- [ ] Manual: Toggle notification preferences, save -- values persist on reload
- [ ] Manual: Update profile fields, save -- values persist on reload
- [ ] Manual: Responsive layout on mobile
- [ ] Verify: All tests pass, full test suite green, svelte-check clean [checkpoint marker]
