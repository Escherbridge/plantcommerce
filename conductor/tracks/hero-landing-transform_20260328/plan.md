# Implementation Plan: Hero & Landing Page Transformation

## Overview

This plan transforms the Aevani homepage from a static e-commerce layout into an immersive, editorial-grade scroll-driven experience. It is organized into 6 phases, progressing from foundational animation primitives through each homepage section, ending with integration and polish.

**Dependency:** The `design-system-brand_20260328` track must be complete before starting. That track provides the custom DaisyUI theme, typography (display/mono/body fonts), SVG pattern library (`PatternBackground`, `MyceliumNetwork`, `RootSystem`), and design tokens (`--duration-slow`, `--ease-out-expo`, etc.).

**Key files created/modified:**
- `plantapp/src/lib/components/ui/ScrollReveal.svelte` (new)
- `plantapp/src/lib/components/ui/TextReveal.svelte` (new)
- `plantapp/src/lib/components/ui/MarqueeBar.svelte` (new)
- `plantapp/src/lib/components/ui/ParallaxHero.svelte` (new)
- `plantapp/src/lib/components/ui/index.ts` (modified - add exports)
- `plantapp/src/routes/+page.svelte` (major rewrite)
- `plantapp/src/routes/+layout.svelte` (modified - add MarqueeBar)

---

## Phase 1: Animation Primitives (ScrollReveal + TextReveal)

**Goal:** Build the two reusable animation components that everything else depends on. These are pure utility components with no homepage-specific logic.

### Tasks

- [ ] **Task 1.1: Create `ScrollReveal.svelte` component**
  - **File:** `plantapp/src/lib/components/ui/ScrollReveal.svelte`
  - **TDD:** Write a component test (`plantapp/src/lib/components/ui/ScrollReveal.test.ts`) that verifies:
    - Component renders children in the DOM regardless of animation state (accessibility: never `display: none`)
    - Accepts `animation` prop with variants: `fade-up`, `fade-in`, `slide-left`, `slide-right`, `scale-up`, `stagger-children`
    - Accepts `delay` (number, ms), `duration` (number, ms), `threshold` (number, 0-1, default 0.15), `once` (boolean, default true) props
    - Applies `opacity: 0` and appropriate transform initially, transitions to `opacity: 1` / `transform: none` when triggered
    - `stagger-children` variant applies incremental delay to direct children (default 100ms between each)
  - **Implementation:**
    - Use Svelte 5 `$effect` with `IntersectionObserver` to detect viewport entry
    - All animations use CSS transitions on `transform` and `opacity` only (compositor-safe per NFR-1)
    - Use design tokens `--duration-slow` and `--ease-out-expo` as defaults
    - When `once: true`, disconnect the observer after first intersection
    - Add `prefers-reduced-motion` media query: skip transforms, use simple instant opacity or no animation
  - **Refactor:** Extract observer setup into a reusable `useIntersectionObserver` action if it simplifies the code

- [ ] **Task 1.2: Create `TextReveal.svelte` component**
  - **File:** `plantapp/src/lib/components/ui/TextReveal.svelte`
  - **TDD:** Write a component test (`plantapp/src/lib/components/ui/TextReveal.test.ts`) that verifies:
    - Renders the final text in the DOM immediately (accessible to screen readers via `aria-label`)
    - Accepts `text` (string), `mode` ('scramble' | 'typewriter', default 'scramble'), `duration` (ms), `delay` (ms), `triggerOnMount` (boolean) props
    - In scramble mode: displays random characters that progressively resolve to the target text
    - In typewriter mode: reveals characters left-to-right
    - Emits a `complete` event when animation finishes
    - Respects `prefers-reduced-motion`: shows final text immediately
  - **Implementation:**
    - Use `$effect` to run the animation loop with `requestAnimationFrame`
    - Scramble charset: uppercase letters and a few symbols for editorial feel
    - Use a `<span aria-hidden="true">` for the animated display and a `<span class="sr-only">` for the accessible text
    - Total animation JS should be minimal (target < 1KB for this component)

- [ ] **Task 1.3: Export new components from UI index**
  - **File:** `plantapp/src/lib/components/ui/index.ts`
  - Add exports for `ScrollReveal` and `TextReveal`

- [ ] **Verification: Phase 1**
  - Run component tests: `cd plantapp && npx vitest run src/lib/components/ui/ScrollReveal.test.ts src/lib/components/ui/TextReveal.test.ts`
  - Manually verify: create a temporary test page that uses both components, confirm animations play on scroll and on mount
  - Confirm `prefers-reduced-motion` behavior in browser devtools (toggle in Rendering panel)
  - [checkpoint marker]

---

## Phase 2: Cinematic Hero Section

**Goal:** Build the full-viewport parallax hero with text-reveal animation, replacing the current 8/4 grid hero.

### Tasks

- [ ] **Task 2.1: Create `ParallaxHero.svelte` component**
  - **File:** `plantapp/src/lib/components/ui/ParallaxHero.svelte`
  - **TDD:** Write a component test (`plantapp/src/lib/components/ui/ParallaxHero.test.ts`) that verifies:
    - Renders at 100vh (100svh on mobile) with full-bleed background image
    - Contains the title "AEVANI", subtitle, and CTA buttons
    - Hero image has `loading="eager"` attribute
    - Background element has `will-change: transform` style
    - Scroll indicator element exists at the bottom
    - All content is accessible (proper heading hierarchy, link text)
  - **Implementation:**
    - Full viewport section with `min-h-svh` (safe viewport height)
    - Background image via `<img>` with `object-cover`, absolutely positioned, with `will-change: transform`
    - Parallax: CSS-only approach using `transform: translate3d(0, calc(var(--scroll-y) * 0.5), 0)` driven by a minimal scroll listener that sets a CSS custom property (or use pure CSS `perspective` + `translateZ` trick)
    - On mobile (`< 768px`): disable parallax entirely (set `--scroll-y` to 0 or skip the transform)
    - Gradient overlay: `bg-gradient-to-b from-transparent to-base-100` at the bottom for seamless section transition
    - Title "AEVANI" uses `TextReveal` component with scramble mode, display font, `clamp(3rem, 10vw, 10rem)` sizing
    - Subtitle "From monoculture to polyculture" uses staggered word fade-in (CSS animation with `animation-delay` per word), triggered after `TextReveal` emits `complete`
    - CTA buttons fade-slide up after subtitle completes (use CSS `animation` with appropriate delay chain)
    - Scroll indicator: animated chevron with CSS `@keyframes` pulse, hidden after user scrolls (use `IntersectionObserver` on a sentinel or a one-time scroll listener)
    - `prefers-reduced-motion`: all content visible immediately, no animations
  - **Refactor:** Consider whether parallax scroll listener should be a Svelte action for reusability

- [ ] **Task 2.2: Add hero image preload hint**
  - **File:** `plantapp/src/routes/+page.svelte` (in `<svelte:head>`)
  - Add `<link rel="preload" as="image" href="/src/lib/images/AI-MockAssets/MAINHERO.png">` for LCP optimization

- [ ] **Task 2.3: Export `ParallaxHero` from UI index**
  - **File:** `plantapp/src/lib/components/ui/index.ts`

- [ ] **Verification: Phase 2**
  - Run component test: `cd plantapp && npx vitest run src/lib/components/ui/ParallaxHero.test.ts`
  - Manual: load the homepage, verify hero fills viewport, text scramble plays, subtitle staggers in, CTAs slide up, scroll indicator pulses
  - Manual: resize to mobile width, confirm parallax is disabled and `100svh` avoids browser chrome issues
  - Manual: enable `prefers-reduced-motion` in devtools, confirm all content shows instantly
  - Performance: check DevTools Performance panel for 60fps during scroll (no layout shifts, only compositor layers)
  - [checkpoint marker]

---

## Phase 3: Marquee Announcement Bar

**Goal:** Add the Chrome Industries-inspired scrolling announcement ticker above the header.

### Tasks

- [ ] **Task 3.1: Create `MarqueeBar.svelte` component**
  - **File:** `plantapp/src/lib/components/ui/MarqueeBar.svelte`
  - **TDD:** Write a component test (`plantapp/src/lib/components/ui/MarqueeBar.test.ts`) that verifies:
    - Renders a bar with configurable messages (accepts `messages: string[]` prop)
    - Messages are separated by decorative dividers
    - Has a dismiss/close button
    - After dismiss, the bar is hidden
    - Screen reader accessible: includes `<span class="sr-only">` with all messages
    - Uses `primary` background and `primary-content` text color classes
    - Bar height is compact (32-36px range)
  - **Implementation:**
    - CSS-only continuous scroll using `@keyframes marquee` with `translateX` animation (no JS)
    - Duplicate the message content for seamless loop (render messages twice, animate width 50% to left)
    - Mono font for editorial feel
    - Decorative dividers between messages (configurable: dot, leaf SVG, or pipe)
    - Close button: collapses with `max-height` transition, stores dismissal in `sessionStorage` under a key like `marquee-dismissed`
    - On mount, check `sessionStorage` — if dismissed, don't render
    - Responsive: smaller font on mobile (`text-xs` vs `text-sm`)
    - `prefers-reduced-motion`: pause the scroll animation (show static text)

- [ ] **Task 3.2: Integrate MarqueeBar into layout**
  - **File:** `plantapp/src/routes/+layout.svelte`
  - Add `MarqueeBar` import and render it above `<Header />` inside the `.layout-content` div
  - Pass default messages: `["Free shipping on orders over $75", "New: Polyculture Starter Kits", "Join 10,000+ sustainable growers"]`

- [ ] **Task 3.3: Export `MarqueeBar` from UI index**
  - **File:** `plantapp/src/lib/components/ui/index.ts`

- [ ] **Verification: Phase 3**
  - Run component test: `cd plantapp && npx vitest run src/lib/components/ui/MarqueeBar.test.ts`
  - Manual: verify marquee scrolls smoothly at 60fps, messages loop seamlessly
  - Manual: click dismiss, verify bar collapses, refresh page, verify bar stays dismissed (sessionStorage)
  - Manual: clear sessionStorage, refresh, verify bar reappears
  - Manual: screen reader test — verify all message content is accessible
  - [checkpoint marker]

---

## Phase 4: Section Transformations (Category, Core Values, Products)

**Goal:** Apply ScrollReveal to all sections and redesign the category showcase, core values, and featured products per spec.

### Tasks

- [ ] **Task 4.1: Editorial Category Showcase redesign**
  - **File:** `plantapp/src/routes/+page.svelte` (category section)
  - **TDD:** Write/update page-level test or snapshot test verifying:
    - Category grid uses asymmetric layout (one featured card spanning 2 columns)
    - Category cards have full-bleed background images with gradient overlays
    - Hover state reveals "Shop Now" CTA
    - Display font used for category labels in uppercase
    - Mobile: single column with tall (60vh) cards
  - **Implementation:**
    - Replace `<CategoryNav>` component usage with custom editorial grid
    - Asymmetric CSS grid: `grid-template-columns: repeat(3, 1fr)` with first item spanning 2 cols and 2 rows
    - Each card: relative positioned with `<img>` cover, gradient overlay, bold uppercase label in display font
    - Hover: image `scale(1.05)` transition, "Shop Now" CTA slides up from `translateY(100%)` to `translateY(0)`
    - Wrap section in `<ScrollReveal animation="fade-up">`
    - Mobile: `grid-cols-1` with `min-h-[60vh]` on each card
    - Add SVG pattern decorative element from design system pattern library on each card

- [ ] **Task 4.2: Core Values section redesign**
  - **File:** `plantapp/src/routes/+page.svelte` (core values section)
  - **TDD:** Verify:
    - Emoji icons (book, muscle) are replaced with SVG illustrations
    - Section wraps in `ScrollReveal` with `stagger-children`
    - Base64 SVG grid pattern is replaced with `PatternBackground` using `MyceliumNetwork`
    - Large cards (Sustainability, Diversity) have SVG pattern overlays from design system
  - **Implementation:**
    - Create inline SVG illustrations for Education and Empowerment (simple line-art style matching brand)
    - Alternative: use SVG files in `plantapp/src/lib/images/icons/` if the illustrations are complex
    - Replace `📚` with an open-book SVG illustration, `💪` with a seedling-hands SVG illustration
    - Replace the base64 `data:image/svg+xml` grid pattern in the Diversity card with a `PatternBackground` component (from design system track)
    - Add `PatternBackground` with `MyceliumNetwork` at low opacity as section background
    - Wrap entire grid in `<ScrollReveal animation="stagger-children" delay={100}>`
    - Sustainability and Community image cards: add subtle SVG pattern overlay

- [ ] **Task 4.3: Featured Products editorial grid redesign**
  - **File:** `plantapp/src/routes/+page.svelte` (featured products section)
  - **TDD:** Verify:
    - First product card spans 2 columns as "featured pick"
    - Product price uses mono font
    - "VIEW DETAILS" CTA uses display font with letter-spacing
    - Hover: scale-up + shadow (not translate-y bounce)
    - Color overlay on hover with "Quick View" action
    - Mobile: 2-column grid
  - **Implementation:**
    - Change grid from uniform `Grid columns={3}` to custom CSS grid where first item spans 2 cols
    - First card: larger image, editorial-style description with more text
    - All cards: hover `scale(1.02)` + `shadow-2xl` transition (remove current `hover:-translate-y-3`)
    - Image hover: color overlay `bg-primary/20` fading in, with centered "Quick View" text
    - Price: add `font-mono` class
    - CTA: add display font class + `tracking-widest uppercase`
    - Mobile: `grid-cols-2` instead of `grid-cols-1`, smaller card padding
    - Wrap section in `<ScrollReveal animation="fade-up">`

- [ ] **Verification: Phase 4**
  - Run all tests: `cd plantapp && npx vitest run`
  - Manual: scroll through homepage, verify each section animates in via ScrollReveal
  - Manual: verify category cards have correct asymmetric layout and hover effects
  - Manual: verify emoji icons are replaced with SVG illustrations in core values
  - Manual: verify product grid has featured first card, mono prices, correct hover behavior
  - Manual: resize to mobile, verify category cards are 60vh, products are 2-column
  - [checkpoint marker]

---

## Phase 5: Newsletter Section + Homepage Integration

**Goal:** Redesign the newsletter section and wire up the complete homepage with all new components.

### Tasks

- [ ] **Task 5.1: Newsletter section redesign**
  - **File:** `plantapp/src/routes/+page.svelte` (newsletter section)
  - **TDD:** Verify:
    - Background uses `RootSystem` SVG pattern at low opacity over dark section
    - Headline uses display font at maximum scale
    - Email input and button have custom styling (not default DaisyUI join)
    - Submit triggers a micro-animation (checkmark morph or confetti)
  - **Implementation:**
    - Replace base64 grid pattern with `PatternBackground` using `RootSystem` pattern at 8-12% opacity
    - Headline: display font, `clamp(2.5rem, 8vw, 7rem)` sizing
    - Custom input: large with minimal border, `border-b-2` style, no rounded corners, display font for button
    - Submit animation: on click, button text morphs to a checkmark SVG with a scale-in CSS animation, reverts after 2s
    - Wrap in `<ScrollReveal animation="fade-up">`

- [ ] **Task 5.2: Full homepage assembly and rewrite**
  - **File:** `plantapp/src/routes/+page.svelte`
  - **Implementation:**
    - Replace the entire current hero section with `<ParallaxHero />`
    - Ensure section ordering: Hero -> Category -> Core Values -> Featured Products -> Newsletter
    - Add `<ScrollReveal>` wrappers around each section (except hero, which has its own animations)
    - Verify all imports are correct and no unused imports remain
    - Ensure structured data and SEO meta tags remain intact
    - Clean up any dead code from the old layout

- [ ] **Task 5.3: Skip-to-content accessibility link**
  - **File:** `plantapp/src/routes/+layout.svelte`
  - Add a visually hidden skip-to-content link that skips the marquee and hero, targeting `#main-content`
  - Add `id="main-content"` to the first section after the hero in `+page.svelte` or to the `<main>` element

- [ ] **Verification: Phase 5**
  - Run all tests: `cd plantapp && npx vitest run`
  - Manual: full homepage scroll-through from top to bottom, verify cohesive visual flow
  - Manual: newsletter submit animation works
  - Manual: skip-to-content link works (Tab on page load, verify focus moves past marquee and hero)
  - [checkpoint marker]

---

## Phase 6: Performance, Accessibility, and Polish

**Goal:** Final pass for performance optimization, accessibility audit, and cross-browser/device testing.

### Tasks

- [ ] **Task 6.1: Performance audit**
  - **Files:** All new components
  - Verify all animations use only `transform` and `opacity` (no `top`, `left`, `width`, `height` animations)
  - Verify `will-change: transform` is applied to parallax elements and removed after animation completes where appropriate
  - Verify IntersectionObservers disconnect after `once: true` fires
  - Measure: total animation-related JS should be < 3KB gzipped
  - Run Lighthouse on the homepage, target Performance score >= 90
  - Verify hero image has `<link rel="preload">` and `loading="eager"`

- [ ] **Task 6.2: Accessibility audit**
  - **Files:** All new components + `+page.svelte` + `+layout.svelte`
  - Verify `prefers-reduced-motion: reduce` disables all animations across all components
  - Verify all scroll-revealed content is in the DOM and readable by screen readers (opacity-based hiding only)
  - Verify marquee has `sr-only` text fallback
  - Verify TextReveal has `aria-label` with final text
  - Verify touch targets are >= 44px on mobile
  - Verify heading hierarchy is correct (h1 -> h2 -> h3, no skips)
  - Tab through entire page, verify logical focus order

- [ ] **Task 6.3: Cross-browser and responsive testing**
  - Test on: Chrome, Firefox, Safari (if available), Edge
  - Test at breakpoints: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop), 1920px (large)
  - Verify `100svh` works correctly on iOS Safari (no content hidden behind browser chrome)
  - Verify marquee animation is smooth across browsers
  - Verify parallax disables on mobile
  - Verify no horizontal overflow at any breakpoint

- [ ] **Task 6.4: Code cleanup and final review**
  - Remove any temporary test pages from Phase 1
  - Ensure all component files have proper TypeScript types for props
  - Verify no `console.log` statements remain
  - Run `npx svelte-check` for type errors
  - Run linter if configured

- [ ] **Verification: Phase 6 (Final)**
  - Run full test suite: `cd plantapp && npx vitest run`
  - Run type check: `cd plantapp && npx svelte-check`
  - Lighthouse Performance >= 90, Accessibility >= 95
  - All animations respect `prefers-reduced-motion`
  - No horizontal scroll on any viewport size
  - [checkpoint marker]

---

## Summary of New Files

| File | Type | Phase |
|------|------|-------|
| `plantapp/src/lib/components/ui/ScrollReveal.svelte` | New component | 1 |
| `plantapp/src/lib/components/ui/ScrollReveal.test.ts` | New test | 1 |
| `plantapp/src/lib/components/ui/TextReveal.svelte` | New component | 1 |
| `plantapp/src/lib/components/ui/TextReveal.test.ts` | New test | 1 |
| `plantapp/src/lib/components/ui/ParallaxHero.svelte` | New component | 2 |
| `plantapp/src/lib/components/ui/ParallaxHero.test.ts` | New test | 2 |
| `plantapp/src/lib/components/ui/MarqueeBar.svelte` | New component | 3 |
| `plantapp/src/lib/components/ui/MarqueeBar.test.ts` | New test | 3 |
| `plantapp/src/lib/components/ui/index.ts` | Modified | 1, 2, 3 |
| `plantapp/src/routes/+page.svelte` | Major rewrite | 2, 4, 5 |
| `plantapp/src/routes/+layout.svelte` | Modified | 3, 5 |

## Estimated Effort

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1: Animation Primitives | 4 | 3-4 hours |
| Phase 2: Cinematic Hero | 4 | 3-4 hours |
| Phase 3: Marquee Bar | 4 | 2-3 hours |
| Phase 4: Section Transforms | 4 | 4-5 hours |
| Phase 5: Newsletter + Integration | 4 | 3-4 hours |
| Phase 6: Polish + QA | 4 | 2-3 hours |
| **Total** | **24** | **17-23 hours** |
