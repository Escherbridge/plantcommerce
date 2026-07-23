# Aevani design reference synthesis

- Prepared: 2026-07-22
- Evidence stash: `aevani-design-references`
- Isolated palace: `.mpg/aevani-design-mock-commerce.json`
- Scope: original principles derived from current Awwwards commerce examples and primary W3C guidance; no site is to be copied.

## Recommended direction: Field Notes Commerce

Keep Aevani's warm-neutral and navy foundation, then introduce chartreuse as a precise living signal: active filter, selected state, availability marker, key badge, focus support, and small editorial rule. The accent should punctuate the system rather than flood backgrounds or carry body copy. Botanical photography, useful guide metadata, and product facts supply richness; the interface itself remains calm and legible.

## Original principles

1. **Quiet canvas, vivid signal.** Current winners pair warm cream or near-black/forest foundations with one assertive signal color. Use lime/chartreuse sparingly against tested dark text or deep navy surfaces; never assume saturation equals contrast.
2. **Editorial entry, conventional completion.** Lead category and guide pages with strong type, useful imagery, and concise narrative, then preserve familiar search, filters, PDP facts, cart, and checkout steps. Progressive disclosure may enrich discovery but must not replace basic routes.
3. **Grid as rhythm, not distribution.** Use a shared max-width container and explicit CSS grid tracks. Cards share image ratios and aligned content regions; the final row starts at the same edge as the first. Avoid `space-between` and fixed card widths that create oversized voids.
4. **Grouping through density.** Keep related guide cards close enough to read as a set, with larger space before/after the section than between cards. Use headings, counts, tags, and subtle dividers/surface shifts to create hierarchy before adding decoration.
5. **Product truth before spectacle.** Motion and photography should clarify ingredient, use, size, condition, and price. Product lists must remain scannable without animation, and every mock commerce surface must preserve visible test-data labeling.
6. **One icon grammar.** Normalize icons to a consistent viewBox and optical footprint, shared stroke weight, rounded caps/joins, and deliberate semantic silhouettes. Place 18–24px glyphs inside approximately 44px interactive targets. Validate meaningful strokes and control states at 3:1 against adjacent colors.
7. **Accessible color states are redundant.** Selected, error, disabled, focus, and hover states need shape, border, label, icon, or text changes in addition to color. Normal text targets 4.5:1; large text and meaningful graphics target at least 3:1.
8. **Responsive from 320px, not downscaled desktop.** At the WCAG reflow floor, use one column, wrapping filters/chips, non-fixed cards, and no two-dimensional scroll. At 768px use intentional two-column compositions where content length permits; expand to more columns only when minimum card width and readable gaps remain.
9. **Static-first motion.** Use small state transitions and optional restrained reveals. Supply a complete reduced-motion path, avoid parallax dependency and forced page choreography, and ensure no interaction depends on animation timing.
10. **Awards are references, not acceptance criteria.** The reviewed Awwwards winners report developer accessibility scores around 6.2–6.6/10. Their useful lessons are composition, palette discipline, and product storytelling; W3C requirements govern implementation.

## Sources

- [Awwwards E-Commerce index](https://www.awwwards.com/websites/e-commerce/) — accessed 2026-07-22; live entries through 2026-07-20.
- [Brunello Cucinelli AI E-com](https://www.awwwards.com/sites/brunello-cucinelli-ai-e-com) — SOTD 2026-07-09.
- [Radian](https://www.awwwards.com/sites/radian) — SOTD 2026-07-04.
- [Bucks Sauce](https://www.awwwards.com/sites/bucks-sauce) — E-commerce Honors June 2026; SOTD 2026-07-03.
- [Yucca Packaging](https://www.awwwards.com/sites/yucca-packaging) — SOTD 2026-01-31.
- [Joy Rush](https://www.awwwards.com/sites/joy-rush) — nominee/showcase 2026-07-08, not a winner.
- [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum) — updated 2026-06-01.
- [W3C Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) — updated 2026-06-15.
- [W3C Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible) — updated 2025-09-17.
- [W3C Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html) — updated 2026-06-12.
- [W3C Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — updated 2026-05-11; WCAG 2.2 AA, not WCAG 2.1 AA.
- [W3C reduced-motion technique C39](https://www.w3.org/WAI/WCAG21/Techniques/css/C39) — updated 2026-01-12; supports WCAG 2.1 AAA Animation from Interactions.
