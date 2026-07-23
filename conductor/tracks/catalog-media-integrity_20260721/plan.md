---
type: plan
title: Catalog and media integrity delivery plan
status: planned
created: 2026-07-21
---

# Delivery plan

1. Implement and test the source-only manifest and production-safe reconciler
   without running a seed or touching production.
2. Rehearse the schema baseline and reconciler against a disposable,
   production-shaped database.
3. Complete supplier, offer, fulfillment, compliance, inventory, and image
   rights evidence outside the application before enabling any product.
4. Execute a read-only production preflight and catalog plan from the exact
   release commit; apply only with explicit release/hash confirmation.
5. Verify the applied state, then separately evaluate the public catalog gate.
6. Keep the legacy category/tags columns as compatibility aliases while the
   storefront reads normalized assignments, facets, guides, and media
   provenance with explicit fallbacks for missing values.
