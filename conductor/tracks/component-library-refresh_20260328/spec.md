# Specification: Component Library Refresh

## Overview

Restyle and enhance the entire Aevani UI component library to align with the new design system established in the design-system-brand track. Every component — from navigation and layout primitives to forms, cards, and media — gets a visual refresh that brings editorial sophistication, micro-interactions, and the new typography/color tokens to life. Components gain new animation capabilities, refined responsive behavior, and consistent use of design tokens.

## Background

### Current State
- **Header** (`navigation/Header.svelte`): Functional sticky header with desktop nav, dropdown menus, cart, and user profile. Uses hardcoded colors (`#1D3557`, `#E63946`, `#A8DADC`). No animation on nav items. Logo is emoji 🌱 + text.
- **Breadcrumbs** (`navigation/Breadcrumbs.svelte`): Accessible with 4 separator variants. Basic styling.
- **CategoryNav** (`navigation/CategoryNav.svelte`): Card-based category navigation. Standard DaisyUI card styling.
- **Layout primitives** (Container, Flex, Grid, GridItem, Section): Functional wrappers with configurable props. No visual styling beyond Tailwind utilities.
- **Accordion** (`ui/Accordion.svelte`): Accessible with 3 variants. Basic DaisyUI styling.
- **Carousel** (`ui/Carousel.svelte`): Image slider with touch/swipe. Basic controls.
- **Forms** (BaseField, BaseForm, MultiStepForm, DatePicker, FileUpload, RichTextEditor): Comprehensive form system. Uses `@tailwindcss/forms` plugin. Standard input styling.
- **Images** (OptimizedImage, ImageGallery): Performance-optimized. Basic visual treatment.
- **No loading states, no skeleton screens, no toast/notification system, no modal component**.

### Design Direction
- Header becomes a dark editorial bar (Chrome Industries-inspired) with logo wordmark
- All interactive elements gain refined hover/focus micro-interactions
- Form fields get custom editorial styling (bottom-border-only inputs, animated labels)
- New components: Toast, Modal, Skeleton, Badge, Tag, Tooltip
- Consistent use of design tokens throughout

## Dependencies
- **design-system-brand_20260328** must be complete: provides theme, tokens, typography, SVG patterns.

## Functional Requirements

### FR-1: Header Redesign
**Description:** Transform the header into a dark, editorial navigation bar with refined interactions.
**Priority:** P0
**Acceptance Criteria:**
- AC-1.1: Header background transitions from transparent (over hero) to solid dark (`neutral` color) on scroll, using a scroll listener with `requestAnimationFrame`.
- AC-1.2: Logo uses the display font wordmark "AEVANI" instead of emoji + text.
- AC-1.3: Navigation items use the body font (Inter) in uppercase with letter-spacing, weight 500.
- AC-1.4: On hover, nav items have an animated underline that slides in from left (CSS `transform: scaleX()` transition).
- AC-1.5: Dropdown menus have a refined appearance: subtle shadow, rounded corners, stagger-animated menu items.
- AC-1.6: Cart icon shows item count with a badge that pulses on update.
- AC-1.7: Mobile hamburger menu animation: three lines morph to X on open.
- AC-1.8: All hardcoded hex colors replaced with DaisyUI semantic tokens.
- AC-1.9: On mobile, the header is compact (56px height) with centered wordmark logo.

### FR-2: Mobile Drawer Redesign
**Description:** Transform the mobile drawer from a basic sidebar into an immersive full-screen overlay.
**Priority:** P0
**Acceptance Criteria:**
- AC-2.1: Mobile drawer opens as a full-screen overlay (not a narrow sidebar) with a dark background.
- AC-2.2: Navigation items animate in with a stagger effect (each item slides in from the right with 50ms delay).
- AC-2.3: Navigation uses the display font at large size for primary items, body font for sub-items.
- AC-2.4: Close button is a prominent X in the top-right corner.
- AC-2.5: Drawer includes social links and a mini newsletter signup at the bottom.
- AC-2.6: Background of drawer uses a subtle SVG pattern from the pattern library.
- AC-2.7: Page behind the drawer scales down slightly (0.95) and blurs for a depth effect.

### FR-3: Footer Redesign
**Description:** Elevate the footer from a standard link grid to an editorial-grade brand statement.
**Priority:** P1
**Acceptance Criteria:**
- AC-3.1: Footer has a dark background (`neutral`) with the `RootSystem` SVG pattern at low opacity.
- AC-3.2: "AEVANI" wordmark in display font at large scale as the footer header element.
- AC-3.3: Link columns use the mono font for a data/directory aesthetic.
- AC-3.4: Newsletter input is styled with the editorial input treatment (bottom-border, no box).
- AC-3.5: Social links are SVG icons (not Font Awesome `<i>` tags) — custom-designed or from a lightweight icon set.
- AC-3.6: Footer bottom bar includes a subtle scroll-to-top button.
- AC-3.7: On mobile, footer columns collapse into an accordion pattern.

### FR-4: Button System
**Description:** Establish a refined button system with consistent micro-interactions.
**Priority:** P0
**Acceptance Criteria:**
- AC-4.1: Primary buttons: solid fill with slight scale-up on hover (1.02) and a subtle shadow lift.
- AC-4.2: Secondary/outline buttons: border with fill animation on hover (background fills from left).
- AC-4.3: Ghost buttons: text-only with animated underline on hover.
- AC-4.4: All buttons use the body font (Inter) at weight 600, uppercase, with `0.05em` letter-spacing.
- AC-4.5: Loading state: button text is replaced with a minimal spinner.
- AC-4.6: Focus states use a visible ring with the accent color (not the default browser outline).
- AC-4.7: A `Button.svelte` component encapsulates all variants and is used consistently across the app.

### FR-5: Card System
**Description:** Create a unified card component system with consistent styling and hover effects.
**Priority:** P1
**Acceptance Criteria:**
- AC-5.1: `ProductCard.svelte` — Dedicated product card with image, title, price (mono font), and CTA. Hover: image scale 1.05, shadow elevation, CTA slide-up.
- AC-5.2: `ContentCard.svelte` — For blog posts and guides. Editorial layout with category tag (mono font), title (display font), excerpt, and reading time.
- AC-5.3: `FeatureCard.svelte` — For value propositions and features. Supports icon/illustration, title, and description.
- AC-5.4: All cards use consistent border-radius from design tokens and warm-tinted shadows.
- AC-5.5: All cards have a subtle border that becomes more visible on hover.

### FR-6: Form Field Styling
**Description:** Restyle form inputs with an editorial, minimal aesthetic.
**Priority:** P1
**Acceptance Criteria:**
- AC-6.1: Text inputs use a bottom-border-only style (no box) with an animated underline that changes color on focus.
- AC-6.2: Labels float above the input with an animation when the field is focused or has content (floating labels).
- AC-6.3: Select dropdowns have custom arrow styling.
- AC-6.4: Checkbox and radio inputs use custom SVG check marks aligned with the brand.
- AC-6.5: Error states use the accent red with a subtle shake animation.
- AC-6.6: All form fields meet 44px minimum touch target height on mobile.

### FR-7: New Utility Components
**Description:** Add missing UI primitives that are needed across the site.
**Priority:** P1
**Acceptance Criteria:**
- AC-7.1: `Toast.svelte` — Notification toast with variants (success, error, warning, info). Slides in from bottom-right, auto-dismisses after configurable duration. Uses a toast store for programmatic triggering.
- AC-7.2: `Modal.svelte` — Accessible modal/dialog with backdrop blur, focus trap, and escape-to-close. Content slot-based.
- AC-7.3: `Skeleton.svelte` — Skeleton loading placeholder with pulse animation. Supports `text`, `image`, `card`, and `custom` shape variants.
- AC-7.4: `Badge.svelte` — Small label/tag component with color variants. Used for product tags, category labels, status indicators.
- AC-7.5: `Tooltip.svelte` — Accessible tooltip on hover/focus with configurable placement (top, right, bottom, left).
- AC-7.6: `Divider.svelte` — Section divider with variants: line, gradient, SVG pattern, text-in-line.

### FR-8: Storybook Updates
**Description:** Update Storybook stories to showcase all refreshed components.
**Priority:** P2
**Acceptance Criteria:**
- AC-8.1: Every new and modified component has at least one Storybook story.
- AC-8.2: Stories demonstrate all variants, states, and responsive behavior.
- AC-8.3: A "Design System" section in Storybook documents colors, typography, spacing, and patterns.

## Non-Functional Requirements

### NFR-1: Performance
- All micro-interactions use `transform` and `opacity` only.
- No component imports >5KB gzipped individually.
- Lazy-load Toast and Modal (only loaded when first triggered).

### NFR-2: Accessibility
- All interactive components have proper ARIA attributes.
- Focus management in Modal (trap + restore).
- Toast notifications use `role="alert"` for screen reader announcements.
- All color contrast ratios meet WCAG AA.
- Keyboard navigation works for all components.

### NFR-3: Mobile-First
- All components are designed mobile-first.
- Touch targets minimum 44px.
- Hover effects have touch-device alternatives (no hover dependency for critical actions).

## Files to Create/Modify

### New Components
- `plantapp/src/lib/components/ui/Button.svelte`
- `plantapp/src/lib/components/ui/Toast.svelte`
- `plantapp/src/lib/components/ui/Modal.svelte`
- `plantapp/src/lib/components/ui/Skeleton.svelte`
- `plantapp/src/lib/components/ui/Badge.svelte`
- `plantapp/src/lib/components/ui/Tooltip.svelte`
- `plantapp/src/lib/components/ui/Divider.svelte`
- `plantapp/src/lib/components/cards/ProductCard.svelte`
- `plantapp/src/lib/components/cards/ContentCard.svelte`
- `plantapp/src/lib/components/cards/FeatureCard.svelte`

### Modified Components
- `plantapp/src/lib/components/navigation/Header.svelte`
- `plantapp/src/lib/components/navigation/Breadcrumbs.svelte`
- `plantapp/src/lib/components/navigation/CategoryNav.svelte`
- `plantapp/src/lib/components/ui/Accordion.svelte`
- `plantapp/src/lib/components/ui/Carousel.svelte`
- `plantapp/src/lib/components/forms/BaseField.svelte`
- `plantapp/src/lib/components/forms/BaseForm.svelte`
- `plantapp/src/routes/+layout.svelte` (header, footer, drawer)

### Storybook
- `plantapp/src/stories/` — Updated and new stories for all components
