# Implementation Plan: Growth Features

## Overview

This plan is organized into 8 phases, progressing from foundational infrastructure (email, schema) through high-impact revenue features (discounts, subscriptions) to engagement features (reviews, wishlists, recommendations) and finally analytics/automation. Each phase ends with a verification checkpoint.

**Estimated total effort:** ~80-100 hours across all phases.

---

## Phase 1: Email Infrastructure and Newsletter

**Goal:** Replace the stub EmailService with Resend, establish email template system, and implement newsletter subscriptions. This is foundational -- nearly every subsequent phase sends emails.

### Task 1.1: Resend SDK Integration and EmailService Rewrite

- [ ] Write test: Unit test for new EmailService that verifies Resend client is called with correct parameters (mock Resend SDK). Test transactional email send (order confirmation) with template data injection. Test error handling when Resend API fails. Test rate limiting logic (reject sends exceeding threshold).
- [ ] Implement: Install `resend` package. Rewrite `src/lib/server/services/email.ts` to use Resend SDK. Add `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` to env config. Create base email send method with error handling, logging, and rate limiting. Preserve existing `sendVerificationEmail` method signature for backward compatibility.
- [ ] Refactor: Extract email configuration (from address, rate limits) into a config object. Ensure all callers of the old EmailService work without changes.

### Task 1.2: Branded Email Templates

- [ ] Write test: Test that each template function returns valid HTML containing expected dynamic content (recipient name, order details, etc.). Test that all templates include unsubscribe link placeholder.
- [ ] Implement: Create `src/lib/server/services/email-templates/` directory with template functions for: `verification.ts`, `order-confirmation.ts`, `password-reset.ts`, `welcome.ts`, `base-layout.ts` (shared header/footer with Aevani branding). Each template is a TypeScript function returning an HTML string.
- [ ] Refactor: Extract shared template components (header, footer, button styles) into the base layout. Ensure consistent styling across all templates.

### Task 1.3: Newsletter Subscriber Schema and Service

- [ ] Write test: Test newsletter service: subscribe (creates pending subscriber), verify (activates subscriber), unsubscribe (marks as unsubscribed), duplicate subscribe (returns friendly message), subscribe with invalid email (rejects). Test token generation for double opt-in.
- [ ] Implement: Add `newsletterSubscriber` table to schema (id, email unique, status enum pending/active/unsubscribed, verificationToken, subscribedAt, verifiedAt, unsubscribedAt, source enum footer/page/checkout, ipAddress). Create `src/lib/server/services/newsletter.ts` with subscribe, verify, unsubscribe methods. Generate cryptographic verification tokens.
- [ ] Refactor: Add DB indexes on email and status columns. Validate email format with Zod.

### Task 1.4: Newsletter tRPC Router and UI

- [ ] Write test: Test tRPC procedures: `newsletter.subscribe` validates email and returns success, `newsletter.verify` with valid token activates subscriber, `newsletter.unsubscribe` with valid token deactivates. Test rate limiting (5 signups per IP per hour).
- [ ] Implement: Create `src/lib/server/api/newsletter.ts` router with `subscribe`, `verify`, `unsubscribe` public procedures. Add newsletter signup form component to site footer (`src/lib/components/layout/NewsletterSignup.svelte`). Create `/newsletter` page. Create `/newsletter/verify` and `/newsletter/unsubscribe` routes. Wire double opt-in confirmation email through EmailService.
- [ ] Refactor: Ensure form has proper validation feedback, loading states, and success/error messages.

### Task 1.5: Newsletter Admin Management

- [ ] Write test: Test admin procedures: `admin.newsletter.list` returns paginated subscribers with filtering, `admin.newsletter.exportCsv` returns CSV string, `admin.newsletter.stats` returns subscriber count and growth data.
- [ ] Implement: Add newsletter admin procedures to admin router. Build admin UI section within `/admin` for subscriber management: table with search/filter, export CSV button, subscriber count and growth chart.
- [ ] Refactor: Ensure admin procedures are protected by role check.

### Task 1.6: Email Logging

- [ ] Write test: Test that every email send creates an audit log entry with recipient, template type, status (sent/failed), and timestamp. Test log query by date range and type.
- [ ] Implement: Add `emailLog` table to schema (id, recipient, templateType, subject, status, errorMessage, sentAt). Update EmailService to log every send attempt. Add admin view for email logs.
- [ ] Refactor: Ensure failed sends are logged with error details for debugging.

- [ ] **Verification:** Send a real test email via Resend in dev environment. Subscribe to newsletter from footer, verify via email link, confirm subscriber appears in admin. Check email logs record the send. [checkpoint marker]

---

## Phase 2: Discount Codes and Promotions Engine

**Goal:** Full discount code system with admin CRUD, checkout application, and usage tracking. This unlocks promotional capabilities for all subsequent features (abandoned cart incentives, subscription discounts).

### Task 2.1: Discount Code Schema

- [ ] Write test: Test that discount code schema enforces required fields (code, type, value). Test unique constraint on code. Test enum values for type (percentage, fixed_amount, free_shipping, bogo). Test discount_usage join table structure.
- [ ] Implement: Add `discountCode` table to schema (id, code unique, type enum, value decimal, minOrderAmount, maxDiscountAmount, usageLimit, usageLimitPerCustomer, usedCount, validFrom, validUntil, applicableProductIds JSON, applicableCategoryIds JSON, isActive, createdAt, updatedAt). Add `discountUsage` table (id, discountCodeId FK, orderId FK, userId FK, discountAmount, usedAt).
- [ ] Refactor: Add indexes on code (unique, case-insensitive), isActive, and validFrom/validUntil for efficient lookup.

### Task 2.2: Discount Validation Service

- [ ] Write test: Test validation logic for each discount type: percentage applies correct %, fixed_amount subtracts flat value, free_shipping zeroes shipping, bogo identifies qualifying items. Test minimum order amount enforcement. Test usage limit (total and per-customer). Test expiration date validation. Test case-insensitive code lookup. Test max discount cap. Test product/category scope restrictions.
- [ ] Implement: Create `src/lib/server/services/discount.ts` with `validateDiscountCode(code, cart, userId)` returning either a validated discount result or a descriptive error. Implement calculation logic for each discount type. Add `applyDiscount(code, orderId, userId, amount)` to record usage.
- [ ] Refactor: Extract discount calculation into pure functions for easy testing. Handle edge cases: empty cart, zero-value discount, already-used codes.

### Task 2.3: Discount tRPC Router

- [ ] Write test: Test `discounts.validate` procedure accepts code string and cart contents, returns discount preview (amount, description) or error message. Test `discounts.apply` is called during order creation. Test that applying an invalid/expired code returns appropriate error.
- [ ] Implement: Create `src/lib/server/api/discounts.ts` router with `validate` (public, authenticated) and admin CRUD procedures. Integrate discount application into existing order creation flow in `src/lib/server/services/order.ts`.
- [ ] Refactor: Ensure discount validation is idempotent (validate can be called multiple times without side effects; only apply records usage).

### Task 2.4: Checkout Discount UI

- [ ] Write test: Component test for discount code input: entering valid code shows discount amount and updated total, entering invalid code shows error message, removing code restores original total.
- [ ] Implement: Add discount code input field to checkout page (`src/routes/checkout/`). Show real-time validation feedback. Display applied discount as a line item in the order summary. Update order total calculation to include discount. Ensure `discountAmount` column on orders table is populated.
- [ ] Refactor: Handle edge case where cart changes after discount is applied (re-validate). Ensure clear UX for discount application and removal.

### Task 2.5: Admin Discount Management

- [ ] Write test: Test admin CRUD procedures: create discount code with all fields, list with pagination and filters (active/expired/type), update code, deactivate code. Test discount performance stats query (times used, total amount, attributed revenue).
- [ ] Implement: Create admin UI for discount management under `/admin` (or extend existing admin page): create/edit form with all discount fields, list table with status indicators, performance stats per code. Add bulk actions (activate/deactivate).
- [ ] Refactor: Validate admin inputs server-side with Zod. Add audit log entries for discount CRUD operations.

### Task 2.6: Affiliate Commission Post-Discount

- [ ] Write test: Test that affiliate commission is calculated on post-discount order amount, not pre-discount. Test with percentage and fixed discounts. Test with no discount (existing behavior preserved).
- [ ] Implement: Update affiliate commission calculation in order service to use `(totalAmount - discountAmount)` as the commission base. Ensure order record stores both pre-discount subtotal and final discounted total.
- [ ] Refactor: Verify existing affiliate tests still pass with the updated calculation.

- [ ] **Verification:** Create a discount code from admin, apply it at checkout, verify order total reflects discount. Confirm usage count increments. Test expired code shows error. Confirm affiliate commission uses post-discount amount. [checkpoint marker]

---

## Phase 3: Product Reviews and Ratings

**Goal:** Complete review system with submission, moderation, and display. Directly impacts conversion through social proof.

### Task 3.1: Review Schema

- [ ] Write test: Test review table constraints: unique constraint on (userId, productId), rating between 1-5, status enum (pending/approved/rejected/flagged). Test review_helpful_vote unique constraint on (userId, reviewId).
- [ ] Implement: Add `review` table to schema (id, productId FK, userId FK, rating integer 1-5, title varchar(120), body text max 2000, status enum, createdAt, updatedAt). Add `reviewHelpfulVote` table (id, reviewId FK, userId FK, createdAt, unique on reviewId+userId). Add `averageRating` decimal and `reviewCount` integer columns to product table with defaults of null/0.
- [ ] Refactor: Add indexes on productId+status (for listing approved reviews), userId+productId (for unique constraint check), and createdAt (for sorting).

### Task 3.2: Review Service -- Submission and Eligibility

- [ ] Write test: Test `canReview(userId, productId)` returns true only if user has a delivered order containing the product and has not already reviewed it. Test `submitReview` creates a review with pending status. Test `updateReview` allows editing own pending/approved review. Test rejection of review for unowned product. Test text length validation (body max 2000, title max 120).
- [ ] Implement: Create `src/lib/server/services/review.ts` with `canReview`, `submitReview`, `updateReview`, `getProductReviews`, `getUserReviews` methods. Eligibility check queries orderItem + order (status=delivered) tables. Sanitize review text (strip HTML tags).
- [ ] Refactor: Extract eligibility query into a reusable function. Add input sanitization as a utility.

### Task 3.3: Review Aggregation and Helpful Votes

- [ ] Write test: Test `getProductReviewStats(productId)` returns average rating, total count, and distribution (count per star level). Test `voteHelpful(userId, reviewId)` creates vote and increments count. Test duplicate vote is rejected. Test that product.averageRating and product.reviewCount are updated when a review is approved.
- [ ] Implement: Add aggregation function that computes stats from approved reviews. Add helpful vote service methods. Create a trigger/hook that updates product table denormalized fields (averageRating, reviewCount) when a review is approved or removed.
- [ ] Refactor: Use a database transaction to ensure atomicity when updating review status and product aggregates simultaneously.

### Task 3.4: Review tRPC Router

- [ ] Write test: Test procedures: `reviews.submit` (authenticated, validates eligibility), `reviews.getByProduct` (public, returns approved reviews paginated), `reviews.voteHelpful` (authenticated), `reviews.canReview` (authenticated, returns boolean). Test sorting options (newest, highest, lowest, most helpful).
- [ ] Implement: Create `src/lib/server/api/reviews.ts` router. Add Zod schemas for review submission (rating 1-5, title max 120, body max 2000). Wire to review service. Support pagination and sorting parameters.
- [ ] Refactor: Add rate limiting (max 10 review submissions per hour per user).

### Task 3.5: Review Display on Product Pages

- [ ] Write test: Component test for ReviewList: renders reviews with star ratings, author, date, body, and helpful count. Test ReviewStats component shows average rating, count, and histogram. Test empty state when no reviews exist.
- [ ] Implement: Create `ReviewList.svelte`, `ReviewStats.svelte`, `ReviewCard.svelte`, and `StarRating.svelte` components in `src/lib/components/ui/`. Add review section to product detail page below product info. Show average rating on product listing cards. Add "Write a Review" button (visible only to eligible users).
- [ ] Refactor: Ensure star rating component is keyboard navigable (arrow keys) and screen-reader friendly (aria-label with current value).

### Task 3.6: Review Submission Form

- [ ] Write test: Component test for ReviewForm: validates star rating is selected, enforces max lengths, submits successfully with valid data, shows error on invalid data. Test edit mode pre-fills existing review data.
- [ ] Implement: Create `ReviewForm.svelte` with star rating selector (clickable stars), title input, body textarea with character counter, and submit button. Handle both create and edit flows. Show success confirmation with "pending moderation" message.
- [ ] Refactor: Add optimistic UI update (show review immediately with "pending" badge) so user sees their submission.

### Task 3.7: Admin Review Moderation

- [ ] Write test: Test admin procedures: `admin.reviews.listPending` returns pending reviews with product and user info, `admin.reviews.approve(id)` sets status to approved and updates product aggregates, `admin.reviews.reject(id)` sets status to rejected, `admin.reviews.flag(id)` sets status to flagged.
- [ ] Implement: Add review moderation section to admin panel: table of pending reviews with product name, reviewer, rating, text preview, and approve/reject/flag action buttons. Add filter by status. Add bulk approve/reject actions.
- [ ] Refactor: Log moderation actions to audit log. Send optional email notification to reviewer when review is approved.

- [ ] **Verification:** As a customer with a delivered order, submit a review. As admin, approve it. Verify review appears on product page with correct rating. Check product card shows average rating. Test helpful vote. Test that non-purchasers cannot submit reviews. [checkpoint marker]

---

## Phase 4: Wishlist Functionality

**Goal:** Save-for-later capability with sharing, wired to the existing `/account/wishlist` stub.

### Task 4.1: Wishlist Schema and Service

- [ ] Write test: Test add/remove wishlist items. Test unique constraint (userId + productId). Test max 100 items per user limit. Test `getWishlist(userId)` returns items with product data. Test `isInWishlist(userId, productId)` boolean check. Test share token generation and lookup.
- [ ] Implement: Add `wishlistItem` table to schema (id, userId FK, productId FK, shareToken nullable, addedAt, unique on userId+productId). Create `src/lib/server/services/wishlist.ts` with add, remove, getWishlist, isInWishlist, generateShareLink, getSharedWishlist methods. Share token is a random URL-safe string.
- [ ] Refactor: Add index on userId for fast wishlist retrieval. Add index on shareToken for share lookup.

### Task 4.2: Wishlist tRPC Router

- [ ] Write test: Test procedures: `wishlist.add` (authenticated, creates item), `wishlist.remove` (authenticated, removes item), `wishlist.list` (authenticated, returns user's wishlist with product details), `wishlist.toggle` (add if not present, remove if present), `wishlist.share` (generates share link), `wishlist.getShared` (public, returns shared wishlist by token).
- [ ] Implement: Create `src/lib/server/api/wishlist.ts` router. Add Zod schemas. Include current product price and stock status in list results. Flag items whose price has dropped since they were added.
- [ ] Refactor: Ensure 100-item limit is enforced with a clear error message.

### Task 4.3: Wishlist UI Components

- [ ] Write test: Component test for WishlistButton (heart icon): toggles filled/unfilled state on click, calls correct tRPC procedure. Test WishlistPage renders items with product image, name, price, stock status, and "Add to Cart" button.
- [ ] Implement: Create `WishlistButton.svelte` (heart icon toggle) for use on product cards and detail pages. Update existing `/account/wishlist/+page.svelte` stub to render real wishlist data. Add "Add to Cart" and "Remove" actions per item. Add "Share Wishlist" button that generates and copies a public URL. Show price-drop and back-in-stock indicators.
- [ ] Refactor: Add optimistic toggle on heart icon (instant visual feedback before server confirms). Handle unauthenticated state (redirect to login with return URL).

### Task 4.4: Shared Wishlist View

- [ ] Write test: Test that `/wishlist/shared/[token]` route loads shared wishlist data. Test that shared view is read-only (no add/remove actions). Test invalid token shows 404.
- [ ] Implement: Create `/wishlist/shared/[token]/+page.server.ts` and `+page.svelte` route. Display product grid with names, images, prices. No user identity shown unless owner opted in. Include "Add to Cart" buttons for viewers.
- [ ] Refactor: Add OG meta tags to shared wishlist page for social preview.

- [ ] **Verification:** Add products to wishlist from product cards and detail page. Verify heart icon state persists across page loads. Share wishlist and open shared link in incognito. Verify items appear. Remove items, verify count updates. Test 100-item limit. [checkpoint marker]

---

## Phase 5: Subscription and Recurring Orders

**Goal:** Stripe Billing integration for Subscribe & Save on eligible products.

### Task 5.1: Subscription Schema and Stripe Customer Linking

- [ ] Write test: Test subscription table structure (userId, productId, stripeSubscriptionId, stripePriceId, status, frequency, nextDeliveryDate, etc.). Test user table stripeCustomerId column. Test service method to get or create Stripe customer for a user.
- [ ] Implement: Add `stripeCustomerId` column to user table. Add `subscription` table to schema (id, userId FK, productId FK, stripeSubscriptionId unique, stripePriceId, status enum active/paused/cancelled/past_due, frequency enum monthly/quarterly, quantity, currentPeriodStart, currentPeriodEnd, cancelledAt, createdAt, updatedAt). Add `isSubscribable` boolean and `stripePriceId` text columns to product table. Create `src/lib/server/services/subscription.ts` with `getOrCreateStripeCustomer(userId)` method.
- [ ] Refactor: Add indexes on userId and stripeSubscriptionId for subscription table.

### Task 5.2: Subscription Creation Flow

- [ ] Write test: Test `createSubscription(userId, productId, frequency)` creates Stripe Subscription via API and stores local record. Test that non-subscribable products are rejected. Test that subscription price reflects the discount. Mock Stripe API calls.
- [ ] Implement: Implement subscription creation: look up Stripe price for product, get/create Stripe customer, call `stripe.subscriptions.create()`, store local subscription record. Handle the initial invoice payment. Create order record for the first delivery.
- [ ] Refactor: Extract Stripe API interactions into a thin wrapper for testability.

### Task 5.3: Subscription Webhook Handlers

- [ ] Write test: Test webhook handler for `invoice.paid` (creates order record, updates subscription period). Test `invoice.payment_failed` (updates status to past_due, sends notification email). Test `customer.subscription.updated` (syncs status changes). Test `customer.subscription.deleted` (marks subscription cancelled). Test webhook signature verification.
- [ ] Implement: Add subscription webhook event handlers to existing Stripe webhook endpoint (`src/routes/api/` or extend existing webhook route). Parse events, match to local subscriptions by stripeSubscriptionId, update status and create orders as needed. Send transactional emails for payment failures.
- [ ] Refactor: Ensure idempotent webhook processing (handle duplicate events gracefully via event ID tracking).

### Task 5.4: Subscription Management (Customer)

- [ ] Write test: Test `getUserSubscriptions(userId)` returns active subscriptions with product details. Test `pauseSubscription`, `resumeSubscription`, `cancelSubscription`, `updateFrequency` methods all call Stripe API and update local records.
- [ ] Implement: Create subscription tRPC router (`src/lib/server/api/subscriptions.ts`) with procedures for list, pause, resume, cancel, updateFrequency. Create `/account/subscriptions/+page.svelte` with subscription list showing product, frequency, next delivery date, status, and action buttons.
- [ ] Refactor: Add confirmation dialogs for cancel/pause actions. Show prorated refund information when applicable.

### Task 5.5: Subscribe & Save Product UI

- [ ] Write test: Component test for SubscribeOption: shows discount percentage, frequency selector, and "Subscribe" button. Test toggling between one-time and subscription purchase modes. Test that subscribe button initiates subscription checkout.
- [ ] Implement: Add `SubscribeOption.svelte` component to product detail page (conditional on product.isSubscribable). Show one-time price vs subscription price with savings callout. Frequency dropdown (monthly/quarterly). "Subscribe & Save" button triggers subscription creation flow, then redirects to Stripe Checkout for initial payment.
- [ ] Refactor: Ensure non-subscribable products show no subscription UI. Handle loading and error states.

### Task 5.6: Admin Subscription Management

- [ ] Write test: Test admin procedures: list all subscriptions with filters (status, product), view MRR calculation, view churn rate. Test subscription detail view.
- [ ] Implement: Add subscription management section to admin panel: table of all subscriptions with user, product, status, frequency, MRR contribution. Add MRR summary card. Add filter by status and product. Make products subscribable/non-subscribable from admin product edit.
- [ ] Refactor: Calculate MRR from active subscriptions. Show trends (new subs vs cancellations over time).

- [ ] **Verification:** Mark a product as subscribable in admin. As a customer, subscribe to it. Verify Stripe Subscription created. Simulate webhook events (invoice.paid) and verify order is created. Pause and resume from account page. Cancel and verify status updates. Check MRR in admin. [checkpoint marker]

---

## Phase 6: Loyalty Program and Recently Viewed

**Goal:** Points-based rewards system and recently viewed product tracking.

### Task 6.1: Loyalty Points Schema and Settings

- [ ] Write test: Test loyalty_points_ledger table structure (userId, points, type enum earned/redeemed/expired/bonus/refund_restore, orderId, description, createdAt). Test loyalty_settings table (pointsPerDollar, pointsRedemptionRate, expiryMonths). Test default settings creation.
- [ ] Implement: Add `loyaltyPointsLedger` table and `loyaltySettings` table to schema. Create `src/lib/server/services/loyalty.ts` with `getSettings`, `updateSettings`, `getBalance(userId)`, `getHistory(userId)` methods. Initialize default settings (1 point/$1, 100 points = $1, 12 month expiry).
- [ ] Refactor: Add index on userId and createdAt for ledger queries.

### Task 6.2: Earning Points on Delivered Orders

- [ ] Write test: Test that when order status changes to "delivered", points are credited to user's ledger. Test point calculation (order total * pointsPerDollar). Test double points on first order. Test that points are NOT earned on orders with refund status. Test that re-delivering an order does not double-credit points.
- [ ] Implement: Add hook/trigger in order service: when order status transitions to "delivered", calculate and credit loyalty points. Check if this is user's first delivered order for double-points bonus. Record ledger entry with orderId reference. Add idempotency check (don't credit if ledger entry already exists for this orderId).
- [ ] Refactor: Make point earning async (queue or background) so it does not slow down order status updates.

### Task 6.3: Redeeming Points at Checkout

- [ ] Write test: Test `redeemPoints(userId, points)` deducts from balance and returns discount amount. Test insufficient balance rejection. Test that redemption is recorded in ledger. Test checkout integration: points discount appears as line item. Test that refunded order restores redeemed points.
- [ ] Implement: Add `redeemPoints` and `restorePoints` methods to loyalty service. Integrate with checkout flow: add points redemption input to checkout page, validate balance, apply discount. On order refund, restore redeemed points with ledger entry type "refund_restore". Update order model to track `loyaltyPointsRedeemed` and `loyaltyPointsDiscount`.
- [ ] Refactor: Use database transaction for atomic balance check + deduction. Ensure points discount stacks with discount codes (as per FR-9 AC-9.3).

### Task 6.4: Loyalty tRPC Router and Account UI

- [ ] Write test: Test procedures: `loyalty.getBalance` (returns current points), `loyalty.getHistory` (returns paginated ledger entries), `loyalty.redeem` (validates and deducts), `loyalty.getSettings` (admin only).
- [ ] Implement: Create `src/lib/server/api/loyalty.ts` router. Add loyalty section to account page (`/account/`) showing: current balance, points history table, and next expiration info. Display points balance in header/account dropdown.
- [ ] Refactor: Format points history with descriptive labels ("Earned from Order #1234", "Redeemed at checkout", etc.).

### Task 6.5: Points Expiration Job

- [ ] Write test: Test expiration logic: points older than 12 months with no new order activity are expired. Test that active customers (recent orders) do not lose points. Test ledger entries are created for expired points.
- [ ] Implement: Create expiration check function in loyalty service. Add API route for cron trigger (`/api/cron/expire-loyalty-points`). Find users with points whose last order was > 12 months ago, create "expired" ledger entries zeroing their balance.
- [ ] Refactor: Process in batches. Log expiration events. Add admin notification for large expirations.

### Task 6.6: Admin Loyalty Dashboard

- [ ] Write test: Test admin procedures: total points in circulation, total points redeemed, redemption rate, top earners list, loyalty settings CRUD.
- [ ] Implement: Add loyalty section to admin panel: stats cards (total points outstanding, redemption rate, average balance), top earners table, settings management form (points per dollar, redemption rate, expiry period). Allow admin to manually adjust a user's points with a reason.
- [ ] Refactor: Ensure settings changes take effect immediately for new transactions but do not retroactively affect existing ledger entries.

### Task 6.7: Recently Viewed -- Schema, Service, and UI

- [ ] Write test: Test `recordView(userId, productId)` creates/updates recently viewed entry. Test `getRecentlyViewed(userId, limit)` returns products ordered by most recent. Test duplicate view updates timestamp. Test max 50 stored entries per user (oldest pruned). Test guest (no userId) path returns empty (handled client-side).
- [ ] Implement: Add `recentlyViewed` table to schema (id, userId FK, productId FK, viewedAt, unique on userId+productId). Create `src/lib/server/services/recently-viewed.ts`. Create tRPC procedure `products.recordView` (authenticated) and `products.getRecentlyViewed` (authenticated). Create `RecentlyViewed.svelte` component showing horizontal product card carousel. Add to homepage, product detail pages, and cart page. For guest users, implement localStorage-based tracking in a Svelte store with `recentlyViewedStore.ts`.
- [ ] Refactor: Ensure product detail page calls recordView on mount. Exclude currently viewed product from the list. Lazy-load the recently viewed section.

- [ ] **Verification:** Complete a purchase, have admin mark as delivered. Verify loyalty points appear in account. Redeem points at checkout, verify discount applied. Browse products, verify recently viewed section populates. Test guest recently viewed in localStorage. Check admin loyalty stats. [checkpoint marker]

---

## Phase 7: Product Recommendations and Abandoned Cart Recovery

**Goal:** Data-driven recommendations and automated cart recovery emails to drive conversions and repeat purchases.

### Task 7.1: Recommendation Schema and Computation Job

- [ ] Write test: Test `productRecommendation` table structure (sourceProductId, recommendedProductId, type enum also_bought/frequently_together/category_based, score, isManualOverride). Test co-occurrence computation: given orders [{A,B,C}, {A,B}, {A,D}], product A's "also bought" list should be [B(2), C(1), D(1)]. Test "frequently bought together" bundles extraction.
- [ ] Implement: Add `productRecommendation` table to schema (id, sourceProductId FK, recommendedProductId FK, type enum, score decimal, isManualOverride boolean, computedAt). Create `src/lib/server/services/recommendation.ts` with `computeRecommendations()` batch job: query all orders with 2+ items, compute co-occurrence matrix, store top 8 recommendations per product. Add fallback: for products with < 3 recommendations, fill with category-based similar products.
- [ ] Refactor: Ensure computation is efficient (batch query, in-memory matrix). Clear and recompute (non-manual) entries on each run. Preserve manual overrides.

### Task 7.2: Recommendation tRPC Router and API Route

- [ ] Write test: Test `recommendations.getForProduct(productId)` returns "also bought" list. Test `recommendations.getFrequentlyBoughtTogether(productIds)` returns bundle suggestions for cart items. Test fallback to category-based when no recommendations exist. Test admin manual override CRUD.
- [ ] Implement: Create `src/lib/server/api/recommendations.ts` router. Add cron API route (`/api/cron/compute-recommendations`) for nightly execution. Add admin procedures for manual override: set/remove curated recommendations for a product.
- [ ] Refactor: Cache recommendation queries with short TTL (5 min) to avoid repeated DB hits on popular products.

### Task 7.3: Recommendation UI Components

- [ ] Write test: Component test for RecommendationCarousel: renders product cards for "Also Bought" section. Test FrequentlyBoughtTogether component shows bundle with combined price and "Add All to Cart" button. Test empty state when no recommendations exist.
- [ ] Implement: Create `RecommendationCarousel.svelte` and `FrequentlyBoughtTogether.svelte` components. Add "Customers Also Bought" section to product detail page (below reviews). Add "Frequently Bought Together" section to cart page. "Add All to Cart" button adds multiple products in one action.
- [ ] Refactor: Lazy-load recommendation sections. Use skeleton loaders during fetch.

### Task 7.4: Abandoned Cart Detection and Email Sequence

- [ ] Write test: Test abandoned cart detection: cart with items, no order for userId within 1 hour, user has email = abandoned. Test email sequence: 1st email at 1h, 2nd at 24h, 3rd at 72h. Test sequence stops if order is placed or cart is emptied. Test duplicate prevention (don't re-send for same cart). Test abandoned_cart_email_log table tracking.
- [ ] Implement: Add `abandonedCartEmailLog` table to schema (id, cartId FK, userId FK, emailNumber 1/2/3, sentAt, openedAt, clickedAt, convertedAt). Create `src/lib/server/services/abandoned-cart.ts` with `detectAbandonedCarts()` and `sendRecoveryEmail(cartId, emailNumber)`. Create recovery email templates (1st: reminder, 2nd: social proof, 3rd: optional incentive code). Add cron API route (`/api/cron/abandoned-cart-recovery`) running every 15 minutes.
- [ ] Refactor: Process in batches of 100. Add configurable timing intervals. Check cart still has items before sending.

### Task 7.5: Abandoned Cart Admin Configuration

- [ ] Write test: Test admin config procedures: toggle feature on/off, set email intervals, set optional incentive discount code. Test recovery metrics query (sent/opened/clicked/converted counts).
- [ ] Implement: Add abandoned cart settings to admin: enable/disable toggle, interval configuration, optional discount code selection (links to discount_code table). Add metrics dashboard section: recovery emails sent, open rate, click rate, conversion rate, revenue recovered.
- [ ] Refactor: Store settings in a general `appSettings` table or extend loyalty_settings to a generic settings table.

### Task 7.6: Recovery Email Content and Tracking

- [ ] Write test: Test recovery email template renders cart contents (product names, images, prices, quantities). Test email includes direct link to cart page. Test 3rd email includes incentive code when configured. Test open tracking pixel URL generation. Test click tracking URL wrapping.
- [ ] Implement: Create recovery email templates for each of the 3 emails. Include cart product listing, total, and CTA button linking to `/cart`. Add optional discount code in 3rd email. Implement simple open tracking via a 1x1 pixel endpoint (`/api/track/email-open/[logId]`). Implement click tracking via redirect endpoint (`/api/track/email-click/[logId]`). Mark as converted when user with tracked cartId completes an order.
- [ ] Refactor: Ensure tracking endpoints are lightweight and fast. Handle cases where images are blocked (open tracking will undercount).

- [ ] **Verification:** Add items to cart as authenticated user. Wait for cron to run (or trigger manually). Verify recovery email is received with cart contents. Complete purchase, verify sequence stops. Check admin metrics. Test recommendation display on product and cart pages. Trigger recommendation computation, verify results appear. [checkpoint marker]

---

## Phase 8: Social Sharing, Analytics Dashboard, and Final Integration

**Goal:** Social share buttons, admin analytics with PostHog, and final cross-feature integration testing.

### Task 8.1: Social Sharing Component

- [ ] Write test: Component test for SocialShareButtons: renders Facebook, X, Pinterest, Copy Link buttons. Test that each button generates correct share URL with encoded parameters. Test Copy Link copies to clipboard and shows toast. Test Web Share API detection and fallback.
- [ ] Implement: Create `SocialShareButtons.svelte` component in `src/lib/components/ui/`. Accept props: url, title, description, imageUrl. Generate platform-specific share URLs (no third-party scripts). Implement Copy Link with Clipboard API and toast notification. Detect Web Share API on mobile and show native share dialog. Add component to product detail pages and content/blog pages.
- [ ] Refactor: Add proper aria-labels for accessibility. Ensure buttons are visually consistent with DaisyUI design.

### Task 8.2: Open Graph and Twitter Card Meta Tags

- [ ] Write test: Test that product detail pages include OG tags (og:title, og:description, og:image, og:url, og:type=product, product:price:amount, product:price:currency). Test content pages include OG tags with featured image. Test Twitter Card tags (twitter:card=summary_large_image, twitter:title, etc.).
- [ ] Implement: Add meta tag generation to product detail page `+page.svelte` (or `+page.ts` head function if using SvelteKit head management). Add meta tag generation to content/blog pages. Use svelte:head for injecting tags. Pull data from page load (product name, description, image URL, price).
- [ ] Refactor: Create a reusable `MetaTags.svelte` component that accepts title, description, image, url, and type props.

### Task 8.3: Analytics Data Aggregation Service

- [ ] Write test: Test `getRevenueOverTime(startDate, endDate, granularity)` returns daily/weekly/monthly revenue from orders. Test `getOrderStats(startDate, endDate)` returns order count, AOV, conversion rate. Test `getTopProducts(startDate, endDate, limit)` returns products ranked by revenue. Test `getCustomerCohorts(startDate, endDate)` returns new vs returning breakdown.
- [ ] Implement: Create `src/lib/server/services/analytics.ts` with aggregation query methods. Revenue over time: group orders by date with sum(totalAmount). Top products: join orderItems with products, group by product, sum revenue. Customer cohorts: query users by first order date, classify as new (first order in period) or returning. Compute AOV as totalRevenue / orderCount.
- [ ] Refactor: Use materialized/cached results for expensive queries (cache for 5 minutes). Ensure date range filtering uses indexed columns.

### Task 8.4: PostHog Integration for Funnel Metrics

- [ ] Write test: Test PostHog service wrapper: `captureEvent(distinctId, event, properties)` calls posthog-node capture. Test `queryFunnel(steps, dateRange)` calls PostHog API and returns funnel data. Test client-side event tracking setup.
- [ ] Implement: Create `src/lib/server/services/posthog.ts` wrapper around posthog-node. Add server-side event capture for key actions: purchase_completed, subscription_created, review_submitted. Add PostHog JS SDK to client via `+layout.svelte` for page view and add-to-cart tracking. Create admin API procedures that query PostHog for funnel data (page_view -> add_to_cart -> begin_checkout -> purchase_completed).
- [ ] Refactor: Ensure PostHog API key is in environment variables. Handle PostHog API errors gracefully (dashboard should still load with internal data even if PostHog is down).

### Task 8.5: Admin Analytics Dashboard UI

- [ ] Write test: Component test for analytics dashboard: renders revenue chart with data points, renders top products table, renders customer cohort breakdown. Test date range picker changes query parameters. Test loading and error states.
- [ ] Implement: Replace existing `/admin/analytics` stub with real dashboard. Use a charting library (Chart.js via svelte-chartjs or lightweight alternative). Build sections: Revenue KPI cards (total revenue, order count, AOV, conversion rate), Revenue over time line chart, Top products table, Customer cohorts bar chart, Affiliate performance summary, Subscription metrics (MRR, churn), Funnel visualization from PostHog data. Add date range picker with presets (7d, 30d, 90d, YTD, custom).
- [ ] Refactor: Lazy-load chart components. Ensure dashboard is responsive. Add refresh button for real-time updates.

### Task 8.6: Analytics tRPC Router

- [ ] Write test: Test admin-only analytics procedures: `analytics.revenue` returns time-series data, `analytics.topProducts` returns ranked list, `analytics.customerCohorts` returns cohort data, `analytics.funnelMetrics` returns PostHog funnel data, `analytics.subscriptionMetrics` returns MRR and churn. All require admin role.
- [ ] Implement: Create `src/lib/server/api/analytics.ts` router with admin-protected procedures. Wire to analytics and PostHog services. Add Zod schemas for date range and granularity parameters.
- [ ] Refactor: Add response caching headers for analytics data. Ensure all procedures validate admin role.

### Task 8.7: Cross-Feature Integration Testing

- [ ] Write test: Integration test for full customer journey: browse products (recently viewed populates) -> add to cart -> apply discount code -> redeem loyalty points -> checkout -> receive order confirmation email -> order delivered -> earn loyalty points -> submit review -> review approved -> product rating updates. Test abandoned cart flow: add to cart -> wait -> receive recovery email -> complete purchase -> sequence stops. Test subscription flow end-to-end.
- [ ] Implement: Fix any integration issues discovered during testing. Ensure all features work together without conflicts: discount + loyalty at checkout, review eligibility after subscription order delivery, newsletter subscriber receives abandoned cart email, etc.
- [ ] Refactor: Final cleanup pass on all new code. Ensure consistent error handling patterns. Verify all new tRPC routers are registered in `root.ts`.

### Task 8.8: Register All New Routers

- [ ] Write test: Test that appRouter includes all new routers (reviews, wishlist, loyalty, discounts, subscriptions, newsletter, recommendations, analytics) and they respond to basic queries.
- [ ] Implement: Update `src/lib/server/api/root.ts` to import and register: reviewsRouter, wishlistRouter, loyaltyRouter, discountsRouter, subscriptionsRouter, newsletterRouter, recommendationsRouter, analyticsRouter. Run `npm run check` to verify no TypeScript errors.
- [ ] Refactor: Ensure no naming conflicts. Run full test suite. Verify build succeeds.

- [ ] **Verification:** Run full test suite (`npm run test`). Run type check (`npm run check`). Run build (`npm run build`). Verify coverage meets 70% threshold for new code. Walk through complete customer journey manually in dev environment. Verify admin analytics dashboard loads with data. Confirm all email types send correctly via Resend. [checkpoint marker]

---

## Summary

| Phase | Focus | Key Deliverables | Est. Hours |
|-------|-------|-----------------|------------|
| 1 | Email + Newsletter | Resend integration, templates, newsletter CRUD | 10-12 |
| 2 | Discount Codes | Promotions engine, checkout integration, admin CRUD | 10-12 |
| 3 | Reviews + Ratings | Submit, moderate, display, helpful votes | 12-14 |
| 4 | Wishlist | Add/remove, share, existing stub wired | 8-10 |
| 5 | Subscriptions | Stripe Billing, webhooks, account management | 12-15 |
| 6 | Loyalty + Recently Viewed | Points ledger, redemption, expiry, browse history | 12-14 |
| 7 | Recommendations + Abandoned Cart | Co-occurrence engine, recovery emails, cron jobs | 12-14 |
| 8 | Social + Analytics + Integration | Share buttons, PostHog dashboard, final tests | 10-12 |
