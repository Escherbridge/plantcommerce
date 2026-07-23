---
type: plan
title: Aevani design elevation and mock commerce delivery plan
status: complete
created: 2026-07-22
updated: 2026-07-22
---

# Delivery plan

1. [x] Record the screenshot critique, current system audit, current award/reference
       synthesis, contrast constraints, and commerce architecture evidence.
2. [x] Consolidate palette, focus, spacing, containers, grids, and icon geometry;
       repair Growing Guides and adjacent five-card compositions from 320px up.
3. [x] Replace the global closed catalogue stub with a database-backed normal
       adapter and create the separately bundled loopback-only mock adapter.
4. [x] Complete catalogue discovery, category/search/filter, PDP, cart, checkout
       review, and session-bound simulated success on the canonical route family.
5. [x] Update Conductor and directory-level contracts, then freeze source edits.
6. [x] Run the full integrated validation sweep once. Repair any failures together
       and rerun only the necessary final confirmation.
7. [x] Collect persistent desktop, 768px, and 375px browser evidence, followed by
       an independent code/accessibility review. Leave deploy/push for fresh user
       approval.

Evidence: [local QA record](../../../.omc/qa/aevani-design-mock-commerce-20260722/README.md).

## Release handoff

After completion and presentation of the local evidence, the user explicitly
authorized publication to `main` and the existing Railway `Aevani` /
`aevani-web` production service. This follow-on release does not enable demo
mode or authorize remote schema, seed, catalogue-reconcile, or capability-flag
mutations.
