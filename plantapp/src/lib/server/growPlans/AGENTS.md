# Shoppable Grow Plan boundary

This directory holds the server-owned specification for four editorial Grow
Plans. It deliberately stores no price, availability, merchant URL, or
customer-facing claim because the launch candidates are research-only.

A plan can become active only when verified catalog/media, guest/auth cart,
checkout, and affiliate-attribution gates all pass. The eventual cart action
must accept catalog identity and quantity only; price, offer, and availability
remain server-resolved. An affiliate action must be disclosed, attributable,
and outbound-onlyâ€”it must never use the Aevani cart or checkout.

See `conductor/tracks/storefront-marketplace-conversion_20260721/spec.md` for
the release and browser-verification contract.
