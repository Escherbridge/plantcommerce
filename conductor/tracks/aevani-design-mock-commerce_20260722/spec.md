---
type: specification
title: Aevani design elevation and mock commerce validation
status: complete
created: 2026-07-22
updated: 2026-07-22
---

# Aevani design elevation and mock commerce validation

Elevate Aevani into a warm editorial-commerce system and make the canonical
catalogue journey production-capable. The normal runtime uses the database
commerce adapter. A separate local-only mock adapter exercises the same routes
without database, Stripe, email, affiliate, fulfillment, account, or Railway
writes.

## Visual direction: Field Notes Commerce

- Warm paper, navy, and deep forest form the quiet structural palette.
- Chartreuse is a precise signal for selection, availability, focus support,
  badges, and editorial rules. Navy remains the readable ink on bright lime.
- Explicit max-width containers and responsive grid tracks create rhythm;
  fixed intrinsic cards and distributed whitespace are not layout primitives.
- Icons use one 24px coordinate system, normalized optical size, a 1.75px
  stroke, and round caps/joins, with distinct silhouettes for distinct actions.
- Motion is static-first and reduced-motion safe. Glass, glow, decorative
  gradients, parallax dependency, and fabricated claims are out of scope.

## Commerce contract

- `/products`, category discovery, search/filter, PDP, `/cart`, `/checkout`,
  and order success remain the canonical route family in every mode.
- Database mode is the default normal runtime and resolves active catalogue,
  cart, and real checkout behavior through server-owned services.
- Mock mode is selected only by private runtime configuration, requires an
  explicit acknowledgement and a loopback request, and is rejected whenever
  Railway environment markers are present. Request parameters cannot select it.
- The 35 existing launch-manifest concepts may be transformed into deterministic
  fictional price/stock fixtures only inside mock mode. Every record and surface
  identifies itself as `mock_test` data.
- Mock cart and order state are bounded, expiring, session-bound, and in-memory.
  Test checkout creates no payment, email, fulfillment, account, real order, or
  external side effect.
- Mock pages are noindex and emit no Product Offer structured data or production
  canonical claim.

## Accessibility and responsive acceptance

- WCAG 2.1 AA text and non-text contrast; visible two-layer focus across mixed
  surfaces; redundant hover, selected, error, and disabled cues.
- One-column reflow without horizontal overflow at 320px/375px, deliberate
  tablet composition at 768px, and bounded desktop grids.
- Keyboard completion of search/filter, PDP quantity, cart changes, checkout
  review, and simulated success. Interactive targets are approximately 44px.

## Release and evidence boundary

Implementation and local/disposable database work were the scope of this track.
Track completion requires one integrated lint/check/test/build sweep plus
persistent browser evidence at desktop, 768px, and 375px with console,
keyboard/focus, overflow, icon, and accessibility observations. Publication is
a separate release handoff: after the local evidence was presented, the user
explicitly authorized a push to `main` and deployment to the existing Railway
`Aevani` / `aevani-web` production service. That handoff does not turn mock mode
into a deployed capability or implicitly authorize seeds, migrations, catalogue
reconciliation, or capability-flag changes.

## Completion evidence

Completed locally on 2026-07-22. The database/default adapter and loopback demo
adapter share the canonical catalogue routes; the full simulated order journey,
responsive guide composition, icon consolidation, noindex behavior, database
recovery rehearsal, accessibility state, and clean final browser consoles are
recorded in
[`../../../.omc/qa/aevani-design-mock-commerce-20260722/README.md`](../../../.omc/qa/aevani-design-mock-commerce-20260722/README.md).

All 103 tests, the production build, Svelte check, changed-file Prettier check,
and diff check passed. Repository-wide lint remains a documented pre-existing
273-file formatting baseline; no unrelated bulk rewrite was performed. At the
local evidence freeze, nothing had been pushed or deployed and no Railway or
remote database had been used; the later publication authorization is recorded
above as a separate handoff.
