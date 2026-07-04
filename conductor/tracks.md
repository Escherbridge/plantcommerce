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

## Phase 6: Internal Platform UI

### Track 14: platform-shell_20260402
**Status:** ready
**Goal:** Build reusable PlatformSidebar and PlatformShell layout components for all internal pages
**Spec:** [spec.md](tracks/platform-shell_20260402/spec.md)
**Plan:** [plan.md](tracks/platform-shell_20260402/plan.md)
**Dependencies:** Track 8 (design-system-brand)
**Phases:** 4 | **Tasks:** 16
- Reusable PlatformSidebar: collapsible, role-aware nav, user widget, mobile overlay
- PlatformShell wrapper: sidebar + content area + breadcrumbs
- Navigation configs for account, affiliate, and admin (TypeScript, SVG icons)
- Generalized design tokens from profile page patterns (.platform-card, .platform-stat)
- Dark theme support, accessibility pass, localStorage collapse persistence

### Track 15: account-dashboard_20260402
**Status:** ready (depends on Track 14)
**Goal:** Unified customer portal with shared layout and enhanced account pages
**Spec:** [spec.md](tracks/account-dashboard_20260402/spec.md)
**Plan:** [plan.md](tracks/account-dashboard_20260402/plan.md)
**Dependencies:** platform-shell_20260402
**Phases:** 5 | **Tasks:** 32
- Account layout using PlatformShell with shared sidebar navigation
- Account overview dashboard with stats, recent orders, quick actions
- Enhanced profile page (refactored from standalone), orders with status filters, wishlist with cart actions
- New settings page (email prefs, notifications, theme toggle, delete account)
- New addresses page with CRUD and default address selection

### Track 16: affiliate-portal_20260402
**Status:** ready (depends on Track 14)
**Goal:** Comprehensive affiliate portal with shared layout and richer analytics
**Spec:** [spec.md](tracks/affiliate-portal_20260402/spec.md)
**Plan:** [plan.md](tracks/affiliate-portal_20260402/plan.md)
**Dependencies:** platform-shell_20260402
**Phases:** 6 | **Tasks:** 35
- Affiliate layout with PlatformShell, mini-stats sidebar widget, centralized auth
- Enhanced dashboard: period selector, CSS sparklines, top links, commission tier progress
- Enhanced links: sortable columns, search/filter, copy-with-toast, status toggles
- Enhanced earnings: date range filter, summary cards, CSV export
- Enhanced materials: tabbed categories, product-specific promotional content
- Affiliate settings: payment preferences, notification toggles, profile fields

### Track 17: admin-enhancement_20260402
**Status:** ready (depends on Track 14)
**Goal:** Polished admin dashboard with better data viz and management UX
**Spec:** [spec.md](tracks/admin-enhancement_20260402/spec.md)
**Plan:** [plan.md](tracks/admin-enhancement_20260402/plan.md)
**Dependencies:** platform-shell_20260402
**Phases:** 6 | **Tasks:** 35
- Admin layout migration to PlatformShell with badge counts
- Enhanced dashboard: KPI cards, recent orders with inline status, activity feed
- Enhanced products: inline edit, search/filter, bulk actions, stock indicators
- Enhanced orders: status tabs, expandable rows, affiliate attribution, CSV export
- Enhanced users: role badges, search/filter, inline role change, detail view
- Admin settings page with store config, audit log viewer

### Track 18: cross-role-nav_20260402
**Status:** ready (depends on Tracks 14-17)
**Goal:** Unified cross-portal experience with role switching, notifications, and command palette
**Spec:** [spec.md](tracks/cross-role-nav_20260402/spec.md)
**Plan:** [plan.md](tracks/cross-role-nav_20260402/plan.md)
**Dependencies:** platform-shell_20260402, account-dashboard_20260402, affiliate-portal_20260402, admin-enhancement_20260402
**Phases:** 6 | **Tasks:** 20
- Role-aware header integration with portal quick links
- Portal switcher component in sidebar footer
- Notification bell with unread count, dropdown panel, mark-as-read
- Notifications infrastructure: DB table, tRPC router, service
- Activity feed component (role-filtered: audit log, clicks, orders)
- Command palette (Ctrl+K): fuzzy search across pages/products/orders/users
- Enhanced breadcrumb system (portal > section > page)

## Phase 7: Education & Community

### Track 19: lms-system_20260402
**Status:** ready
**Goal:** Comprehensive multimodal LMS with admin-configurable courses, quizzes, certificates, and progress tracking
**Spec:** [spec.md](tracks/lms-system_20260402/spec.md)
**Plan:** [plan.md](tracks/lms-system_20260402/plan.md)
**Dependencies:** Tracks 1, 2, 6
**Estimated Duration:** 12-14 weeks (9 phases, 75 tasks)
- Hierarchical curriculum: Programs → Courses → Modules → Lessons → Content Blocks
- Four course types: self-paced, instructor-led, blended, cohort-based
- 8 multimodal content types (video, text, slides, audio, downloads, embeds, code, images)
- Assessment engine: 8 question types, question banks, auto/manual grading
- Progress tracking with learner and admin analytics dashboards
- PDF certificates with public verification, achievement badges
- Course pricing via Stripe (free, one-time purchase)
- Enrollment management: open, approval, invite-only, capacity limits
- New Instructor role with scoped permissions
- Discussion forums, course reviews, bookmarks, and notes
- Deep integration with affiliate system, product catalog, and existing CMS
