---
type: specification
title: Catalog and media integrity
status: planned
created: 2026-07-21
---

# Catalog and media integrity

Create a reviewed, versioned launch-candidate manifest for the 35 sellable
concepts and one collection in `documentation/WHITELABEL.MD`. Each candidate
is research-only, inactive, not customer-facing, and not sellable until its
operational and media evidence passes review.

## Required outcomes

- A distinct, dry-run-first `catalog:seed:plan`, `catalog:seed:apply`,
  `catalog:seed:verify`, and `catalog:seed:rollback` workflow. It must never
  invoke the destructive UAT fixture reset.
- Stable source IDs, manifest hashing, managed-field ownership, transaction
  locking, audit records, non-destructive reconciliation, and bounded rollback.
- A product/category/image DTO and canonical product route contract with no
  source-tree or mock-media URL on a public surface.
- Bucket-backed images with rights source, alt text, verification time, exactly
  one primary image, and no public shoppability without verified primary media.
- A normalized enrichment layer for secondary categories (including Hydroponics,
  Aquaponics, and Seeds & Propagation), tags, typed facets, content areas,
  guide relationships, manufacturer identities, and explicit mock/test media
  provenance. Missing metadata must render as a truthful placeholder.

## Release boundary

Production apply is a manually invoked Railway worker from the reviewed release
commit after a read-only preflight, scoped logical backup, and exact
artifact/release/target confirmation. It is never a web-service startup or
predeploy action. The existing `db:seed:uat` fixture remains
disposable-environment-only; bundled AI-MockAssets remain visibly labeled and
rights-unverified.

## Verification

The verification report proves manifest/schema fingerprints, managed-row
counts, source-ID/slug/SKU uniqueness, image integrity, evidence state, and
no invalid commerce values. It must not log secrets or pretend that research
data is a sellable offer.
