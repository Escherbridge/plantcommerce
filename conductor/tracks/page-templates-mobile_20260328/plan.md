# Implementation Plan: Page Templates & Mobile Experience

## Overview

This plan transforms all 46 route pages into a cohesive editorial-grade experience using three reusable layout templates, then applies them systematically across product, content, auth, utility, and account pages. Mobile polish is woven into every phase rather than treated as an afterthought. A final phase adds page transitions and cross-cutting accessibility/SEO/performance verification.

**Phases:**
1. Foundation -- Layout templates, ScrollReveal, and shared primitives
2. Product Pages -- Listing and detail page transformations
3. Content Pages -- Blog, guides, learn, FAQ, resources
4. Auth & Account Pages -- Login, register, account section
5. Utility & Legal Pages -- About, contact, shipping, returns, legal pages
6. Page Transitions -- Route transition animations
7. Mobile Polish & Cross-Cutting -- Touch targets, overflow audit, a11y, SEO, perf

**Estimated total effort:** 35-50 hours

---

## Phase 1: Foundation -- Layout Templates & Shared Primitives

**Goal:** Create the three reusable layout templates (PageLayout, SplitLayout, ArticleLayout) and the ScrollReveal animation component that all subsequent phases depend on.

### Tasks

- [ ] **Task 1.1: Create `ScrollReveal.svelte` component**
  - File: `plantapp/src/lib/components/animation/ScrollReveal.svelte`
  - Build an Intersection Observer wrapper component using Svelte 5 runes (`$effect`, `$state`).
  - Props: `threshold` (0-1), `delay` (ms), `direction` ('up' | 'down' | 'left' | 'right' | 'none'), `once` (boolean), `disabled` (boolean for `prefers-reduced-motion`).
  - Uses CSS transitions (opacity + transform). Respects `prefers-reduced-motion` via `matchMedia`.
  - TDD: Write component rendering test verifying props pass through, `aria-hidden` toggling, and reduced-motion class application.

- [ ] **Task 1.2: Create `PageLayout.svelte` template**
  - File: `plantapp/src/lib/components/layout/PageLayout.svelte`
  - Props: `title: string`, `subtitle?: string`, `heroImage?: string`, `heroHeight?: 'sm' | 'md' | 'lg'`, `showBreadcrumbs?: boolean` (default true), `breadcrumbItems?: BreadcrumbItem[]`, `maxWidth?: 'sm' | 'md' | 'lg' | 'xl'`, `children` (snippet), `cta?` (snippet).
  - Structure: optional hero banner (full-width image with overlay text) -> Breadcrumbs -> main content slot -> optional CTA section slot.
  - Uses existing `Container.svelte`, `Section.svelte`, and `Breadcrumbs.svelte`.
  - Wraps content sections in `ScrollReveal`.
  - Mobile: hero banner stacks cleanly, breadcrumbs scroll horizontally (already supported), content uses `px-4` at mobile.
  - TDD: Write test verifying hero renders when `heroImage` provided, breadcrumbs render when `showBreadcrumbs` is true, title/subtitle display.

- [ ] **Task 1.3: Create `SplitLayout.svelte` template**
  - File: `plantapp/src/lib/components/layout/SplitLayout.svelte`
  - Props: `imageSrc?: string`, `imageAlt?: string`, `pattern?: 'dots' | 'grid' | 'botanical'`, `side?: 'left' | 'right'` (which side gets the visual), `children` (snippet for the form/content side).
  - Desktop: 50/50 grid with visual on one side, content on the other. Visual side uses either an image or an SVG pattern background.
  - Mobile: stacks vertically -- visual side becomes a shorter banner (max-h-48), content underneath.
  - Min-height 100vh on desktop.
  - TDD: Write test verifying image renders when `imageSrc` provided, pattern renders as fallback, stacking order at mobile breakpoint.

- [ ] **Task 1.4: Create `ArticleLayout.svelte` template**
  - File: `plantapp/src/lib/components/layout/ArticleLayout.svelte`
  - Props: `title: string`, `subtitle?: string`, `author?: string`, `date?: string`, `readingTime?: string`, `showToc?: boolean` (default true), `showProgress?: boolean` (default true), `breadcrumbItems?: BreadcrumbItem[]`, `children` (snippet).
  - Structure: reading progress bar (thin bar at top of viewport) -> Breadcrumbs -> article header (title, meta) -> two-column layout (sidebar ToC + `prose` content area) -> end section.
  - Table of Contents sidebar: sticky on desktop, collapsible drawer on mobile. Auto-generates from h2/h3 headings in content using `$effect` DOM query.
  - Reading progress indicator: scroll-linked thin bar using `$effect` with scroll listener.
  - Prose area uses Tailwind `@tailwindcss/typography` classes: `prose prose-lg max-w-none` with dropcap first letter styling.
  - TDD: Write test verifying progress bar element exists, ToC renders, prose container has correct classes.

- [ ] **Task 1.5: Create `BottomSheet.svelte` component**
  - File: `plantapp/src/lib/components/ui/BottomSheet.svelte`
  - Reusable bottom sheet drawer for mobile filter/sort interactions.
  - Props: `open: boolean` (bindable), `title?: string`, `snapPoints?: number[]`, `children` (snippet).
  - Features: backdrop overlay, drag handle, snap-to-close gesture, focus trap, scroll lock on body, `aria-modal`.
  - TDD: Write test verifying open/close states, backdrop renders, title displays, keyboard escape closes.

- [ ] **Task 1.6: Create barrel exports for new components**
  - File: `plantapp/src/lib/components/animation/index.ts` -- export ScrollReveal
  - File: `plantapp/src/lib/components/layout/index.ts` -- update to include PageLayout, SplitLayout, ArticleLayout
  - File: `plantapp/src/lib/components/ui/index.ts` -- update to include BottomSheet
  - TDD: Import test verifying all components export correctly.

- [ ] **Verification: Phase 1 checkpoint** [checkpoint marker]
  - Create a temporary test route or use `/component-demo` to render all three layouts and ScrollReveal.
  - Verify at 320px, 375px, 414px, 768px, 1024px, 1440px viewport widths.
  - Confirm `prefers-reduced-motion` disables animations.
  - Confirm all layout templates render breadcrumbs, content slots, and hero areas.

---

## Phase 2: Product Pages

**Goal:** Transform product listing and product detail pages into editorial shopping experiences with mobile-optimized filtering and sticky CTAs.

### Tasks

- [ ] **Task 2.1: Create `ProductCard.svelte` component**
  - File: `plantapp/src/lib/components/cards/ProductCard.svelte`
  - Props: `product` (object with name, price, image, category, slug), `variant?: 'default' | 'featured'` (featured spans 2 cols in masonry), `className?: string`.
  - Hover effect: image scale-up, shadow elevation, quick-add overlay.
  - Uses `OptimizedImage.svelte` for responsive images.
  - 44px minimum touch target on mobile for the card link area.
  - TDD: Write test verifying product data renders (name, price, image alt), featured variant has correct CSS class, link href is correct.

- [ ] **Task 2.2: Create view toggle and masonry grid utilities**
  - File: `plantapp/src/lib/components/products/ViewToggle.svelte` -- grid/masonry toggle buttons with icons.
  - File: `plantapp/src/lib/components/products/ProductGrid.svelte` -- wraps product cards in either a standard CSS grid (3-4 cols) or a masonry layout (CSS `columns` or `grid-template-rows: masonry` with fallback).
  - Props for ProductGrid: `products`, `view: 'grid' | 'masonry'`, `loading: boolean`.
  - Includes skeleton loading state (6-8 placeholder cards).
  - TDD: Write test verifying grid vs masonry class application, skeleton state renders correct number of placeholders.

- [ ] **Task 2.3: Create `FilterSidebar.svelte` with mobile bottom sheet**
  - File: `plantapp/src/lib/components/products/FilterSidebar.svelte`
  - Desktop: sidebar with expand/collapse sections (category checkboxes, price range slider, availability).
  - Mobile: renders inside `BottomSheet.svelte`, triggered by a sticky "Filters" button at bottom of viewport.
  - Uses Svelte 5 runes for reactive filter state.
  - Smooth expand/collapse CSS transitions on filter sections.
  - TDD: Write test verifying filter sections render, mobile trigger button exists, filter state changes propagate.

- [ ] **Task 2.4: Transform `/products` listing page**
  - File: `plantapp/src/routes/products/+page.svelte`
  - Wrap in `PageLayout.svelte` with hero banner (category name in display font over image).
  - Integrate `ViewToggle`, `ProductGrid`, `FilterSidebar`.
  - Add "Load More" button with skeleton loading states.
  - Empty state with illustration and helpful copy.
  - Editorial intro paragraph below hero.
  - Mobile: filters in bottom sheet, 2-column grid, horizontal scroll for category pills.
  - TDD: Write test verifying page uses PageLayout, hero renders, product grid renders, empty state shows when no products.

- [ ] **Task 2.5: Transform category pages**
  - Files: `plantapp/src/routes/products/hydroponics/+page.svelte`, `plantapp/src/routes/products/aquaponics/+page.svelte`, `plantapp/src/routes/products/silvopasture/+page.svelte`, `plantapp/src/routes/products/agroforestry/+page.svelte`
  - Each uses `PageLayout.svelte` with category-specific hero image and editorial intro.
  - Reuses `ProductGrid`, `FilterSidebar`, `ViewToggle` from Task 2.2/2.3.
  - Category-specific SEO via `SEO.svelte`.
  - TDD: Write test for one category page verifying hero title matches category, breadcrumbs include category name.

- [ ] **Task 2.6: Transform `/products/mock-detail` product detail page**
  - File: `plantapp/src/routes/products/mock-detail/+page.svelte`
  - Hero area: full-width image gallery using existing `ImageGallery.svelte` and `Carousel.svelte`.
  - Typography hierarchy: product name in display font, price in mono (large), description in body with generous line-height.
  - "Add to Cart" button: large primary button, visually prominent.
  - Product details in `Accordion.svelte` (specs, shipping info, care instructions).
  - "You May Also Like" section: horizontal scroll carousel of `ProductCard` components on mobile, grid on desktop.
  - Mobile sticky bottom bar: price + "Add to Cart" fixed at bottom, hidden when native "Add to Cart" section is in viewport (use IntersectionObserver).
  - `ScrollReveal` on reviews, related products sections.
  - `StructuredData.svelte` with Product schema.
  - TDD: Write test verifying gallery renders, accordion sections exist, sticky bar has correct elements, structured data outputs Product schema.

- [ ] **Verification: Phase 2 checkpoint** [checkpoint marker]
  - Navigate `/products` at 320px, 375px, 414px -- no overflow, filters in bottom sheet, 2-col grid.
  - Toggle grid/masonry views on desktop.
  - Navigate `/products/mock-detail` -- verify gallery, sticky bar on mobile, accordion expand/collapse.
  - Check all product pages have SEO component and structured data.

---

## Phase 3: Content Pages

**Goal:** Apply editorial typography and layout to blog, guides, learn, FAQ, and resources pages.

### Tasks

- [ ] **Task 3.1: Create `ContentCard.svelte` component**
  - File: `plantapp/src/lib/components/cards/ContentCard.svelte`
  - Props: `title`, `excerpt`, `image`, `date`, `category`, `href`, `variant?: 'default' | 'featured'`.
  - Featured variant: full-width with large image, overlaid text.
  - Default variant: card with image top, text below.
  - TDD: Write test verifying featured vs default rendering, link href, image alt text.

- [ ] **Task 3.2: Create `FeatureCard.svelte` component**
  - File: `plantapp/src/lib/components/cards/FeatureCard.svelte`
  - Props: `title`, `description`, `icon` (snippet or string), `href`, `className`.
  - Hover: subtle lift + border color change.
  - TDD: Write test verifying title, description, link, icon render.

- [ ] **Task 3.3: Transform `/blog` listing page**
  - File: `plantapp/src/routes/blog/+page.svelte`
  - Use `PageLayout.svelte` with hero.
  - Featured post: full-width `ContentCard` at top (variant='featured').
  - Remaining posts: 2-column grid of `ContentCard` components.
  - Category filter pills at top (horizontal scroll on mobile).
  - SEO with Article list structured data.
  - TDD: Write test verifying featured post renders full-width, grid has 2 columns, category pills exist.

- [ ] **Task 3.4: Transform `/guides` listing page**
  - File: `plantapp/src/routes/guides/+page.svelte`
  - Use `PageLayout.svelte`.
  - Grid of `ContentCard` components organized by difficulty/category.
  - TDD: Write test verifying PageLayout wrapping, cards render.

- [ ] **Task 3.5: Transform `/learn` page**
  - File: `plantapp/src/routes/learn/+page.svelte`
  - Use `PageLayout.svelte` with hero.
  - Grid of `FeatureCard` components showcasing learning categories (Hydroponics 101, Aquaponics Guide, etc.).
  - Each card links to relevant guide/content section.
  - TDD: Write test verifying FeatureCard grid renders, links are correct.

- [ ] **Task 3.6: Transform `/faq` page**
  - File: `plantapp/src/routes/faq/+page.svelte`
  - Use `PageLayout.svelte`.
  - Search/filter input at top to filter FAQ items by keyword.
  - FAQ items rendered with `Accordion.svelte` grouped by category.
  - `StructuredData.svelte` with FAQPage schema.
  - TDD: Write test verifying search input exists, accordion items render, structured data outputs FAQPage schema.

- [ ] **Task 3.7: Transform `/resources` page**
  - File: `plantapp/src/routes/resources/+page.svelte`
  - Use `PageLayout.svelte`.
  - Categorized card grid (Downloads, Calculators, Tools, etc.).
  - Uses `FeatureCard` or `ContentCard` per category.
  - TDD: Write test verifying categorized sections render, cards display.

- [ ] **Verification: Phase 3 checkpoint** [checkpoint marker]
  - Navigate all content pages at 375px -- verify prose readability, no overflow.
  - Verify FAQ search filters items correctly.
  - Verify all content pages have `SEO.svelte` with unique title/description.
  - Check Article structured data on blog pages, FAQPage schema on `/faq`.

---

## Phase 4: Auth & Account Pages

**Goal:** Apply SplitLayout to auth pages and create consistent account section navigation.

### Tasks

- [ ] **Task 4.1: Create `AccountNav.svelte` component**
  - File: `plantapp/src/lib/components/navigation/AccountNav.svelte`
  - Desktop: vertical sidebar navigation with links to profile, orders, wishlist.
  - Mobile: horizontal tab/pill navigation (scrollable).
  - Active state highlighting based on current route.
  - Props: `currentPath: string`.
  - TDD: Write test verifying nav items render, active state applied to current path, mobile variant is horizontal.

- [ ] **Task 4.2: Create `AccountLayout.svelte` wrapper**
  - File: `plantapp/src/lib/components/layout/AccountLayout.svelte`
  - Combines `PageLayout` + `AccountNav` sidebar.
  - Desktop: sidebar (240px) + content area.
  - Mobile: tab nav on top + content below.
  - Props: `title`, `children` (snippet).
  - TDD: Write test verifying sidebar renders on desktop layout, tabs render on mobile layout.

- [ ] **Task 4.3: Transform `/login` page**
  - File: `plantapp/src/routes/login/+page.svelte`
  - Use `SplitLayout.svelte` with botanical pattern or AI mock asset on left, form on right.
  - Form fields use editorial floating-label, bottom-border input style (Tailwind classes: `border-0 border-b-2 border-gray-300 focus:border-primary bg-transparent`).
  - Social login button placeholders above the form divider.
  - "Don't have an account? Register" link below.
  - TDD: Write test verifying SplitLayout wrapping, form fields render, submit handler exists.

- [ ] **Task 4.4: Transform `/register` page**
  - File: `plantapp/src/routes/register/+page.svelte`
  - Use `SplitLayout.svelte` (mirror of login, different image/pattern side).
  - Fields: name, email, password, confirm password with floating labels.
  - Link to login page.
  - TDD: Write test verifying SplitLayout wrapping, all form fields present.

- [ ] **Task 4.5: Transform `/verify-email` page**
  - File: `plantapp/src/routes/verify-email/+page.svelte`
  - Use `PageLayout.svelte` with centered content, email icon illustration, instructions.
  - TDD: Write test verifying PageLayout wrapping, instructional content renders.

- [ ] **Task 4.6: Transform `/account/profile` page**
  - File: `plantapp/src/routes/account/profile/+page.svelte`
  - Use `AccountLayout.svelte`.
  - Profile form with editorial input style.
  - Avatar upload area.
  - TDD: Write test verifying AccountLayout wrapping, form fields render.

- [ ] **Task 4.7: Transform `/account/orders` page**
  - File: `plantapp/src/routes/account/orders/+page.svelte`
  - Use `AccountLayout.svelte`.
  - Clean table layout with status badges (DaisyUI `badge` component: `badge-success`, `badge-warning`, `badge-error`).
  - Mobile: cards instead of table rows (responsive table -> card pattern).
  - TDD: Write test verifying table renders on desktop, cards on mobile, badges display.

- [ ] **Task 4.8: Transform `/account/wishlist` page**
  - File: `plantapp/src/routes/account/wishlist/+page.svelte`
  - Use `AccountLayout.svelte`.
  - Grid of `ProductCard.svelte` components.
  - Empty state with illustration.
  - TDD: Write test verifying ProductCard grid, empty state rendering.

- [ ] **Verification: Phase 4 checkpoint** [checkpoint marker]
  - Test login/register at 320px, 375px -- SplitLayout stacks, form is usable.
  - Test account pages at mobile -- tab navigation works, tables convert to cards.
  - Verify all auth pages have SEO component.
  - Verify floating-label inputs are accessible (labels remain visible, `aria-label` or visible label).

---

## Phase 5: Utility & Legal Pages

**Goal:** Polish all remaining pages (about, contact, shipping, returns, legal, careers, press, sustainability, help, accessibility, cookies).

### Tasks

- [ ] **Task 5.1: Transform `/about` page**
  - File: `plantapp/src/routes/about/+page.svelte`
  - Use `PageLayout.svelte` with a large hero image.
  - Editorial storytelling layout: full-bleed image sections, pull quotes (styled blockquotes), company timeline.
  - Team section with photo grid.
  - `ScrollReveal` on each section.
  - TDD: Write test verifying hero, timeline section, pull quote elements exist.

- [ ] **Task 5.2: Transform `/contact` page**
  - File: `plantapp/src/routes/contact/+page.svelte`
  - Use `SplitLayout.svelte`: contact form on one side, contact info (address, phone, email, map placeholder) on the other.
  - Form uses editorial input style.
  - TDD: Write test verifying SplitLayout, form fields, contact info section.

- [ ] **Task 5.3: Transform `/sustainability` page**
  - File: `plantapp/src/routes/sustainability/+page.svelte`
  - Use `PageLayout.svelte` with sustainability hero image.
  - Editorial content sections with full-bleed images, statistics callouts, and `ScrollReveal`.
  - TDD: Write test verifying hero, content sections render.

- [ ] **Task 5.4: Transform legal pages (privacy, terms, cookies)**
  - Files: `plantapp/src/routes/privacy/+page.svelte`, `plantapp/src/routes/terms/+page.svelte`, `plantapp/src/routes/cookies/+page.svelte`
  - All use `ArticleLayout.svelte` with table of contents and prose typography.
  - Last updated date in article header.
  - TDD: Write test for one legal page verifying ArticleLayout wrapping, ToC presence, prose class.

- [ ] **Task 5.5: Transform utility pages (shipping, returns, help, accessibility)**
  - Files: `plantapp/src/routes/shipping/+page.svelte`, `plantapp/src/routes/returns/+page.svelte`, `plantapp/src/routes/help/+page.svelte`, `plantapp/src/routes/accessibility/+page.svelte`
  - All use `PageLayout.svelte` with small hero banner.
  - Content uses prose typography within `Container`.
  - Shipping/returns: step-by-step process with numbered sections.
  - Help: categorized FAQ-style accordion or link grid.
  - TDD: Write test for one utility page verifying PageLayout wrapping, hero title, content structure.

- [ ] **Task 5.6: Transform company pages (careers, press)**
  - Files: `plantapp/src/routes/careers/+page.svelte`, `plantapp/src/routes/press/+page.svelte`
  - Careers: `PageLayout.svelte` with job listing cards, company culture section.
  - Press: `PageLayout.svelte` with press release listing, media kit download section.
  - TDD: Write test verifying PageLayout, section content renders.

- [ ] **Task 5.7: Transform `/cart` page visual refresh**
  - File: `plantapp/src/routes/cart/+page.svelte`
  - Use `PageLayout.svelte` (no hero, just breadcrumbs + title).
  - Clean card-based line items with product thumbnails via `OptimizedImage`.
  - Quantity controls with 44px touch targets.
  - Order summary card sticky on desktop sidebar.
  - Mobile: summary card below items, full-width "Checkout" button.
  - Empty cart state with illustration and "Continue Shopping" CTA.
  - TDD: Write test verifying line item rendering, empty state, checkout button.

- [ ] **Verification: Phase 5 checkpoint** [checkpoint marker]
  - Navigate all utility/legal pages at 375px -- verify prose readability, no overflow, ToC works.
  - Verify about page storytelling layout renders sections with ScrollReveal.
  - Verify contact page SplitLayout stacks on mobile.
  - Verify cart page at mobile widths -- touch targets, no overlap.
  - All pages have SEO component with unique metadata.

---

## Phase 6: Page Transitions

**Goal:** Add subtle, performant route transition animations using the View Transitions API with CSS fallback.

### Tasks

- [ ] **Task 6.1: Implement page transition in root layout**
  - File: `plantapp/src/routes/+layout.svelte`
  - Use SvelteKit's `onNavigate` lifecycle hook to trigger View Transitions API (`document.startViewTransition`).
  - Fallback: CSS class-based fade transition for browsers without View Transitions support.
  - Duration: 200-300ms.
  - Respect `prefers-reduced-motion` -- skip transition entirely.
  - TDD: Write test verifying `onNavigate` callback is registered, reduced-motion check exists.

- [ ] **Task 6.2: Add view transition CSS**
  - File: `plantapp/src/app.css` (or scoped in layout)
  - Define `::view-transition-old(root)` and `::view-transition-new(root)` animations.
  - Fallback: `.page-enter`, `.page-leave` CSS classes with opacity/translateY transitions.
  - Keep animations simple: fade + slight upward slide (translateY 8px -> 0).
  - TDD: Verify CSS contains view-transition pseudo-elements and fallback classes.

- [ ] **Task 6.3: Add focus management on route change**
  - File: `plantapp/src/routes/+layout.svelte`
  - After navigation completes, move focus to `<main>` element (use `afterNavigate` from `$app/navigation`).
  - Announce route change to screen readers via a visually hidden live region.
  - TDD: Write test verifying `afterNavigate` sets focus to main, live region element exists.

- [ ] **Verification: Phase 6 checkpoint** [checkpoint marker]
  - Navigate between 3-4 different pages -- observe smooth fade transition.
  - Enable `prefers-reduced-motion` in dev tools -- confirm no animation.
  - Use screen reader (or inspect live region) -- confirm route change announced.
  - Measure navigation performance -- transitions should not add perceptible delay.

---

## Phase 7: Mobile Polish & Cross-Cutting Quality

**Goal:** Final sweep ensuring every page meets mobile, accessibility, SEO, and performance standards.

### Tasks

- [ ] **Task 7.1: Mobile overflow and viewport audit**
  - Files: All 46 route pages (spot-check each)
  - Test every page at 320px, 375px, 414px viewport widths.
  - Fix any horizontal scrolling or overflow issues.
  - Ensure no fixed/sticky elements overlap (header, sticky CTA bars, bottom sheet).
  - Document: create a checklist in `plantapp/src/routes/` or track notes.
  - TDD: N/A -- manual visual audit.

- [ ] **Task 7.2: Touch target audit**
  - Files: All interactive elements across all pages.
  - Ensure all buttons, links, inputs, and card tap areas meet 44px minimum touch target.
  - Fix any undersized targets by adding padding or min-height/min-width.
  - TDD: N/A -- manual audit with browser dev tools measuring tool.

- [ ] **Task 7.3: Typography and readability audit**
  - Files: All pages.
  - Verify minimum 16px body text, minimum 14px secondary text across all pages.
  - Verify proper heading hierarchy (single h1, sequential h2/h3) on every page.
  - Verify prose content pages have adequate line-height (1.6+) and max-width for readability.
  - TDD: N/A -- manual audit.

- [ ] **Task 7.4: Responsive image audit**
  - Files: All pages using images.
  - Ensure all images use `OptimizedImage.svelte` with `srcset` for responsive loading.
  - Verify `alt` text on all images.
  - Check no images cause CLS (set explicit width/height or aspect-ratio).
  - TDD: N/A -- manual audit.

- [ ] **Task 7.5: SEO component audit**
  - Files: All 46 route pages.
  - Verify every page has `SEO.svelte` with unique `title`, `description`, and `image`.
  - Verify canonical URLs are correct.
  - Add `StructuredData.svelte` where missing: Product schema on product pages, Article schema on blog/content, FAQPage on FAQ.
  - TDD: Write a script or test that checks each route file imports and uses SEO component.

- [ ] **Task 7.6: Accessibility audit**
  - Files: All pages and components.
  - Run Lighthouse accessibility audit on 5 key pages (homepage, products, product detail, blog, login) -- target score > 95.
  - Verify skip-to-content link works on every page (add to `+layout.svelte` if missing).
  - Verify focus management on route changes (Phase 6 Task 6.3).
  - Verify all modals/drawers (BottomSheet, mobile nav) have proper focus trapping and `aria-modal`.
  - Verify keyboard navigation works for all interactive patterns (accordion, carousel, tabs).
  - TDD: N/A -- Lighthouse + manual testing.

- [ ] **Task 7.7: Performance check**
  - Files: N/A (measurement task).
  - Run Lighthouse performance audit on 3 key pages (homepage, products, product detail) on simulated mobile 4G.
  - Verify LCP < 2.5s, CLS < 0.1, FID < 100ms.
  - Check route JS bundles stay under 50KB gzipped (use `vite-bundle-visualizer` or build output).
  - If any page exceeds budget, apply code splitting (dynamic imports for heavy components like ImageGallery, Carousel).
  - TDD: N/A -- measurement task.

- [ ] **Task 7.8: Skip-to-content link**
  - File: `plantapp/src/routes/+layout.svelte`
  - Add a visually-hidden skip link as first focusable element: `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to content</a>`.
  - Add `id="main-content"` to `<main>` element.
  - TDD: Write test verifying skip link exists and points to main content.

- [ ] **Verification: Phase 7 final checkpoint** [checkpoint marker]
  - All pages render without horizontal overflow at 320px.
  - All interactive elements meet 44px touch target.
  - Lighthouse accessibility > 95 on sampled pages.
  - Lighthouse performance meets NFR-1 targets on sampled pages.
  - Every page has unique SEO metadata.
  - Skip-to-content works on every page.
  - Page transitions work and respect reduced-motion.
  - No console errors or warnings across all routes.

---

## File Summary

### New Files (15)
| File | Phase | Purpose |
|------|-------|---------|
| `plantapp/src/lib/components/animation/ScrollReveal.svelte` | 1 | Intersection Observer reveal animation |
| `plantapp/src/lib/components/animation/index.ts` | 1 | Barrel export |
| `plantapp/src/lib/components/layout/PageLayout.svelte` | 1 | Standard page template |
| `plantapp/src/lib/components/layout/SplitLayout.svelte` | 1 | 50/50 auth page template |
| `plantapp/src/lib/components/layout/ArticleLayout.svelte` | 1 | Long-form content template |
| `plantapp/src/lib/components/layout/AccountLayout.svelte` | 4 | Account section wrapper |
| `plantapp/src/lib/components/ui/BottomSheet.svelte` | 1 | Mobile bottom sheet drawer |
| `plantapp/src/lib/components/cards/ProductCard.svelte` | 2 | Product card component |
| `plantapp/src/lib/components/cards/ContentCard.svelte` | 3 | Blog/content card component |
| `plantapp/src/lib/components/cards/FeatureCard.svelte` | 3 | Feature/category card component |
| `plantapp/src/lib/components/products/ViewToggle.svelte` | 2 | Grid/masonry view switcher |
| `plantapp/src/lib/components/products/ProductGrid.svelte` | 2 | Product grid with loading states |
| `plantapp/src/lib/components/products/FilterSidebar.svelte` | 2 | Filter UI with mobile bottom sheet |
| `plantapp/src/lib/components/navigation/AccountNav.svelte` | 4 | Account sidebar/tab navigation |
| `plantapp/src/lib/components/ui/index.ts` | 1 | Updated barrel export |

### Modified Files (25+)
| File | Phase | Change |
|------|-------|--------|
| `plantapp/src/lib/components/layout/index.ts` | 1 | Add new layout exports |
| `plantapp/src/routes/+layout.svelte` | 6, 7 | Page transitions, focus management, skip link |
| `plantapp/src/app.css` | 6 | View transition CSS |
| `plantapp/src/routes/products/+page.svelte` | 2 | Full redesign with PageLayout |
| `plantapp/src/routes/products/mock-detail/+page.svelte` | 2 | Editorial product detail |
| `plantapp/src/routes/products/hydroponics/+page.svelte` | 2 | Category page redesign |
| `plantapp/src/routes/products/aquaponics/+page.svelte` | 2 | Category page redesign |
| `plantapp/src/routes/products/silvopasture/+page.svelte` | 2 | Category page redesign |
| `plantapp/src/routes/products/agroforestry/+page.svelte` | 2 | Category page redesign |
| `plantapp/src/routes/blog/+page.svelte` | 3 | Blog listing redesign |
| `plantapp/src/routes/guides/+page.svelte` | 3 | Guides listing redesign |
| `plantapp/src/routes/learn/+page.svelte` | 3 | Learning hub redesign |
| `plantapp/src/routes/faq/+page.svelte` | 3 | FAQ with accordion + search |
| `plantapp/src/routes/resources/+page.svelte` | 3 | Resources card grid |
| `plantapp/src/routes/login/+page.svelte` | 4 | SplitLayout redesign |
| `plantapp/src/routes/register/+page.svelte` | 4 | SplitLayout redesign |
| `plantapp/src/routes/verify-email/+page.svelte` | 4 | PageLayout wrapping |
| `plantapp/src/routes/account/profile/+page.svelte` | 4 | AccountLayout wrapping |
| `plantapp/src/routes/account/orders/+page.svelte` | 4 | AccountLayout + responsive table |
| `plantapp/src/routes/account/wishlist/+page.svelte` | 4 | AccountLayout + ProductCard grid |
| `plantapp/src/routes/about/+page.svelte` | 5 | Editorial storytelling layout |
| `plantapp/src/routes/contact/+page.svelte` | 5 | SplitLayout contact form |
| `plantapp/src/routes/sustainability/+page.svelte` | 5 | Editorial content sections |
| `plantapp/src/routes/cart/+page.svelte` | 5 | Visual refresh with PageLayout |
| `plantapp/src/routes/privacy/+page.svelte` | 5 | ArticleLayout |
| `plantapp/src/routes/terms/+page.svelte` | 5 | ArticleLayout |
| `plantapp/src/routes/cookies/+page.svelte` | 5 | ArticleLayout |
| `plantapp/src/routes/shipping/+page.svelte` | 5 | PageLayout |
| `plantapp/src/routes/returns/+page.svelte` | 5 | PageLayout |
| `plantapp/src/routes/help/+page.svelte` | 5 | PageLayout |
| `plantapp/src/routes/accessibility/+page.svelte` | 5 | PageLayout |
| `plantapp/src/routes/careers/+page.svelte` | 5 | PageLayout |
| `plantapp/src/routes/press/+page.svelte` | 5 | PageLayout |

---

## Dependency Graph

```
Phase 1 (Foundation)
  |
  +---> Phase 2 (Products)   -- needs PageLayout, ScrollReveal, BottomSheet, ProductCard
  |
  +---> Phase 3 (Content)    -- needs PageLayout, ArticleLayout, ScrollReveal
  |
  +---> Phase 4 (Auth)       -- needs SplitLayout, PageLayout
  |
  +---> Phase 5 (Utility)    -- needs PageLayout, ArticleLayout, SplitLayout
  |
  +---> Phase 6 (Transitions) -- independent of page content, depends on layout only
  |
  Phase 7 (Polish) ----------- runs last, audits everything
```

Phases 2-5 can be worked in parallel after Phase 1 completes. Phase 6 can start any time after Phase 1. Phase 7 must be last.
