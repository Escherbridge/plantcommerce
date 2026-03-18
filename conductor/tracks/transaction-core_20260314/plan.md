# Implementation Plan: Transaction Core

## Overview

This plan is organized into 6 phases that build progressively toward the goal of processing a real paid order end-to-end. Each phase produces a working, testable increment.

**Phase 1** establishes the data foundation (schema migration + seed data).
**Phase 2** wires the product display and detail pages to real data.
**Phase 3** connects the cart UI to real tRPC mutations.
**Phase 4** integrates Stripe hosted Checkout.
**Phase 5** implements the webhook handler and order creation.
**Phase 6** builds the admin order management and confirmation email.

---

## Phase 1: Data Foundation

**Goal:** Add Stripe columns to the order table, create seed data, and install Stripe dependency.

### Task 1.1: Schema Migration -- Add Stripe Fields to Order Table

- [ ] Write test: Unit test that imports the schema and asserts `stripeSessionId` and `stripePaymentIntentId` columns exist on the `order` table with correct types (text, nullable).
- [ ] Implement: Add `stripeSessionId` (text, nullable, unique) and `stripePaymentIntentId` (text, nullable) columns to the `order` table in `plantapp/src/lib/server/db/schema.ts`. Generate migration with `npm run db:generate`. Apply with `npm run db:migrate`.
- [ ] Verify: Migration applies cleanly; existing tests still pass.

### Task 1.2: Install Stripe SDK

- [ ] Implement: Run `npm install stripe` in `plantapp/`. Create `plantapp/src/lib/server/stripe.ts` that exports a configured Stripe instance using `STRIPE_SECRET_KEY` from environment variables.
- [ ] Write test: Unit test that verifies the Stripe client module exports a Stripe instance (mock the constructor, verify the key is read from env).
- [ ] Verify: `npm run check` passes with the new dependency.

### Task 1.3: Seed Data Script

- [ ] Write test: Integration test for the seed function that verifies: (a) 4 categories are created with correct slugs, (b) at least 3 products per category exist, (c) running seed twice does not create duplicates (idempotency).
- [ ] Implement: Create `plantapp/src/lib/server/db/seed.ts` with a `seed()` function that upserts categories and products. Create `plantapp/scripts/seed.ts` as the CLI entrypoint. Add `"db:seed"` script to `package.json`.
- [ ] Refactor: Extract product data into a separate `seedData.ts` file for maintainability.
- [ ] Verify: Run `npm run db:seed` and confirm data appears in DB studio (`npm run db:studio`).

### Task 1.4: Verification -- Phase 1 Complete

- [ ] Verification: Run full test suite. Confirm schema migration is applied. Confirm seed data is present in the database. Confirm `stripe` package is installed and importable. [checkpoint marker]

---

## Phase 2: Product Display

**Goal:** Verify category pages display real product data and create the product detail page.

### Task 2.1: Verify Category Page Data Loading

- [ ] Write test: Integration test that calls `products.getProducts` tRPC procedure with a category ID and verifies it returns seeded products with correct shape (name, price, slug, category info).
- [ ] Implement: If the existing loader and tRPC calls work correctly with seed data, no code changes needed. If the category page product card template references fields that don't match the tRPC response shape (e.g., `product.image` vs `product.images`), fix the mapping in the Svelte component or loader.
- [ ] Verify: Start dev server, navigate to `/products/hydroponics`, confirm real products display.

### Task 2.2: Product Detail Page -- Route and Loader

- [ ] Write test: Integration test that calls `products.getProduct` tRPC procedure with a known slug and verifies it returns full product data including category, description, price, stock, and SKU.
- [ ] Implement: Create `plantapp/src/routes/products/[category]/[slug]/+page.ts` with a loader that calls `trpc.products.getProduct.query({ slug })`. Handle the 404 case by throwing a SvelteKit `error(404)`.
- [ ] Verify: Tests pass; the loader returns expected data structure.

### Task 2.3: Product Detail Page -- UI Component

- [ ] Write test: Component test (or snapshot) for the product detail page that verifies it renders product name, description, price, stock status, SKU, and an "Add to Cart" button.
- [ ] Implement: Create `plantapp/src/routes/products/[category]/[slug]/+page.svelte` with a layout showing product details, quantity selector, and "Add to Cart" button. Use DaisyUI card, badge, and button components.
- [ ] Refactor: Extract the quantity selector into a reusable component if not already existing.
- [ ] Verify: Start dev server, navigate to a product slug, confirm the page renders correctly.

### Task 2.4: Link Category Cards to Detail Pages

- [ ] Write test: Verify that product card links in the category page point to `/products/[category]/[slug]`.
- [ ] Implement: Update the `href` in category page product cards (e.g., `plantapp/src/routes/products/hydroponics/+page.svelte`) to use `product.slug` and the category slug from the loader data. Ensure all 4 category pages use the correct link format.
- [ ] Verify: Clicking a product card on any category page navigates to the correct detail page.

### Task 2.5: Verification -- Phase 2 Complete

- [ ] Verification: All 4 category pages show real products from DB. Product detail page loads for each product. 404 is returned for invalid slugs. No TypeScript errors. [checkpoint marker]

---

## Phase 3: Cart Wiring

**Goal:** Connect the cart page UI and PDP "Add to Cart" to real tRPC cart mutations. Implement guest session ID management.

### Task 3.1: Cart Session ID Cookie

- [ ] Write test: Unit test for a `getCartSessionId` helper function that: (a) returns an existing cookie value if present, (b) generates a new UUID and sets a cookie if not present.
- [ ] Implement: Create a utility in `plantapp/src/lib/server/cartSession.ts` (or integrate into `hooks.server.ts`) that reads/sets a `cartSessionId` cookie with `httpOnly`, `sameSite: lax`, `path: /`, and 30-day maxAge. Ensure it is available in the SvelteKit `locals` or passed through layout data.
- [ ] Verify: Cookie is set on first visit; subsequent visits use the same ID.

### Task 3.2: Cart Session ID in Layout Data

- [ ] Write test: Verify that the root layout load function provides `cartSessionId` to all pages.
- [ ] Implement: Update `plantapp/src/routes/+layout.server.ts` (or create it) to read the `cartSessionId` from cookies/locals and pass it to the client. Client-side pages/components can then include it in tRPC calls.
- [ ] Verify: `cartSessionId` is accessible in any `+page.svelte` via `data.cartSessionId`.

### Task 3.3: Add to Cart from Product Detail Page

- [ ] Write test: Integration test that calls `cart.addItem` tRPC mutation with a product ID, quantity, and session ID, then verifies `cart.getCart` returns the item.
- [ ] Implement: In the PDP component (`+page.svelte`), wire the "Add to Cart" button to call `trpc.cart.addItem.mutate({ productId, quantity, sessionId })`. Show a success toast/notification. Update the header cart count.
- [ ] Verify: Adding a product from the PDP persists it in the database and shows in the cart page.

### Task 3.4: Cart Page -- Wire Quantity and Remove

- [ ] Write test: Integration test that: (a) adds an item, (b) updates its quantity via `cart.updateItemQuantity`, (c) verifies the new quantity, (d) removes the item via `cart.removeItem`, (e) verifies the cart is empty.
- [ ] Implement: In `plantapp/src/routes/cart/+page.svelte`, replace the `console.log` stubs in `updateQuantity` and `removeItem` with real tRPC calls. Add loading states. Update the cart page loader (`+page.ts`) to fetch cart data via `trpc.cart.getCart.query({ sessionId })`.
- [ ] Refactor: Extract cart total calculation to a shared utility.
- [ ] Verify: Quantity changes and removals persist immediately; totals update correctly.

### Task 3.5: Header Cart Count

- [ ] Write test: Component test that the header displays the correct cart item count when provided via props/store.
- [ ] Implement: Create a reactive cart count store or use layout data. In the header/navigation component, display the cart item count badge. Ensure it updates when items are added/removed.
- [ ] Verify: Cart count in header matches the number of items in the database cart.

### Task 3.6: Verification -- Phase 3 Complete

- [ ] Verification: Add item from PDP, see it in cart, change quantity, remove it. Guest session persists across pages. Header shows cart count. Run test suite. [checkpoint marker]

---

## Phase 4: Stripe Checkout Integration

**Goal:** Create a Stripe Checkout Session from cart contents and redirect the user to Stripe's hosted payment page.

### Task 4.1: Stripe Checkout Service

- [ ] Write test: Unit test for a `StripeCheckoutService.createCheckoutSession` method that: (a) accepts cart data and URLs, (b) calls `stripe.checkout.sessions.create` with correct line items, (c) returns the session URL. Mock the Stripe SDK.
- [ ] Implement: Create `plantapp/src/lib/server/services/stripeCheckout.ts` with a `createCheckoutSession` method that maps cart items to Stripe line item format (`price_data` with `currency: 'usd'`, `product_data.name`, `unit_amount` in cents, `quantity`). Include metadata: `cartId`, `userId`, `sessionId`. Set `success_url` and `cancel_url`.
- [ ] Verify: Tests pass; the service correctly transforms cart data into Stripe's expected format.

### Task 4.2: Checkout API Endpoint

- [ ] Write test: Integration test for the checkout endpoint that: (a) sends a POST with cart/session info, (b) verifies a Stripe session is created, (c) returns the redirect URL. Use mocked Stripe.
- [ ] Implement: Create `plantapp/src/routes/api/checkout/+server.ts` as a POST endpoint. It reads the cart (via `CartService.getCart`), validates it is not empty, creates a Stripe Checkout Session via the service, and returns `{ url: session.url }` as JSON.
- [ ] Verify: Endpoint returns a valid Stripe Checkout URL.

### Task 4.3: Cart Page -- Checkout Button

- [ ] Write test: Verify that clicking "Proceed to Checkout" calls the checkout endpoint and redirects.
- [ ] Implement: In `plantapp/src/routes/cart/+page.svelte`, change the "Proceed to Checkout" link to a button that: (a) POSTs to `/api/checkout` with the session ID, (b) redirects to the returned Stripe URL. Add loading state and error handling.
- [ ] Verify: Clicking the button with items in the cart redirects to Stripe's checkout page (in test mode).

### Task 4.4: Remove Old Checkout Page

- [ ] Implement: Remove or repurpose `plantapp/src/routes/checkout/+page.svelte` since checkout is now handled by Stripe. If keeping the route, redirect it to `/cart`. The old form-based checkout flow is no longer needed.
- [ ] Verify: Navigating to `/checkout` either redirects to `/cart` or shows a meaningful message.

### Task 4.5: Verification -- Phase 4 Complete

- [ ] Verification: With items in cart, click checkout, get redirected to Stripe test checkout page. Cancel returns to cart. Complete payment (use Stripe test card `4242 4242 4242 4242`) and get redirected to success URL. Run test suite. [checkpoint marker]

---

## Phase 5: Webhook and Order Creation

**Goal:** Handle Stripe's `checkout.session.completed` webhook to create orders in the database.

### Task 5.1: Webhook Endpoint -- Signature Verification

- [ ] Write test: Unit test that: (a) rejects requests without a `stripe-signature` header (returns 400), (b) rejects requests with an invalid signature (returns 400), (c) accepts requests with a valid signature. Mock `stripe.webhooks.constructEvent`.
- [ ] Implement: Create `plantapp/src/routes/api/webhooks/stripe/+server.ts`. Read the raw request body as text (not JSON). Call `stripe.webhooks.constructEvent(body, signature, webhookSecret)`. Handle `StripeSignatureVerificationError`.
- [ ] Verify: Tests pass for all signature scenarios.

### Task 5.2: Order Creation from Webhook

- [ ] Write test: Integration test that: (a) simulates a `checkout.session.completed` event with cart metadata, (b) verifies an order is created with correct items, totals, and Stripe IDs, (c) verifies cart is cleared, (d) verifies product stock is decremented.
- [ ] Implement: In the webhook handler, when the event type is `checkout.session.completed`: extract `cartId`/`userId`/`sessionId` from metadata, load the cart, create the order (adapt `OrderService.createOrder` or create `OrderService.createOrderFromStripe`), store `stripeSessionId` and `stripePaymentIntentId`, clear the cart. Set order status to `confirmed`.
- [ ] Refactor: Ensure `OrderService` accepts optional Stripe IDs and can set the initial status to `confirmed` instead of `pending`.
- [ ] Verify: Full flow works: create checkout session -> simulate webhook -> order exists in DB.

### Task 5.3: Idempotency Guard

- [ ] Write test: Test that processing the same `checkout.session.completed` event twice does not create a duplicate order. The second call should return 200 without creating a new order.
- [ ] Implement: Before creating an order, check if an order with the same `stripeSessionId` already exists. If so, return 200 immediately.
- [ ] Verify: Duplicate webhook deliveries are handled gracefully.

### Task 5.4: Order Confirmation Page

- [ ] Write test: Integration test that the success page retrieves order details by Stripe session ID.
- [ ] Implement: Create `plantapp/src/routes/checkout/success/+page.ts` that reads `session_id` from URL params, queries the order by `stripeSessionId` (add a new method to `OrderService` or use an existing lookup), and returns order details. Create `+page.svelte` with a thank-you message, order summary, and "Continue Shopping" link. If the order is not yet created (webhook latency), show a "processing" state with a polling mechanism or auto-refresh.
- [ ] Verify: After completing Stripe checkout, the success page shows order details.

### Task 5.5: Verification -- Phase 5 Complete

- [ ] Verification: Full end-to-end flow: browse products -> add to cart -> checkout via Stripe -> webhook creates order -> success page shows order details -> product stock is decremented -> cart is cleared. Run test suite. [checkpoint marker]

---

## Phase 6: Admin and Email

**Goal:** Wire admin order management to real data and add order confirmation email logging.

### Task 6.1: Order Confirmation Email

- [ ] Write test: Unit test for `EmailService.sendOrderConfirmation` that verifies it logs order number, items, totals, and customer email to the console.
- [ ] Implement: Add `sendOrderConfirmation(order: OrderDetails)` method to `plantapp/src/lib/server/services/email.ts`. It console-logs a formatted order confirmation. Call it from the webhook handler after order creation.
- [ ] Verify: After a webhook-created order, the console shows a formatted order confirmation email.

### Task 6.2: Admin Orders List Page

- [ ] Write test: Integration test that calls `orders.getAllOrders` tRPC procedure and verifies it returns orders with correct shape (order number, status, total, date, customer email).
- [ ] Implement: Update `plantapp/src/routes/admin/orders/+page.ts` to load orders via tRPC with pagination and status filter from URL params. Update `+page.svelte` to display real data with proper status badges, order numbers (not just IDs), customer emails, and formatted dates. Add pagination controls.
- [ ] Verify: Admin orders page shows real orders from the database.

### Task 6.3: Admin Order Detail Page

- [ ] Write test: Integration test that calls `orders.getOrderDetails` tRPC procedure and verifies it returns full order details including items, addresses, and Stripe IDs.
- [ ] Implement: Create `plantapp/src/routes/admin/orders/[id]/+page.ts` and `+page.svelte`. Load order details via tRPC. Display order items table, shipping/billing addresses, payment info (Stripe session ID), and status. Add a status update dropdown that calls `orders.updateOrderStatus` tRPC mutation.
- [ ] Refactor: Add audit logging to the status update mutation (it already exists in the router but verify it calls `AuditLogService.log`).
- [ ] Verify: Admin can view full order details and update status.

### Task 6.4: Admin Order Status Update with Audit Log

- [ ] Write test: Integration test that calls `orders.updateOrderStatus` and verifies: (a) order status is updated in the database, (b) an audit log entry is created with the admin user ID, action, and order details.
- [ ] Implement: Ensure the `updateOrderStatus` tRPC mutation in `orders.ts` calls `AuditLogService.log` with action `'update_order_status'` and details including old/new status. If not already present, add it.
- [ ] Verify: Status update creates an audit log entry visible in the database.

### Task 6.5: Verification -- Phase 6 Complete

- [ ] Verification: Admin can list orders with filters, view order details, update status with audit logging. Order confirmation email is logged to console after webhook processing. Run full test suite. Confirm 70% coverage target on new/modified code. Run `npm run check` with no errors. [checkpoint marker]

---

## Summary

| Phase | Tasks | Key Deliverable |
|-------|-------|-----------------|
| 1 | 4 | Schema migration, Stripe SDK, seed data |
| 2 | 5 | Category pages with real data, product detail page |
| 3 | 6 | Fully wired cart with session management |
| 4 | 5 | Stripe hosted Checkout redirect flow |
| 5 | 5 | Webhook order creation, confirmation page |
| 6 | 5 | Admin order management, confirmation email |
| **Total** | **30** | **End-to-end paid order flow** |
