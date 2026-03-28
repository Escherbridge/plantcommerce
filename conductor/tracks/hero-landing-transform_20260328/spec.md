# Specification: Hero & Landing Page Transformation

## Overview

Transform the Aevani homepage from a conventional e-commerce landing page into an immersive, editorial-grade experience that tells the polyculture story through scroll-driven animations, cinematic hero sections, and bold typographic statements. Inspired by TLB's text-reveal animations, Readymag's bold editorial layouts, and Chrome Industries' utilitarian product showcase, this track reimagines every section of the homepage as a distinct visual moment.

## Background

### Current State
- **Hero**: Asymmetric 8/4 grid with a single static image and text. Functional but flat — no animation, no scroll interaction, no visual drama.
- **Category Navigation**: Standard `CategoryNav` component with basic card grid.
- **Core Values**: Asymmetric card grid with hover effects. Uses emoji icons (📚, 💪) instead of custom SVG illustrations. Has one inline base64 SVG grid pattern.
- **Featured Products**: Standard 3-column grid of product cards.
- **Newsletter**: Gradient background with input/button. Another base64 grid pattern.
- **No scroll animations, no parallax, no text reveals, no intersection observers**.
- **No announcement/marquee bar** like Chrome Industries.

### Design Direction
- **Hero**: Full-viewport cinematic hero with layered parallax, text-scramble reveal animation (TLB-inspired), and a bold typographic statement.
- **Scroll storytelling**: Each section reveals through intersection observer animations — fade-up, slide-in, stagger effects.
- **Marquee announcement bar**: Chrome Industries-style scrolling ticker at the very top.
- **Editorial product showcase**: Readymag-inspired asymmetric masonry with hover reveals.
- **SVG pattern section dividers**: Organic transitions between sections using the pattern library from the design-system track.

## Dependencies
- **design-system-brand_20260328** must be complete: provides custom theme, typography, SVG patterns, and design tokens.

## Functional Requirements

### FR-1: Announcement Marquee Bar
**Description:** A scrolling marquee bar at the very top of the viewport (above the header), inspired by Chrome Industries' continuous-scroll announcement ticker.
**Priority:** P1
**Acceptance Criteria:**
- AC-1.1: A new `MarqueeBar.svelte` component displays a continuously scrolling horizontal ticker with configurable messages.
- AC-1.2: Messages scroll using CSS `@keyframes` animation (no JS) for smooth 60fps performance.
- AC-1.3: Supports multiple messages separated by a decorative divider (dot, leaf icon, or pipe).
- AC-1.4: Uses the mono font for an editorial/utilitarian feel.
- AC-1.5: Background uses `primary` color, text uses `primary-content`.
- AC-1.6: Has a close/dismiss button that collapses the bar with a smooth animation and persists dismissal in `sessionStorage`.
- AC-1.7: Content is configurable via props (array of strings) and can be updated from admin later.
- AC-1.8: Responsive — font size adjusts for mobile. Bar height is compact (32-36px).

### FR-2: Cinematic Hero Section
**Description:** Replace the current static hero with a full-viewport cinematic experience featuring layered depth, text animations, and scroll-triggered transitions.
**Priority:** P0
**Acceptance Criteria:**
- AC-2.1: Hero occupies 100vh with no grid split — the image fills the entire viewport as a background.
- AC-2.2: A subtle parallax effect moves the background image at 0.5x scroll speed using CSS `transform: translate3d()` (GPU-accelerated, no JS scroll listener).
- AC-2.3: Hero text uses the display font at maximum scale (`clamp(3rem, 10vw, 10rem)`) with a text-reveal animation that types/unscrambles the word "AEVANI" on load (TLB-inspired).
- AC-2.4: Subtitle "From monoculture to polyculture" fades in with a staggered word animation after the title reveal completes.
- AC-2.5: A subtle gradient overlay transitions from transparent at top to the base background color at bottom, creating a seamless scroll into the next section.
- AC-2.6: CTA buttons fade-slide up after subtitle animation completes.
- AC-2.7: A scroll indicator (animated chevron or "Scroll to explore" text) pulses at the bottom of the hero, disappearing after first scroll.
- AC-2.8: On mobile (< 768px), parallax is disabled (performance), text scales down gracefully, and the hero is 100svh (safe viewport height for mobile browsers).
- AC-2.9: Hero respects `prefers-reduced-motion` — all animations are disabled, content appears immediately.

### FR-3: Scroll-Driven Section Reveals
**Description:** Implement a reusable `ScrollReveal.svelte` component using Intersection Observer to animate sections into view as the user scrolls.
**Priority:** P0
**Acceptance Criteria:**
- AC-3.1: `ScrollReveal.svelte` wraps any content and triggers entrance animations when the element enters the viewport (configurable threshold, default 0.15).
- AC-3.2: Animation variants: `fade-up`, `fade-in`, `slide-left`, `slide-right`, `scale-up`, `stagger-children`.
- AC-3.3: `stagger-children` animates direct children with a configurable delay between each (default 100ms).
- AC-3.4: Animations use CSS transitions with the design token timing (`--duration-slow`, `--ease-out-expo`).
- AC-3.5: Component accepts `delay` (ms), `duration` (ms), `threshold` (0-1), and `once` (boolean, default true — animate only on first intersection) props.
- AC-3.6: All scroll animations respect `prefers-reduced-motion` — reduced to simple opacity fade or no animation.
- AC-3.7: Applied to all homepage sections: category nav, core values, featured products, newsletter.

### FR-4: Editorial Category Showcase
**Description:** Replace the standard CategoryNav cards with an editorial-grade asymmetric showcase inspired by Readymag's mosaic layouts.
**Priority:** P1
**Acceptance Criteria:**
- AC-4.1: Categories display in an asymmetric grid: one large featured category (spanning 2 cols, taller), with remaining categories in smaller cards.
- AC-4.2: Each category card has a full-bleed background image from the AI mock assets, with a gradient overlay and bold uppercase category name.
- AC-4.3: On hover, the image scales subtly and a "Shop Now" CTA slides up from the bottom.
- AC-4.4: Category labels use the display font in uppercase.
- AC-4.5: On mobile, categories stack in a single column with 60vh-height cards for immersive scrolling.
- AC-4.6: Each card uses a relevant SVG pattern from the pattern library as a decorative element.

### FR-5: Core Values Redesign with Illustrations
**Description:** Replace emoji icons with custom SVG illustrations and add scroll-triggered stagger animations.
**Priority:** P1
**Acceptance Criteria:**
- AC-5.1: The 📚 and 💪 emoji icons are replaced with hand-crafted SVG illustrations that match the brand's organic/editorial aesthetic.
- AC-5.2: Value cards animate in with a stagger effect using `ScrollReveal` with `stagger-children`.
- AC-5.3: The large "Sustainability" and "Diversity" cards retain their image/gradient treatment but gain subtle SVG pattern overlays from the pattern library (replacing the base64 grid).
- AC-5.4: Section uses a `PatternBackground` with the `MyceliumNetwork` pattern at low opacity.

### FR-6: Featured Products Editorial Grid
**Description:** Transform the product grid from a uniform 3-column layout into an editorial showcase with hover micro-interactions.
**Priority:** P1
**Acceptance Criteria:**
- AC-6.1: First product card spans 2 columns as a "featured pick" with a larger image and editorial-style description.
- AC-6.2: Product cards gain a subtle scale-up + shadow transition on hover (replacing the current `translate-y` bounce).
- AC-6.3: Product images have a color overlay on hover that transitions to reveal a "Quick View" action.
- AC-6.4: Price display uses the mono font for a utilitarian/data feel.
- AC-6.5: "VIEW DETAILS" CTA uses the display font in uppercase with letter-spacing.
- AC-6.6: On mobile, products display in a 2-column grid (not single column) with smaller cards.

### FR-7: Newsletter Section Reimagined
**Description:** Transform the newsletter CTA into a visually striking, full-width section with organic SVG background and bold typography.
**Priority:** P2
**Acceptance Criteria:**
- AC-7.1: Background uses the `RootSystem` SVG pattern at 8-12% opacity over a dark section.
- AC-7.2: Headline uses the display font at maximum scale.
- AC-7.3: Email input and button are redesigned with custom styling (not default DaisyUI join) — large, bold, minimal border.
- AC-7.4: On submit, a micro-animation confirms the subscription (checkmark morph or confetti burst).

## Non-Functional Requirements

### NFR-1: Performance
- All animations use `transform` and `opacity` only (compositor-safe, no layout thrash).
- Parallax uses `will-change: transform` and `transform: translate3d()`.
- Intersection Observer disconnects after `once: true` animations fire.
- Hero image uses `loading="eager"` with proper `<link rel="preload">`.
- Total animation JS < 3KB gzipped (mostly CSS-driven).

### NFR-2: Accessibility
- All animations respect `prefers-reduced-motion: reduce`.
- Scroll reveal content is in the DOM and accessible to screen readers regardless of animation state (use `opacity` not `display: none`).
- Marquee bar text is also available in a `<span class="sr-only">` for screen readers.
- Skip-to-content link skips the marquee and hero.

### NFR-3: Mobile-First
- All layouts are designed mobile-first, enhancing for larger screens.
- Touch targets meet 44px minimum on all interactive elements.
- Hero uses `100svh` (not `100vh`) to avoid mobile browser chrome issues.
- Parallax is disabled on mobile (performance).
- Scroll-driven animations have shorter durations on mobile.

## Files to Create/Modify
- `plantapp/src/lib/components/ui/MarqueeBar.svelte` — New announcement ticker
- `plantapp/src/lib/components/ui/ScrollReveal.svelte` — New scroll animation wrapper
- `plantapp/src/lib/components/ui/TextReveal.svelte` — New text scramble/reveal animation
- `plantapp/src/lib/components/ui/ParallaxHero.svelte` — New cinematic hero
- `plantapp/src/routes/+page.svelte` — Complete homepage redesign
- `plantapp/src/routes/+layout.svelte` — Add MarqueeBar above Header
