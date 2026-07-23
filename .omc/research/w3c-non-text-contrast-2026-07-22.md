# Source capture: W3C WCAG 2.1 — Non-text Contrast

- URL: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- Fetched: 2026-07-22 (America/Denver)
- Page update: 2026-06-15
- Intent: define contrast constraints for SVG icons, control boundaries, focus indicators, and state visuals.

## Captured source facts

- Success Criterion 1.4.11 is Level AA.
- Visual information required to identify controls and meaningful graphics must achieve at least 3:1 contrast with adjacent colors.
- Selected/focused state indicators also need sufficient contrast.
- Very thin graphical lines can render fainter than their nominal CSS color; W3C recommends avoiding overly thin lines or exceeding the minimum contrast.
- A control does not always require a visible hit-area boundary if its icon/text already identifies it, but it still requires visible focus indication.

## Aevani implication

Standardize icon stroke/optical weight and test icons in every state. Do not rely on a pale chartreuse hairline, color-only selection, or hover-only disclosure to make controls understandable.
