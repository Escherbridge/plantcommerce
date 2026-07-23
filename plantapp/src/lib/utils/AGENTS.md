# Utilities

## Stored rich text

`sanitizeRichText.ts` is the sole renderer gate for persisted LMS text and slide HTML. It is deliberately fail-closed and dependency-free: all source text is escaped unless it exactly matches a supported tag.

Supported markup is limited to `a`, `blockquote`, `b`, `br`, `code`, `del`, `em`, `h1`–`h6`, `hr`, `i`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `u`, and `ul`. Only an `href` is permitted on `a`; it accepts relative URLs plus `http`, `https`, and `mailto` URLs, emits `rel="noopener noreferrer"`, and rejects every other protocol. Classes, styles, media, embeds, custom data attributes, and all event handlers are intentionally unsupported.

Do not expand this subset with regex patches. If product requirements need images, tables, styles, or richer attributes, add a maintained SSR-safe sanitizer and preserve the same fail-closed behavior with dedicated adversarial tests.

## Relative time and hydration safety

`relativeTime.ts` exposes two formatters. `formatRelativeTime` is `Date.now()`-relative ("3 days ago") and therefore differs between the SSR render and the later client hydration, which triggers Svelte's `hydration_html_changed` warning if rendered directly during hydration. `formatAbsoluteDate` builds a `Mon D, YYYY` string from UTC parts only, so it is byte-identical on server and client regardless of host timezone/locale.

The pattern (see the product detail page `[category]/[slug]/+page.svelte`): render `formatAbsoluteDate` during SSR and initial hydration, gate on a `mounted` flag set in `onMount`, then switch to `formatRelativeTime` after mount. This keeps the hydrated HTML stable while still showing relative time to users.
