# Implementation Plan: Affiliate System

## Overview

This plan is organized into 7 phases, progressing from foundational schema changes through core business logic, to UI integration and admin tooling. Each phase builds on the previous one. The approach prioritizes backend service correctness (with tests) before wiring up UI, since most existing pages already have skeleton markup.

**Dependencies:** Track 1 (transaction-core) for checkout attribution to be fully exercised; this track implements the hooks regardless.

---

## Phase 1: Schema Evolution and Migration

**Goal:** Extend the database schema with all new tables and columns required by the affiliate system.

### Task 1.1: Add status and application fields to affiliate table
- [ ] Write test: Verify `affiliate` table insert/select with new fields (`status`, `affiliateType`, `applicationData`, `rejectionReason`, `customCommissionRate`, `approvedAt`, `approvedBy`) using Drizzle
- [ ] Implement: Update `affiliate` table definition in `plantapp/src/lib/server/db/schema.ts`:
  - Add `status` text column with enum `['pending', 'approved', 'rejected', 'suspended']`, default `'pending'`
  - Add `affiliateType` text column with enum `['standard', 'newsletter_partner']`, default `'standard'`
  - Add `applicationData` text column (JSON string: website, audienceSize, promotionPlan)
  - Add `rejectionReason` text column (nullable)
  - Add `customCommissionRate` decimal column (nullable, precision 5 scale 4)
  - Add `approvedAt` timestamp column (nullable)
  - Add `approvedBy` text column (nullable, references user.id)
  - Change `commissionRate` default from `'0.05'` to `'0.08'`
- [ ] Verify: Run `npm run db:generate` in `plantapp/` to produce migration, confirm no type errors

### Task 1.2: Create affiliateCoupon table
- [ ] Write test: Verify `affiliateCoupon` table insert/select/relations
- [ ] Implement: Add `affiliateCoupon` table to schema with columns: `id` (serial PK), `affiliateLinkId` (FK to affiliateLink), `code` (text, unique), `discountType` (enum: percentage/fixed), `discountValue` (decimal 10,2), `usageCount` (int, default 0), `maxUses` (int, nullable), `isActive` (bool, default true), `expiresAt` (timestamp, nullable), `createdAt`, `updatedAt`. Add indexes on `code` (unique) and `affiliateLinkId`.
- [ ] Implement: Add relations (affiliateCoupon -> affiliateLink, affiliateLink -> many affiliateCoupons)
- [ ] Verify: Generate migration, types compile

### Task 1.3: Create affiliateCommissionLog table
- [ ] Write test: Verify `affiliateCommissionLog` table insert/select/relations
- [ ] Implement: Add `affiliateCommissionLog` table: `id` (serial PK), `orderId` (FK to order), `affiliateId` (FK to affiliate), `affiliateLinkId` (FK to affiliateLink, nullable), `orderAmount` (decimal 10,2), `commissionRate` (decimal 5,4), `commissionAmount` (decimal 10,2), `tier` (text: base/silver/gold), `status` (enum: pending/paid), `paidAt` (timestamp, nullable), `paymentReference` (text, nullable), `createdAt`. Add indexes on `affiliateId`, `orderId`, `status`.
- [ ] Implement: Add relations (commissionLog -> order, affiliate, affiliateLink)
- [ ] Verify: Generate migration, types compile

### Task 1.4: Add isUnique to affiliateClick and export new types
- [ ] Write test: Verify `affiliateClick` insert with `isUnique` field
- [ ] Implement: Add `isUnique` boolean column to `affiliateClick` table, default `true`. Export types for new tables (`AffiliateCoupon`, `AffiliateCommissionLog`).
- [ ] Verify: Run `npm run db:generate` final migration, run `npm run check` to confirm zero type errors

---

## Phase 2: Core Business Logic - Registration and Approval

**Goal:** Implement the affiliate registration/approval workflow in the service layer and tRPC router with full test coverage.

### Task 2.1: Refactor AffiliateService.createAffiliate for pending status
- [ ] Write test: `createAffiliate` creates record with `status: 'pending'`, stores application data, does NOT change user role
- [ ] Write test: `createAffiliate` returns existing affiliate if user already applied (idempotent)
- [ ] Implement: Modify `AffiliateService.createAffiliate` in `plantapp/src/lib/server/services/affiliate.ts` to accept `applicationData` parameter, set `status: 'pending'`, `commissionRate: '0.08'`, remove the user role change logic
- [ ] Refactor: Extract Zod validation schema for application data

### Task 2.2: Implement approval/rejection service methods
- [ ] Write test: `approveAffiliate(affiliateId, adminUserId)` sets status to 'approved', sets approvedAt/approvedBy, changes user role to 'affiliate'
- [ ] Write test: `rejectAffiliate(affiliateId, reason)` sets status to 'rejected', stores rejection reason, user role stays 'customer'
- [ ] Write test: `suspendAffiliate(affiliateId)` sets status to 'suspended', deactivates all affiliate links
- [ ] Write test: Approving a non-pending affiliate throws error
- [ ] Implement: Add `approveAffiliate`, `rejectAffiliate`, `suspendAffiliate` methods to `AffiliateService`
- [ ] Refactor: Ensure all status transitions are validated (pending->approved, pending->rejected, approved->suspended)

### Task 2.3: Update tRPC affiliate router for registration
- [ ] Write test: `createAffiliate` mutation accepts application data and creates pending affiliate
- [ ] Write test: `getMyAffiliate` returns affiliate with status field
- [ ] Implement: Update `createAffiliate` procedure in `plantapp/src/lib/server/api/affiliate.ts` to accept application data input, remove automatic role change, return status
- [ ] Implement: Migrate procedures from `protectedProcedure` to `affiliateProcedure` where appropriate (keep `createAffiliate` as `protectedProcedure` since applicants are not yet affiliates)
- [ ] Refactor: Add `getApplicationStatus` procedure for pending/rejected applicants

### Task 2.4: Add admin affiliate endpoints
- [ ] Write test: `admin.getAffiliates` returns paginated list with status filter
- [ ] Write test: `admin.approveAffiliate` calls service and returns updated affiliate
- [ ] Write test: `admin.rejectAffiliate` stores reason and returns updated affiliate
- [ ] Write test: `admin.suspendAffiliate` deactivates affiliate and links
- [ ] Implement: Add affiliate management procedures to `plantapp/src/lib/server/api/admin.ts` using `adminProcedure`
- [ ] Verify: All tests pass, router types compile

---

## Phase 3: Core Business Logic - Tiered Commissions and Click Dedup

**Goal:** Implement the tiered commission calculation engine and click deduplication logic.

### Task 3.1: Commission tier calculation
- [ ] Write test: `calculateCommissionTier(monthlyAttributedSales)` returns correct tier and rate:
  - $0-$499.99 -> { tier: 'base', rate: 0.08 }
  - $500-$1999.99 -> { tier: 'silver', rate: 0.12 }
  - $2000+ -> { tier: 'gold', rate: 0.16 }
- [ ] Write test: `getMonthlyAttributedSales(affiliateId)` sums order subtotals for current calendar month
- [ ] Write test: Custom commission rate on affiliate record overrides tier calculation
- [ ] Implement: Add `calculateCommissionTier` and `getMonthlyAttributedSales` to `AffiliateService`
- [ ] Refactor: Use Decimal.js or string-based arithmetic for commission calculations to avoid floating point errors

### Task 3.2: Refactor processConversion with tiered commissions
- [ ] Write test: `processConversion(orderId)` calculates commission using current tier rate
- [ ] Write test: `processConversion` creates `affiliateCommissionLog` record with correct tier, rate, amount, status 'pending'
- [ ] Write test: `processConversion` updates affiliate's `totalEarnings` and `totalConversions`
- [ ] Write test: `processConversion` skips if no affiliate attribution on order
- [ ] Implement: Refactor `processConversion` in `AffiliateService` to use tiered rate, create commission log entry
- [ ] Refactor: Ensure all monetary operations use string/decimal arithmetic

### Task 3.3: Click deduplication
- [ ] Write test: First click from session+link in 24h window sets `isUnique: true`, increments counters
- [ ] Write test: Subsequent click from same session+link within 24h sets `isUnique: false`, does NOT increment counters
- [ ] Write test: Click from same session after 24h window sets `isUnique: true`, increments counters
- [ ] Write test: Click from different session on same link sets `isUnique: true`
- [ ] Implement: Modify `trackClick` in `AffiliateService` to check for existing click with same `sessionId` + `affiliateLinkId` within 24 hours before incrementing counters
- [ ] Verify: All tier and dedup tests pass

---

## Phase 4: Coupon Code System

**Goal:** Implement coupon code generation, validation, and checkout attribution.

### Task 4.1: Coupon code generation service
- [ ] Write test: `createCoupon(affiliateLinkId, discountType, discountValue)` creates coupon with unique 8+ char code
- [ ] Write test: Coupon code is alphanumeric and uppercase
- [ ] Write test: Duplicate coupon code throws error
- [ ] Write test: `getCouponByCode(code)` returns coupon with affiliate link details
- [ ] Implement: Add coupon methods to `AffiliateService` in `plantapp/src/lib/server/services/affiliate.ts` with `createCoupon`, `getCouponByCode`, `validateCoupon`, `incrementCouponUsage`
- [ ] Refactor: Ensure code generation uses crypto-safe random

### Task 4.2: Coupon validation
- [ ] Write test: `validateCoupon(code)` returns valid coupon if active, not expired, under max uses
- [ ] Write test: `validateCoupon` returns null for inactive/expired/over-limit coupons
- [ ] Write test: `incrementCouponUsage(couponId)` increments usage count
- [ ] Implement: Add validation logic checking `isActive`, `expiresAt`, `usageCount < maxUses`

### Task 4.3: Coupon-based attribution
- [ ] Write test: When order has coupon code, `resolveAttribution(orderId, couponCode, cookieAffiliateLinkId)` returns coupon's affiliate link (coupon takes precedence)
- [ ] Write test: When order has only cookie attribution, `resolveAttribution` returns cookie's affiliate link
- [ ] Write test: When order has neither, `resolveAttribution` returns null
- [ ] Implement: Add `resolveAttribution` method that checks coupon first, then cookie
- [ ] Implement: Hook into `processConversion` to use `resolveAttribution`

### Task 4.4: tRPC coupon endpoints
- [ ] Write test: `affiliate.createCoupon` mutation creates coupon for affiliate's link
- [ ] Write test: `affiliate.createCoupon` rejects if affiliate doesn't own the link
- [ ] Write test: Public `validateCoupon` query returns discount details without exposing affiliate info
- [ ] Implement: Add `createCoupon` (affiliateProcedure), `validateCoupon` (publicProcedure) to affiliate router
- [ ] Verify: All coupon tests pass

---

## Phase 5: Dashboard and Earnings UI

**Goal:** Wire up the existing dashboard, earnings, and links UI pages to real data.

### Task 5.1: Dashboard data loader and real stats
- [ ] Write test: Dashboard loader returns affiliate with status, stats with current month earnings, tier info, recent activity
- [ ] Implement: Update `getStats` tRPC procedure to include: current month earnings, pending payout total, current tier, tier progress (current month sales / next tier threshold)
- [ ] Implement: Implement `getRecentClicks` to return actual recent click data joined with product names and conversion status
- [ ] Implement: Update `plantapp/src/routes/affiliate/dashboard/+page.ts` loader to pass tier info and monthly stats
- [ ] Implement: Update `plantapp/src/routes/affiliate/dashboard/+page.svelte` to show tier progress bar, pending payout, handle pending/rejected status states

### Task 5.2: Earnings page with real payout data
- [ ] Write test: `getEarnings` returns real total earnings, pending payout, current month earnings, commission history from `affiliateCommissionLog`
- [ ] Implement: Update `getEarnings` procedure in `plantapp/src/lib/server/api/affiliate.ts` to query `affiliateCommissionLog` grouped by status, join with order and product data
- [ ] Implement: Update `plantapp/src/routes/affiliate/earnings/+page.ts` and `+page.svelte` to display real commission history with pending/paid status

### Task 5.3: Links page with coupon codes and sorting
- [ ] Write test: `getMyLinks` returns links with associated coupon codes
- [ ] Implement: Update `getMyLinks`/`getLinks` to include coupon code data joined from `affiliateCoupon`
- [ ] Implement: Fix `plantapp/src/routes/affiliate/links/+page.svelte` to use correct tRPC method (`createLink` not `generateLink`), add coupon code toggle, display coupon next to link, add sort/filter controls
- [ ] Implement: Update `plantapp/src/routes/affiliate/links/+page.ts` loader

### Task 5.4: Registration flow UI
- [ ] Implement: Update `plantapp/src/routes/affiliate/join/+page.svelte` with real application form (website URL, audience size, promotion plan, TOS checkbox), fix commission tiers to 8/12/16%, wire to `createAffiliate` mutation
- [ ] Implement: Add conditional rendering in dashboard for pending/rejected states
- [ ] Verify: Full affiliate user flow works: apply -> pending -> approved -> dashboard

---

## Phase 6: Admin Affiliate Management UI

**Goal:** Build the admin interface for managing affiliates, reviewing applications, and processing payouts.

### Task 6.1: Admin affiliates list page
- [ ] Implement: Create `plantapp/src/routes/admin/affiliates/+page.ts` loader calling `admin.getAffiliates`
- [ ] Implement: Create `plantapp/src/routes/admin/affiliates/+page.svelte` with:
  - Status filter tabs (All, Pending, Approved, Rejected, Suspended)
  - Table: username, email, status, type, total earnings, total conversions, applied date
  - Action buttons per row: Approve/Reject (for pending), Suspend (for approved), View Details

### Task 6.2: Admin affiliate detail and actions
- [ ] Write test: `admin.getAffiliateDetail` returns full affiliate profile with links, stats, commission history
- [ ] Implement: Add `getAffiliateDetail` procedure to admin router
- [ ] Implement: Create `plantapp/src/routes/admin/affiliates/[id]/+page.svelte` with:
  - Affiliate profile card (user info, application data, status)
  - Performance stats (clicks, conversions, earnings, current tier)
  - Commission rate override input
  - Affiliate type toggle (standard / newsletter_partner)
  - Links table
  - Commission log table

### Task 6.3: Payout management
- [ ] Write test: `admin.getPendingPayouts` returns affiliates with pending commissions grouped and totaled
- [ ] Write test: `admin.markPayoutPaid` updates commission log entries to 'paid' status with reference
- [ ] Write test: `admin.exportPayoutsCsv` returns CSV string with affiliate name, email, amount
- [ ] Implement: Add payout procedures to admin router
- [ ] Implement: Add payout section to `/admin/affiliates` page or create `/admin/affiliates/payouts` with:
  - Table of affiliates with pending amounts (filtered to >= $50 threshold)
  - "Export CSV" button
  - "Mark Paid" button per affiliate with payment reference input
  - Bulk "Mark All Paid" with confirmation
- [ ] Verify: Admin can review applications, approve/reject, view performance, export payouts

---

## Phase 7: Materials, Newsletter Partners, and TOS

**Goal:** Complete remaining features: shareable assets from real product data, newsletter partner differentiation, and terms of service page.

### Task 7.1: Materials page with real product data
- [ ] Implement: Update `plantapp/src/routes/affiliate/materials/+page.ts` to load actual products with images from DB
- [ ] Implement: Update `plantapp/src/routes/affiliate/materials/+page.svelte` to display product cards with:
  - Product image (from `productImage` table)
  - Product name and price
  - "Download Image" button
  - "Generate Affiliate Link" button (calls `createLink` mutation)
  - Brand guidelines section (can remain semi-static initially)

### Task 7.2: Newsletter partner support
- [ ] Write test: Newsletter partner affiliates get 10% base commission rate instead of 8%
- [ ] Write test: `getNewsletterCopyBlocks()` returns pre-written email templates
- [ ] Implement: Add newsletter commission tier logic (10% base, then standard tier progression)
- [ ] Implement: Add newsletter copy blocks section to materials page (conditionally shown when `affiliateType === 'newsletter_partner'`)
- [ ] Implement: Pre-written email copy blocks with subject line, body template with `{{AFFILIATE_LINK}}` placeholder, CTA

### Task 7.3: Affiliate Terms of Service page
- [ ] Implement: Create `plantapp/src/routes/affiliate/terms/+page.svelte` with static TOS content covering:
  - Program overview and eligibility
  - Commission structure (8%/12%/16% tiers)
  - Payment terms ($50 minimum, monthly cycle)
  - Prohibited activities (spam, misleading claims, trademark misuse)
  - Termination and suspension clauses
  - FTC disclosure requirements
  - Cookie duration and attribution rules
- [ ] Implement: Ensure `/affiliate/join` links to `/affiliate/terms` and requires TOS checkbox

### Task 7.4: Final integration and cleanup
- [ ] Verify: All affiliate pages load without errors and display real data
- [ ] Verify: Admin affiliate management flow works end-to-end
- [ ] Verify: Click tracking and deduplication works on `/aff/[linkCode]`
- [ ] Verify: Commission tier calculation produces correct rates
- [ ] Verify: Run full test suite, confirm 70% coverage on new/modified files
- [ ] Verify: Run `npm run check` with zero errors
- [ ] Verify: Run `npm run format` and `npm run lint` with no issues
