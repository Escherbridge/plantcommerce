# Implementation Plan: Component Library Refresh

## Overview

This plan transforms the Aevani component library from its current state (hardcoded colors, basic DaisyUI styling, no animations) into a refined, editorial-grade design system with micro-interactions, semantic tokens, and new utility components. Work is divided into 7 phases, ordered by dependency and priority (P0 first, then P1, then P2).

**Dependency:** The `design-system-brand_20260328` track must be complete before starting. That track provides the DaisyUI theme, typography tokens (display/body/mono fonts), color tokens, and SVG pattern library.

**Base path:** `c:/Users/atooz/Programming/plantcommerce/plantapp/src/lib`

---

## Phase 1: Button System (FR-4, P0)

**Goal:** Create the foundational Button component used by every subsequent phase.

### Tasks

- [ ] **Task 1.1: Create Button component with variant props**
  - **File:** `components/ui/Button.svelte`
  - **TDD:** Write a rendering test that mounts `Button` with each variant (`primary`, `secondary`, `ghost`) and asserts correct CSS classes are applied. Then implement the component with Svelte 5 runes (`$props`, `$derived`). Refactor to extract shared class logic.
  - **Details:** Props: `variant` (`primary` | `secondary` | `ghost`), `size` (`sm` | `md` | `lg`), `loading` (boolean), `disabled` (boolean), `href` (optional, renders `<a>` instead of `<button>`), `type` (`button` | `submit` | `reset`), `className`. Uses Inter font, weight 600, uppercase, `0.05em` letter-spacing (AC-4.4).

- [ ] **Task 1.2: Implement hover micro-interactions per variant**
  - **File:** `components/ui/Button.svelte`
  - **TDD:** Write tests verifying hover classes exist: primary gets `hover:scale-[1.02]` and shadow lift (AC-4.1), secondary gets fill-from-left animation (AC-4.2), ghost gets animated underline (AC-4.3). Implement with CSS transitions using only `transform` and `opacity` (NFR-1).

- [ ] **Task 1.3: Add loading spinner state and focus ring**
  - **File:** `components/ui/Button.svelte`
  - **TDD:** Write test that when `loading={true}`, button text is replaced with a spinner SVG and button is disabled (AC-4.5). Write test that focus state shows accent-color ring (AC-4.6). Implement and refactor.

- [ ] **Task 1.4: Create Button barrel export and type definitions**
  - **File:** `components/ui/index.ts`
  - **TDD:** Write import test confirming `Button` is exportable from the barrel. Create/update the barrel file.

- [ ] **Verification:** Manually render `Button` in all variants (primary, secondary, ghost) at all sizes. Confirm hover animations, loading state, focus ring, and keyboard activation. [checkpoint marker]

---

## Phase 2: Header and Mobile Drawer Redesign (FR-1, FR-2, P0)

**Goal:** Transform the header into an editorial dark navigation bar and the drawer into a full-screen overlay.

### Tasks

- [ ] **Task 2.1: Replace hardcoded colors with DaisyUI semantic tokens in Header**
  - **File:** `components/navigation/Header.svelte`
  - **TDD:** Write test asserting no hardcoded hex values (`#1D3557`, `#E63946`, `#A8DADC`, `#457B9D`) exist in the component source. Replace all instances with DaisyUI token classes (`bg-neutral`, `text-neutral-content`, `text-accent`, `border-base-300`, etc.). (AC-1.8)

- [ ] **Task 2.2: Implement scroll-aware header background transition**
  - **File:** `components/navigation/Header.svelte`
  - **TDD:** Write test that the header element has `data-scrolled="false"` at top and `data-scrolled="true"` after scroll. Implement a `$effect` with `requestAnimationFrame`-throttled scroll listener that toggles between transparent and solid `bg-neutral` backgrounds. (AC-1.1)

- [ ] **Task 2.3: Restyle logo, nav items, and dropdown menus**
  - **File:** `components/navigation/Header.svelte`
  - **TDD:** Write test: logo renders "AEVANI" in display font without emoji (AC-1.2). Nav links use body font (Inter), uppercase, `letter-spacing: 0.05em`, weight 500 (AC-1.3). Hover underline uses `scaleX` transition (AC-1.4). Dropdown items stagger-animate in (AC-1.5). Implement each.

- [ ] **Task 2.4: Add cart badge pulse and mobile header compact mode**
  - **File:** `components/navigation/Header.svelte`
  - **TDD:** Write test: cart badge has `animate-pulse` class when count changes (AC-1.6). Mobile header is 56px height with centered wordmark (AC-1.9). Implement with CSS `@media` queries.

- [ ] **Task 2.5: Implement hamburger-to-X morphing animation**
  - **File:** `components/navigation/Header.svelte`
  - **TDD:** Write test: when drawer is open, hamburger SVG lines transform to an X shape (AC-1.7). Implement with CSS transforms on the three `<path>` elements keyed to the drawer checkbox state.

- [ ] **Task 2.6: Redesign mobile drawer as full-screen overlay**
  - **File:** `routes/+layout.svelte`
  - **TDD:** Write test: drawer-side element covers full viewport (AC-2.1). Close button is top-right X (AC-2.4). Background page scales to 0.95 and blurs (AC-2.7). Implement by replacing the current 20rem sidebar with `w-screen h-screen` overlay, adding `backdrop-blur` and `scale-[0.95]` transform on `.layout-content` when drawer is checked.

- [ ] **Task 2.7: Add stagger animation and editorial typography to drawer nav items**
  - **File:** `routes/+layout.svelte`
  - **TDD:** Write test: each `.mobile-nav-link` has an incremental `transition-delay` (50ms * index) (AC-2.2). Primary items use display font at large size, sub-items use body font (AC-2.3). Implement with inline `style` for delay and font class switching.

- [ ] **Task 2.8: Add drawer SVG pattern background, social links, and newsletter**
  - **File:** `routes/+layout.svelte`
  - **TDD:** Write test: drawer container includes an SVG pattern element (AC-2.6). Drawer footer has social links and a newsletter form (AC-2.5). Implement using the pattern library from the design-system-brand track.

- [ ] **Verification:** Test header on desktop and mobile viewports. Scroll to confirm transparent-to-solid transition. Hover nav items for underline animation. Open drawer on mobile: confirm full-screen overlay, stagger animation, pattern background, scale/blur of page behind. [checkpoint marker]

---

## Phase 3: Footer Redesign (FR-3, P1)

**Goal:** Elevate the footer from a standard link grid to an editorial brand statement.

### Tasks

- [ ] **Task 3.1: Restyle footer background and brand section**
  - **File:** `routes/+layout.svelte`
  - **TDD:** Write test: footer uses `bg-neutral` with `RootSystem` SVG pattern at low opacity (AC-3.1). Wordmark "AEVANI" rendered in display font at large scale (AC-3.2). Replace emoji logo and hardcoded colors. Implement.

- [ ] **Task 3.2: Apply mono font to link columns and editorial newsletter input**
  - **File:** `routes/+layout.svelte`
  - **TDD:** Write test: footer link elements use mono font class (AC-3.3). Newsletter input uses bottom-border-only style without box/background (AC-3.4). Replace current `input-bordered` class with custom editorial treatment. Implement.

- [ ] **Task 3.3: Replace Font Awesome icons with SVG social icons and add scroll-to-top**
  - **File:** `routes/+layout.svelte`
  - **TDD:** Write test: no `<i class="fab ...">` elements exist in footer (AC-3.5). A scroll-to-top button exists in the footer bottom bar (AC-3.6). Replace Font Awesome `<i>` tags with inline SVG icons. Add a button with `window.scrollTo({ top: 0, behavior: 'smooth' })`.

- [ ] **Task 3.4: Implement mobile accordion pattern for footer columns**
  - **File:** `routes/+layout.svelte`
  - **TDD:** Write test: on viewports < 768px, footer sections collapse into accordion items (AC-3.7). Implement using the existing `Accordion` component or a lightweight inline disclosure pattern.

- [ ] **Verification:** View footer on desktop: dark background with pattern, large wordmark, mono font links, SVG icons, editorial newsletter input. On mobile: accordion columns. Test scroll-to-top button. [checkpoint marker]

---

## Phase 4: Card System (FR-5, P1)

**Goal:** Create three card variants with consistent styling and hover effects.

### Tasks

- [ ] **Task 4.1: Create ProductCard component**
  - **File:** `components/cards/ProductCard.svelte`
  - **TDD:** Write test: component renders image, title, price (in mono font), and CTA button. On hover, image scales to 1.05, shadow elevates, CTA slides up from below (AC-5.1). Props: `image`, `title`, `price`, `href`, `badge` (optional). Implement with CSS transitions on `transform` and `opacity` only (NFR-1).

- [ ] **Task 4.2: Create ContentCard component**
  - **File:** `components/cards/ContentCard.svelte`
  - **TDD:** Write test: component renders category tag (mono font), title (display font), excerpt, reading time (AC-5.2). Props: `category`, `title`, `excerpt`, `readingTime`, `image`, `href`, `date`. Implement.

- [ ] **Task 4.3: Create FeatureCard component**
  - **File:** `components/cards/FeatureCard.svelte`
  - **TDD:** Write test: component renders icon/illustration slot, title, description (AC-5.3). Props: `title`, `description`, `icon` (slot or component). Implement.

- [ ] **Task 4.4: Apply consistent card tokens (border-radius, shadows, hover borders)**
  - **Files:** `components/cards/ProductCard.svelte`, `components/cards/ContentCard.svelte`, `components/cards/FeatureCard.svelte`
  - **TDD:** Write test across all three cards: border-radius uses design token value, shadows use warm tint, border becomes more visible on hover (AC-5.4, AC-5.5). Extract shared card classes into a utility or shared style block. Refactor.

- [ ] **Task 4.5: Create cards barrel export**
  - **File:** `components/cards/index.ts`
  - **TDD:** Write import test confirming all three card components export correctly. Create barrel file.

- [ ] **Verification:** Render all three card types in a test page. Hover each to confirm image scale, shadow elevation, CTA slide-up (ProductCard), border visibility increase. Check mono/display font usage. [checkpoint marker]

---

## Phase 5: Form Field Styling (FR-6, P1)

**Goal:** Transform form inputs from boxed styling to an editorial bottom-border aesthetic.

### Tasks

- [ ] **Task 5.1: Implement bottom-border-only input style with animated focus underline**
  - **File:** `components/forms/BaseField.svelte`
  - **TDD:** Write test: text input has no visible box border (only bottom border). On focus, underline changes color with a transition (AC-6.1). Remove `border-2`, `rounded-lg`, `shadow-sm` classes. Add `border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent` treatment with focus color transition.

- [ ] **Task 5.2: Add floating label animation**
  - **File:** `components/forms/BaseField.svelte`
  - **TDD:** Write test: label starts at input baseline position and floats above on focus or when input has content (AC-6.2). Implement with CSS `transform: translateY()` and `scale()` transitions, using a `$derived` state to detect whether field is focused or has value.

- [ ] **Task 5.3: Style select dropdowns, checkboxes, and radios**
  - **File:** `components/forms/BaseField.svelte`
  - **TDD:** Write test: select has custom arrow SVG (AC-6.3). Checkbox and radio use custom SVG check marks (AC-6.4). Replace DaisyUI default checkbox/radio appearance with brand-aligned custom SVGs using `appearance: none` and background-image.

- [ ] **Task 5.4: Add error shake animation and ensure 44px touch targets**
  - **File:** `components/forms/BaseField.svelte`
  - **TDD:** Write test: when `hasError` is true, field has a CSS shake animation class (AC-6.5). All inputs have minimum 44px height on mobile (AC-6.6). Add `@keyframes shake` and apply it on error. Verify `min-h-[44px]` is set.

- [ ] **Task 5.5: Replace hardcoded colors in BaseField with semantic tokens**
  - **File:** `components/forms/BaseField.svelte`
  - **TDD:** Write test: no hardcoded hex values (`#1D3557`, `#E63946`, `#A8DADC`, `#457B9D`) in component. Replace all with DaisyUI semantic classes (`text-neutral`, `text-error`, `border-primary`, etc.).

- [ ] **Verification:** Render a form with text input, textarea, select, checkbox, radio. Focus each field to see floating label and underline animation. Submit with errors to see shake animation. Test on mobile for 44px targets. [checkpoint marker]

---

## Phase 6: New Utility Components (FR-7, P1)

**Goal:** Add Toast, Modal, Skeleton, Badge, Tooltip, and Divider components.

### Tasks

- [ ] **Task 6.1: Create toast store for programmatic triggering**
  - **File:** `stores/toast.ts`
  - **TDD:** Write test: `addToast({ message, variant, duration })` adds a toast to the store. After `duration` ms, the toast is automatically removed. Store exports `toasts` (readable), `addToast`, `removeToast`. Implement with Svelte 5 runes or a writable store.

- [ ] **Task 6.2: Create Toast component**
  - **File:** `components/ui/Toast.svelte`
  - **TDD:** Write test: component renders toasts from the store with correct variant classes (success, error, warning, info). Each toast slides in from bottom-right and has a dismiss button. Uses `role="alert"` (NFR-2). Implement. Ensure lazy-loadable (NFR-1) by not importing in layout until needed.
  - **Details:** Position fixed bottom-right. Variants use DaisyUI `alert-success`, `alert-error`, `alert-warning`, `alert-info` tokens. Auto-dismiss via store timer.

- [ ] **Task 6.3: Create Modal component with focus trap**
  - **File:** `components/ui/Modal.svelte`
  - **TDD:** Write test: Modal renders with backdrop blur. Focus is trapped inside modal (tab cycling). Escape key closes it. `aria-modal="true"`, `role="dialog"` (NFR-2). Content via `{@render children()}` snippet. Props: `open` (bindable boolean), `onClose` callback. Implement. Lazy-loadable (NFR-1).

- [ ] **Task 6.4: Create Skeleton component**
  - **File:** `components/ui/Skeleton.svelte`
  - **TDD:** Write test: component renders correct shape for each variant (`text`, `image`, `card`, `custom`). Has pulse animation class (AC-7.3). Props: `variant`, `width`, `height`, `className`. Implement with `animate-pulse` and `bg-base-300` rounded shapes.

- [ ] **Task 6.5: Create Badge component**
  - **File:** `components/ui/Badge.svelte`
  - **TDD:** Write test: component renders with color variant classes (`primary`, `secondary`, `accent`, `neutral`, `success`, `warning`, `error`, `info`) (AC-7.4). Props: `variant`, `size` (`sm` | `md`), `className`. Uses DaisyUI `badge` classes. Implement.

- [ ] **Task 6.6: Create Tooltip component**
  - **File:** `components/ui/Tooltip.svelte`
  - **TDD:** Write test: tooltip shows on hover and focus. Placement prop (`top`, `right`, `bottom`, `left`) positions correctly (AC-7.5). Has `role="tooltip"` and `aria-describedby` linkage (NFR-2). Props: `text`, `placement`, `className`. Implement with CSS positioning and Svelte 5 runes for visibility state.

- [ ] **Task 6.7: Create Divider component**
  - **File:** `components/ui/Divider.svelte`
  - **TDD:** Write test: component renders four variants: `line` (simple hr), `gradient` (gradient background), `pattern` (SVG pattern), `text` (line with centered text) (AC-7.6). Props: `variant`, `text` (for text variant), `className`. Implement.

- [ ] **Task 6.8: Update ui barrel export**
  - **File:** `components/ui/index.ts`
  - **TDD:** Write import test for all new components. Update barrel file to export Toast, Modal, Skeleton, Badge, Tooltip, Divider.

- [ ] **Verification:** Test Toast by calling `addToast` from a button click -- confirm slide-in, auto-dismiss, variant styling. Open Modal -- confirm backdrop blur, focus trap, escape-to-close. Render Skeleton in all variants. Render Badge with all color variants. Hover/focus a Tooltip-wrapped element in all four placements. Render Divider in all variants. [checkpoint marker]

---

## Phase 7: Component Polish and Storybook (FR-8, P2 + NFR cleanup)

**Goal:** Update remaining components (Breadcrumbs, CategoryNav, Accordion, Carousel) with design tokens and micro-interactions. Create Storybook stories for all components.

### Tasks

- [ ] **Task 7.1: Restyle Breadcrumbs with design tokens**
  - **File:** `components/navigation/Breadcrumbs.svelte`
  - **TDD:** Write test: no hardcoded hex colors. Uses mono font for breadcrumb text. Separator uses neutral color token. Implement token replacements.

- [ ] **Task 7.2: Restyle CategoryNav with editorial card treatment**
  - **File:** `components/navigation/CategoryNav.svelte`
  - **TDD:** Write test: cards use consistent border-radius from design tokens. Hover shows shadow elevation and border visibility increase (consistent with Phase 4 card behavior). Replace hardcoded colors with semantic tokens.

- [ ] **Task 7.3: Restyle Accordion with editorial styling**
  - **File:** `components/ui/Accordion.svelte`
  - **TDD:** Write test: accordion uses design token colors. Arrow rotation is smooth. Focus ring uses accent color. Implement token and transition updates.

- [ ] **Task 7.4: Restyle Carousel controls with editorial treatment**
  - **File:** `components/ui/Carousel.svelte`
  - **TDD:** Write test: arrow buttons use new Button component styling or consistent hover treatment. Dot indicators use design token colors. Replace inline `bg-black/20` with semantic token approach.

- [ ] **Task 7.5: Create Storybook stories for Button, Cards, and Form Fields**
  - **Files:** `stories/Button.stories.ts`, `stories/ProductCard.stories.ts`, `stories/ContentCard.stories.ts`, `stories/FeatureCard.stories.ts`, `stories/BaseField.stories.ts`
  - **TDD:** Write stories demonstrating all variants, sizes, states (hover, focus, loading, disabled, error). Verify stories render without errors (AC-8.1, AC-8.2).

- [ ] **Task 7.6: Create Storybook stories for utility components**
  - **Files:** `stories/Toast.stories.ts`, `stories/Modal.stories.ts`, `stories/Skeleton.stories.ts`, `stories/Badge.stories.ts`, `stories/Tooltip.stories.ts`, `stories/Divider.stories.ts`
  - **TDD:** Write stories for all variants and states. Verify interactive behavior in Storybook.

- [ ] **Task 7.7: Create Storybook stories for navigation components**
  - **Files:** `stories/Header.stories.ts`, `stories/Breadcrumbs.stories.ts`, `stories/CategoryNav.stories.ts`, `stories/Accordion.stories.ts`, `stories/Carousel.stories.ts`
  - **TDD:** Write stories demonstrating responsive behavior and all variants.

- [ ] **Task 7.8: Create Design System documentation section in Storybook**
  - **File:** `stories/DesignSystem.mdx`
  - **TDD:** Write documentation covering colors, typography (display/body/mono), spacing tokens, and SVG patterns (AC-8.3). Verify it renders in Storybook.

- [ ] **Verification:** Run Storybook. Navigate every story. Confirm all variants render correctly. Confirm the Design System section documents tokens. Run accessibility checks in Storybook if addon is available. [checkpoint marker]

---

## File Summary

### New Files (14)
| File | Phase | FR |
|------|-------|----|
| `components/ui/Button.svelte` | 1 | FR-4 |
| `components/cards/ProductCard.svelte` | 4 | FR-5 |
| `components/cards/ContentCard.svelte` | 4 | FR-5 |
| `components/cards/FeatureCard.svelte` | 4 | FR-5 |
| `components/cards/index.ts` | 4 | FR-5 |
| `stores/toast.ts` | 6 | FR-7 |
| `components/ui/Toast.svelte` | 6 | FR-7 |
| `components/ui/Modal.svelte` | 6 | FR-7 |
| `components/ui/Skeleton.svelte` | 6 | FR-7 |
| `components/ui/Badge.svelte` | 6 | FR-7 |
| `components/ui/Tooltip.svelte` | 6 | FR-7 |
| `components/ui/Divider.svelte` | 6 | FR-7 |
| `components/ui/index.ts` | 1, 6 | FR-4, FR-7 |
| `stories/DesignSystem.mdx` | 7 | FR-8 |

### Modified Files (8)
| File | Phase | FR |
|------|-------|----|
| `components/navigation/Header.svelte` | 2 | FR-1 |
| `routes/+layout.svelte` | 2, 3 | FR-2, FR-3 |
| `components/forms/BaseField.svelte` | 5 | FR-6 |
| `components/navigation/Breadcrumbs.svelte` | 7 | -- |
| `components/navigation/CategoryNav.svelte` | 7 | -- |
| `components/ui/Accordion.svelte` | 7 | -- |
| `components/ui/Carousel.svelte` | 7 | -- |
| `stories/*.stories.ts` (multiple) | 7 | FR-8 |

### Key Constraints
- All file paths are relative to `plantapp/src/lib/`
- All animations must use `transform` and `opacity` only (NFR-1)
- No single component import > 5KB gzipped (NFR-1)
- Toast and Modal are lazy-loaded (NFR-1)
- All interactive elements need ARIA attributes and keyboard navigation (NFR-2)
- Mobile-first design with 44px minimum touch targets (NFR-3)
- Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`) -- no legacy `export let` or `$:` syntax
- DaisyUI v5 semantic token classes -- no hardcoded hex colors
- Tailwind CSS v4 utility classes
