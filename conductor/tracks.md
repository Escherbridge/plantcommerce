---
type: index
title: Aevani active delivery program
status: planned
updated: 2026-07-21
---

# Aevani active delivery program

This index records the active, evidence-based delivery program. `planned` does
not mean implementation is absent; it means the release evidence necessary to
claim completion has not been collected. The historic track directories remain
available as planning records but must not be used to infer a feature is ready.

## Release boundary

The stable release stays in status mode while the database baseline is
unrehearsed. The public catalog remains closed, and the destructive UAT fixture
is not a production catalog source. See
`.omc/plans/aevani-post-release-hardening-handoff.md` and
`.omc/plans/aevani-launch-catalog-seed-plan.md`.

## Active tracks

| Priority | Track | Status | Dependencies | Outcome |
| --- | --- | --- | --- | --- |
| P0 | [Catalog & Media Integrity](tracks/catalog-media-integrity_20260721/spec.md) | planned | Database baseline rehearsal | Reviewed research-only manifest, safe reconciler, verified media provenance. |
| P0 | [Authentication Journey Contracts](tracks/auth-journey-contracts_20260721/spec.md) | planned | Database baseline rehearsal | Secure, accessible auth and guest-cart continuity contracts. |
| P0 | [Storefront Marketplace Conversion](tracks/storefront-marketplace-conversion_20260721/spec.md) | planned | Catalog/media and auth contracts | Canonical marketplace/PDP/cart/checkout/affiliate journey and gated Grow Plans. |
| P1 | [Visual System Refresh](tracks/visual-system-refresh_20260721/spec.md) | planned | None | Accessible, token-led Swiss/editorial UI with truthful content and purposeful motion. |

## Sequence

1. Complete the database-baseline rehearsals and production-safe catalog
   preflight; no production migration or seed runs as part of implementation.
2. Establish catalog/media, identity, cart, checkout, and affiliate contract
   evidence. The catalog gate stays closed until verified operational truth
   exists.
3. Implement and verify the marketplace and visual system against those
   contracts. Grow Plans remain specified, not public, until all of their P0
   dependencies pass.
4. Freeze edits for the integrated lint, check, test, build, migration,
   browser, accessibility, security, CI, Railway, and production-query gate.

## Archived historical plans

The 2026-03-28 hero, page-template, design-system, and component-library
tracks are archived because their mock-media and decorative-motion assumptions
conflict with the current program. Their retained requirements and replacement
owners are in [the supersession record](archive/superseded-20260721.md).

All other legacy track directories are reference material only until they have
been retroed into an active track with implementation and verification evidence.
