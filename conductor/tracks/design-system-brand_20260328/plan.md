# Implementation Plan: Design System & Brand Evolution

## Overview

This plan transforms Aevani from a generic DaisyUI setup with hardcoded hex colors into a distinctive, editorial-grade design system. Work is divided into 6 phases, ordered by dependency: tokens and theme first, then typography, then SVG patterns, then component migration, then documentation. Each phase follows a TDD-inspired cycle where validation criteria are defined before implementation.

**Estimated total effort:** 16-24 hours across 6 phases.

---

## Phase 1: Color Palette & DaisyUI Theme

**Goal:** Define the evolved Aevani color palette and wire it into DaisyUI as custom `aevani` and `aevani-dark` themes, replacing the 26 built-in theme list.

### Tasks

- [ ] **Task 1.1: Define color palette constants**
  Create a reference file with the evolved palette values and WCAG contrast ratios.
  - File: `plantapp/src/lib/styles/colors.ts`
  - Export an object with all palette colors (primary deep navy, growth green, bold red, warm cream, charcoal, warm gray, plus semantic mappings).
  - Include comments documenting each color's origin (brand guide original vs. evolved value) and intended use.
  - TDD: Write a test that imports the palette and validates all text/background combinations meet WCAG AA contrast ratios (4.5:1 normal text, 3:1 large text). Use a contrast-ratio calculation utility.
  - Test file: `plantapp/src/lib/styles/colors.test.ts`

- [ ] **Task 1.2: Create custom `aevani` DaisyUI theme**
  - File: `plantapp/tailwind.config.js`
  - Replace the 26 built-in themes array with a single custom theme object under `daisyui.themes`.
  - Map palette to DaisyUI semantic slots: `primary` (deep navy), `secondary` (muted blue), `accent` (bold red), `neutral` (charcoal), `base-100` (warm cream `#F7F5F0`), `base-200`, `base-300`, `info` (growth green), `success`, `warning`, `error`.
  - Set `--rounded-btn`, `--rounded-box`, `--animation-btn` theme variables.
  - TDD: After saving, run `npx tailwindcss --content ./src/**/*.svelte --output /dev/null` to verify config parses without errors.

- [ ] **Task 1.3: Create `aevani-dark` theme variant**
  - File: `plantapp/tailwind.config.js` (same file, second theme entry)
  - Define dark mode variant: swap base-100 to charcoal `#1A1A1A`, base-200/300 to darker grays, primary/accent colors adjusted for dark backgrounds.
  - Set `daisyui.darkTheme: "aevani-dark"`.

- [ ] **Task 1.4: Set default theme on HTML element**
  - File: `plantapp/src/app.html`
  - Add `data-theme="aevani"` to the `<html>` tag.
  - Verify the theme applies by checking that `bg-base-100` resolves to warm cream in browser dev tools.

- [ ] **Verification: Phase 1** [checkpoint marker]
  - Run the contrast ratio tests from Task 1.1.
  - Open the app in a browser and confirm `bg-base-100` is warm cream, `text-primary` is deep navy, `btn-accent` is bold red.
  - Toggle to `aevani-dark` via dev tools and confirm dark mode colors render correctly.

---

## Phase 2: Typography System

**Goal:** Implement the three-tier font stack (display, body, mono) with fluid responsive scaling via `clamp()`.

### Tasks

- [ ] **Task 2.1: Install font packages**
  - Run: `cd plantapp && npm install @fontsource-variable/inter @fontsource/barlow-condensed @fontsource/jetbrains-mono`
  - Barlow Condensed for display (bold condensed impact, similar to Chrome Industries' ZoomPro).
  - Inter Variable for body (brand guide recommendation, replaces Liter).
  - JetBrains Mono for editorial/decorative mono accents (TLB-inspired).

- [ ] **Task 2.2: Configure font imports and CSS custom properties**
  - File: `plantapp/src/app.css`
  - Replace `@import '@fontsource/fira-mono'` with the three new font imports.
  - Update `:root` CSS custom properties:
    - `--font-display: 'Barlow Condensed', 'Arial Narrow', sans-serif`
    - `--font-body: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    - `--font-mono: 'JetBrains Mono', 'Fira Mono', monospace`
  - Set `font-display: swap` on each `@font-face` declaration.
  - Remove the `Liter`-specific `.liter-regular` utility class.

- [ ] **Task 2.3: Update Tailwind font family config**
  - File: `plantapp/tailwind.config.js`
  - Update `theme.extend.fontFamily`:
    - `display: ['Barlow Condensed', 'Arial Narrow', 'sans-serif']`
    - `sans: ['Inter Variable', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']`
    - `mono: ['JetBrains Mono', 'Fira Mono', 'monospace']`
  - Remove old `liter` and `sans` (Liter) entries.

- [ ] **Task 2.4: Define fluid type scale**
  - File: `plantapp/src/app.css`
  - Add CSS custom properties for the type scale using `clamp()`:
    - `--text-hero: clamp(2.5rem, 5vw + 1rem, 8rem)` (FR-3 AC-3.6)
    - `--text-display: clamp(2rem, 3vw + 1rem, 5rem)`
    - `--text-h1: clamp(1.75rem, 2.5vw + 0.5rem, 3.5rem)`
    - `--text-h2: clamp(1.5rem, 2vw + 0.5rem, 2.5rem)`
    - `--text-h3: clamp(1.25rem, 1.5vw + 0.5rem, 1.75rem)`
    - `--text-body: clamp(1rem, 0.5vw + 0.875rem, 1.125rem)`
    - `--text-sm: clamp(0.875rem, 0.25vw + 0.8rem, 0.9375rem)`
    - `--text-xs: 0.75rem`
  - Add corresponding utility classes (`.text-hero`, `.text-display`, etc.) that combine the size with the appropriate font family (display font for hero/display/h1, body font for body/sm/xs).

- [ ] **Task 2.5: Update body font-family on `<body>`**
  - File: `plantapp/src/app.css`
  - Ensure `body { font-family: var(--font-body); }` uses the new Inter-based variable.
  - Ensure `pre, code { font-family: var(--font-mono); }`.

- [ ] **Verification: Phase 2** [checkpoint marker]
  - Open the app and inspect computed font-family on body text (should be Inter).
  - Add a temporary `<h1 class="font-display text-hero uppercase">TEST</h1>` to a page and confirm Barlow Condensed renders at fluid size.
  - Add a temporary `<code class="font-mono">CODE</code>` and confirm JetBrains Mono renders.
  - Resize the browser from 320px to 1440px and confirm hero text scales fluidly.
  - Check Network tab: fonts load with `font-display: swap`, no FOIT.

---

## Phase 3: Design Tokens (CSS Custom Properties)

**Goal:** Establish a comprehensive token system for spacing, radii, shadows, and animation timings.

### Tasks

- [ ] **Task 3.1: Define spacing tokens**
  - File: `plantapp/src/app.css` (`:root` block)
  - Add spacing scale:
    - `--space-xs: 0.25rem` (4px)
    - `--space-sm: 0.5rem` (8px)
    - `--space-md: 1rem` (16px)
    - `--space-lg: 1.5rem` (24px)
    - `--space-xl: 2rem` (32px)
    - `--space-2xl: 3rem` (48px)
    - `--space-3xl: 4rem` (64px)

- [ ] **Task 3.2: Define border-radius tokens**
  - File: `plantapp/src/app.css` (`:root` block)
  - Add:
    - `--radius-sm: 4px`
    - `--radius-md: 8px`
    - `--radius-lg: 16px`
    - `--radius-xl: 24px`
    - `--radius-full: 9999px`

- [ ] **Task 3.3: Define shadow tokens**
  - File: `plantapp/src/app.css` (`:root` block)
  - Warm-tinted shadows (not pure black, using `rgba(29, 53, 87, ...)` based on primary):
    - `--shadow-sm: 0 1px 2px rgba(29, 53, 87, 0.05)`
    - `--shadow-md: 0 4px 6px -1px rgba(29, 53, 87, 0.07), 0 2px 4px -1px rgba(29, 53, 87, 0.04)`
    - `--shadow-lg: 0 10px 15px -3px rgba(29, 53, 87, 0.08), 0 4px 6px -2px rgba(29, 53, 87, 0.04)`
    - `--shadow-xl: 0 20px 25px -5px rgba(29, 53, 87, 0.1), 0 10px 10px -5px rgba(29, 53, 87, 0.03)`

- [ ] **Task 3.4: Define animation timing tokens**
  - File: `plantapp/src/app.css` (`:root` block)
  - Add:
    - `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`
    - `--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1)`
    - `--duration-fast: 150ms`
    - `--duration-normal: 300ms`
    - `--duration-slow: 600ms`
    - `--duration-reveal: 1200ms`

- [ ] **Task 3.5: Create Storybook design tokens documentation page**
  - File: `plantapp/src/stories/DesignTokens.stories.ts`
  - File: `plantapp/src/stories/DesignTokens.svelte` (companion component)
  - Create a Storybook page that visually renders all tokens: color swatches, typography samples, spacing scale visualization, shadow samples, radius samples, and animation timing demos.
  - Group into sections: Colors, Typography, Spacing, Shadows, Radii, Animations.

- [ ] **Verification: Phase 3** [checkpoint marker]
  - Run Storybook (`npm run storybook`) and confirm the Design Tokens page renders all token categories.
  - Inspect `:root` in browser dev tools and confirm all custom properties are present.
  - Test that `var(--shadow-md)` and `var(--radius-lg)` work when applied inline to a test element.

---

## Phase 4: SVG Pattern Library

**Goal:** Create 6 organic SVG pattern components and a `PatternBackground` wrapper.

### Tasks

- [ ] **Task 4.1: Create `PatternBackground.svelte` wrapper**
  - File: `plantapp/src/lib/components/patterns/PatternBackground.svelte`
  - Props (Svelte 5 runes): `pattern` (snippet or component), `color` (string, default `'currentColor'`), `opacity` (number, default `0.1`), `blendMode` (string, default `'multiply'`), `animate` (boolean, default `false`), `class` (string).
  - Renders a `<div>` with `position: relative` that wraps children, with the SVG pattern as an absolutely-positioned background layer.
  - Add `aria-hidden="true"` to the pattern container (NFR-2).
  - TDD: Write a component test verifying `aria-hidden` is present, opacity prop applies, and children render.
  - Test file: `plantapp/src/lib/components/patterns/PatternBackground.test.ts`

- [ ] **Task 4.2: Create `MyceliumNetwork.svelte` pattern**
  - File: `plantapp/src/lib/components/patterns/MyceliumNetwork.svelte`
  - Props: `color` (default `'currentColor'`), `opacity` (default `1`), `scale` (default `1`), `animate` (boolean, default `false`).
  - Render inline `<svg>` with branching organic network lines using `<path>` elements with cubic bezier curves.
  - When `animate` is true, apply a subtle CSS animation (slow drift/pulse, using `--duration-reveal`).
  - SVG must be under 2KB uncompressed (NFR-1).
  - TDD: Component test verifying SVG renders, props apply, and `aria-hidden` is on the SVG.
  - Test file: `plantapp/src/lib/components/patterns/MyceliumNetwork.test.ts`

- [ ] **Task 4.3: Create `PolycultureGrid.svelte` pattern**
  - File: `plantapp/src/lib/components/patterns/PolycultureGrid.svelte`
  - Irregular organic grid with varied cell sizes suggesting biodiversity.
  - Same props interface as Task 4.2.
  - TDD: Component test for render and props.
  - Test file: `plantapp/src/lib/components/patterns/PolycultureGrid.test.ts`

- [ ] **Task 4.4: Create `RootSystem.svelte` pattern**
  - File: `plantapp/src/lib/components/patterns/RootSystem.svelte`
  - Downward-branching root pattern, suitable for footer/bottom sections.
  - Same props interface.
  - TDD: Component test.
  - Test file: `plantapp/src/lib/components/patterns/RootSystem.test.ts`

- [ ] **Task 4.5: Create `LeafVenation.svelte` pattern**
  - File: `plantapp/src/lib/components/patterns/LeafVenation.svelte`
  - Leaf vein pattern with a central midrib and branching secondary veins.
  - Same props interface.
  - TDD: Component test.
  - Test file: `plantapp/src/lib/components/patterns/LeafVenation.test.ts`

- [ ] **Task 4.6: Create `WaterRipple.svelte` pattern**
  - File: `plantapp/src/lib/components/patterns/WaterRipple.svelte`
  - Concentric organic ripple circles with slight irregularity.
  - Same props interface.
  - TDD: Component test.
  - Test file: `plantapp/src/lib/components/patterns/WaterRipple.test.ts`

- [ ] **Task 4.7: Create `GrowthSpiral.svelte` pattern**
  - File: `plantapp/src/lib/components/patterns/GrowthSpiral.svelte`
  - Golden ratio / fibonacci spiral pattern.
  - Same props interface.
  - TDD: Component test.
  - Test file: `plantapp/src/lib/components/patterns/GrowthSpiral.test.ts`

- [ ] **Task 4.8: Create barrel export for patterns**
  - File: `plantapp/src/lib/components/patterns/index.ts`
  - Export all 6 patterns plus `PatternBackground`.

- [ ] **Task 4.9: Create Storybook stories for patterns**
  - File: `plantapp/src/stories/Patterns.stories.ts`
  - Show each pattern standalone and within `PatternBackground` with various props (color, opacity, animate).
  - Include a gallery view showing all 6 side by side.

- [ ] **Verification: Phase 4** [checkpoint marker]
  - Run all pattern component tests: `npx vitest run src/lib/components/patterns/`.
  - Open Storybook and confirm all 6 patterns render in the Patterns story.
  - Inspect each SVG in dev tools: confirm inline SVG (not base64), `aria-hidden="true"`, and file size under 2KB.
  - Toggle `animate` prop and confirm CSS animations activate.

---

## Phase 5: Component Migration (Hardcoded Colors to Semantic Tokens)

**Goal:** Replace all hardcoded hex values throughout the codebase with DaisyUI semantic classes and CSS custom properties.

### Tasks

- [ ] **Task 5.1: Migrate `+layout.svelte` (footer section)**
  - File: `plantapp/src/routes/+layout.svelte`
  - Replace all instances of `text-[#1D3557]` with `text-primary`.
  - Replace `text-[#457B9D]` with `text-secondary`.
  - Replace `hover:text-[#E63946]` with `hover:text-accent`.
  - Replace `border-[#A8DADC]` with `border-secondary/40` or `border-base-300`.
  - Replace `bg-[#1D3557]` with `bg-primary`.
  - Replace `hover:bg-[#457B9D]` with `hover:bg-secondary`.
  - Replace hardcoded hex values in `<style>` block with CSS custom properties or DaisyUI theme variables (`oklch(var(--p))` etc.).
  - Replace `background-color: #f9fafb` with `bg-base-100`.
  - Replace `border-top: 1px solid #e5e7eb` with `border-base-300`.
  - Replace `color: #111827` / `#4b5563` / `#6b7280` / `#374151` / `#9ca3af` with appropriate `text-base-content`, `text-neutral`, etc.
  - Replace `font-family: 'Helvetica Neue'` with `var(--font-body)`.

- [ ] **Task 5.2: Migrate `Header.svelte`**
  - File: `plantapp/src/lib/components/navigation/Header.svelte`
  - Replace all `#1d3557` with `text-primary` / `oklch(var(--p))`.
  - Replace `#e63946` with accent equivalents.
  - Replace `#457b9d` with secondary equivalents.
  - Replace hardcoded grays in `<style>` with theme variables.
  - Replace `font-family: 'Helvetica Neue'` with `var(--font-body)`.
  - Apply `font-display` to brand text for the display font.

- [ ] **Task 5.3: Migrate `BaseField.svelte`**
  - File: `plantapp/src/lib/components/forms/BaseField.svelte`
  - Replace all `text-[#1D3557]` with `text-primary`.
  - Replace `text-[#E63946]` / `border-[#E63946]` with `text-error` / `border-error`.
  - Replace `border-[#A8DADC]` with `border-base-300`.
  - Replace `border-[#457B9D]` / `text-[#457B9D]` with `border-secondary` / `text-secondary`.

- [ ] **Task 5.4: Migrate `MultiStepForm.svelte`**
  - File: `plantapp/src/lib/components/forms/MultiStepForm.svelte`
  - Replace all hardcoded brand hex values with DaisyUI semantic classes.
  - `text-[#1D3557]` -> `text-primary`
  - `text-[#457B9D]` -> `text-secondary`
  - `text-[#E63946]` / `bg-[#E63946]` -> `text-accent` / `bg-accent`
  - `bg-[#A8DADC]` -> `bg-secondary/30` or `bg-info/30`
  - `bg-[#1D3557]` -> `bg-primary`
  - `border-[#1D3557]` -> `border-primary`
  - `ring-[#1D3557]` -> `ring-primary`
  - `border-[#A8DADC]` -> `border-base-300`

- [ ] **Task 5.5: Migrate `mock-detail/+page.svelte`**
  - File: `plantapp/src/routes/products/mock-detail/+page.svelte`
  - Replace all hardcoded hex values with semantic classes.
  - `text-[#1D3557]` -> `text-primary`
  - `bg-[#F1FAEE]` -> `bg-base-200`
  - `bg-[#A8DADC]` -> `bg-info/40`

- [ ] **Task 5.6: Migrate `component-demo/+page.svelte`**
  - File: `plantapp/src/routes/component-demo/+page.svelte`
  - Replace all hardcoded hex values with semantic classes following the same mapping.

- [ ] **Task 5.7: Audit for remaining hardcoded colors**
  - Run: `grep -rn "#1D3557\|#F1FAEE\|#457B9D\|#A8DADC\|#E63946\|#1d3557\|#f1faee\|#457b9d\|#a8dadc\|#e63946" plantapp/src/`
  - Any remaining hits (excluding `imagedesc.md` and test files) must be migrated.
  - Also search for generic hardcoded grays that should use theme tokens: `grep -rn "color: #[0-9a-f]" plantapp/src/` in `<style>` blocks.

- [ ] **Verification: Phase 5** [checkpoint marker]
  - Run the grep audit from Task 5.7 and confirm zero hits in `.svelte` files (excluding docs/images).
  - Open the app and navigate through all pages: homepage, product detail, component demo.
  - Confirm visual consistency: no broken colors, no unstyled elements.
  - Switch to `aevani-dark` theme via dev tools and confirm all migrated components respect dark mode.

---

## Phase 6: Brand Documentation Update

**Goal:** Update brand guide, brand exploration, and create new design system documentation.

### Tasks

- [ ] **Task 6.1: Update `BRAND_GUIDE.md`**
  - File: `market_research/branding/BRAND_GUIDE.md`
  - Update Section 3 (Color Palette) with the evolved palette:
    - New primary: evolved deep navy (document hex, RGB, rationale).
    - New growth green accent.
    - Warm cream `#F7F5F0` replacing `#F1FAEE`.
    - Charcoal `#1A1A1A` and warm gray `#6B7064`.
    - Retain Bold Red `#E63946`.
  - Update Section 4 (Typography) with the three-tier system:
    - Display: Barlow Condensed (weights, usage).
    - Body: Inter (weights 400-900, usage).
    - Mono: JetBrains Mono (usage for editorial accents).
  - Add a new Section on Design Tokens (reference to `DESIGN_SYSTEM.md`).

- [ ] **Task 6.2: Update `BRAND_EXPLORATION.md`**
  - File: `market_research/branding/BRAND_EXPLORATION.md`
  - Add a new "Section 8: Visual Evolution" documenting:
    - Design references (THE LOOKBACK, Readymag, Chrome Industries) and what was drawn from each.
    - Rationale for the evolved palette.
    - Typography direction rationale.
    - SVG pattern library concept and its connection to polyculture/mycelium themes.

- [ ] **Task 6.3: Create `DESIGN_SYSTEM.md`**
  - File: `market_research/branding/DESIGN_SYSTEM.md`
  - Comprehensive documentation covering:
    - Color Tokens: full palette with hex values, DaisyUI semantic mapping, WCAG contrast notes.
    - Typography: font stack, fluid type scale values, usage guidelines (when to use display vs. body vs. mono).
    - Spacing Tokens: full scale with pixel values.
    - Border Radius Tokens: full scale.
    - Shadow Tokens: full scale with visual descriptions.
    - Animation Tokens: timing functions and durations with usage guidance.
    - SVG Pattern Library: list of all patterns, props API, usage examples.
    - Component Patterns: how to use DaisyUI semantic classes, how to apply theme colors.

- [ ] **Verification: Phase 6** [checkpoint marker]
  - Review all three documentation files for completeness against FR-6 acceptance criteria.
  - Confirm `DESIGN_SYSTEM.md` covers all token categories defined in Phase 3.
  - Confirm `BRAND_GUIDE.md` color values match the actual values in `tailwind.config.js`.
  - Cross-reference font names in docs with installed `@fontsource` packages.

---

## Summary of File Changes

### New Files
| File | Phase | Description |
|------|-------|-------------|
| `plantapp/src/lib/styles/colors.ts` | 1 | Color palette constants + exports |
| `plantapp/src/lib/styles/colors.test.ts` | 1 | WCAG contrast ratio tests |
| `plantapp/src/lib/components/patterns/PatternBackground.svelte` | 4 | Pattern wrapper component |
| `plantapp/src/lib/components/patterns/PatternBackground.test.ts` | 4 | Wrapper component tests |
| `plantapp/src/lib/components/patterns/MyceliumNetwork.svelte` | 4 | SVG pattern |
| `plantapp/src/lib/components/patterns/MyceliumNetwork.test.ts` | 4 | Pattern tests |
| `plantapp/src/lib/components/patterns/PolycultureGrid.svelte` | 4 | SVG pattern |
| `plantapp/src/lib/components/patterns/PolycultureGrid.test.ts` | 4 | Pattern tests |
| `plantapp/src/lib/components/patterns/RootSystem.svelte` | 4 | SVG pattern |
| `plantapp/src/lib/components/patterns/RootSystem.test.ts` | 4 | Pattern tests |
| `plantapp/src/lib/components/patterns/LeafVenation.svelte` | 4 | SVG pattern |
| `plantapp/src/lib/components/patterns/LeafVenation.test.ts` | 4 | Pattern tests |
| `plantapp/src/lib/components/patterns/WaterRipple.svelte` | 4 | SVG pattern |
| `plantapp/src/lib/components/patterns/WaterRipple.test.ts` | 4 | Pattern tests |
| `plantapp/src/lib/components/patterns/GrowthSpiral.svelte` | 4 | SVG pattern |
| `plantapp/src/lib/components/patterns/GrowthSpiral.test.ts` | 4 | Pattern tests |
| `plantapp/src/lib/components/patterns/index.ts` | 4 | Barrel export |
| `plantapp/src/stories/DesignTokens.stories.ts` | 3 | Storybook token docs |
| `plantapp/src/stories/DesignTokens.svelte` | 3 | Storybook token component |
| `plantapp/src/stories/Patterns.stories.ts` | 4 | Storybook pattern gallery |
| `market_research/branding/DESIGN_SYSTEM.md` | 6 | Design system documentation |

### Modified Files
| File | Phase | Changes |
|------|-------|---------|
| `plantapp/tailwind.config.js` | 1, 2 | Custom themes, font families |
| `plantapp/src/app.css` | 2, 3 | Font imports, type scale, design tokens |
| `plantapp/src/app.html` | 1 | `data-theme="aevani"` |
| `plantapp/src/routes/+layout.svelte` | 5 | Replace hardcoded colors |
| `plantapp/src/lib/components/navigation/Header.svelte` | 5 | Replace hardcoded colors |
| `plantapp/src/lib/components/forms/BaseField.svelte` | 5 | Replace hardcoded colors |
| `plantapp/src/lib/components/forms/MultiStepForm.svelte` | 5 | Replace hardcoded colors |
| `plantapp/src/routes/products/mock-detail/+page.svelte` | 5 | Replace hardcoded colors |
| `plantapp/src/routes/component-demo/+page.svelte` | 5 | Replace hardcoded colors |
| `market_research/branding/BRAND_GUIDE.md` | 6 | Updated palette + typography |
| `market_research/branding/BRAND_EXPLORATION.md` | 6 | Visual evolution section |

---

## Risk Notes

1. **DaisyUI v5 theme syntax**: DaisyUI v5 changed theme configuration format from v4. Verify the exact syntax for custom themes against DaisyUI v5 docs before implementing Phase 1.
2. **Tailwind CSS v4 compatibility**: Tailwind v4 uses `@import 'tailwindcss'` instead of directives. The `@plugin` syntax is already in use in `app.css`. Confirm DaisyUI v5 plugin registration works with this syntax.
3. **Font loading performance**: Three font families is heavier than one. Use `@fontsource-variable/inter` (variable font, single file) to minimize weight. Subset fonts if needed.
4. **Existing Storybook config**: Verify `.storybook/main.ts` and `preview.ts` support the new stories path and Svelte 5 component format before writing stories.
