---
type: index
title: Aevani active delivery program
status: planned
updated: 2026-07-22
---

# Aevani active delivery program

This index records the active, evidence-based delivery program. `planned` does
not mean implementation is absent; it means the release evidence necessary to
claim completion has not been collected. The historic track directories remain
available as planning records but must not be used to infer a feature is ready.

## Release boundary

The 2026-07-22 design/mock-commerce track removes the source-level global
catalogue hold. The normal adapter is database-backed and production-capable;
the source-only research manifest remains separate and is not a production
catalogue seed or offer source.

The implementation and evidence program was completed without deployment or
remote database work. After that evidence was presented, the user separately
authorized publication to `main` and the existing Railway `Aevani` / `aevani-web`
production service. Mock mode remains loopback-only and is prohibited whenever
Railway identity markers are present. Remote migrations, seeds, capability-flag
changes, and catalogue reconciliation remain separate operations.

## Active tracks

| Priority | Track                                                                                          | Status   | Dependencies                     | Outcome                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| P0       | [Aevani Design Elevation & Mock Commerce](tracks/aevani-design-mock-commerce_20260722/spec.md) | complete | None                             | Field Notes visual system and canonical database/demo commerce adapters with complete local E2E evidence. |
| P0       | [Catalog & Media Integrity](tracks/catalog-media-integrity_20260721/spec.md)                   | planned  | Database baseline rehearsal      | Reviewed research-only manifest, safe reconciler, verified media provenance.                              |
| P0       | [Authentication Journey Contracts](tracks/auth-journey-contracts_20260721/spec.md)             | planned  | Database baseline rehearsal      | Secure, accessible auth and guest-cart continuity contracts.                                              |
| P0       | [Storefront Marketplace Conversion](tracks/storefront-marketplace-conversion_20260721/spec.md) | planned  | Catalog/media and auth contracts | Canonical marketplace/PDP/cart/checkout/affiliate journey and gated Grow Plans.                           |
| P1       | [Visual System Refresh](tracks/visual-system-refresh_20260721/spec.md)                         | planned  | None                             | Accessible, token-led Swiss/editorial UI with truthful content and purposeful motion.                     |

## Sequence

1. Complete the database-backed catalogue and isolated demo-provider contracts.
2. Verify catalogue/media, identity, cart, checkout, and affiliate behavior
   without treating research-only concepts as production inventory or offers.
3. Implement and verify the marketplace and visual system against those
   contracts. Grow Plans remain specified, not public, until all of their P0
   dependencies pass.
4. Freeze edits for the integrated lint, check, test, build, browser,
   accessibility, and security evidence pass. Publish only through the separate,
   explicitly authorized release handoff after those gates pass.

## Archived historical plans

The 2026-03-28 hero, page-template, design-system, and component-library
tracks are archived because their mock-media and decorative-motion assumptions
conflict with the current program. Their retained requirements and replacement
owners are in [the supersession record](archive/superseded-20260721.md).

All other legacy track directories are reference material only until they have
been retroed into an active track with implementation and verification evidence.
