---
type: specification
title: Storefront marketplace conversion and Shoppable Grow Plans
status: planned
created: 2026-07-21
---

# Storefront marketplace conversion and Shoppable Grow Plans

Restore marketplace discovery only after verified catalog media and catalog
truth are available. A backend failure must produce an observable unavailable
or error state, never a silent mock catalog.

## Marketplace contract

- Product cards use canonical `/products/[category]/[slug]` routes and the
  shared product/category/image DTO.
- A sellable item has verified price, availability, primary image, and a
  server-owned cart action. All public catalog, cart, checkout, and affiliate
  operations remain behind the same catalog-truth gate.
- There is one canonical hardened checkout architecture. Totals, attribution,
  and order finalization remain server-owned and replay-safe.
- Affiliate-only items use a disclosed, attributable outbound action and never
  resemble items that can be purchased through Aevani checkout.

## Shoppable Grow Plans

Specify four editorial plans now: Countertop Hydroponics, 10-Day Microgreens,
Pollinator Patch, and Soil Renewal / Composting. Each states an outcome,
experience level, space, setup time, required and optional items,
compatibility, and next steps.

The route and add-required-items action stay inactive until catalog/media,
cart, checkout, and attribution P0 gates are verified. When active, owned
items are added atomically through one server-owned cart mutation; affiliate
items retain their disclosure and outbound attribution boundary.

## Verification

Browser evidence covers discovery, PDP, guest/auth cart continuity, checkout,
order access, affiliate disclosure/attribution, Grow Plan item actions, and
the absence of mock-media paths.
