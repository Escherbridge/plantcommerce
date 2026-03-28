# Specification: Design System & Brand Evolution

## Overview

Evolve the Aevani brand identity and design system from its current generic DaisyUI/Tailwind setup into a distinctive, editorial-grade visual language. Inspired by THE LOOKBACK (monospace typography, extreme whitespace, text-reveal animations), Readymag (bold editorial grids, vibrant accent colors, Graphik-style typography), and Chrome Industries (dark utilitarian headers, uppercase boldness, ZoomPro compressed fonts), this track establishes the design tokens, custom DaisyUI theme, typography system, color palette, and SVG pattern library that all subsequent UI tracks depend on.

## Background

### Current State
- **Typography**: Uses "Liter" as the only font family via `--font-body` and Tailwind's `fontFamily.sans`. Brand guide recommends Inter but it was never implemented. No display/heading font for impact.
- **Colors**: Brand guide defines Deep Blue `#1D3557`, Light Cream `#F1FAEE`, Muted Blue `#457B9D`, Light Blue-Green `#A8DADC`, Bold Red `#E63946`. These are hardcoded throughout components (footer, header) rather than using DaisyUI semantic tokens.
- **DaisyUI**: Config enables all 26 built-in themes but no custom "aevani" theme exists. Components use generic DaisyUI classes (`btn-primary`, `bg-base-100`) that resolve to the default "light" theme.
- **No design tokens**: No CSS custom properties for spacing scale, border-radius, shadows, or animation timing.
- **No SVG patterns**: One inline base64 grid pattern used in diversity section and newsletter. No pattern library.
- **Storybook**: Exists at `plantapp/.storybook/` with example stories but no design token documentation.

### Design Reference Analysis

**THE LOOKBACK (tlb.betteroff.studio)**:
- Monospace/sans-serif typographic duo (navigation in mono, content in clean sans)
- Text-scramble loading animations that progressively reveal content
- Extreme whitespace with right-aligned timeline sidebar navigation
- Colors: white bg, black text, teal `rgb(30,136,162)`, gold `rgb(204,150,8)`, red `rgb(243,25,33)`
- Category labels in uppercase: ARTICLES, PODCAST, INSPIRATION, MUSIC

**Readymag (readymag.com)**:
- Graphik as primary typeface, Times New Roman for editorial contrast
- Masonry/mosaic grid with varying card sizes
- Bold orange `rgb(236,82,11)` accent, deep green `rgb(0,54,43)`, amber `rgb(255,162,0)`
- Rounded pill-shaped navigation buttons
- Feature sections with bold amber/orange panels

**Chrome Industries (chromeindustries.com)**:
- ZoomPro (compressed), Moderat, Archivo font stack - industrial feel
- Dark charcoal header with scrolling marquee announcement bar
- Uppercase bold navigation with generous letter-spacing
- Clean white product backgrounds with lifestyle photography
- Black/white foundation with yellow `rgb(255,234,59)` and red `rgb(238,75,43)` accents

### Design Direction for Aevani

Merge the editorial sophistication of TLB, the bold energy of Readymag, and the utilitarian e-commerce clarity of Chrome Industries into an identity that feels:
- **Rooted yet Modern**: Earthy palette elevated with editorial typography
- **Bold yet Organic**: Uppercase impact paired with flowing organic SVG patterns
- **Editorial yet Shoppable**: Magazine-grade layouts that still convert

## Functional Requirements

### FR-1: Custom "Aevani" DaisyUI Theme
**Description:** Create a custom DaisyUI theme with the evolved Aevani color palette as semantic tokens, replacing all hardcoded hex values throughout the codebase.
**Priority:** P0
**Acceptance Criteria:**
- AC-1.1: A custom `aevani` theme is defined in `tailwind.config.js` under `daisyui.themes` with proper `primary`, `secondary`, `accent`, `neutral`, `base-100/200/300`, `info`, `success`, `warning`, `error` color mappings.
- AC-1.2: An `aevani-dark` theme variant exists for dark mode.
- AC-1.3: The `aevani` theme is set as the default (`data-theme="aevani"` on `<html>`).
- AC-1.4: All hardcoded hex values in `+layout.svelte`, `Header.svelte`, `app.css`, and other components are replaced with DaisyUI semantic classes.

### FR-2: Evolved Color Palette
**Description:** Evolve the brand palette to incorporate reference site inspiration while maintaining Aevani's earthy identity.
**Priority:** P0
**Acceptance Criteria:**
- AC-2.1: Primary palette evolves Deep Blue `#1D3557` to a richer, slightly warmer deep navy.
- AC-2.2: A new "growth green" accent is introduced (inspired by Chrome Industries' deep teal `rgb(0,75,64)` merged with Aevani's sustainability theme).
- AC-2.3: Bold Red `#E63946` is retained as the action/CTA accent.
- AC-2.4: A warm cream/off-white `#F7F5F0` replaces the stark `#F1FAEE` for backgrounds (warmer, more editorial feel inspired by TLB's warm whites).
- AC-2.5: Neutral scale includes a charcoal `#1A1A1A` for dark sections (Chrome Industries-inspired) and a warm gray `#6B7064` for muted text.
- AC-2.6: All colors pass WCAG AA contrast ratios when used in their intended text/background combinations.

### FR-3: Typography System
**Description:** Implement a three-tier typography system with display, body, and mono fonts.
**Priority:** P0
**Acceptance Criteria:**
- AC-3.1: **Display font**: A bold condensed/compressed sans-serif (e.g., "Barlow Condensed" or "Oswald") for hero headings, section titles, and CTAs. This gives the uppercase impact of Chrome Industries' ZoomPro/Archivo.
- AC-3.2: **Body font**: "Inter" (as specified in brand guide) replaces "Liter" for body text, UI elements, navigation, and product descriptions. Available in weights 400, 500, 600, 700, 900.
- AC-3.3: **Mono font**: "JetBrains Mono" or "Space Mono" for decorative/editorial accents (category labels, timestamps, product codes) inspired by TLB's monospace aesthetic.
- AC-3.4: All three fonts are loaded via `@fontsource` packages (already in project pattern).
- AC-3.5: Tailwind `fontFamily` config updated with `font-display`, `font-body`, `font-mono` utilities.
- AC-3.6: A responsive type scale is defined using CSS clamp() for fluid typography (e.g., hero headings scale from `2.5rem` at 320px to `8rem` at 1440px).

### FR-4: Design Tokens as CSS Custom Properties
**Description:** Define a comprehensive set of CSS custom properties for spacing, border-radius, shadows, and animation timings.
**Priority:** P1
**Acceptance Criteria:**
- AC-4.1: Spacing tokens: `--space-xs` through `--space-3xl` defined on `:root`.
- AC-4.2: Border-radius tokens: `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (16px), `--radius-xl` (24px), `--radius-full`.
- AC-4.3: Shadow tokens: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` with warm-tinted shadows (not pure black).
- AC-4.4: Animation timing tokens: `--ease-out-expo`, `--ease-in-out-cubic`, `--duration-fast` (150ms), `--duration-normal` (300ms), `--duration-slow` (600ms), `--duration-reveal` (1200ms).
- AC-4.5: All tokens are documented in a Storybook "Design Tokens" story page.

### FR-5: SVG Pattern Library
**Description:** Create a library of evocative SVG background patterns inspired by polyculture, mycelium networks, and organic growth. These replace the single generic grid pattern currently used.
**Priority:** P1
**Acceptance Criteria:**
- AC-5.1: At minimum 6 SVG patterns created as Svelte components in `$lib/components/patterns/`:
  - `MyceliumNetwork.svelte` — branching organic network lines (inspired by Brand Assets "Mycelium Network" image)
  - `PolycultureGrid.svelte` — irregular organic grid suggesting biodiversity
  - `RootSystem.svelte` — downward-branching root pattern for footer/bottom sections
  - `LeafVenation.svelte` — leaf vein pattern for overlays
  - `WaterRipple.svelte` — concentric organic ripples (inspired by "Water & Growth" asset)
  - `GrowthSpiral.svelte` — golden ratio spiral/fibonacci growth pattern
- AC-5.2: Each pattern accepts props for `color`, `opacity`, `scale`, and `animate` (boolean for subtle CSS animation).
- AC-5.3: Patterns render as inline SVGs (not base64) for better performance and theming.
- AC-5.4: A `PatternBackground.svelte` wrapper component applies any pattern as a section background with configurable blend mode and opacity.

### FR-6: Brand Documentation Update
**Description:** Update the brand documentation files to reflect the evolved design system.
**Priority:** P1
**Acceptance Criteria:**
- AC-6.1: `market_research/branding/BRAND_GUIDE.md` is updated with the new color palette, typography system, and design token documentation.
- AC-6.2: `market_research/branding/BRAND_EXPLORATION.md` is updated with a new "Visual Evolution" section documenting the design references and rationale.
- AC-6.3: A new `market_research/branding/DESIGN_SYSTEM.md` file documents the complete token system, component patterns, and usage guidelines.

## Non-Functional Requirements

### NFR-1: Performance
- Font loading uses `font-display: swap` with proper preload hints.
- SVG patterns are lightweight (<2KB each uncompressed).
- No layout shift from font loading (proper fallback font metrics).

### NFR-2: Accessibility
- All color combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text).
- Font sizes never go below 16px for body text on mobile.
- SVG patterns include `aria-hidden="true"` as they are decorative.

### NFR-3: Mobile-First
- All tokens and scales are designed mobile-first with responsive overrides.
- Typography scale uses `clamp()` for fluid sizing.

## Dependencies
- None (this is the foundation track).

## Files to Create/Modify
- `plantapp/tailwind.config.js` — Custom theme, font families
- `plantapp/src/app.css` — CSS custom properties, font imports
- `plantapp/src/lib/components/patterns/*.svelte` — SVG pattern library (6+ components)
- `plantapp/src/lib/components/patterns/PatternBackground.svelte` — Pattern wrapper
- `plantapp/src/routes/+layout.svelte` — Replace hardcoded colors
- `plantapp/src/lib/components/navigation/Header.svelte` — Replace hardcoded colors
- `market_research/branding/BRAND_GUIDE.md` — Updated brand docs
- `market_research/branding/BRAND_EXPLORATION.md` — Updated with visual evolution
- `market_research/branding/DESIGN_SYSTEM.md` — New design system docs
