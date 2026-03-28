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

## Phase 4: UI Refresh — Visual Evolution (Parallel Track)

### Track 8: design-system-brand_20260328
**Status:** ready
**Goal:** Establish evolved design system with custom theme, typography, SVG patterns, and brand tokens
**Spec:** [spec.md](tracks/design-system-brand_20260328/spec.md)
**Plan:** [plan.md](tracks/design-system-brand_20260328/plan.md)
- Custom "aevani" DaisyUI theme with evolved color palette
- Three-tier typography system (display + body + mono)
- CSS custom property design tokens (spacing, radius, shadows, timing)
- SVG pattern library (6+ organic patterns: mycelium, roots, leaf venation, etc.)
- PatternBackground wrapper component
- Updated brand documentation
- References: TLB (editorial mono), Readymag (bold grids), Chrome Industries (dark utilitarian)

### Track 9: hero-landing-transform_20260328
**Status:** ready (depends on Track 8)
**Goal:** Transform homepage into an immersive editorial experience with scroll animations
**Spec:** [spec.md](tracks/hero-landing-transform_20260328/spec.md)
**Plan:** [plan.md](tracks/hero-landing-transform_20260328/plan.md)
- Cinematic full-viewport hero with parallax and text-scramble reveal
- Chrome Industries-style scrolling marquee announcement bar
- ScrollReveal component with intersection observer animations
- Editorial category showcase (asymmetric masonry grid)
- Core values redesign with SVG illustrations replacing emoji
- Featured products editorial grid
- Newsletter section with organic SVG background
- All animations respect prefers-reduced-motion

### Track 10: component-library-refresh_20260328
**Status:** ready (depends on Track 8)
**Goal:** Restyle every UI component with editorial sophistication and micro-interactions
**Spec:** [spec.md](tracks/component-library-refresh_20260328/spec.md)
**Plan:** [plan.md](tracks/component-library-refresh_20260328/plan.md)
- Header: transparent-to-dark scroll transition, wordmark logo, animated nav underlines
- Mobile drawer: full-screen overlay with stagger animations
- Footer: dark editorial with SVG pattern background
- Button system: primary/secondary/ghost with hover micro-interactions
- Card system: ProductCard, ContentCard, FeatureCard components
- Editorial form fields: floating labels, bottom-border inputs
- New utilities: Toast, Modal, Skeleton, Badge, Tooltip, Divider
- Storybook updates for all components

### Track 11: page-templates-mobile_20260328
**Status:** ready (depends on Tracks 8, 9, 10)
**Goal:** Apply design system to all pages with polished mobile experience
**Spec:** [spec.md](tracks/page-templates-mobile_20260328/spec.md)
**Plan:** [plan.md](tracks/page-templates-mobile_20260328/plan.md)
- Reusable page layout templates (PageLayout, SplitLayout, ArticleLayout)
- Product listing: editorial masonry + grid toggle, mobile filter bottom sheet
- Product detail: immersive showcase with editorial typography
- Content pages: blog, guides, learn with prose typography
- Auth pages: split-screen editorial treatment
- Page transitions via SvelteKit onNavigate + View Transitions API
- Mobile polish: 320px+ tested, 44px touch targets, no overflow
- All pages pass Lighthouse a11y > 95

## Phase 5: Scale (Post-launch)

### Track 12: growth-features_20260314
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
