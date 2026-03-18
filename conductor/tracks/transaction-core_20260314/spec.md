# Specification: Transaction Core

## Overview

Wire real product data through tRPC, implement Stripe hosted Checkout, create orders from webhooks, and build basic admin order management. This track delivers the ability to process a real paid order end-to-end through the Aevani storefront.

## Background

The Aevani application has a fully defined database schema (products, categories, carts, orders, order items), tRPC routers, and service-layer classes that already contain working Drizzle queries. Category pages exist with loader functions that call tRPC. However, the database has no seed data, the checkout page uses a simulated payment placeholder, cart UI functions are stubbed, and the admin order page renders mock data. This track completes the transaction pipeline from product display through payment to fulfillment tracking.

### Current State

- **Product routers/services**: Fully implemented with Drizzle queries (list, filter, detail by slug). Working but no seed data exists.
- **Cart routers/services**: Fully implemented (add, remove, update, clear, transfer guest cart). UI functions are stubbed (`console.log` placeholders).
- **Order routers/services**: Fully implemented (create from cart, get by ID/number, list, status update, cancel). No payment integration.
- **Checkout page**: Collects shipping/billing info via a form but uses "simulated payment" -- no Stripe.
- **Admin orders page**: Renders a basic table but data loading may be incomplete.
- **Email service**: Only sends verification emails; no order confirmation.
- **Schema**: Missing `stripeSessionId` / `stripePaymentIntentId` columns on the `order` table.
- **Dependencies**: `stripe` npm package not installed.

## Functional Requirements

### FR-1: Product Seed Data
**Description:** Create a seed script that populates the four product categories (Hydroponics, Aquaponics, Silvopasture, Agroforestry) and at least 3 products per category with realistic names, descriptions, prices, SKUs, and stock quantities.
**Priority:** P0
**Acceptance Criteria:**
- AC-1.1: Running the seed script creates 4 categories with slugs matching existing routes (`hydroponics`, `aquaponics`, `silvopasture`, `agroforestry`).
- AC-1.2: Each category has at least 3 active products with unique slugs and SKUs.
- AC-1.3: Seed script is idempotent (safe to run multiple times without duplicates).
- AC-1.4: Products have realistic prices (between $9.99 and $499.99) and stock quantities (5-100).

### FR-2: Real Product Data on Category Pages
**Description:** Verify that existing tRPC product routers and loaders correctly serve real data from the database to the category pages after seeding.
**Priority:** P0
**Acceptance Criteria:**
- AC-2.1: `/products/hydroponics` displays products from the hydroponics category fetched via tRPC.
- AC-2.2: `/products/aquaponics`, `/products/silvopasture`, `/products/agroforestry` similarly display real data.
- AC-2.3: Product cards show name, price, and short description from the database.
- AC-2.4: Category pages show an empty state message when no products exist in a category.

### FR-3: Product Detail Page
**Description:** Create a dynamic product detail page at `/products/[category]/[slug]` that displays full product information fetched via tRPC.
**Priority:** P0
**Acceptance Criteria:**
- AC-3.1: Page loads product by slug using the existing `products.getProduct` tRPC procedure.
- AC-3.2: Page displays product name, full description, price, compare price (if set), stock status, and SKU.
- AC-3.3: "Add to Cart" button calls the cart tRPC mutation with the selected quantity.
- AC-3.4: Returns 404 for non-existent product slugs.
- AC-3.5: Page is accessible without authentication.

### FR-4: Cart Wiring
**Description:** Connect the existing cart UI to real tRPC cart mutations. Generate and persist a session ID for guest users so carts survive page navigation.
**Priority:** P0
**Acceptance Criteria:**
- AC-4.1: Adding a product from the PDP creates/updates a cart in the database.
- AC-4.2: The cart page (`/cart`) displays items from the database via tRPC `cart.getCart`.
- AC-4.3: Quantity +/- buttons call `cart.updateItemQuantity` and the UI updates.
- AC-4.4: Remove button calls `cart.removeItem` and the item disappears.
- AC-4.5: Guest users receive a `cartSessionId` cookie (UUID) that persists across requests.
- AC-4.6: Authenticated users' carts are linked to their `userId` instead of `sessionId`.
- AC-4.7: Cart item count is visible in the site header/navigation.

### FR-5: Stripe Hosted Checkout
**Description:** Replace the simulated payment form with a Stripe Checkout Session redirect. When the user clicks "Proceed to Checkout" from the cart page, the server creates a Stripe Checkout Session with line items from the cart, then redirects the user to Stripe's hosted page.
**Priority:** P0
**Acceptance Criteria:**
- AC-5.1: `stripe` npm package is installed and configured with `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` environment variables.
- AC-5.2: A new tRPC mutation or server endpoint (`/api/checkout`) creates a Stripe Checkout Session with line items matching the cart contents.
- AC-5.3: Each line item includes product name, unit price (in cents), and quantity.
- AC-5.4: The Checkout Session specifies `success_url` pointing to `/checkout/success?session_id={CHECKOUT_SESSION_ID}` and `cancel_url` pointing to `/cart`.
- AC-5.5: The Checkout Session stores `metadata` containing the internal cart ID, user ID (if authenticated), and session ID (if guest).
- AC-5.6: The user is redirected to Stripe's hosted checkout page.
- AC-5.7: Tax and shipping are either passed as line items or configured via Stripe's automatic tax/shipping options.

### FR-6: Stripe Webhook -- Order Creation
**Description:** Implement a webhook endpoint at `/api/webhooks/stripe` that listens for `checkout.session.completed` events. On receipt, it creates an order in the database from the cart data referenced in the session metadata.
**Priority:** P0
**Acceptance Criteria:**
- AC-6.1: Webhook endpoint verifies the Stripe signature using `STRIPE_WEBHOOK_SECRET`.
- AC-6.2: On `checkout.session.completed`, the handler retrieves the cart from session metadata and creates an order via `OrderService.createOrder` (or a modified version).
- AC-6.3: The order record stores the Stripe Checkout Session ID and Payment Intent ID.
- AC-6.4: Product stock quantities are decremented.
- AC-6.5: The cart is cleared after successful order creation.
- AC-6.6: Duplicate webhook deliveries are handled idempotently (same session ID does not create duplicate orders).
- AC-6.7: Failed webhook processing returns appropriate HTTP status codes (200 for success, 400/500 for errors).

### FR-7: Order Confirmation Page
**Description:** Create a success page at `/checkout/success` that displays order details after successful payment.
**Priority:** P1
**Acceptance Criteria:**
- AC-7.1: Page retrieves the order using the Stripe session ID from the URL query parameter.
- AC-7.2: Displays order number, items purchased, quantities, prices, and total.
- AC-7.3: Shows a "thank you" message with expected next steps.
- AC-7.4: Provides a link to continue shopping.
- AC-7.5: If the order is not found (e.g., webhook hasn't processed yet), shows a "processing" message with auto-refresh.

### FR-8: Order Confirmation Email
**Description:** Send a basic transactional email when an order is created from a webhook.
**Priority:** P1
**Acceptance Criteria:**
- AC-8.1: `EmailService` gains a `sendOrderConfirmation` method.
- AC-8.2: The email includes order number, item list, totals, and shipping address.
- AC-8.3: For this track, the email is logged to the console (same pattern as the existing verification email). A real email provider integration is out of scope.
- AC-8.4: The webhook handler calls `sendOrderConfirmation` after creating the order.

### FR-9: Admin Order Management
**Description:** Wire the admin orders page to display real order data and allow status updates.
**Priority:** P1
**Acceptance Criteria:**
- AC-9.1: `/admin/orders` lists all orders from the database using `orders.getAllOrders` tRPC procedure, with pagination.
- AC-9.2: Orders can be filtered by status (pending, confirmed, processing, shipped, delivered, cancelled, refunded).
- AC-9.3: Clicking an order navigates to `/admin/orders/[id]` showing full order details (items, addresses, payment status).
- AC-9.4: Admin can update order status via a dropdown/button (e.g., pending -> confirmed -> processing -> shipped -> delivered).
- AC-9.5: Status changes are recorded in the audit log.
- AC-9.6: Admin pages require admin role authentication.

### FR-10: Schema Migration for Stripe Fields
**Description:** Add Stripe-related columns to the `order` table.
**Priority:** P0
**Acceptance Criteria:**
- AC-10.1: `order` table gains `stripeSessionId` (text, nullable, unique) column.
- AC-10.2: `order` table gains `stripePaymentIntentId` (text, nullable) column.
- AC-10.3: Migration is generated via Drizzle Kit and applied.

## Non-Functional Requirements

### NFR-1: Security
- Stripe webhook signature verification must be implemented; raw request body must be used (not parsed JSON).
- Stripe secret key must never be exposed to the client.
- Admin endpoints must enforce the `admin` role check.
- Cart session IDs must be cryptographically random UUIDs.

### NFR-2: Performance
- Product listing queries should return within 200ms for up to 50 products.
- Webhook processing should complete within 5 seconds.

### NFR-3: Reliability
- Webhook handler must be idempotent (replaying the same event must not create duplicate orders).
- Cart operations must validate stock availability before proceeding.

### NFR-4: Test Coverage
- Target 70% coverage for new and modified code.
- Critical paths (checkout session creation, webhook processing, order creation) must have integration tests.
- Service-layer business logic must have unit tests.

## User Stories

### US-1: Browsing Products
**As a** visitor,
**I want to** browse products by category and view product details,
**So that** I can find products I want to purchase.

**Scenarios:**
- **Given** I am on the hydroponics category page, **When** the page loads, **Then** I see product cards with names, prices, and descriptions from the database.
- **Given** I click on a product card, **When** the product detail page loads, **Then** I see the full product information including description, price, and stock status.

### US-2: Adding to Cart
**As a** visitor (guest or authenticated),
**I want to** add products to my cart and adjust quantities,
**So that** I can prepare my order before checkout.

**Scenarios:**
- **Given** I am on a product detail page, **When** I click "Add to Cart", **Then** the product is added to my cart and the header cart count updates.
- **Given** I have items in my cart, **When** I change the quantity, **Then** the cart total updates in real time.
- **Given** I am a guest, **When** I add an item, **Then** a session cookie is set and my cart persists across pages.

### US-3: Checkout and Payment
**As a** customer,
**I want to** pay for my order securely via Stripe,
**So that** I can complete my purchase with confidence.

**Scenarios:**
- **Given** I have items in my cart, **When** I click "Proceed to Checkout", **Then** I am redirected to Stripe's hosted checkout page.
- **Given** I complete payment on Stripe, **When** I am redirected back, **Then** I see an order confirmation with my order number and items.
- **Given** I cancel payment on Stripe, **When** I am redirected back, **Then** I return to my cart with items intact.

### US-4: Admin Order Fulfillment
**As an** admin,
**I want to** view and manage orders,
**So that** I can process and fulfill customer purchases.

**Scenarios:**
- **Given** I am logged in as admin, **When** I visit `/admin/orders`, **Then** I see a paginated list of all orders.
- **Given** I view an order, **When** I change its status to "shipped", **Then** the status is updated and an audit log entry is created.

## Technical Considerations

### Stripe Integration Pattern
- Use **Stripe hosted Checkout** (redirect model) for PCI compliance and speed of implementation.
- Store `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` as environment variables.
- Webhook endpoint must use the raw request body (not parsed) for signature verification.
- Use SvelteKit's `+server.ts` (not tRPC) for the webhook endpoint since Stripe sends POST requests with a specific content type and signature header.

### Schema Changes
- Add `stripeSessionId` and `stripePaymentIntentId` to the `order` table via a new Drizzle migration.
- The `stripeSessionId` column should have a unique index for idempotent webhook handling.

### Cart Session Management
- Use a `cartSessionId` cookie with `httpOnly`, `secure` (in production), `sameSite: lax`, and a 30-day expiry.
- Generate the session ID server-side using `crypto.randomUUID()`.
- In the SvelteKit `hooks.server.ts` or layout server load, ensure the cookie is set for all visitors.

### Existing Code Reuse
- The existing `OrderService.createOrder` method creates orders from cart data. It will be adapted (or a new method created) to accept Stripe metadata and store Stripe IDs.
- The existing `CartService`, `ProductService`, and tRPC routers are already functional and only need minor modifications.
- The existing category loader (`$lib/loaders/productCategory.ts`) already works with tRPC; category pages just need seed data to display real products.

### Environment Configuration
- `STRIPE_SECRET_KEY` -- Stripe test-mode secret key
- `STRIPE_PUBLISHABLE_KEY` -- Stripe test-mode publishable key
- `STRIPE_WEBHOOK_SECRET` -- Webhook signing secret from Stripe CLI or Dashboard
- All must be configured in `.env` (local) and Railway environment variables (production).

## Out of Scope

- Real email delivery (Mailgun, SendGrid, SES) -- emails are console-logged only.
- Discount codes / coupon system.
- Shipping rate calculation (fixed $5.00 flat rate used).
- Tax calculation beyond the fixed 8% rate.
- Stripe Customer portal / subscription billing.
- Product image uploads (file storage integration).
- Express Checkout (Apple Pay, Google Pay) -- deferred to Track 4.
- Refund processing via Stripe.
- Inventory reservation / hold during checkout.
- Multi-currency support.
- Guest checkout without any session tracking.
- Cart merge on login (existing `transferGuestCart` is sufficient).

## Open Questions

1. **Shipping strategy:** Should free shipping over $100 (shown in the cart UI) be enforced at the Stripe level, or is it purely a UI display for now?
2. **Tax handling:** Should tax be calculated by Stripe Tax, or continue with the hardcoded 8% rate for the initial launch?
3. **Order status after payment:** Should orders start as `confirmed` (payment received) or `pending` (awaiting admin review)?
4. **Webhook retry policy:** Stripe retries failed webhooks for up to 3 days. Is the basic idempotency check (unique `stripeSessionId`) sufficient, or do we need a dedicated webhook event log table?
5. **Product detail page URL structure:** Should it be `/products/[category]/[slug]` or `/products/[slug]`? The category pages already link to `/products/hydroponics/{slug}` format.
