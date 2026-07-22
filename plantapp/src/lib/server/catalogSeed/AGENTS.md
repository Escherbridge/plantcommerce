# Production catalog-seed workflow

This directory owns the reviewed launch-candidate manifest and the pure planning helpers used by `scripts/catalog-seed.ts`. It is deliberately separate from `db/seed.ts`, which is a destructive UAT fixture reset.

## Safety boundary

The manifest represents research candidates, not offers. Every product remains inactive, non-public, non-sellable, unpriced, unstocked, and without unverified media. Do not add source-document prices, supplier claims, imagery, or availability here unless their operational evidence, rights provenance, and verification timestamp have been reviewed.

`catalog:seed:plan` and `catalog:seed:verify` must use a read-only transaction. Every command requires `CATALOG_SEED_EXPECTED_MANIFEST_HASH` to equal the compiled reviewed manifest, and exact runtime-to-expected pairs for Railway project, environment, service, database, release ID (`RAILWAY_RELEASE_ID`), and release commit. `catalog:seed:apply` and `catalog:seed:rollback` additionally require a command confirmation containing that release ID and manifest hash. The source-only `drizzle/0008_catalog_seed_reconciler.sql` recovery artifact must pass its target-specific preflight and disposable rehearsal first. These are manual Railway-job commands only, never application-start or predeploy hooks.

`catalog_seed_category`, `catalog_seed_collection`, and `catalog_seed_item` are the immutable namespace-to-row mappings. A collection maps to a category landing-page taxonomy only; it never creates a product, price, inventory, or checkout record. Their managed snapshot/hash fields detect changes to managed values; any mismatch is a conflict, not a reason to overwrite an administrator's change. `catalog_seed_run` stores bounded pre-images and change hashes for guarded rollback.
