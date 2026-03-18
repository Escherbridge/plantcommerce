# Implementation Plan: Mobile & Checkout Optimization

## Overview

This plan is organized into 6 phases, progressing from foundational responsive infrastructure through cart state management, mobile page retrofits, Express Checkout integration, and polish. Each phase ends with a manual verification checkpoint. All tasks follow the TDD Red-Green-Refactor cycle.

**Prerequisites:** The `transaction-core_20260314` track must be complete before starting Phase 3 (Express Checkout depends on working Stripe integration, wired cart mutations, and real product data).

---

## Phase 1: Foundation -- Theme, Cart Store, Skeleton Components

Goal: Establish the DaisyUI theme, a reactive cart count store, and reusable skeleton/loading components that all subsequent phases will use.

### Task 1.1: Configure DaisyUI Custom "aevani" Theme
- [ ] Write test: Verify that a Tailwind build with the aevani theme produces expected CSS custom properties (primary, secondary, accent, neutral, error colors). Test config file exports the expected theme object.
- [ ] Implement: Create or update the DaisyUI plugin config in `plantapp/tailwind.config.ts` (or `app.css` `@plugin` directive) to define the "aevani" theme with `primary: #1D3557`, `secondary: #457B9D`, `accent: #A8DADC`, `neutral: #F1FAEE`, `error: #E63946`. Set `data-theme="aevani"` on the root `<html>` element in `plantapp/src/app.html`.
- [ ] Verify: `npm run build` succeeds, DaisyUI components render with the new color palette. No visual regressions on existing pages.

### Task 1.2: Create Reactive Cart Count Store
- [ ] Write test: Unit test for `cartStore` -- initial count is 0, `setCount(5)` updates count to 5, `increment()` adds 1, `decrement()` subtracts 1 (min 0), `reset()` sets to 0.
- [ ] Implement: Create `plantapp/src/lib/stores/cart.svelte.ts` using Svelte 5 runes. Export reactive `cartCount` state, `setCartCount`, `incrementCartCount`, `decrementCartCount`, and `resetCartCount` functions. Add a `syncCartCount` function that calls `trpc.cart.getCart` and sets count from response.
- [ ] Verify: Tests pass. Import the store in a test component and confirm reactivity.

### Task 1.3: Wire Cart Badge in Header
- [ ] Write test: Component test for Header -- when `cartCount` is 0 the badge element is hidden, when `cartCount` is 3 the badge shows "3".
- [ ] Implement: Import the cart store in `plantapp/src/lib/components/navigation/Header.svelte`. Replace the hardcoded `<span class="cart-count">0</span>` with a reactive badge that reads from the store. Hide the badge when count is 0. Call `syncCartCount` on mount in the root layout.
- [ ] Verify: Tests pass. Manually verify badge visibility in browser.

### Task 1.4: Create Skeleton Components
- [ ] Write test: Component test for `ProductDetailSkeleton` -- renders expected number of animated placeholder elements, has `aria-busy="true"`.
- [ ] Write test: Component test for `CartItemSkeleton` -- renders placeholder card with image, text lines, and button areas.
- [ ] Implement: Create `plantapp/src/lib/components/ui/ProductDetailSkeleton.svelte` with a mobile-first layout matching the PDP structure (image area, title line, price line, button area) using Tailwind `animate-pulse` and DaisyUI skeleton classes. Create `plantapp/src/lib/components/ui/CartItemSkeleton.svelte` similarly. Both components accept a `count` prop for rendering multiple instances.
- [ ] Verify: Tests pass. Skeleton components render correctly at 375px and 1024px widths.

### Task 1.5: Create TouchQuantityControl Component
- [ ] Write test: Component test -- renders +/- buttons at minimum 44x44px, fires `onchange` with new quantity on increment/decrement, disables decrement at quantity 1, disables increment at max quantity, shows loading state when `loading` prop is true.
- [ ] Implement: Create `plantapp/src/lib/components/ui/TouchQuantityControl.svelte`. Props: `quantity`, `min` (default 1), `max`, `loading`, `onchange`. Use `min-h-[44px] min-w-[44px]` for buttons. Add `active:scale-95` for touch feedback. Prevent context menu on long-press via `oncontextmenu|preventDefault`.
- [ ] Verify: Tests pass. Component renders correctly and buttons meet 44px target.

- [ ] Verification: Manually confirm -- DaisyUI theme applies site-wide, cart badge shows 0 then hides, skeleton components render at mobile widths, TouchQuantityControl buttons are at least 44px. [checkpoint marker]

---

## Phase 2: Mobile-First Product Detail Page

Goal: Retrofit the product detail page with responsive layout, sticky add-to-cart bar, enhanced image gallery, and loading states.

### Task 2.1: Responsive PDP Layout
- [ ] Write test: Component/snapshot test -- at mobile width the PDP renders a single-column layout with full-width image area; at desktop width renders a 2-column grid.
- [ ] Implement: Refactor `plantapp/src/routes/products/mock-detail/+page.svelte` (and/or the dynamic `[category]/[slug]/+page.svelte` if it exists). Replace the `grid-cols-1 lg:grid-cols-2` with mobile-first responsive classes. Make the carousel container full-bleed on mobile (negative margins or remove Container padding). Use responsive font sizes for product name (`text-2xl md:text-4xl lg:text-5xl`). Make thumbnail row horizontally scrollable on mobile (`flex overflow-x-auto md:grid md:grid-cols-4`).
- [ ] Verify: Tests pass. Page renders without horizontal scroll at 320px, 375px, 768px, and 1024px.

### Task 2.2: Replace Quantity Controls on PDP
- [ ] Write test: Integration test -- PDP page renders `TouchQuantityControl` component, clicking + increments displayed quantity.
- [ ] Implement: Replace the inline `join` quantity controls in the PDP with the `TouchQuantityControl` component from Task 1.5. Pass product `stockQuantity` as the max.
- [ ] Verify: Tests pass. Quantity controls are 44px touch targets on mobile.

### Task 2.3: Sticky "Add to Cart" Bar
- [ ] Write test: Component test for `StickyAddToCart.svelte` -- renders price and button, has `aria-label`, applies `fixed bottom-0` positioning, respects `visible` prop.
- [ ] Write test: Integration test -- on PDP, the sticky bar is hidden when the inline button is visible, shown when the inline button is scrolled out of view.
- [ ] Implement: Create `plantapp/src/lib/components/ui/StickyAddToCart.svelte`. Props: `price`, `inStock`, `loading`, `onAddToCart`, `visible`. Apply `fixed bottom-0 left-0 right-0 z-40 md:hidden` with `pb-[env(safe-area-inset-bottom)]`. In the PDP, use Intersection Observer on the inline "Add to Cart" button to toggle `visible` state. Pass the same `addToCart` handler to both the inline button and the sticky bar.
- [ ] Verify: Tests pass. On mobile viewport, scroll down and confirm sticky bar appears.

### Task 2.4: Enhanced Mobile Image Gallery
- [ ] Write test: Component test -- tapping the carousel image on mobile triggers lightbox open; image counter displays "1 / 4" format.
- [ ] Implement: Add an `onclick` handler to the Carousel slide on the PDP that opens the existing `ImageGallery` lightbox on mobile (using a media query check or pointer detection). Add a visible image counter overlay on the Carousel (`<div class="absolute bottom-2 right-2 ...">1 / {total}</div>`) that shows on mobile. The existing Carousel already has swipe support.
- [ ] Verify: Tests pass. On mobile, tapping the image opens lightbox; image counter is visible.

### Task 2.5: PDP Loading State
- [ ] Write test: Page test -- when data is loading, `ProductDetailSkeleton` is rendered with `aria-busy="true"`; when data arrives, the real content replaces the skeleton.
- [ ] Implement: In the PDP page load function, add a loading state. Show `ProductDetailSkeleton` while the tRPC call is in flight. Wire the "Add to Cart" button to show a spinner (DaisyUI `loading loading-spinner`) and disable during the tRPC `cart.addItem` mutation. Update cart store count after successful add.
- [ ] Verify: Tests pass. Throttle network in devtools and confirm skeleton appears then transitions to content.

- [ ] Verification: On a 375px viewport, navigate to a product detail page. Confirm: full-bleed images with swipe, image counter visible, responsive text sizing, 44px quantity buttons, sticky bar appears on scroll, "Add to Cart" shows spinner during mutation, cart badge updates. On 1024px, confirm desktop layout is intact. [checkpoint marker]

---

## Phase 3: Mobile-First Cart Page

Goal: Retrofit the cart page with responsive layout, touch-friendly controls, and horizontal scrolling for related products.

### Task 3.1: Responsive Cart Layout
- [ ] Write test: Component test -- at mobile width, cart items render as stacked full-width cards; at desktop width, renders 2/3 + 1/3 grid with sidebar order summary.
- [ ] Implement: Refactor `plantapp/src/routes/cart/+page.svelte`. On mobile: stack cart item cards vertically with image on the left (smaller, ~80px), product info and quantity on the right. Move order summary below the items list on mobile. Use `lg:grid-cols-3` for desktop sidebar layout (existing). Ensure "Proceed to Checkout" is full-width and prominent on mobile.
- [ ] Verify: Tests pass. No horizontal scroll at 320px. Order summary is accessible on mobile.

### Task 3.2: Replace Quantity Controls in Cart
- [ ] Write test: Integration test -- cart page renders `TouchQuantityControl` for each item, changing quantity calls the cart store update function.
- [ ] Implement: Replace the `join btn-sm` quantity controls in the cart page with `TouchQuantityControl`. Wire `onchange` to call `trpc.cart.updateItemQuantity` and update the cart store count. Show loading state on the control during the mutation.
- [ ] Verify: Tests pass. Quantity buttons are 44px targets. Count updates propagate to header badge.

### Task 3.3: Responsive "Recently Viewed" Section
- [ ] Write test: Component test -- at mobile width, recently viewed products render in a horizontal scroll container; at desktop width, renders in a 4-column grid.
- [ ] Implement: Replace the `grid grid-cols-4` on the recently viewed section with `flex overflow-x-auto gap-4 snap-x snap-mandatory md:grid md:grid-cols-4`. Each product card gets `snap-center flex-shrink-0 w-[200px] md:w-auto`.
- [ ] Verify: Tests pass. On mobile, products scroll horizontally with snap points.

### Task 3.4: Cart Loading State
- [ ] Write test: Page test -- when cart data is loading, `CartItemSkeleton` components render; when data arrives, real items replace skeletons.
- [ ] Implement: Add loading state to the cart page. Show `CartItemSkeleton` (3 instances) while `data.cart` is loading. Wire remove-item button with a loading spinner.
- [ ] Verify: Tests pass. Skeleton appears during data fetch.

### Task 3.5: Mobile Order Summary Sticky Bar
- [ ] Write test: Component test -- on mobile, a sticky bottom bar shows the cart total and "Checkout" button; on desktop, the sidebar summary remains.
- [ ] Implement: Create a mobile-only sticky bottom summary bar (`fixed bottom-0 left-0 right-0 z-40 md:hidden`) showing the total and a "Proceed to Checkout" button. The full order summary (subtotal, shipping, tax breakdown) remains in the main content flow above. Apply `pb-[env(safe-area-inset-bottom)]`.
- [ ] Verify: Tests pass. On mobile, the sticky bar is visible. On desktop, the sidebar summary is shown.

- [ ] Verification: On a 375px viewport, navigate to `/cart` with items. Confirm: stacked cards with 44px quantity buttons, horizontal scroll for recently viewed, sticky bottom bar with total, cart badge updates on quantity change. On 1024px, confirm desktop grid layout with sidebar summary. [checkpoint marker]

---

## Phase 4: Mobile Checkout & Progressive Disclosure

Goal: Refactor the checkout page with Svelte 5 syntax, progressive disclosure sections, and mobile-optimized form fields.

### Task 4.1: Migrate Checkout to Svelte 5 Runes
- [ ] Write test: Page test -- checkout page renders with `$props()` data, reactive totals update correctly when cart data changes.
- [ ] Implement: Rewrite `plantapp/src/routes/checkout/+page.svelte` to replace `export let data` with `let { data } = $props()`, `$:` with `$derived()`, and `let sameAsShipping = true` with `$state(true)`. Ensure all existing functionality is preserved.
- [ ] Verify: Tests pass. Checkout page renders and functions identically to before migration.

### Task 4.2: Progressive Disclosure Checkout Sections
- [ ] Write test: Component test for `CheckoutAccordion.svelte` -- only one section is expanded at a time, completed sections show a summary, clicking a completed section re-expands it for editing.
- [ ] Implement: Create `plantapp/src/lib/components/checkout/CheckoutAccordion.svelte`. Divide the checkout form into 4 sections: Contact Info, Shipping Address, Billing Address, Payment Method. Each section has states: `active` (expanded, editable), `completed` (collapsed, shows summary), `upcoming` (collapsed, grayed out). On mobile, use accordion behavior. On desktop (`lg:` breakpoint), render all sections expanded (preserving the existing experience). Use the existing `Accordion` component or build a checkout-specific one.
- [ ] Verify: Tests pass. On mobile, sections expand/collapse as expected. On desktop, all sections visible.

### Task 4.3: Mobile-Optimized Form Fields
- [ ] Write test: Component test -- form inputs have `min-height: 44px`, appropriate `inputmode` attributes (email, tel, numeric), and `autocomplete` attributes.
- [ ] Implement: Update all checkout form inputs with: `min-h-[44px]` for touch targets, `inputmode="email"` on email field, `inputmode="tel"` on phone field, `inputmode="numeric"` on postal code, `autocomplete` attributes (e.g., `autocomplete="shipping address-line1"`). Use `text-base` (16px) on mobile inputs to prevent iOS zoom-on-focus.
- [ ] Verify: Tests pass. Inputs do not trigger zoom on iOS Safari focus.

### Task 4.4: Checkout Loading States
- [ ] Write test: Component test -- "Place Order" button shows loading spinner during submission, form fields disable during submission.
- [ ] Implement: Add `isSubmitting` state. When the checkout form is submitted (either to Stripe hosted Checkout or the standard flow), show a spinner on the button, disable all fields, and overlay the form with a subtle opacity. Show a "Processing your order..." message on mobile.
- [ ] Verify: Tests pass. Button shows spinner during submission.

### Task 4.5: Mobile Checkout Order Summary
- [ ] Write test: Component test -- on mobile, the order summary is collapsible (shows item count and total, expands to show full breakdown); on desktop, it remains in the sidebar.
- [ ] Implement: Create a collapsible order summary for mobile checkout. Default state: collapsed showing "N items -- $XX.XX" with a "Show details" toggle. Expanded state: full item list with images, quantities, and price breakdown. On desktop, render the existing sticky sidebar summary.
- [ ] Verify: Tests pass. On mobile, summary collapses and expands. On desktop, sidebar is visible.

- [ ] Verification: On a 375px viewport, navigate to `/checkout`. Confirm: only Contact section is expanded, inputs are 44px height, email keyboard appears for email field, completing Contact collapses it and expands Shipping, order summary is collapsible, "Place Order" shows loading state. On 1024px, confirm all sections are visible with sidebar summary. [checkpoint marker]

---

## Phase 5: Stripe Express Checkout Integration

Goal: Add Stripe Express Checkout Element for Apple Pay, Google Pay, and Link on checkout and cart pages.

### Task 5.1: Install @stripe/stripe-js and Create Stripe Client Utility
- [ ] Write test: Unit test -- `getStripeClient()` returns a Stripe instance when `PUBLIC_STRIPE_PUBLISHABLE_KEY` is set, throws a descriptive error when the key is missing.
- [ ] Implement: Run `npm install @stripe/stripe-js`. Create `plantapp/src/lib/stripe/client.ts` that exports a `getStripeClient()` function using `loadStripe()` with the publishable key from `$env/static/public`. Use a module-level promise to ensure Stripe.js is loaded only once.
- [ ] Verify: Tests pass. Stripe client loads in browser environment.

### Task 5.2: Create PaymentIntent Server Endpoint
- [ ] Write test: Integration test -- POST to `/api/create-payment-intent` with a valid cart returns `{ clientSecret }` (200 status). POST with an empty cart returns 400. POST without authentication or session returns 401.
- [ ] Implement: Create `plantapp/src/routes/api/create-payment-intent/+server.ts`. The handler reads the cart (via session/user ID), calculates the total in cents, creates a Stripe PaymentIntent with `automatic_payment_methods: { enabled: true }` and metadata containing cart ID and user/session ID. Returns `{ clientSecret }`.
- [ ] Verify: Tests pass. Endpoint creates a PaymentIntent in Stripe test mode.

### Task 5.3: Create ExpressCheckout Svelte Component
- [ ] Write test: Component test -- `ExpressCheckout.svelte` mounts without error, calls `getStripeClient()`, renders a container div for the Element. When `clientSecret` is null, shows a loading skeleton. When Stripe is not available, the component hides itself.
- [ ] Implement: Create `plantapp/src/lib/components/checkout/ExpressCheckout.svelte`. Props: `clientSecret`, `onSuccess`, `onError`. On mount, initialize Stripe Elements with the `clientSecret`, create an `expressCheckout` Element, and mount it. Listen for the `confirm` event -- when fired, call `stripe.confirmPayment()` and then invoke `onSuccess` with the payment result. Handle `ready` event to detect if any payment methods are available; if none, hide the component.
- [ ] Verify: Tests pass. Component mounts and renders a Stripe element container.

### Task 5.4: Integrate Express Checkout on Checkout Page
- [ ] Write test: Page test -- checkout page fetches a PaymentIntent `clientSecret` on load and passes it to `ExpressCheckout`. If Express Checkout confirms payment, the test verifies a server call to create the order.
- [ ] Implement: In the checkout page, call `/api/create-payment-intent` on mount to get the `clientSecret`. Render `ExpressCheckout` above the standard checkout form with a "Or pay with card" divider below it. On `onSuccess`, call a server endpoint to create the order from the cart (similar to webhook logic) and redirect to `/checkout/success`. Apply Aevani brand appearance options to the Stripe Element.
- [ ] Verify: Tests pass. On a device with Apple Pay/Google Pay, the button appears. On devices without, the section hides gracefully.

### Task 5.5: Integrate Express Checkout on Cart Page
- [ ] Write test: Page test -- cart page shows Express Checkout section when items are present, hides it when cart is empty.
- [ ] Implement: Add an Express Checkout section on the cart page below the order summary (on desktop) or above the sticky bar (on mobile). Fetch a `clientSecret` when the cart is non-empty. On successful express payment, create the order and redirect to confirmation. Show a "Buy now with" heading above the Express Checkout Element.
- [ ] Verify: Tests pass. Express Checkout appears on cart page with items, hides on empty cart.

### Task 5.6: Create Order from Express Checkout Payment
- [ ] Write test: Integration test -- POST to `/api/confirm-express-order` with a valid PaymentIntent ID creates an order, decrements stock, clears the cart, and returns the order number.
- [ ] Implement: Create `plantapp/src/routes/api/confirm-express-order/+server.ts`. The handler verifies the PaymentIntent status is `succeeded` via the Stripe API, retrieves the cart from metadata, creates the order using `OrderService`, decrements stock, clears the cart, and returns `{ orderNumber, redirectUrl }`. This is idempotent (checks if order already exists for this PaymentIntent).
- [ ] Verify: Tests pass. Order is created correctly and cart is cleared.

- [ ] Verification: Using Stripe test mode on a mobile device (or Chrome DevTools device emulation with Google Pay test cards), navigate to `/checkout`. Confirm: Express Checkout buttons appear (or gracefully hide), tapping a button initiates the payment flow. On the cart page, confirm the Express Checkout section appears. Test the full flow: add item, go to cart, use Express Checkout, verify order created and confirmation page displays. [checkpoint marker]

---

## Phase 6: Address Autocomplete & Polish

Goal: Add address autocomplete, migrate hardcoded colors to theme tokens, and perform final responsive polish.

### Task 6.1: Address Autocomplete Component
- [ ] Write test: Component test for `AddressAutocomplete.svelte` -- renders a text input, when `PUBLIC_GOOGLE_PLACES_API_KEY` is empty it renders a plain input without errors, when key is set it initializes the Google Places script.
- [ ] Write test: Unit test -- `parseGooglePlaceResult()` extracts street, city, state, postal code, and country from a mock Google Place result object.
- [ ] Implement: Create `plantapp/src/lib/components/checkout/AddressAutocomplete.svelte`. Props: `value`, `onAddressSelect` (callback with parsed address fields), `placeholder`, `name`. If `PUBLIC_GOOGLE_PLACES_API_KEY` is set, dynamically load the Google Places script and initialize Autocomplete on the input. On place selection, parse the result and call `onAddressSelect` with `{ street, city, state, postalCode, country }`. If the key is not set, render a standard input.
- [ ] Verify: Tests pass. With key unset, the input renders normally. With key set (if available), autocomplete suggestions appear.

### Task 6.2: Integrate Address Autocomplete in Checkout
- [ ] Write test: Integration test -- on the checkout page, the shipping address field uses `AddressAutocomplete`, and selecting a suggestion auto-fills city, state, postal code, and country fields.
- [ ] Implement: Replace the plain `<input>` for `address1` in the checkout form (both shipping and billing sections) with `AddressAutocomplete`. Wire `onAddressSelect` to set the corresponding city, state, postalCode, and country form fields. Ensure the billing address autocomplete only appears when "Same as shipping" is unchecked.
- [ ] Verify: Tests pass. Autocomplete populates address fields on selection.

### Task 6.3: Migrate Header Colors to Theme Tokens
- [ ] Write test: Snapshot test -- Header component renders with DaisyUI theme classes instead of hardcoded hex values.
- [ ] Implement: In `Header.svelte`, replace hardcoded color references (`#1D3557`, `#E63946`, `#457B9D`, etc.) in `<style>` blocks with DaisyUI CSS variables (`oklch(var(--p))` for primary, etc.) or Tailwind theme classes (`text-primary`, `bg-secondary`, `hover:text-error`). Migrate from `<style>` scoped CSS to Tailwind utility classes where practical.
- [ ] Verify: Tests pass. Header visually matches the existing design. Colors come from theme variables.

### Task 6.4: Migrate PDP Colors to Theme Tokens
- [ ] Write test: Snapshot test -- PDP renders with DaisyUI theme classes instead of hardcoded hex values.
- [ ] Implement: In the product detail page, replace `text-[#1D3557]`, `bg-[#F1FAEE]`, `bg-[#A8DADC]` with `text-primary`, `bg-neutral`, `bg-accent` respectively. Replace `text-[#E63946]` with `text-error` or a custom `text-brand-red` utility.
- [ ] Verify: Tests pass. PDP visually matches. No hardcoded hex values remain in the PDP file.

### Task 6.5: Final Responsive Audit and Polish
- [ ] Write test: Visual regression / layout test -- at 320px, 375px, 768px, 1024px, and 1440px widths, all key pages (PDP, cart, checkout) render without horizontal overflow and all touch targets meet 44px minimum.
- [ ] Implement: Audit and fix any remaining responsive issues: check for text overflow, truncation, image sizing, padding inconsistencies, safe area insets on sticky bars. Ensure the mobile drawer in the root layout closes after navigation. Test with Chrome DevTools device presets (iPhone SE, iPhone 14, Pixel 7, iPad).
- [ ] Verify: Tests pass across all breakpoints. No horizontal scrollbars appear at any tested width.

### Task 6.6: Run Full Test Suite and Coverage Check
- [ ] Write test: No new tests -- run the full suite.
- [ ] Implement: Run `npm run check` (svelte-check), `npm run lint`, `npm run format -- --check`, and the full Vitest suite. Fix any type errors, lint issues, or formatting problems. Verify coverage meets the 70% target for all new and modified files.
- [ ] Verify: All checks pass. Coverage report shows >= 70% on new code.

- [ ] Verification: Full manual walkthrough on mobile viewport (375px) and desktop (1440px). Product detail page: responsive images, swipe, lightbox, sticky bar, quantity controls, loading state, cart badge update. Cart page: responsive layout, touch controls, horizontal recently viewed, sticky summary, Express Checkout. Checkout page: progressive disclosure on mobile, address autocomplete, Express Checkout, loading states, theme colors. Verify no hardcoded hex values remain in modified files. Run Lighthouse mobile audit on PDP and confirm score >= 70. [checkpoint marker]
