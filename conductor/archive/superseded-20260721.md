---
type: archive
title: Marketplace-program supersession record
status: archived
created: 2026-07-21
scope: conductor
---

# Marketplace-program supersession record

The four source tracks below remain in `conductor/tracks/` as immutable
historical planning evidence. They are archived rather than deleted because
their implementation notes are useful, but they are not active delivery plans
and must not be used as completion evidence.

| Historical track | Archived because | Retained work | Replacement owner |
| --- | --- | --- | --- |
| `hero-landing-transform_20260328` | It requires a text scramble, parallax, a repeating marquee, and blanket reveal motion now rejected as decorative. | Editorial hierarchy, responsive hero layout, reduced-motion support. | `visual-system-refresh_20260721` |
| `page-templates-mobile_20260328` | It depends on AI mock media, `/products/mock-detail`, unsupported product claims, and broad page animation. | Mobile touch targets, responsive layouts, product/PDP information hierarchy. | `storefront-marketplace-conversion_20260721`, `auth-journey-contracts_20260721` |
| `design-system-brand_20260328` | It predates the current catalog truthfulness and component-state contracts; its checklists do not prove implementation. | Tokenized Swiss/editorial system, typography, accessibility, responsive design. | `visual-system-refresh_20260721` |
| `component-library-refresh_20260328` | It combines useful primitives with unverified newsletter, mock media, and decorative interaction requirements. | Accessible component states, navigation, form and card primitives. | `visual-system-refresh_20260721`, `auth-journey-contracts_20260721` |

## Evidence used for the archive decision

- `plantapp/src/lib/server/catalogTruth/publicCatalog.ts` deliberately keeps the
  public catalog unavailable while operational evidence is absent.
- `.omc/plans/aevani-ui-marketplace-hardening-kickoff.md` records broken
  source-tree mock-image URLs, mock product routing, and rejected motion.
- `.omc/plans/aevani-launch-catalog-seed-plan.md` requires real media rights,
  an inactive research-only seed, and a production-safe reconciler.

## Legacy-track handling

The remaining legacy tracks are historical planning inputs, not active release
commitments. Their requirements may be retroed into the active program only
with implementation and verification evidence. The active index therefore
lists only the four replacement tracks and this archive record; it makes no
claim that legacy checklists are complete.
