# Specification: Mobile & Checkout Optimization

## Overview

Transform the Aevani storefront into a mobile-first shopping experience and integrate Stripe Express Checkout Element (Apple Pay, Google Pay, Link) for one-tap purchasing. This track retrofits existing pages (product detail, cart, checkout) with responsive layouts, touch-optimized interactions, and perceived-performance patterns, while adding a client-side Stripe payment path alongside the existing hosted Checkout redirect.

## Background

The Aevani storefront has functional product detail, cart, and checkout pages, but they were built desktop-first. The current checkout flow uses Stripe hosted Checkout (redirect), established in the `transaction-core` track. Existing components include a `Carousel` with touch/swipe support, an `ImageGallery` with lightbox, a `MultiStepForm` with step progress, and layout primitives (`Container`, `Section`, `Grid`). The Header component has a mobile hamburger menu and drawer navigation in the root layout, but cart item count is hardcoded to `0`. The cart page uses a `lg:grid-cols-3` layout that stacks on mobile but is not optimized for small screens (tiny tap targets, no swipe-to-delete, quantity controls are cramped). The checkout page uses `export let` (Svelte 4 syntax) and displays all form fields at once with no progressive disclosure.

### Current State

- **Product detail page** (`/products/mock-detail`): Desktop-oriented grid, `Carousel` component for images (already has swipe), quantity controls work but are small, no sticky "Add to Cart" on mobile.
- **Cart page** (`/cart`): Desktop grid layout, quantity controls use `btn-sm` (small touch targets), "Recently Viewed" grid is `grid-cols-4` on all screens, cart functions are stubbed.
- **Checkout page** (`/checkout`): Uses Svelte 4 `export let` syntax, shows all shipping/billing fields at once, payment section is a placeholder. Transaction-core track will wire Stripe hosted Checkout here.
- **Header**: Cart count badge exists but is hardcoded `0`. Mobile drawer exists but does not show cart.
- **Theming**: Uses hardcoded color values (`#1D3557`, `#E63946`, `#A8DADC`, `#F1FAEE`, `#457B9D`). No DaisyUI theme configuration. Custom CSS in `<style>` blocks rather than Tailwind utilities.
- **No skeleton screens or loading states** exist anywhere in the app.

### Dependencies

- **transaction-core track** must be complete first: provides working Stripe integration, wired cart tRPC mutations, real product data, and `stripeSessionId`/`stripePaymentIntentId` columns on orders.
- **@stripe/stripe-js** npm package will be needed for Express Checkout Element (client-side Stripe).

## Functional Requirements

### FR-1: Mobile-First Responsive Product Detail Page
**Description:** Refactor the product detail page to use a mobile-first responsive layout that works well from 320px to 1440px. The image gallery should be full-width on mobile with swipe navigation, and product info should stack below.
**Priority:** P0
**Acceptance Criteria:**
- AC-1.1: At 320px-767px (mobile), the product image carousel is full-bleed (edge-to-edge), product info stacks below, and all text is readable without horizontal scrolling.
- AC-1.2: At 768px-1023px (tablet), the layout shifts to a 2-column grid with image and info side by side.
- AC-1.3: At 1024px+ (desktop), the existing 2-column layout is preserved with larger spacing.
- AC-1.4: Thumbnail images below the carousel are 4 columns on desktop, horizontally scrollable on mobile.
- AC-1.5: Product name uses responsive font sizing (`text-2xl` on mobile, scaling to `text-5xl` on desktop).

### FR-2: Touch-Friendly Quantity Controls
**Description:** Replace small quantity buttons with touch-optimized controls that meet minimum 44x44px tap target guidelines across all pages (product detail, cart).
**Priority:** P0
**Acceptance Criteria:**
- AC-2.1: Quantity increment/decrement buttons are at minimum 44px x 44px on mobile.
- AC-2.2: The quantity input field is large enough to tap and edit directly on mobile (min-height 44px).
- AC-2.3: Buttons provide visual feedback on touch (active state scale/color change).
- AC-2.4: Long-press on +/- buttons does not trigger unintended behavior (no accidental zoom or context menu).

### FR-3: Sticky "Add to Cart" on Mobile
**Description:** On mobile viewports, display a sticky bottom bar on the product detail page containing the price and "Add to Cart" button, visible as the user scrolls.
**Priority:** P0
**Acceptance Criteria:**
- AC-3.1: On viewports below 768px, a fixed bottom bar appears containing the product price and an "Add to Cart" button.
- AC-3.2: The sticky bar only appears after the user scrolls past the inline "Add to Cart" button (using Intersection Observer).
- AC-3.3: The sticky bar has sufficient padding to avoid overlap with mobile browser chrome and safe areas (`env(safe-area-inset-bottom)`).
- AC-3.4: The sticky bar is hidden on desktop viewports (768px+).
- AC-3.5: Tapping "Add to Cart" in the sticky bar triggers the same add-to-cart logic as the inline button.

### FR-4: Mobile-Optimized Cart Page
**Description:** Redesign the cart page for mobile with stacked item cards, larger touch targets, swipe-to-reveal delete, and a responsive order summary.
**Priority:** P0
**Acceptance Criteria:**
- AC-4.1: On mobile, cart items display as full-width stacked cards with product image, name, price, and quantity controls in a comfortable layout.
- AC-4.2: Quantity controls meet the 44px minimum tap target requirement.
- AC-4.3: Order summary moves from a sidebar (desktop) to a sticky bottom bar or expandable section on mobile.
- AC-4.4: "Recently Viewed" section uses a horizontal scroll on mobile instead of a 4-column grid.
- AC-4.5: Empty cart state is centered and uses appropriate sizing for mobile screens.
- AC-4.6: "Proceed to Checkout" button is full-width and prominently positioned on mobile.

### FR-5: Cart Item Count Badge in Navigation
**Description:** Display a live cart item count badge in the Header navigation that updates when items are added, removed, or quantities change.
**Priority:** P0
**Acceptance Criteria:**
- AC-5.1: The header cart icon shows a badge with the current number of items in the cart.
- AC-5.2: The badge updates in real time when items are added from the product detail page.
- AC-5.3: The badge updates when quantities change or items are removed on the cart page.
- AC-5.4: The badge is hidden when the cart is empty (count is 0).
- AC-5.5: The cart count state is managed via a Svelte store or rune-based reactive state accessible across components.

### FR-6: Progressive Disclosure Checkout Flow
**Description:** Refactor the checkout page to use progressive disclosure with collapsible sections (accordion or multi-step) so users see one section at a time on mobile, reducing cognitive load.
**Priority:** P1
**Acceptance Criteria:**
- AC-6.1: Checkout form is divided into sections: Contact, Shipping Address, Billing Address, Payment.
- AC-6.2: On mobile, only the current section is expanded; completed sections collapse to show a summary.
- AC-6.3: On desktop, the existing side-by-side layout with the order summary is preserved.
- AC-6.4: Users can navigate back to edit completed sections.
- AC-6.5: The checkout page is migrated from Svelte 4 `export let` syntax to Svelte 5 runes (`$props`, `$state`, `$derived`).
- AC-6.6: Form validation errors display inline within the active section.

### FR-7: Stripe Express Checkout Element
**Description:** Integrate Stripe Express Checkout Element to offer Apple Pay, Google Pay, and Link as one-tap payment options on the checkout page, alongside the existing hosted Checkout flow.
**Priority:** P1
**Acceptance Criteria:**
- AC-7.1: `@stripe/stripe-js` npm package is installed and Stripe.js is loaded on the checkout page.
- AC-7.2: A server endpoint creates a Stripe PaymentIntent with the cart total and returns the `clientSecret`.
- AC-7.3: The Express Checkout Element renders available wallet buttons (Apple Pay, Google Pay, Link) based on the user's browser/device capabilities.
- AC-7.4: If no express checkout methods are available (e.g., desktop Chrome without Google Pay configured), the element gracefully hides itself and the standard checkout form remains.
- AC-7.5: Clicking an express checkout button collects shipping address from the wallet, confirms the PaymentIntent, and creates the order server-side.
- AC-7.6: After successful express payment, the user is redirected to the order confirmation page.
- AC-7.7: Express Checkout is also shown on the cart page as a "Buy Now" shortcut.
- AC-7.8: The Express Checkout Element uses the Aevani brand colors (dark blue `#1D3557` background variant) for visual consistency.

### FR-8: Responsive Product Image Gallery with Swipe
**Description:** Enhance the existing Carousel component for a better mobile product image experience with pinch-to-zoom and full-screen viewing.
**Priority:** P1
**Acceptance Criteria:**
- AC-8.1: Product images are swipeable on touch devices (existing Carousel already supports this).
- AC-8.2: Tapping an image on mobile opens a full-screen lightbox overlay.
- AC-8.3: In the lightbox, swipe left/right navigates between images.
- AC-8.4: Image counter ("2 / 4") is displayed on the carousel on mobile.
- AC-8.5: Images use responsive `srcset`/`sizes` attributes when available for performance.

### FR-9: Address Autocomplete
**Description:** Integrate an address autocomplete service (Google Places Autocomplete or a similar provider) into the shipping and billing address forms to reduce manual entry on mobile.
**Priority:** P2
**Acceptance Criteria:**
- AC-9.1: The "Address" input field on the checkout form triggers autocomplete suggestions as the user types.
- AC-9.2: Selecting a suggestion auto-fills city, state, postal code, and country fields.
- AC-9.3: Autocomplete works on both mobile and desktop.
- AC-9.4: The integration degrades gracefully if the API key is not configured (manual entry still works).
- AC-9.5: A configurable environment variable (`PUBLIC_GOOGLE_PLACES_API_KEY`) controls the API key.

### FR-10: Loading States and Skeleton Screens
**Description:** Add skeleton loading screens and loading states for key mobile interactions to improve perceived performance.
**Priority:** P1
**Acceptance Criteria:**
- AC-10.1: Product detail page shows a skeleton layout (image placeholder, text lines, button placeholder) while data loads.
- AC-10.2: Cart page shows skeleton card placeholders while cart data loads.
- AC-10.3: "Add to Cart" button shows a loading spinner and disables during the tRPC mutation.
- AC-10.4: Checkout "Place Order" button shows a loading state during payment processing.
- AC-10.5: Skeleton components use DaisyUI's skeleton utility classes or Tailwind `animate-pulse`.

### FR-11: DaisyUI Nature Theme
**Description:** Configure a custom DaisyUI theme that codifies the existing hardcoded color palette (#1D3557, #E63946, #A8DADC, #F1FAEE, #457B9D) into semantic DaisyUI theme tokens, and migrate inline color references to use theme variables.
**Priority:** P2
**Acceptance Criteria:**
- AC-11.1: A custom DaisyUI theme named "aevani" is configured in the Tailwind/DaisyUI config.
- AC-11.2: Theme maps: `primary` = `#1D3557` (dark blue), `secondary` = `#457B9D` (medium blue), `accent` = `#A8DADC` (light teal), `neutral` = `#F1FAEE` (off-white), `error` = `#E63946` (red).
- AC-11.3: At minimum, the Header and product detail page are migrated from hardcoded hex values to DaisyUI theme classes.
- AC-11.4: The theme is applied globally via `data-theme="aevani"` on the `<html>` element.

## Non-Functional Requirements

### NFR-1: Performance
- Product detail page must achieve a Lighthouse mobile performance score of 70+ (measured on simulated 4G).
- First Contentful Paint (FCP) on mobile should be under 2.5 seconds.
- Skeleton screens must render within 100ms of navigation start (no layout shift after skeleton).
- Express Checkout Element must load within 2 seconds of page render.

### NFR-2: Accessibility
- All interactive elements must meet WCAG 2.1 AA minimum contrast ratios (4.5:1 for normal text, 3:1 for large text).
- Touch targets must be at minimum 44x44 CSS pixels per WCAG 2.5.5.
- Skeleton screens must have `aria-busy="true"` and announce loading state to screen readers.
- Express Checkout Element keyboard navigation must work correctly.

### NFR-3: Browser & Device Support
- Must work on: Safari iOS 15+, Chrome Android 10+, Samsung Internet 20+, Chrome Desktop 100+, Firefox Desktop 100+, Safari Desktop 15+.
- Must handle viewport sizes from 320px to 1440px without horizontal scrolling.
- Must handle notched devices (iPhone X+) with `env(safe-area-inset-*)`.

### NFR-4: Security
- Stripe publishable key is safe for client-side use but must come from environment variable (`PUBLIC_STRIPE_PUBLISHABLE_KEY`).
- PaymentIntent creation must happen server-side; the client only receives the `clientSecret`.
- Google Places API key should be restricted by HTTP referrer in the Google Cloud Console.

### NFR-5: Test Coverage
- Target 70% coverage for new and modified code.
- Unit tests for cart store, checkout form validation, responsive utility helpers.
- Component tests for skeleton components, sticky bar visibility logic, quantity controls.
- Integration tests for PaymentIntent creation endpoint and Express Checkout flow.

## User Stories

### US-1: Mobile Product Browsing
**As a** mobile shopper,
**I want to** browse product images by swiping and read product details comfortably on my phone,
**So that** I can evaluate products without pinching or zooming.

**Scenarios:**
- **Given** I am on a product detail page on my phone (375px viewport), **When** the page loads, **Then** the product image fills the screen width and I can swipe between images.
- **Given** I am viewing product details on mobile, **When** I scroll down past the "Add to Cart" button, **Then** a sticky bottom bar appears with the price and an "Add to Cart" button.
- **Given** I tap the product image on mobile, **When** the lightbox opens, **Then** I can swipe between images in full-screen view.

### US-2: Mobile Cart Management
**As a** mobile shopper,
**I want to** easily adjust quantities and remove items from my cart using touch gestures,
**So that** I can manage my order without frustration on a small screen.

**Scenarios:**
- **Given** I have items in my cart on mobile, **When** I view the cart page, **Then** items are displayed as full-width cards with large quantity buttons.
- **Given** I tap the + button on a cart item, **When** the quantity increments, **Then** the cart total and header badge update immediately.
- **Given** I add a product to my cart from the product page, **When** the add succeeds, **Then** the header cart badge updates from 0 to 1.

### US-3: Express Checkout
**As a** returning customer on my iPhone,
**I want to** pay with Apple Pay using a single tap,
**So that** I can complete my purchase without typing my address or card number.

**Scenarios:**
- **Given** I am on the checkout page on an Apple Pay-enabled device, **When** the page loads, **Then** I see an Apple Pay button above the standard checkout form.
- **Given** I tap the Apple Pay button, **When** the Apple Pay sheet appears and I authenticate with Face ID, **Then** the payment completes and I see an order confirmation.
- **Given** I am on the cart page with items, **When** I see the Express Checkout section, **Then** I can tap Google Pay/Apple Pay/Link to skip the checkout form entirely.

### US-4: Quick Checkout on Mobile
**As a** first-time mobile visitor,
**I want to** check out with as few form fields as possible,
**So that** I can complete my purchase quickly without excessive typing on my phone keyboard.

**Scenarios:**
- **Given** I am on the checkout page on mobile, **When** the page loads, **Then** I see only the Contact section expanded, with Shipping, Billing, and Payment collapsed.
- **Given** I start typing my address, **When** autocomplete suggestions appear, **Then** I can tap a suggestion to auto-fill city, state, and postal code.
- **Given** I complete the Contact section, **When** I tap "Continue", **Then** the Contact section collapses with a summary and the Shipping section expands.

## Technical Considerations

### Stripe Express Checkout Element Architecture
- Use `@stripe/stripe-js` to load Stripe.js on the client.
- Create a new server endpoint (`/api/create-payment-intent`) that creates a PaymentIntent with the cart total and returns `{ clientSecret }`.
- Mount the `ExpressCheckoutElement` inside a Svelte wrapper component (`ExpressCheckout.svelte`).
- Listen for `confirm` event on the Element to handle successful payments.
- After successful payment, call a server-side endpoint to create the order (similar to the webhook flow but triggered directly by the client after PaymentIntent confirmation).
- The Express Checkout Element handles its own UI for Apple Pay, Google Pay, and Link -- no custom button UI needed.

### Cart State Management
- Create a Svelte 5 rune-based cart store (`$lib/stores/cart.svelte.ts`) that holds the cart item count and is reactive across all components.
- The store syncs with the server via tRPC calls and updates the count optimistically.
- The Header component reads from this store for the badge count.

### Responsive Strategy
- Use Tailwind CSS breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px).
- Mobile-first: default styles are for mobile, with `md:` and `lg:` overrides for larger screens.
- Use CSS `env(safe-area-inset-*)` for sticky bars on notched devices.
- Use `@media (hover: none) and (pointer: coarse)` for touch-specific styles.

### Svelte 5 Migration (Checkout Page)
- Replace `export let data` with `let { data } = $props()`.
- Replace `$:` reactive statements with `$derived()`.
- Replace `let sameAsShipping = true` with `let sameAsShipping = $state(true)`.
- This aligns with the rest of the codebase which already uses Svelte 5 runes.

### Address Autocomplete
- Use the Google Places Autocomplete API (new Places SDK) with session tokens for cost optimization.
- The feature is behind a feature flag: if `PUBLIC_GOOGLE_PLACES_API_KEY` is not set, the plain input renders without autocomplete.

## Out of Scope

- Native mobile app or PWA features (service workers, offline support, app manifest).
- Push notifications for order updates.
- Stripe Billing / subscriptions.
- Refund processing via Express Checkout.
- Internationalization (i18n) or multi-language support.
- Dark mode theme variant (only light "aevani" theme in this track).
- Product zoom on hover (desktop only, not touch).
- Infinite scroll or virtual scrolling for product lists.
- Cart drawer / slide-out panel (full page cart is used instead).
- Real-time inventory checks during Express Checkout.
- Shipping rate calculation beyond fixed rate.
- Tax calculation beyond fixed 8% rate.

## Open Questions

1. **Address autocomplete provider:** Google Places is the most recognized but has usage costs. Should we use a free/cheaper alternative like Mapbox or OpenCage for the initial implementation?
2. **Express Checkout scope:** Should Express Checkout be available on the product detail page as well (buy-now single product), or only on cart/checkout pages?
3. **Cart persistence UX:** When a mobile user adds an item and navigates away, should we show a toast/snackbar confirmation, or silently update the badge?
4. **Checkout page restructure:** Should the mobile checkout use a true multi-step wizard (separate URL steps) or an accordion-style single page? The spec currently assumes accordion.
5. **Theme migration scope:** Should the DaisyUI theme migration cover all pages in this track, or only the pages being directly modified (PDP, cart, checkout)?
