# Growth Features -- Specification

## Overview

Post-launch feature set designed to increase customer lifetime value (LTV), drive repeat purchases, and deepen engagement with the Aevani platform. These features build on the completed transaction-core, auth, discovery, mobile-checkout, affiliate, and content-seo tracks.

## Background

With the core e-commerce loop operational (browse, cart, checkout, order) and the affiliate/content engines live, the platform needs mechanisms to retain customers, encourage return visits, and create habitual purchasing behavior. The sustainable agriculture market rewards loyalty: customers who find reliable seed and nutrient suppliers tend to reorder seasonally. This track captures that behavior through subscriptions, loyalty points, reviews, wishlists, recommendations, promotions, and email lifecycle campaigns.

---

## Functional Requirements

### FR-1: Product Reviews and Ratings

**Description:** Authenticated customers can submit star ratings (1-5) and text reviews on products they have purchased. Admin can moderate (approve, reject, flag) reviews before they appear publicly.

**Acceptance Criteria:**
- AC-1.1: Only authenticated users who have a completed (delivered) order containing the product can submit a review.
- AC-1.2: Each user can submit one review per product; they may edit their existing review.
- AC-1.3: Reviews include a 1-5 star rating (required) and optional text body (max 2000 chars) and optional title (max 120 chars).
- AC-1.4: Reviews default to "pending" status and require admin approval before public display.
- AC-1.5: Admin can view all pending reviews, approve, reject, or flag them from the admin panel.
- AC-1.6: Product detail pages display approved reviews with average rating, total review count, and rating distribution histogram.
- AC-1.7: Product listing cards show average rating stars and review count.
- AC-1.8: Reviews are sorted by newest first, with option to sort by highest/lowest rating and most helpful.
- AC-1.9: Users can mark a review as "helpful" (one vote per user per review).

**Priority:** P1

---

### FR-2: Subscription / Recurring Orders (Stripe Billing)

**Description:** Customers can subscribe to recurring deliveries of eligible products (seeds, nutrients, soil amendments) on monthly or custom intervals using Stripe Billing.

**Acceptance Criteria:**
- AC-2.1: Products have an optional `isSubscribable` flag and `subscriptionPriceId` linking to a Stripe Price object.
- AC-2.2: Product detail page shows a "Subscribe & Save" option with discount percentage (e.g., 10% off) alongside one-time purchase.
- AC-2.3: Subscription checkout creates a Stripe Subscription via Stripe Billing API.
- AC-2.4: Webhook handlers process `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, and `customer.subscription.deleted` events.
- AC-2.5: Customers can view, pause, resume, cancel, and change frequency of subscriptions from their account page.
- AC-2.6: Admin can view all active subscriptions, filter by status, and see MRR (monthly recurring revenue).
- AC-2.7: Failed payment triggers a retry sequence and notifies the customer via email.
- AC-2.8: Subscription orders create regular order records for fulfillment tracking.

**Priority:** P1

---

### FR-3: Wishlist Functionality

**Description:** Authenticated users can save products to a wishlist for later purchase and optionally share wishlists via a public URL.

**Acceptance Criteria:**
- AC-3.1: Authenticated users can add/remove products to/from their wishlist via a heart icon on product cards and detail pages.
- AC-3.2: Wishlist page (`/account/wishlist`) displays all saved products with current price, stock status, and "Add to Cart" action.
- AC-3.3: If a wishlisted product goes on sale or comes back in stock, the system can flag it (visual indicator on wishlist page).
- AC-3.4: Users can generate a shareable public link for their wishlist.
- AC-3.5: Shared wishlists are read-only and show product names, images, and prices without exposing the owner's identity unless they opt in.
- AC-3.6: Maximum 100 items per wishlist.

**Priority:** P2

---

### FR-4: Email Marketing Integration

**Description:** Replace the stub EmailService with a real email provider (Resend) for transactional emails and add marketing email capabilities.

**Acceptance Criteria:**
- AC-4.1: Integrate Resend SDK for transactional emails (order confirmation, shipping updates, password reset, email verification).
- AC-4.2: All transactional emails use branded HTML templates with Aevani design.
- AC-4.3: Marketing emails can be sent to subscriber segments (all subscribers, customers with orders, inactive customers).
- AC-4.4: Email templates are managed as server-side components with dynamic data injection.
- AC-4.5: Unsubscribe link in every marketing email; unsubscribe action updates user preferences immediately.
- AC-4.6: Email send events are logged for audit and analytics.
- AC-4.7: Rate limiting on email sends to prevent abuse.

**Priority:** P1

---

### FR-5: Customer Loyalty / Rewards Program

**Description:** Points-based loyalty program where customers earn points on purchases and redeem them for discounts on future orders.

**Acceptance Criteria:**
- AC-5.1: Customers earn 1 point per $1 spent (configurable ratio stored in a settings table).
- AC-5.2: Points are credited after order status reaches "delivered" (not on purchase, to prevent gaming with refunds).
- AC-5.3: Points can be redeemed at checkout: 100 points = $1 discount (configurable).
- AC-5.4: Account page shows current point balance, points history (earned, redeemed, expired), and tier status.
- AC-5.5: Points expire after 12 months of inactivity (no new orders).
- AC-5.6: Bonus points events: double points on first order, birthday bonus (if DOB is provided), referral bonus.
- AC-5.7: Admin can view loyalty program stats: total points in circulation, redemption rate, top earners.
- AC-5.8: Points balance is displayed in the account dropdown/header.
- AC-5.9: If an order with redeemed points is refunded, the points are restored.

**Priority:** P2

---

### FR-6: Advanced Analytics Dashboard (Admin)

**Description:** Admin dashboard integrating PostHog analytics and internal data to display sales trends, customer cohorts, product performance, and funnel metrics.

**Acceptance Criteria:**
- AC-6.1: Dashboard page at `/admin/analytics` shows: revenue over time (daily/weekly/monthly), order count, average order value (AOV), and conversion rate.
- AC-6.2: Customer cohort analysis: new vs returning customers, cohort retention (month-over-month).
- AC-6.3: Product performance table: top sellers by revenue and units, products with declining sales, review sentiment summary.
- AC-6.4: Funnel metrics from PostHog: page view -> add to cart -> checkout -> purchase conversion rates.
- AC-6.5: Affiliate performance summary: top affiliates, revenue by affiliate, commission costs.
- AC-6.6: Subscription metrics: MRR, churn rate, new subscriptions, and cancellations over time.
- AC-6.7: Data is queryable by date range with presets (7d, 30d, 90d, YTD, custom).
- AC-6.8: Dashboard loads in under 3 seconds for 90th percentile queries.
- AC-6.9: Charts rendered client-side; data fetched via tRPC from aggregated DB queries and PostHog API.

**Priority:** P2

---

### FR-7: Recently Viewed Products

**Description:** Track and display products the user has recently viewed to aid navigation and rediscovery.

**Acceptance Criteria:**
- AC-7.1: When a user views a product detail page, the product is added to their "recently viewed" list.
- AC-7.2: For authenticated users, recently viewed is stored in the database (persists across sessions/devices).
- AC-7.3: For guest users, recently viewed is stored in localStorage (client-side only).
- AC-7.4: Recently viewed section appears on the homepage, product detail pages, and cart page.
- AC-7.5: Displays up to 10 most recently viewed products, excluding the currently viewed product.
- AC-7.6: Duplicate views update the timestamp rather than creating new entries.

**Priority:** P3

---

### FR-8: Product Recommendations

**Description:** Display "Customers Also Bought" and "Frequently Bought Together" recommendations on product detail pages and in the cart.

**Acceptance Criteria:**
- AC-8.1: "Customers Also Bought" is computed from order co-occurrence: products that appear in the same orders as the current product, ranked by frequency.
- AC-8.2: "Frequently Bought Together" bundles show 2-3 products commonly purchased together with a combined price and "Add All to Cart" button.
- AC-8.3: Recommendations are pre-computed via a scheduled job (nightly) and cached in a recommendations table.
- AC-8.4: Fallback to category-based recommendations when insufficient order data exists.
- AC-8.5: Product detail page shows up to 8 "Also Bought" recommendations.
- AC-8.6: Cart page shows "Frequently Bought Together" for items in the cart.
- AC-8.7: Admin can manually curate/override recommendations for specific products.

**Priority:** P2

---

### FR-9: Discount Codes and Promotions Engine

**Description:** Comprehensive promotions system supporting percentage off, fixed amount off, free shipping, and BOGO (buy-one-get-one) discount codes.

**Acceptance Criteria:**
- AC-9.1: Admin can create discount codes with: code string, type (percentage, fixed_amount, free_shipping, bogo), value, minimum order amount, maximum discount amount, usage limit (total and per-customer), valid date range, and applicable product/category scope.
- AC-9.2: Customers enter discount codes at checkout; the system validates and applies the discount in real time.
- AC-9.3: Only one discount code per order (no stacking), but discount codes stack with loyalty point redemptions.
- AC-9.4: BOGO discounts automatically add the free item to the cart when conditions are met.
- AC-9.5: Discount usage is tracked; codes that exceed their usage limit are automatically deactivated.
- AC-9.6: Admin can view discount code performance: times used, total discount amount given, revenue attributed.
- AC-9.7: Expired or deactivated codes show a clear error message when customers attempt to use them.
- AC-9.8: Discount codes are case-insensitive.
- AC-9.9: Affiliate commission is calculated on the post-discount order amount.

**Priority:** P1

---

### FR-10: Abandoned Cart Recovery Emails

**Description:** Automatically send reminder emails to customers who add items to their cart but do not complete checkout within a configured time window.

**Acceptance Criteria:**
- AC-10.1: System identifies abandoned carts: carts with items that have not progressed to a completed order within 1 hour (configurable).
- AC-10.2: Only send recovery emails to authenticated users with a valid email (no guest cart recovery in V1).
- AC-10.3: Send up to 3 recovery emails per abandoned cart at intervals: 1 hour, 24 hours, 72 hours.
- AC-10.4: Recovery email includes cart contents (product names, images, prices), a direct link back to the cart page, and an optional incentive code.
- AC-10.5: If the customer completes the purchase or empties the cart, the recovery sequence stops.
- AC-10.6: Admin can configure recovery email timing, toggle the feature on/off, and set an optional discount code to include.
- AC-10.7: Track recovery email metrics: sent, opened (via pixel if possible), clicked, converted.
- AC-10.8: A background job (cron or scheduled task) processes abandoned carts periodically (every 15 minutes).

**Priority:** P2

---

### FR-11: Social Sharing Buttons

**Description:** Add share buttons on product pages and content pages for major social platforms.

**Acceptance Criteria:**
- AC-11.1: Product detail pages and blog/guide pages include share buttons for: Facebook, X (Twitter), Pinterest, and a "Copy Link" button.
- AC-11.2: Share buttons use native share URLs (no third-party tracking scripts).
- AC-11.3: Shared links include appropriate Open Graph and Twitter Card meta tags for rich previews.
- AC-11.4: Product shares include the product image, name, price, and a short description.
- AC-11.5: Content shares include the featured image, title, and excerpt.
- AC-11.6: "Copy Link" button shows a brief confirmation toast.
- AC-11.7: On mobile, show a native share dialog via the Web Share API when available, falling back to individual buttons.

**Priority:** P3

---

### FR-12: Newsletter Subscription and Management

**Description:** Allow visitors and customers to subscribe to the Aevani newsletter, and provide admin tools to manage the subscriber list.

**Acceptance Criteria:**
- AC-12.1: Newsletter signup form in the site footer and on a dedicated `/newsletter` page.
- AC-12.2: Subscription requires email only; no account required.
- AC-12.3: Double opt-in: after submitting, user receives a confirmation email with a verification link.
- AC-12.4: Subscribers table stores: email, subscription status (pending, active, unsubscribed), subscribed_at, verified_at, unsubscribed_at, and source (footer, page, checkout).
- AC-12.5: Unsubscribe link in every newsletter email; one-click unsubscribe.
- AC-12.6: Admin can view subscriber count, export subscriber list (CSV), and see growth trends.
- AC-12.7: Prevent duplicate subscriptions; if already subscribed, show a friendly message.
- AC-12.8: GDPR-compliant: clear consent language, easy unsubscribe, data export on request.

**Priority:** P2

---

## Non-Functional Requirements

### NFR-1: Performance
- Product pages with reviews load in under 2 seconds (P95).
- Analytics dashboard queries complete in under 3 seconds (P90).
- Recommendation pre-computation job completes in under 5 minutes for up to 10,000 products.
- Email sends are async and do not block user-facing requests.
- Recently viewed and wishlist operations complete in under 200ms.

### NFR-2: Security
- Review text is sanitized to prevent XSS (strip HTML, allow only plain text).
- Discount codes are validated server-side; client cannot manipulate discount amounts.
- Loyalty points ledger uses atomic transactions to prevent double-spend.
- Email unsubscribe tokens are cryptographically secure and single-use.
- Stripe webhook signatures are verified for all subscription events.
- Rate limiting on review submissions (max 10 per hour per user), newsletter signups (max 5 per IP per hour), and email sends.

### NFR-3: Scalability
- Reviews, wishlists, and recently viewed use indexed queries that perform well up to 1M records.
- Recommendation computation is designed to run offline (batch) and not impact live traffic.
- Abandoned cart job processes in batches of 100 to avoid long-running transactions.

### NFR-4: Accessibility
- All new UI components meet WCAG 2.1 AA standards.
- Star rating input is keyboard navigable and screen-reader friendly.
- Social share buttons have proper aria labels.

---

## User Stories

### US-1: Product Reviews
**As a** customer who has purchased a product,
**I want to** leave a star rating and written review,
**So that** I can share my experience and help other buyers make decisions.

**Given** I am logged in and have received a delivered order containing Product X,
**When** I navigate to Product X's detail page and click "Write a Review",
**Then** I see a form with star rating selector and text fields, and upon submission, I see a confirmation that my review is pending moderation.

### US-2: Subscribe and Save
**As a** regular customer who buys nutrients monthly,
**I want to** set up a recurring delivery subscription,
**So that** I never run out of supplies and I save money with a subscription discount.

**Given** I am on a subscribable product's detail page,
**When** I select "Subscribe & Save" and choose a monthly frequency,
**Then** I am taken through checkout to set up a Stripe Subscription, and my first order is placed immediately.

### US-3: Wishlist
**As a** browsing customer,
**I want to** save products I am interested in to a wishlist,
**So that** I can easily find and purchase them later.

**Given** I am logged in and viewing a product,
**When** I click the heart icon,
**Then** the product is added to my wishlist and the heart icon fills in to confirm.

### US-4: Loyalty Points
**As a** repeat customer,
**I want to** earn points on my purchases and redeem them for discounts,
**So that** I am rewarded for my loyalty and incentivized to keep shopping here.

**Given** I have 500 loyalty points and I am at checkout,
**When** I choose to redeem 500 points,
**Then** $5.00 is deducted from my order total and my point balance is reduced accordingly.

### US-5: Discount Code
**As a** customer with a promo code,
**I want to** apply it at checkout,
**So that** I receive the advertised discount on my order.

**Given** I have items in my cart totaling $50 and a valid 20% off code,
**When** I enter the code at checkout,
**Then** the order total updates to $40 and the discount is displayed clearly.

### US-6: Abandoned Cart Recovery
**As a** customer who left items in my cart,
**I want to** receive a reminder email,
**So that** I can easily return and complete my purchase.

**Given** I added items to my cart 1 hour ago without checking out,
**When** the abandoned cart job runs,
**Then** I receive an email with my cart contents and a link back to my cart.

### US-7: Admin Analytics
**As an** admin,
**I want to** see sales trends and customer behavior data,
**So that** I can make informed decisions about inventory, marketing, and product strategy.

**Given** I am logged in as admin and navigate to `/admin/analytics`,
**When** I select a 30-day date range,
**Then** I see revenue charts, top products, conversion funnels, and customer cohort data for that period.

---

## Technical Considerations

1. **Database Schema Additions:** New tables: `review`, `review_helpful_vote`, `wishlist_item`, `loyalty_points_ledger`, `loyalty_settings`, `discount_code`, `discount_usage`, `newsletter_subscriber`, `recently_viewed`, `product_recommendation`, `subscription`, `abandoned_cart_email_log`. Product table gains `isSubscribable`, `stripePriceId`, `averageRating`, `reviewCount` columns.

2. **Stripe Billing Integration:** Requires creating Stripe Products and Prices for subscribable items. New webhook event handlers for subscription lifecycle events. Stripe Customer objects must be linked to Aevani user records (add `stripeCustomerId` to user table).

3. **Email Provider Migration:** Replace stub `EmailService` with Resend SDK. Requires `RESEND_API_KEY` environment variable. Build HTML email templates for each transactional and marketing email type.

4. **Background Jobs:** Abandoned cart recovery and recommendation pre-computation require scheduled execution. Options: SvelteKit API route triggered by external cron (Railway cron jobs or similar), or in-process `setInterval` for simpler deployment.

5. **PostHog Integration:** `posthog-node` is already a dependency. Server-side event capture for purchases, signups. Client-side PostHog JS SDK needed for funnel tracking (page views, add-to-cart, checkout initiation). Admin dashboard queries PostHog API for funnel data.

6. **tRPC Router Organization:** New routers: `reviews`, `wishlist`, `loyalty`, `discounts`, `subscriptions`, `newsletter`, `recommendations`, `analytics`. Each follows existing pattern with Zod validation.

7. **Existing Wishlist Route:** The route `/account/wishlist` already exists as a stub page. This track will wire it to real data.

8. **Existing Analytics Route:** The route `/admin/analytics` already exists as a stub. This track will replace it with real dashboard components.

---

## Out of Scope

- AI/ML-based recommendation engine (V1 uses co-occurrence counting only).
- Push notifications (web or mobile).
- SMS marketing.
- Multi-currency or multi-language support.
- Gift cards or store credit (separate from loyalty points).
- Tiered loyalty membership levels (V1 is flat-rate points only).
- A/B testing framework (PostHog feature flags are available but not in this track's scope).
- Automated email campaign builder/editor (V1 uses code-defined templates).
- Guest wishlist (localStorage-based; V1 requires authentication).
- Review photos/media uploads.

---

## Open Questions

1. **Subscription Frequencies:** Should we offer only monthly, or also biweekly and quarterly options? (Defaulting to monthly + quarterly for V1.)
2. **Loyalty Point Multipliers:** Should affiliate-referred purchases earn bonus points for the customer? (Defaulting to no for V1.)
3. **Review Incentives:** Should customers earn bonus loyalty points for leaving a review? (Defaulting to yes, 25 points per approved review.)
4. **Abandoned Cart Discount:** Should the third recovery email include an auto-generated discount code? (Defaulting to admin-configurable option.)
5. **Recommendation Cold Start:** For new products with no order history, should we show editor-curated picks or category-based similar products? (Defaulting to category-based with manual override.)
