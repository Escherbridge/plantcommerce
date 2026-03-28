# Specification: Page Templates & Mobile Experience

## Overview

Apply the new design system, component library, and animation patterns to all remaining pages in the Aevani storefront, ensuring every route delivers the same editorial-grade experience. This track focuses on product listing/detail pages, content pages (blog, guides, learn, about), utility pages (cart, checkout, auth, account), and a bulletproof mobile experience across all of them. Every page should feel like it belongs in the same visual family established by the homepage transformation.

## Background

### Current State
- **46 route pages** exist across products, content, admin, affiliate, account, and utility sections.
- **Product pages** (`/products`, `/products/[category]`, `/products/mock-detail`): Basic grid layouts with DaisyUI cards. No advanced filtering UI, no editorial product detail experience.
- **Content pages** (`/blog`, `/guides`, `/learn`, `/resources`, `/faq`, `/about`): Placeholder content with basic text layouts.
- **Auth pages** (`/login`, `/register`, `/verify-email`): Basic form pages with minimal styling.
- **Account pages** (`/account/profile`, `/account/orders`, `/account/wishlist`): Basic table/list layouts.
- **Cart/Checkout** (`/cart`, `/checkout`): Desktop-oriented layouts (addressed partially in mobile-checkout track for functionality, this track handles visual design).
- **Utility pages** (`/shipping`, `/returns`, `/privacy`, `/terms`, `/cookies`, `/contact`, `/help`, `/faq`, `/accessibility`, `/careers`, `/press`, `/sustainability`): Likely minimal placeholder content.
- **No page transition animations between routes.**
- **No consistent page layout template** — each page builds its own structure.

### Design Direction
- Every page uses consistent section spacing, typography hierarchy, and animation patterns from the design system
- Product listing pages get a Readymag-inspired masonry/magazine layout option
- Product detail pages become immersive editorial showcases
- Content pages use beautiful prose typography for readability
- Auth pages get a split-screen editorial treatment
- Mobile experience is polished end-to-end with proper touch interactions
- Page transitions add polish when navigating between routes

## Dependencies
- **design-system-brand_20260328**: Provides theme, tokens, typography, patterns
- **component-library-refresh_20260328**: Provides refreshed components (cards, buttons, forms, etc.)
- **hero-landing-transform_20260328**: Provides ScrollReveal, TextReveal, and animation patterns

## Functional Requirements

### FR-1: Page Layout Templates
**Description:** Create reusable page layout templates that enforce consistent structure across all pages.
**Priority:** P0
**Acceptance Criteria:**
- AC-1.1: `PageLayout.svelte` — Standard page wrapper with configurable hero banner, breadcrumbs, content area, and CTA section. Props: `title`, `subtitle`, `heroImage`, `showBreadcrumbs`, `maxWidth`.
- AC-1.2: `SplitLayout.svelte` — 50/50 split layout for auth pages (image/pattern on one side, content on the other). Stacks on mobile.
- AC-1.3: `ArticleLayout.svelte` — Optimized for long-form content with `prose` typography, table of contents sidebar, and reading progress indicator.
- AC-1.4: All layouts use consistent spacing tokens and include `ScrollReveal` on content sections.
- AC-1.5: Every page includes proper breadcrumb navigation using the refreshed `Breadcrumbs` component.

### FR-2: Product Listing Pages
**Description:** Transform product listing and category pages into editorial shopping experiences.
**Priority:** P0
**Acceptance Criteria:**
- AC-2.1: Product listing pages (`/products`, `/products/[category]`) feature a hero banner with the category name in display font over a relevant AI mock asset image.
- AC-2.2: A toggle allows switching between grid view (3-4 columns) and magazine/masonry view (asymmetric editorial layout with one featured product card spanning 2 columns).
- AC-2.3: Filter sidebar uses the refreshed form inputs (checkboxes, range sliders) with smooth expand/collapse animations.
- AC-2.4: Product cards use the new `ProductCard.svelte` component with consistent hover effects.
- AC-2.5: Infinite scroll or "Load More" button with skeleton loading states.
- AC-2.6: On mobile, filters collapse into a bottom sheet drawer triggered by a sticky filter button.
- AC-2.7: Category pages include a brief editorial introduction paragraph below the hero.
- AC-2.8: Empty state (no products found) uses the "Success State Illustration" asset with helpful copy.

### FR-3: Product Detail Page
**Description:** Transform the product detail page into an immersive, editorial product showcase.
**Priority:** P0
**Acceptance Criteria:**
- AC-3.1: Hero area: full-width image gallery with thumbnail strip below. Uses the refreshed `Carousel` and `ImageGallery` components.
- AC-3.2: Product info section uses a clear typographic hierarchy: name in display font, price in mono font (large), description in body font with generous line-height.
- AC-3.3: "Add to Cart" area is visually prominent with the primary button at large size.
- AC-3.4: Product details/specs displayed in an expandable `Accordion` using the refreshed component.
- AC-3.5: A "You May Also Like" section at the bottom uses `ProductCard` components in a horizontal scroll on mobile.
- AC-3.6: On mobile, a sticky bottom bar shows price + "Add to Cart" button (building on mobile-checkout track's FR-3).
- AC-3.7: Page uses `ScrollReveal` for section animations as user scrolls to reviews, related products, etc.

### FR-4: Content Pages (Blog, Guides, Learn)
**Description:** Apply editorial typography and layout to all content-focused pages.
**Priority:** P1
**Acceptance Criteria:**
- AC-4.1: Blog listing (`/blog`) uses `ContentCard.svelte` in a 2-column grid with a featured post spanning full width at the top.
- AC-4.2: Blog/guide detail pages use `ArticleLayout.svelte` with proper `prose` typography, dropcap first letter, and blockquote styling.
- AC-4.3: Learn page (`/learn`) uses a grid of `FeatureCard.svelte` components showcasing learning categories.
- AC-4.4: FAQ page (`/faq`) uses the refreshed `Accordion` component with search/filter functionality.
- AC-4.5: Resources page (`/resources`) uses a categorized card grid.
- AC-4.6: All content pages have meta OG images and proper SEO using the `SEO.svelte` component.

### FR-5: Auth & Account Pages
**Description:** Give authentication and account pages the editorial treatment.
**Priority:** P1
**Acceptance Criteria:**
- AC-5.1: Login and Register pages use `SplitLayout.svelte` with an AI mock asset or SVG pattern on the left, form on the right.
- AC-5.2: Form fields use the new floating-label, bottom-border editorial input style.
- AC-5.3: Social login buttons (if any) are prominently placed above the form.
- AC-5.4: Account pages use a sidebar navigation on desktop, tab navigation on mobile.
- AC-5.5: Order history uses clean table styling with status badges (using `Badge.svelte`).
- AC-5.6: Wishlist page uses `ProductCard.svelte` in a responsive grid.

### FR-6: Utility/Legal Pages
**Description:** Ensure even utility pages like shipping, privacy, and terms look polished.
**Priority:** P2
**Acceptance Criteria:**
- AC-6.1: All utility pages use `PageLayout.svelte` with a small hero banner and the page title.
- AC-6.2: Legal content (privacy, terms, cookies) uses `ArticleLayout.svelte` with prose typography and a table of contents.
- AC-6.3: Contact page has a split layout: contact form on one side, contact info/map placeholder on the other.
- AC-6.4: About page uses an editorial storytelling layout with full-bleed images, pull quotes, and timeline.
- AC-6.5: Sustainability page leverages AI mock assets (SustainabilityHero.png) with editorial content sections.

### FR-7: Page Transitions
**Description:** Add subtle page transition animations when navigating between routes.
**Priority:** P2
**Acceptance Criteria:**
- AC-7.1: Page transitions use a simple fade/slide effect via SvelteKit's `onNavigate` lifecycle.
- AC-7.2: Transition duration is short (200-300ms) to not impede navigation speed.
- AC-7.3: View Transitions API is used where supported (Chrome 111+), with a CSS fallback for other browsers.
- AC-7.4: Transitions respect `prefers-reduced-motion`.

### FR-8: Mobile Polish
**Description:** Ensure every page and interaction is optimized for mobile devices.
**Priority:** P0
**Acceptance Criteria:**
- AC-8.1: All pages pass a manual test at 320px, 375px, and 414px viewport widths without horizontal scrolling or overflow.
- AC-8.2: All interactive elements (buttons, links, inputs, cards) meet 44px minimum touch target.
- AC-8.3: Bottom sheet drawers are used for filters, sort options, and secondary actions on mobile.
- AC-8.4: Horizontal scroll carousels are used for product recommendations and category navigation on mobile.
- AC-8.5: No fixed/sticky elements overlap or conflict on mobile (header, sticky CTA, bottom nav).
- AC-8.6: Text is readable without zooming (minimum 16px body text, minimum 14px secondary text).
- AC-8.7: Images use responsive `srcset` via `OptimizedImage` component on all pages.
- AC-8.8: Mobile drawer navigation is fully keyboard-accessible and works with VoiceOver/TalkBack.

## Non-Functional Requirements

### NFR-1: Performance
- Each page route's JS bundle stays under 50KB gzipped (use code splitting).
- Largest Contentful Paint (LCP) < 2.5s on mobile 4G.
- Cumulative Layout Shift (CLS) < 0.1 across all pages.
- First Input Delay (FID) < 100ms.

### NFR-2: Accessibility
- Every page passes Lighthouse accessibility audit with score > 95.
- Proper heading hierarchy (h1 > h2 > h3) on every page.
- Skip-to-content link functional on every page.
- Focus management on route changes (focus moves to main content).
- All images have descriptive alt text.

### NFR-3: SEO
- Every page uses the `SEO.svelte` component with unique title, description, and OG image.
- Structured data (`StructuredData.svelte`) on product pages (Product schema), content pages (Article schema), and FAQ page (FAQPage schema).
- Proper canonical URLs on all pages.

## Files to Create/Modify

### New Page Templates
- `plantapp/src/lib/components/layout/PageLayout.svelte`
- `plantapp/src/lib/components/layout/SplitLayout.svelte`
- `plantapp/src/lib/components/layout/ArticleLayout.svelte`

### Modified Pages (all under `plantapp/src/routes/`)
- `products/+page.svelte` — Product listing redesign
- `products/[category]/+page.svelte` — Category listing (may need creation)
- `products/mock-detail/+page.svelte` — Product detail redesign
- `blog/+page.svelte` — Blog listing
- `guides/+page.svelte` — Guides listing
- `learn/+page.svelte` — Learning hub
- `faq/+page.svelte` — FAQ page
- `about/+page.svelte` — About page editorial
- `sustainability/+page.svelte` — Sustainability story
- `login/+page.svelte` — Login redesign
- `register/+page.svelte` — Register redesign
- `account/profile/+page.svelte` — Account profile
- `account/orders/+page.svelte` — Order history
- `account/wishlist/+page.svelte` — Wishlist
- `cart/+page.svelte` — Cart page visual refresh
- `contact/+page.svelte` — Contact page
- `shipping/+page.svelte`, `returns/+page.svelte`, `privacy/+page.svelte`, `terms/+page.svelte` — Utility pages
- All remaining utility/legal pages
