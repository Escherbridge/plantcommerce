# Specification: Account Dashboard & Customer Portal

## Overview

Replace the current standalone account pages with a unified dashboard experience using the PlatformShell component. All `/account/*` routes will share a consistent layout with sidebar navigation, authenticated data loading, and cohesive Aevani-themed styling. New pages (Overview Dashboard, Settings, Addresses) will be added alongside enhanced versions of the existing Profile, Orders, and Wishlist pages.

## Background

The existing account section has functional pages but no shared layout. The Profile page includes a hardcoded sidebar nav that is not reused by Orders or Wishlist. Each page creates its own tRPC client and handles auth independently. The PlatformShell component (from the `platform-shell_20260402` dependency) provides a consistent shell with sidebar navigation, header, and content area that should be used as the layout wrapper.

### Current State
- `/account/profile` -- well-designed profile page with custom CSS (profile-card pattern, stats, action buttons), hardcoded sidebar
- `/account/orders` -- order listing with status filter buttons, tRPC-loaded data
- `/account/wishlist` -- wishlist grid with product cards, add-to-cart and remove actions
- `/account/orders/[orderNumber]` -- order detail page
- No shared `/account/+layout.svelte` exists
- Auth is handled per-page via `requireAuth()` or manual redirect checks

### Database Context
- `user` table: id, username, email, firstName, lastName, avatarFileId, role, isActive, emailVerified, createdAt
- `order` table: orderNumber, userId, status (pending/confirmed/processing/shipped/delivered/cancelled/refunded), totalAmount, shippingAddress (JSON), billingAddress (JSON)
- `wishlistItem` table: userId, productId (unique per user)
- `cart`/`cartItem` tables for active carts
- No dedicated `address` table exists -- addresses are stored as JSON on orders

---

## Functional Requirements

### FR-1: Account Layout with PlatformShell
**Description:** Create a shared layout at `/account/+layout.svelte` that wraps all account routes in the PlatformShell component with account-specific navigation.
**Priority:** P0
**Acceptance Criteria:**
- Layout uses PlatformShell with sidebar navigation containing: Overview, Profile, Orders, Wishlist, Addresses, Settings
- Navigation highlights the active route
- Layout applies to all `/account/*` child routes
- Sidebar collapses to a mobile-friendly format on small screens
- User name and avatar (or initials fallback) displayed in sidebar header

### FR-2: Account Layout Server Loader
**Description:** Create a server-side layout loader that authenticates the user and loads shared account data for all child routes.
**Priority:** P0
**Acceptance Criteria:**
- `requireAuth()` check redirects unauthenticated users to `/login?redirect=/account`
- Loads user profile data (name, email, role, avatar, createdAt)
- Loads summary stats: total orders count, wishlist item count
- Data is available to all child pages via `$page.data` or parent data
- Child pages no longer need individual auth checks

### FR-3: Account Overview Dashboard
**Description:** Create a dashboard landing page at `/account` showing a welcome message, quick stats, recent activity, and action shortcuts.
**Priority:** P0
**Acceptance Criteria:**
- Welcome message displays user's first name (or username fallback)
- Stats cards show: Total Orders, Wishlist Items, Member Since (formatted date)
- Recent Orders section displays last 3 orders with status badge, date, and total
- Quick action buttons: Browse Products, View Wishlist, Edit Profile
- "Become an Affiliate" CTA card visible only for users with `role === 'customer'`
- Empty states for users with no orders

### FR-4: Enhanced Profile Page
**Description:** Refactor the existing profile page to work within the PlatformShell layout, removing its hardcoded sidebar while preserving the profile-card design patterns.
**Priority:** P1
**Acceptance Criteria:**
- Hardcoded sidebar navigation removed (now provided by layout)
- Personal information form with edit/save toggle preserved
- Password change form preserved
- Account stats card preserved (data from layout)
- Avatar upload placeholder area (circular, with camera icon overlay)
- Profile update submits via tRPC `users.updateProfile` procedure
- Password update submits via tRPC `auth.changePassword` procedure
- Form validation with inline error messages
- Success toast on save

### FR-5: Enhanced Orders Page
**Description:** Improve the orders listing with better filtering, styling consistent with the profile-card pattern, and proper empty states.
**Priority:** P1
**Acceptance Criteria:**
- Status filter tabs: All, Processing, Shipped, Delivered, Cancelled (using URL search params)
- Active filter tab visually highlighted
- Order cards display: order number, date, status badge (color-coded), item count, total amount
- Each order card links to `/account/orders/[orderNumber]`
- Track Order button for shipped/delivered orders
- Reorder button for delivered orders
- Empty state with SVG illustration and "Browse Products" CTA
- Styled using profile-card pattern from existing profile page

### FR-6: Enhanced Wishlist Page
**Description:** Improve the wishlist page with quick cart actions, remove functionality, and consistent card styling.
**Priority:** P1
**Acceptance Criteria:**
- Product cards in responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Each card shows: product image, name, price, stock status badge
- "Add to Cart" button per item (disabled if out of stock)
- "Remove" button per item with immediate UI update
- Add to cart calls tRPC `cart.addItem` and shows success toast
- Remove calls tRPC `users.removeFromWishlist` and shows success toast
- Empty state with heart SVG and "Browse Products" CTA
- Item count displayed in section header

### FR-7: Account Settings Page
**Description:** Create a new settings page at `/account/settings` for managing preferences.
**Priority:** P2
**Acceptance Criteria:**
- Email preferences section with toggles: Order updates, Promotions, Newsletter
- Notification settings section with toggles (placeholder -- UI only for now)
- Theme preference toggle: Light / Dark / System (saves to localStorage, applies via DaisyUI data-theme)
- Delete Account section with danger styling
- Delete Account button opens confirmation modal requiring email re-entry
- Delete Account calls tRPC procedure to deactivate account (soft delete via `isActive = false`)
- All toggle states persist (email prefs via tRPC, theme via localStorage)

### FR-8: Addresses Page
**Description:** Create an addresses management page at `/account/addresses` allowing users to view and manage saved addresses.
**Priority:** P2
**Acceptance Criteria:**
- Display addresses extracted from previous order shipping/billing addresses
- "Add New Address" form with fields: label, line1, line2, city, state, zip, country
- Edit existing address inline
- Delete address with confirmation
- Set default address toggle
- Addresses stored in a new `address` table (schema migration required)
- Address form validates required fields (line1, city, state, zip, country)

---

## Non-Functional Requirements

### NFR-1: Performance
- Layout server loader completes in under 200ms
- Dashboard page loads with all stats in under 500ms
- No layout shift when navigating between account sub-pages
- Skeleton loading states for async data sections

### NFR-2: Responsive Design
- All pages functional from 320px viewport width to desktop
- Touch targets minimum 44px on mobile
- Sidebar collapses to horizontal tabs or drawer on mobile (via PlatformShell)

### NFR-3: Accessibility
- All form inputs have associated labels
- Status badges use aria-label for screen readers
- Focus management on modal open/close
- Color is not the sole indicator of status (text labels accompany badges)

### NFR-4: Consistency
- All cards use the profile-card CSS pattern from the existing profile page
- Headers use `font-display uppercase tracking-tight`
- Buttons use `font-display uppercase tracking-wider`
- No emoji anywhere -- inline SVGs only
- Aevani theme CSS variables used throughout (oklch color functions)

---

## User Stories

### US-1: Customer views account dashboard
**As** a logged-in customer
**I want** to see an overview of my account activity
**So that** I can quickly check my recent orders and navigate to account features

**Scenarios:**
- **Given** I am logged in and navigate to `/account`, **When** the page loads, **Then** I see a welcome message with my name, stats cards, and recent orders
- **Given** I have no orders, **When** I view the dashboard, **Then** I see a friendly empty state with a "Browse Products" button
- **Given** I am a customer (not affiliate), **When** I view the dashboard, **Then** I see a "Become an Affiliate" CTA card

### US-2: Customer manages profile
**As** a logged-in customer
**I want** to update my personal information
**So that** my account details stay current

**Scenarios:**
- **Given** I am on the profile page, **When** I click Edit, **Then** form fields become editable
- **Given** I have edited my name, **When** I click Save, **Then** changes persist and I see a success toast
- **Given** I enter a wrong current password, **When** I submit the password form, **Then** I see an error message

### US-3: Customer browses orders with filters
**As** a customer with order history
**I want** to filter my orders by status
**So that** I can find specific orders quickly

**Scenarios:**
- **Given** I have orders in multiple statuses, **When** I click the "Shipped" tab, **Then** only shipped orders are displayed
- **Given** I click "All", **When** the page updates, **Then** all orders are shown

### US-4: Customer manages wishlist
**As** a customer
**I want** to add wishlist items to my cart or remove them
**So that** I can purchase saved items when ready

**Scenarios:**
- **Given** I have items in my wishlist, **When** I click "Add to Cart" on an in-stock item, **Then** it is added to my cart and I see a success toast
- **Given** I want to remove an item, **When** I click the remove button, **Then** it disappears from the list immediately

### US-5: Customer manages addresses
**As** a repeat customer
**I want** to save shipping addresses
**So that** checkout is faster on future orders

**Scenarios:**
- **Given** I have past orders, **When** I visit the addresses page, **Then** I see addresses from my order history
- **Given** I add a new address, **When** I fill the form and submit, **Then** the address is saved and appears in my list

### US-6: Customer manages account settings
**As** a customer
**I want** to control my notification preferences and theme
**So that** I have a personalized experience

**Scenarios:**
- **Given** I am on the settings page, **When** I toggle dark mode, **Then** the theme changes immediately
- **Given** I want to delete my account, **When** I confirm with my email, **Then** my account is deactivated

---

## Technical Considerations

- **Dependency:** This track depends on `platform-shell_20260402` for the PlatformShell component. If PlatformShell is not yet available, Phase 1 should create a minimal layout wrapper that can be swapped later.
- **Schema Migration:** FR-8 (Addresses) requires a new `address` table. This should be a Drizzle migration.
- **tRPC Procedures Needed:**
  - `users.updateProfile` -- update firstName, lastName, email
  - `users.getAccountStats` -- return order count, wishlist count, member since
  - `users.getDashboardData` -- return recent orders (limit 3), stats
  - `auth.changePassword` -- validate current password, update hash
  - `users.deactivateAccount` -- soft delete (set isActive = false)
  - `addresses.list` / `addresses.create` / `addresses.update` / `addresses.delete`
- **Existing tRPC:** `orders.getUserOrders`, `users.getWishlist`, `cart.addItem`, `users.removeFromWishlist` already exist
- **Theme:** DaisyUI data-theme attribute on `<html>` element, stored in localStorage

## Out of Scope

- Payment methods management (Stripe Customer Portal handles this)
- Order returns/refunds workflow
- Avatar image upload (placeholder only -- requires file upload integration)
- Email preference backend (toggles are UI-only until email infrastructure track)
- Two-factor authentication settings
- Social account linking UI

## Open Questions

1. Should the address table support a "default" flag, or should the most recently used address be auto-selected at checkout?
2. Should the "Become an Affiliate" CTA link to `/affiliate/join` or open an inline application form?
3. For the Settings page theme toggle, should the preference sync to the server (user preferences table) or remain localStorage-only?
