# Aevani Design System

A comprehensive reference for all design tokens, component patterns, and usage guidelines. This document is the single source of truth for visual implementation.

---

## 1. Color Tokens

### 1.1. Brand Palette

| Token | Hex | RGB | Role |
|---|---|---|---|
| `--color-navy` | `#1B2D4A` | `27, 45, 74` | Primary brand color, headings, nav |
| `--color-cream` | `#F7F5F0` | `247, 245, 240` | Primary background |
| `--color-blue` | `#457B9D` | `69, 123, 157` | Secondary UI, links, borders |
| `--color-green` | `#0A4B3E` | `10, 75, 62` | Sustainability accent, growth messaging |
| `--color-red` | `#E63946` | `230, 57, 70` | CTAs, alerts, energetic accents |
| `--color-charcoal` | `#1A1A1A` | `26, 26, 26` | Dark section backgrounds |
| `--color-warm-gray` | `#6B7064` | `107, 112, 100` | Muted text, secondary labels |
| `--color-light-cream` | `#FDFCF9` | `253, 252, 249` | Lightest background, max whitespace |
| `--color-border` | `#E8E5DE` | `232, 229, 222` | Subtle borders, dividers |

### 1.2. DaisyUI Semantic Mapping

```css
:root {
  --color-base-100: #FDFCF9;    /* lightest-cream — page background */
  --color-base-200: #F7F5F0;    /* warm-cream — card backgrounds */
  --color-base-300: #E8E5DE;    /* border-light — elevated surfaces */
  --color-base-content: #1B2D4A; /* navy — default text */

  --color-primary: #1B2D4A;      /* navy */
  --color-primary-content: #F7F5F0;
  --color-secondary: #457B9D;    /* muted-blue */
  --color-secondary-content: #FDFCF9;
  --color-accent: #E63946;       /* bold-red — CTAs and attention */
  --color-accent-content: #FFFFFF;
  --color-neutral: #1A1A1A;      /* charcoal */
  --color-neutral-content: #F7F5F0;
  --color-error: #E63946;        /* bold-red — validation errors */
  --color-error-content: #FFFFFF;
  --color-info: #0A4B3E;         /* growth-green — informational */
  --color-success: #2D6A4F;
  --color-warning: #D97706;
}
```

### 1.3. WCAG Contrast Notes

| Foreground | Background | Ratio | Level |
|---|---|---|---|
| `#1B2D4A` Navy | `#F7F5F0` Cream | ~10.5:1 | AAA |
| `#1B2D4A` Navy | `#FDFCF9` Light Cream | ~11.2:1 | AAA |
| `#F7F5F0` Cream | `#1A1A1A` Charcoal | ~14.3:1 | AAA |
| `#F7F5F0` Cream | `#1B2D4A` Navy | ~10.5:1 | AAA |
| `#FDFCF9` Light Cream | `#0A4B3E` Growth Green | ~9.8:1 | AAA |
| `#E63946` Red | `#FDFCF9` Light Cream | ~4.6:1 | AA (large text only for body) |
| `#6B7064` Warm Gray | `#FDFCF9` Light Cream | ~4.8:1 | AA |

---

## 2. Typography

### 2.1. Font Stack

```css
:root {
  --font-display: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}
```

### 2.2. Fluid Type Scale

All values use `clamp(min, preferred, max)` for viewport-responsive sizing.

| Token | Value | Approx px (1440px) | Usage |
|---|---|---|---|
| `--text-xs` | `clamp(0.65rem, 0.6vw, 0.75rem)` | ~11px | Micro labels, timestamps |
| `--text-sm` | `clamp(0.8rem, 0.8vw, 0.875rem)` | ~14px | Captions, breadcrumbs |
| `--text-base` | `clamp(1rem, 1vw, 1.125rem)` | ~18px | Body text |
| `--text-lg` | `clamp(1.125rem, 1.2vw, 1.375rem)` | ~22px | Lead text, callouts |
| `--text-xl` | `clamp(1.375rem, 1.6vw, 1.75rem)` | ~28px | H3 headings |
| `--text-2xl` | `clamp(1.75rem, 2.2vw, 2.5rem)` | ~40px | H2 headings |
| `--text-3xl` | `clamp(2.25rem, 3.5vw, 3.5rem)` | ~56px | H1 headings |
| `--text-4xl` | `clamp(3rem, 5vw, 5rem)` | ~80px | Display headings |
| `--text-hero` | `clamp(4rem, 8vw, 9rem)` | ~144px | Hero statements |

### 2.3. Usage Guidelines

**Display (Barlow Condensed)**
- Always uppercase for headings; mixed-case acceptable for longer phrases
- Minimum weight: 700 for display usage
- Tracking: `letter-spacing: 0.04em` to `0.12em` depending on size
- Line height: `0.9` to `1.1` for large display sizes
- Never use for body copy or paragraphs longer than one sentence

**Body (Inter)**
- Regular (400) for paragraphs and descriptions
- Medium (500) for subheadings and emphasized UI elements
- SemiBold (600) for labels and nav items
- Bold (700) for strong emphasis and callout numbers
- Black (900) for counter stats and bold feature callouts
- Line height: `1.6` for body text, `1.3` for UI elements

**Mono (JetBrains Mono)**
- Use sparingly — it signals data, precision, and category taxonomy
- Ideal weight: 500 (Medium) for labels, 700 (Bold) for featured data
- Line height: `1.4`
- Letter-spacing: `0.02em` minimum
- Never use for long-form copy; maximum one sentence

---

## 3. Spacing Tokens

Based on a 4px base unit with a modular scale.

```css
:root {
  --space-xs:  0.25rem;   /*  4px */
  --space-sm:  0.5rem;    /*  8px */
  --space-md:  1rem;      /* 16px */
  --space-lg:  1.5rem;    /* 24px */
  --space-xl:  2rem;      /* 32px */
  --space-2xl: 3rem;      /* 48px */
  --space-3xl: 4.5rem;    /* 72px */
  --space-4xl: 6rem;      /* 96px */
  --space-5xl: 9rem;      /* 144px */
}
```

**Usage guidelines:**
- `xs`/`sm`: Internal component padding, icon gaps, tight list items
- `md`/`lg`: Standard component padding, card spacing
- `xl`/`2xl`: Section sub-spacing, content columns
- `3xl`/`4xl`: Section padding (top/bottom)
- `5xl`: Hero sections, editorial whitespace

---

## 4. Border Radius Tokens

```css
:root {
  --radius-sm:   0.125rem;  /*  2px — subtle rounding on inputs */
  --radius-md:   0.25rem;   /*  4px — standard buttons, badges */
  --radius-lg:   0.5rem;    /*  8px — cards, modals */
  --radius-xl:   1rem;      /* 16px — featured cards, callouts */
  --radius-2xl:  1.5rem;    /* 24px — large image containers */
  --radius-full: 9999px;    /* pills, avatars, circular elements */
}
```

**Direction:** Aevani uses restrained rounding. Most UI elements use `radius-md`. Reserve `radius-lg` and above for content-heavy cards and featured elements. Sharp (`radius-sm` or zero) for editorial text-based sections.

---

## 5. Shadow Tokens

All shadows use warm brown-tinted umbras to match the cream palette.

```css
:root {
  --shadow-sm:  0 1px 2px 0 rgba(27, 45, 74, 0.06);
  --shadow-md:  0 2px 8px 0 rgba(27, 45, 74, 0.10), 0 1px 3px 0 rgba(27, 45, 74, 0.06);
  --shadow-lg:  0 8px 24px 0 rgba(27, 45, 74, 0.12), 0 2px 6px 0 rgba(27, 45, 74, 0.07);
  --shadow-xl:  0 20px 48px 0 rgba(27, 45, 74, 0.15), 0 6px 16px 0 rgba(27, 45, 74, 0.08);
  --shadow-inset: inset 0 2px 4px 0 rgba(27, 45, 74, 0.06);
}
```

**Usage:**
- `shadow-sm`: Subtle card lift, form input focus state
- `shadow-md`: Standard card elevation, dropdown menus
- `shadow-lg`: Modal dialogs, elevated side panels
- `shadow-xl`: Sticky nav on scroll, toast notifications
- `shadow-inset`: Pressed button states, text input wells

---

## 6. Animation Tokens

```css
:root {
  /* Timing functions */
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);  /* slight overshoot */
  --ease-linear:    linear;

  /* Durations */
  --duration-instant:  80ms;    /* micro-interactions, toggles */
  --duration-fast:     150ms;   /* button hover, link transitions */
  --duration-normal:   250ms;   /* modal open, dropdown expand */
  --duration-slow:     400ms;   /* page transitions, hero entries */
  --duration-reveal:   600ms;   /* content reveal animations */
  --duration-crawl:    1200ms;  /* marquee speed, ambient patterns */

  /* Pattern-specific */
  --pattern-drift-duration:   18s;   /* MyceliumNetwork drift */
  --pattern-breathe-duration: 12s;   /* PolycultureGrid breathe */
  --pattern-pulse-duration:    4s;   /* LeafVenation pulse */
  --pattern-ripple-duration:   3s;   /* WaterRipple expand */
}
```

**Philosophy:** Fast for interactive feedback, slow for ambient and decorative motion. Never animate anything that interferes with reading. Respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. SVG Pattern Library

All patterns live in `src/lib/components/patterns/`. They all share a consistent props API.

### 7.1. Shared Props API

```typescript
interface PatternProps {
  color?: string;    // CSS color value. Default: 'currentColor'
  opacity?: number;  // 0–1. Default: 1 (use PatternBackground for section-level opacity)
  scale?: number;    // Pattern tile size multiplier. Default: 1
  animate?: boolean; // Enables ambient animation. Default: false
}
```

### 7.2. Pattern Reference

| Pattern | Component | Tile Size | Animation | Concept |
|---|---|---|---|---|
| Mycelium Network | `MyceliumNetwork.svelte` | 120×120px | 18s drift | Underground connectivity, nutrient networks |
| Polyculture Grid | `PolycultureGrid.svelte` | 160×140px | 12s breathe | Companion planting zones, organic cells |
| Leaf Venation | `LeafVenation.svelte` | 80×80px | 4s pulse | Photosynthesis, structured branching |
| Water Ripple | `WaterRipple.svelte` | 100×100px | 3s expand | Irrigation, propagating impact |
| Root System | (planned) | — | — | Foundational growth, anchoring |
| Growth Spiral | (planned) | — | — | Fibonacci growth, natural expansion |

### 7.3. PatternBackground Wrapper

`PatternBackground.svelte` composes any pattern as a background layer behind content.

```svelte
<PatternBackground
  pattern={myceliumSnippet}
  color="#1B2D4A"
  opacity={0.06}
  blendMode="multiply"
  animate={false}
  class="min-h-screen"
>
  <!-- Content renders above pattern -->
</PatternBackground>
```

**Recommended opacity by background:**
- Cream background: `0.05`–`0.10`
- Navy background: `0.15`–`0.25` (use light color)
- Charcoal background: `0.10`–`0.20` (use cream color)

---

## 8. Usage Guidelines

### 8.1. When to Use Each Font

| Context | Font | Weight | Size Token |
|---|---|---|---|
| Hero statement | Barlow Condensed | 900 | `--text-hero` |
| Section title | Barlow Condensed | 700–800 | `--text-3xl` to `--text-4xl` |
| Card heading | Barlow Condensed | 600 | `--text-2xl` |
| Navigation labels | Barlow Condensed | 600 | `--text-sm` to `--text-base` |
| Body paragraph | Inter | 400 | `--text-base` |
| Lead paragraph | Inter | 400–500 | `--text-lg` |
| UI label | Inter | 500–600 | `--text-sm` |
| Button text | Inter | 600–700 | `--text-sm` to `--text-base` |
| Category label | JetBrains Mono | 500 | `--text-xs` to `--text-sm` |
| Product code | JetBrains Mono | 400 | `--text-xs` |
| Timestamp | JetBrains Mono | 400 | `--text-xs` |
| Data stat | JetBrains Mono | 700 | `--text-xl` to `--text-2xl` |

### 8.2. When to Use Each Color

| Color | Primary usage | Avoid |
|---|---|---|
| Navy `#1B2D4A` | Headings, nav, dark text, primary buttons | Backgrounds for large areas |
| Warm Cream `#F7F5F0` | Card backgrounds, section fills | Dark sections |
| Muted Blue `#457B9D` | Links, secondary actions, info badges | Headings |
| Growth Green `#0A4B3E` | Sustainability messaging, "grow" CTAs, success states | Decorative only |
| Bold Red `#E63946` | Primary CTAs, error states, sale badges | Body text |
| Charcoal `#1A1A1A` | Dark hero sections, reversed text sections | Soft/editorial sections |
| Warm Gray `#6B7064` | Secondary text, placeholders, timestamps | Headings |
| Light Cream `#FDFCF9` | Page background, whitespace sections | Card backgrounds (too flat) |
| Border `#E8E5DE` | Dividers, card borders, input outlines | Text |

### 8.3. How to Apply Patterns

1. **Choose by section intent:**
   - Mycelium Network → Community/connection sections
   - Polyculture Grid → Product browsing, catalog sections
   - Leaf Venation → Educational/knowledge sections
   - Water Ripple → Impact/sustainability sections

2. **Use low opacity** (`0.05`–`0.12`) for subtlety. Patterns are texture, not focus.

3. **Match pattern color to section:**
   - Light sections: `color="#1B2D4A"` (navy) at low opacity
   - Dark sections: `color="#F7F5F0"` (cream) at low-medium opacity

4. **Animate sparingly.** Only one animated pattern per viewport. Prefer static for content-heavy pages.

5. **Never overlap two patterns.** One pattern per section maximum.
