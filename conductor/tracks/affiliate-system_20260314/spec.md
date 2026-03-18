# Specification: Affiliate System

## Overview

Build a complete affiliate marketing system for Aevani that enables content creators and newsletter partners to register, generate tracked referral links with optional coupon codes, and earn tiered commissions on attributed sales. The system includes an affiliate-facing dashboard with real-time analytics, an admin panel for approval and payout management, and shareable marketing assets.

## Background

The affiliate system is a core revenue driver for Aevani, targeting 20%+ of revenue from the affiliate channel within 60 days of launch. Existing infrastructure includes basic schema tables (`affiliate`, `affiliateLink`, `affiliateClick`), a service layer with fundamental CRUD operations, skeleton UI pages, and a working click-redirect handler at `/aff/[linkCode]` with 30-day cookie attribution. However, the current implementation lacks an approval workflow, coupon codes, tiered commissions, click deduplication, payout tracking, admin management, and newsletter partner support. All existing UI pages use placeholder/mock data.

### Current State Assessment

| Component | Status | Gap |
|-----------|--------|-----|
| DB schema (affiliate, affiliateLink, affiliateClick) | Exists | Missing: status/tier fields, coupon table, payout table, commission log |
| AffiliateService | Exists | No approval flow, no tiered commission calc, no dedup, no payout logic |
| tRPC affiliate router | Exists | Uses `protectedProcedure` instead of `affiliateProcedure`, missing admin endpoints |
| `/affiliate/join` page | Exists | Static; no real application form; wrong commission tiers displayed |
| `/affiliate/dashboard` page | Exists | Returns placeholder data; no real-time stats |
| `/affiliate/earnings` page | Exists | Returns zeros; no payout history |
| `/affiliate/links` page | Exists | Calls wrong tRPC method name (`generateLink` vs `createLink`) |
| `/affiliate/materials` page | Exists | Hardcoded mock data |
| `/aff/[linkCode]` redirect | Working | No click deduplication; no coupon code handling |
| Admin affiliate management | Missing | No admin routes or procedures for affiliates |
| Coupon/discount code system | Missing | No schema, no service, no UI |
| Payout tracking | Missing | No schema, no service |
| Newsletter partner tier | Missing | No differentiation |
| TOS page | Missing | No route, no content |

## Functional Requirements

### FR-1: Affiliate Registration with Admin Approval
**Description:** Users can apply to the affiliate program via a form. Applications enter a "pending" state and require admin approval before the affiliate can access the dashboard or generate links.

**Acceptance Criteria:**
- AC-1.1: Application form collects: website/social URL, audience size estimate, promotion plan (textarea), and accepts TOS checkbox
- AC-1.2: Submitting the form creates an affiliate record with `status: 'pending'`
- AC-1.3: User role remains `customer` until admin approves (then changes to `affiliate`)
- AC-1.4: Pending applicants see a "pending review" status page when visiting `/affiliate/dashboard`
- AC-1.5: Rejected applicants see rejection notice with optional admin feedback
- AC-1.6: Approved affiliates are notified (in-app; email is out of scope for this track)

**Priority:** P0 (Critical)

### FR-2: Referral Link Generation with Coupon Codes
**Description:** Approved affiliates can generate unique referral links for any active product. Each link can optionally be paired with a discount coupon code that the affiliate can share alongside the link for improved conversion rates.

**Acceptance Criteria:**
- AC-2.1: Affiliates can generate a link for any active product from the links page
- AC-2.2: Affiliates can specify an optional custom link code (validated for URL safety)
- AC-2.3: Each affiliate-product combination produces a unique link
- AC-2.4: Affiliates can optionally generate a coupon code paired with a link (percentage or fixed discount)
- AC-2.5: Generated coupon codes are unique and validated at checkout
- AC-2.6: Link and coupon code are displayed together for easy copy-paste sharing
- AC-2.7: Affiliates can deactivate/reactivate their links

**Priority:** P0 (Critical)

### FR-3: Click Tracking with Session-Based Deduplication
**Description:** Every click on an affiliate link is tracked with IP address, user agent, referer, and timestamp. Duplicate clicks from the same session within a configurable window are deduplicated to prevent inflated metrics.

**Acceptance Criteria:**
- AC-3.1: Each click records IP address, user agent, referer, session ID, and timestamp
- AC-3.2: Clicks from the same session ID + affiliate link within 24 hours are counted once (deduplication)
- AC-3.3: Click count on `affiliateLink` and `affiliate` tables reflect deduplicated totals
- AC-3.4: Raw click data (including duplicates) is preserved in `affiliateClick` for audit
- AC-3.5: A `isUnique` boolean flag on `affiliateClick` distinguishes unique vs duplicate clicks

**Priority:** P0 (Critical)

### FR-4: Conversion Attribution
**Description:** When a customer completes checkout, the system attributes the order to the affiliate whose link or coupon code was used. Attribution uses 30-day cookie-based tracking (already implemented in `/aff/[linkCode]`), extended to also support coupon-code-based attribution.

**Acceptance Criteria:**
- AC-4.1: Orders placed within 30 days of clicking an affiliate link are attributed to that affiliate
- AC-4.2: If a customer uses an affiliate coupon code at checkout, the order is attributed to the coupon's affiliate even without a prior click
- AC-4.3: Coupon-based attribution takes precedence over cookie-based attribution if both exist
- AC-4.4: Attribution is recorded on the order via `affiliateLinkId` and in a new `affiliateCommissionLog`
- AC-4.5: Conversion increments the link's and affiliate's conversion counters

**Priority:** P0 (Critical)

### FR-5: Tiered Commission Structure
**Description:** Commissions are calculated using a tiered structure based on the affiliate's attributed sales in the current calendar month.

**Acceptance Criteria:**
- AC-5.1: Base tier: 8% commission (monthly attributed sales $0 - $499.99)
- AC-5.2: Silver tier: 12% commission (monthly attributed sales $500 - $1,999.99)
- AC-5.3: Gold tier: 16% commission (monthly attributed sales $2,000+)
- AC-5.4: Tier is recalculated on each conversion based on current month's total attributed sales
- AC-5.5: The commission rate applied to a specific order is the rate valid at the time of that conversion
- AC-5.6: Affiliate dashboard displays current tier and progress toward next tier
- AC-5.7: Default commission rate for new affiliates is 8% (0.08)

**Priority:** P0 (Critical)

### FR-6: Affiliate Dashboard
**Description:** A real-time dashboard where affiliates can view their performance metrics, recent activity, and account status.

**Acceptance Criteria:**
- AC-6.1: Dashboard displays: total clicks, total conversions, conversion rate, total earnings, current month earnings, pending payout amount
- AC-6.2: Current commission tier is displayed with visual progress bar toward next tier
- AC-6.3: Recent activity table shows last 20 link interactions with product name, date, click/conversion status, and earnings
- AC-6.4: Quick action links to: generate links, view earnings, access materials
- AC-6.5: Affiliate code is displayed with copy-to-clipboard functionality
- AC-6.6: Data updates reflect within current page load (no websocket requirement)

**Priority:** P0 (Critical)

### FR-7: Link Performance Analytics
**Description:** Per-link analytics showing clicks, conversions, earnings, and conversion rate for each affiliate link.

**Acceptance Criteria:**
- AC-7.1: Links table displays: product name, link URL, coupon code (if any), clicks, conversions, conversion rate, earnings, status
- AC-7.2: Links can be sorted by clicks, conversions, or earnings
- AC-7.3: Each link row has copy-to-clipboard for the affiliate URL and coupon code
- AC-7.4: Links can be filtered by active/inactive status

**Priority:** P1 (High)

### FR-8: Admin Affiliate Management
**Description:** Admin panel for managing affiliate applications, viewing performance, and handling payouts.

**Acceptance Criteria:**
- AC-8.1: Admin can view list of all affiliate applications with status filter (pending, approved, rejected, suspended)
- AC-8.2: Admin can approve a pending application (sets status to 'approved', changes user role to 'affiliate')
- AC-8.3: Admin can reject a pending application with an optional reason message
- AC-8.4: Admin can suspend an active affiliate (sets status to 'suspended', prevents further link usage)
- AC-8.5: Admin can view individual affiliate performance: clicks, conversions, earnings, links, current tier
- AC-8.6: Admin can override an affiliate's commission rate (custom rate takes precedence over tier)
- AC-8.7: Admin section is accessible at `/admin/affiliates`

**Priority:** P0 (Critical)

### FR-9: Manual Payout System
**Description:** Track commission earnings with pending/paid status and provide CSV export of pending payouts for manual processing.

**Acceptance Criteria:**
- AC-9.1: Each commission earned creates a record in `affiliateCommissionLog` with status 'pending'
- AC-9.2: Admin can view all pending payouts grouped by affiliate with total amounts
- AC-9.3: Admin can export pending payouts as CSV (affiliate name, email, payout amount, payment details)
- AC-9.4: Admin can mark payouts as 'paid' (individually or bulk) with payment reference
- AC-9.5: Affiliate earnings page shows payout history with status (pending, paid) and payment date
- AC-9.6: Minimum payout threshold: $50

**Priority:** P1 (High)

### FR-10: Shareable Assets and Deep Links
**Description:** Provide affiliates with downloadable product images and deep link generation for specific products to support micro-influencer content creation.

**Acceptance Criteria:**
- AC-10.1: Materials page displays product images available for download (sourced from product images in DB)
- AC-10.2: Each product card on materials page has a "Generate Link" button that creates an affiliate link for that product
- AC-10.3: Product images can be downloaded directly from the materials page
- AC-10.4: Materials page shows brand guidelines (colors, logo, dos/don'ts)

**Priority:** P2 (Medium)

### FR-11: Newsletter Partner Tier
**Description:** A differentiated affiliate tier for newsletter partners with adjusted commission terms and pre-written email copy blocks.

**Acceptance Criteria:**
- AC-11.1: Affiliate record supports an `affiliateType` field: 'standard' or 'newsletter_partner'
- AC-11.2: Newsletter partners have a distinct base commission rate (configurable, default 10%)
- AC-11.3: Newsletter partners see a "Newsletter Copy" section on the materials page with pre-written email blocks
- AC-11.4: Admin can designate an affiliate as a newsletter partner
- AC-11.5: Newsletter email copy blocks include: subject line, body text with placeholder for affiliate link, and call-to-action

**Priority:** P2 (Medium)

### FR-12: Affiliate Terms of Service Page
**Description:** A static page displaying the affiliate program terms, guidelines, and compliance requirements.

**Acceptance Criteria:**
- AC-12.1: Page is accessible at `/affiliate/terms`
- AC-12.2: Content includes: program overview, commission structure, payment terms, prohibited activities, termination clauses, FTC disclosure requirements
- AC-12.3: Page is publicly accessible (no authentication required)
- AC-12.4: Application form links to this page and requires TOS checkbox

**Priority:** P1 (High)

## Non-Functional Requirements

### NFR-1: Performance
- Click tracking endpoint must respond in < 200ms (redirect should not be perceptibly delayed)
- Dashboard page load must complete in < 1 second with typical data volumes (< 1000 links per affiliate)
- Click deduplication lookup must use indexed queries

### NFR-2: Security
- Affiliate routes must use `affiliateProcedure` middleware (role check for 'affiliate' or 'admin')
- Admin affiliate routes must use `adminProcedure` middleware
- Click tracking endpoint remains public (no auth) but validates input
- Coupon codes must not be guessable (minimum 8 characters, alphanumeric)
- Affiliate cookie (`affiliate-link`) must be httpOnly, secure, sameSite: lax

### NFR-3: Data Integrity
- Commission calculations must use decimal arithmetic (no floating point rounding errors)
- Click counts must be eventually consistent (fire-and-forget is acceptable for the redirect path)
- Payout status transitions must be auditable

### NFR-4: Test Coverage
- 70% coverage target for all new/modified service and router code
- Critical paths requiring coverage: commission tier calculation, click deduplication, conversion attribution, payout status transitions

## User Stories

### US-1: Affiliate Registration
**As a** content creator interested in sustainable agriculture,
**I want to** apply to Aevani's affiliate program,
**So that** I can earn commissions by recommending products to my audience.

**Scenarios:**
- **Given** I am a logged-in user, **When** I visit `/affiliate/join` and submit the application form, **Then** my application is created with status 'pending' and I see a confirmation message.
- **Given** I have a pending application, **When** I visit `/affiliate/dashboard`, **Then** I see a "pending review" status page instead of the dashboard.
- **Given** an admin has approved my application, **When** I visit `/affiliate/dashboard`, **Then** I see the full dashboard with my affiliate code and metrics.

### US-2: Link Generation and Sharing
**As an** approved affiliate,
**I want to** generate referral links with optional coupon codes for specific products,
**So that** I can share them with my audience and track which products perform best.

**Scenarios:**
- **Given** I am an approved affiliate on the links page, **When** I select a product and click "Generate Link", **Then** a unique affiliate link is created and displayed with a copy button.
- **Given** I have generated a link, **When** I toggle the "Create Coupon Code" option, **Then** a discount coupon code is generated and displayed alongside the link.
- **Given** I have multiple links, **When** I view the links table, **Then** I see each link's clicks, conversions, earnings, and can sort/filter them.

### US-3: Commission Earnings
**As an** affiliate,
**I want to** see my commission tier and track my earnings over time,
**So that** I can understand my revenue and optimize my promotion strategy.

**Scenarios:**
- **Given** I have earned $0-$499 in attributed sales this month, **When** I view my dashboard, **Then** my tier shows "Base (8%)" with a progress bar toward $500.
- **Given** a customer purchases through my link, **When** the order is completed, **Then** my earnings update with the correct tiered commission amount.
- **Given** I have pending payouts above $50, **When** I view the earnings page, **Then** I see the pending amount and payout history.

### US-4: Admin Affiliate Management
**As an** administrator,
**I want to** review affiliate applications and manage active affiliates,
**So that** I can maintain program quality and process payouts.

**Scenarios:**
- **Given** there are pending applications, **When** I visit `/admin/affiliates`, **Then** I see a list of pending applications with applicant details.
- **Given** I am reviewing an application, **When** I click "Approve", **Then** the affiliate status changes to 'approved' and their user role becomes 'affiliate'.
- **Given** there are pending payouts, **When** I click "Export CSV", **Then** a CSV file downloads with all pending payout details.

## Technical Considerations

### Schema Changes Required
1. Add to `affiliate` table: `status` (pending/approved/rejected/suspended), `affiliateType` (standard/newsletter_partner), `applicationData` (JSON: website, audience size, plan), `rejectionReason`, `customCommissionRate`, `approvedAt`, `approvedBy`
2. New `affiliateCoupon` table: affiliateLinkId, code, discountType (percentage/fixed), discountValue, usageCount, maxUses, isActive, expiresAt
3. New `affiliateCommissionLog` table: orderId, affiliateId, affiliateLinkId, orderAmount, commissionRate, commissionAmount, tier, status (pending/paid), paidAt, paymentReference
4. Add `isUnique` boolean to `affiliateClick` table
5. Update default `commissionRate` from 0.05 to 0.08

### Service Layer Changes
- Refactor `AffiliateService.createAffiliate` to create with 'pending' status (no auto-approve)
- Add commission tier calculation logic
- Add click deduplication to `trackClick`
- Add coupon validation and attribution logic
- New `AffiliatePayoutService` for payout management

### tRPC Router Changes
- Migrate affiliate router to use `affiliateProcedure` for authenticated affiliate endpoints
- Add admin affiliate endpoints to `adminRouter` or create dedicated `adminAffiliateRouter`
- Fix `getRecentClicks` and `getEarnings` to return real data

### Checkout Integration Dependency
- Conversion attribution requires a working checkout flow (Track 1: transaction-core)
- For this track, implement the attribution hooks but note they activate when checkout is wired

## Out of Scope

- Automated email notifications (welcome, approval, payout)
- Real-time websocket updates on dashboard
- Automated payout processing (PayPal, Stripe Connect)
- Tax document generation (1099 forms)
- Multi-level/referral-chain affiliate structures
- A/B testing of coupon codes
- Fraud detection beyond basic click deduplication
- Mobile app deep links
- Affiliate API (for programmatic access)

## Open Questions

1. **Coupon discount limits:** Should there be a maximum discount percentage/amount that affiliates can create, or is this admin-controlled only?
2. **Commission on discounted orders:** Is the commission calculated on the pre-discount or post-discount order subtotal?
3. **Refund handling:** When an order is refunded, should the affiliate commission be clawed back automatically, or handled manually?
4. **Self-referral policy:** Can affiliates earn commission on their own purchases?
5. **Concurrent attribution:** If a customer clicks affiliate A's link, then later clicks affiliate B's link, which affiliate gets attribution? (Last-click assumed)
