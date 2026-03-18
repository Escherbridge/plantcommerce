# Aevani — Track Roadmap

## Phase 1: Launch (Weeks 1-4)

### Track 1: transaction-core_20260314
**Status:** ready
**Goal:** Process a real paid order end-to-end
**Spec:** [spec.md](tracks/transaction-core_20260314/spec.md)
**Plan:** [plan.md](tracks/transaction-core_20260314/plan.md)
- Wire tRPC routers to real DB queries (products, categories, product detail)
- Cart persistence (session-based for guests, DB-linked for auth users)
- Stripe hosted Checkout integration
- Stripe webhook handler (checkout.session.completed -> create order)
- Order confirmation page + transactional email
- Basic admin: list orders, mark as fulfilled

### Track 2: auth-accounts_20260314
**Status:** ready
**Goal:** Complete authentication and account management
**Spec:** [spec.md](tracks/auth-accounts_20260314/spec.md)
**Plan:** [plan.md](tracks/auth-accounts_20260314/plan.md)
- User registration / login / session completion
- Account page: order history from DB
- Password reset flow
- Guest checkout option (no forced account creation)
- Email verification flow

## Phase 2: Convert (Weeks 4-7)

### Track 3: discovery-trust_20260314
**Status:** ready
**Goal:** Raise conversion rate through better product discovery and trust signals
**Spec:** [spec.md](tracks/discovery-trust_20260314/spec.md)
**Plan:** [plan.md](tracks/discovery-trust_20260314/plan.md)
- Category pages with real product data + pagination
- Product filtering: category, price range, certification type
- Full-text search with PostgreSQL tsvector/tsquery
- Certification badge display on product cards and PDPs
- In-stock / out-of-stock indicators with per-product thresholds
- Environmental impact cards and provenance information
- Product comparison (optional)

### Track 4: mobile-checkout_20260314
**Status:** ready
**Goal:** Mobile-optimized shopping experience
**Spec:** [spec.md](tracks/mobile-checkout_20260314/spec.md)
**Plan:** [plan.md](tracks/mobile-checkout_20260314/plan.md)
- Mobile-first responsive product pages and cart
- Touch-friendly controls and sticky "Add to Cart"
- Stripe Express Checkout Element (Apple Pay, Google Pay, Link)
- DaisyUI "aevani" nature-inspired theme
- Skeleton screens and loading states

## Phase 3: Grow (Weeks 7-12)

### Track 5: affiliate-system_20260314
**Status:** ready
**Goal:** 20%+ of revenue from affiliate channel within 60 days
**Spec:** [spec.md](tracks/affiliate-system_20260314/spec.md)
**Plan:** [plan.md](tracks/affiliate-system_20260314/plan.md)
- Affiliate registration + admin approval flow
- Referral link generation with coupon codes
- Click tracking with session-based deduplication
- Tiered commission structure (8% base -> 12% at $500/mo -> 16% at $2K/mo)
- Affiliate dashboard with real-time analytics
- Admin payout management with CSV export
- Newsletter partner tier
- Affiliate TOS page

### Track 6: content-seo_20260314
**Status:** ready
**Goal:** Long-term organic growth via educational content
**Spec:** [spec.md](tracks/content-seo_20260314/spec.md)
**Plan:** [plan.md](tracks/content-seo_20260314/plan.md)
- Quill rich text editor for content creation
- Blog publishing with listing, detail, and pagination
- Growing guides by system type with linked products
- FAQ management with categorized accordions
- SEO meta tags, JSON-LD structured data, sitemap.xml
- Image optimization with sharp (multi-size variants)
- Admin content management with preview and autosave
- RSS feed

## Phase 4: Scale (Post-launch)

### Track 7: growth-features_20260314
**Status:** ready
**Goal:** Increase LTV and repeat purchases
**Spec:** [spec.md](tracks/growth-features_20260314/spec.md)
**Plan:** [plan.md](tracks/growth-features_20260314/plan.md)
- Product reviews and ratings with moderation
- Subscription/recurring orders (Stripe Billing)
- Wishlist functionality
- Email infrastructure (Resend) + newsletter management
- Discount codes and promotions engine
- Loyalty/rewards program
- Recently viewed products + recommendations
- Abandoned cart recovery emails
- Social sharing
- Admin analytics dashboard (PostHog)
