# Utilities

## Stored rich text

`sanitizeRichText.ts` is the sole renderer gate for persisted LMS text and slide HTML. It is deliberately fail-closed and dependency-free: all source text is escaped unless it exactly matches a supported tag.

Supported markup is limited to `a`, `blockquote`, `b`, `br`, `code`, `del`, `em`, `h1`–`h6`, `hr`, `i`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `u`, and `ul`. Only an `href` is permitted on `a`; it accepts relative URLs plus `http`, `https`, and `mailto` URLs, emits `rel="noopener noreferrer"`, and rejects every other protocol. Classes, styles, media, embeds, custom data attributes, and all event handlers are intentionally unsupported.

Do not expand this subset with regex patches. If product requirements need images, tables, styles, or richer attributes, add a maintained SSR-safe sanitizer and preserve the same fail-closed behavior with dedicated adversarial tests.
