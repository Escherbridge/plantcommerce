# Migration recovery

## Current baseline

`0000_bizarre_black_tom`, `0001_wandering_tomorrow_man`, and
`0002_smiling_shooting_star` are the only journaled Drizzle migrations.
`0001_sloppy_living_mummy.sql` is an orphaned historical artifact and must not
be renamed, journaled retroactively, or replayed.

The project has previously used schema push workflows, so a deployed schema
can contain columns absent from the journal. In particular, the legacy Stripe
order columns may already exist. The source model and migration history are
not a deployment baseline.

## `0003_secure_checkout_drafts.sql`

This file is a source-only recovery artifact for the secure checkout model. It
is deliberately not added to Drizzle's journal until a reviewed baseline is
established. Do not run `npm run db:migrate` or `npm run db:push` as part of
this checkout release: either can produce unsafe replay or further untracked
drift.

Before a release operator applies it, they must take a backup and run
`preflight_secure_checkout_drafts.sql` read-only against the target database.
The operator must save its output and record:

- the migration-tracking table and its entries, if present;
- the `order` Stripe and draft columns, constraints, indexes, and duplicate
  non-null Stripe session IDs;
- the absence of every `checkout_*`, `stripe_webhook_event`, and
  `guest_order_access_grant` table (the recovery DDL aborts if any exist);
- the current `product.reserved_quantity` column and data validity.

Rehearse the exact reviewed DDL, including this preflight and its transaction,
on a disposable copy first. If any existing object differs from the expected
shape, stop and reconcile the baseline with a reviewed migration plan; never
mark rows in `__drizzle_migrations` merely to make a command pass. Record the
approved deployment procedure and resulting schema fingerprint with the
release evidence.

The checkout snapshots and items are intentionally immutable at the database
layer. Provider-collected customer contact and address fields may be filled
after payment; pricing, identity, attribution, source-cart version, and item
snapshots may not change.

## `0004_auth_capabilities.sql`

This is also a source-only recovery artifact and remains outside the Drizzle
journal. It creates the `password_reset_token` table (including the active
email bound to each recovery capability), a dual-proof `email_change_capability`
table, and unique single-capability and throttle-subject indexes. A staged email
replacement must be proved at both the new address and the existing recovery
address before it can become active. Its DDL is explicitly qualified to the `public`
schema so it cannot be redirected through a target search path. Applying it
intentionally invalidates all legacy email-verification links because those
historical rows stored raw bearer tokens. Before applying it, take a backup and
run a read-only target inspection that records the `user`,
`email_verification_token`, `email_change_capability`, `login_attempts`, and
`password_reset_token` table shapes, duplicate throttle subjects, email-shaped usernames, case-insensitive active/pending email collisions, cross-account
username/email collisions, indexes, and migration-tracking state. The migration
rejects those identity conflicts because email-shaped login input is
deterministically resolved only through the email namespace. Rehearse the exact
DDL on a disposable copy first. Only then set `AUTH_CAPABILITIES_ENABLED=true`
and `AUTH_ATOMIC_THROTTLES_ENABLED=true`; do not use `db:migrate` or
`db:push` to apply either recovery artifact.

## `0005_lms_quiz_integrity.sql`

This source-only artifact adds the unique `(attempt_id, question_id)` invariant
that makes a quiz attempt's server-created question set immutable. It does not
modify existing data: the target preflight must show no duplicate pairs and no
pre-existing index of that name. Rehearse it on a disposable copy before
applying, and do not journal it or run `db:migrate`/`db:push` until the project
baseline is reconciled.

## `0006_affiliate_attribution.sql`

This source-only artifact creates the server-side affiliate-attribution,
deduplicated-click, and capability-hash records. It deliberately leaves the
legacy raw `affiliate_click` table untouched so a release operator can inspect
and retire historical data separately. Run `preflight_affiliate_attribution.sql`
read-only, save its output, take a backup, and rehearse the exact DDL on a
disposable copy before applying. Only then set
`AFFILIATE_ATTRIBUTION_ENABLED=true`; do not journal this file or use
`db:migrate`/`db:push` until the baseline is reconciled.

### Attribution retention

No application path deletes affiliate-attribution data automatically. At least
monthly, an authorized operator must run the read-only
`retention_affiliate_attribution.sql` report, preserve any records required for
an active dispute, fraud investigation, tax/audit hold, or commission ledger
reconciliation, and record approval before applying a separately reviewed,
batched deletion. The default review windows are 48 hours for dedupe markers,
30 days after expiry for unconsumed attributions, 90 days for click records,
and 365 days after expiry for consumed attributions. Do not delete records
solely from this repository or without the retention evidence.

## `0007_affiliate_commission_ledger.sql`

This source-only artifact makes affiliate ownership unique per user, gives a
cart exactly one user or guest identity, and adds immutable affiliate
commission facts plus append-only pending, approved, reversed, payable, and
paid events. It must follow the checkout recovery artifact because every
commission is bound to an immutable checkout draft, frozen affiliate/policy
snapshot, order, and Stripe webhook event. Run
`preflight_affiliate_commission_ledger.sql` read-only, save its output, take a
backup, and rehearse the exact DDL on a disposable copy before applying. The
preflight must show no duplicate affiliate owners, affiliate link codes, cart
identities, or orders per checkout draft; no active attributed drafts; and must
record the migration tracker, prerequisite immutable-draft trigger,
constraints, and indexes.

The recovery DDL deliberately aborts instead of choosing a winner for duplicate
affiliate or cart rows. Do not journal it or use `db:migrate`/`db:push` until
the target baseline is reconciled. Only after the approved rehearsal may an
operator set `AFFILIATE_LEDGER_ENABLED=true`. An attributed paid checkout fails
closed while that flag is disabled so no order can be marked fulfilled without
its source-of-truth commission entry.

`affiliate_commission_ledger` is a fact table, not a mutable balance. Its
pending event records the frozen checkout-draft quote, rate basis points,
affiliate identity, legacy-tier marker or future tier version, and terms/
disclosure acceptance snapshot. Refunds and clawbacks append negative reversed
events; approval and payout lifecycle changes append zero-delta events with
idempotent references. Database triggers prohibit updates and deletes from the
ledger, its events, payout instructions, and terms-acceptance evidence.
`affiliate_payout` creates only a payout instruction/reference in this
release—it does not initiate a provider disbursement. Legacy affiliate/link
earnings columns remain rebuildable display projections and are never payout
authority.

## `0008_catalog_seed_reconciler.sql`

This source-only artifact establishes immutable manifest-to-category/product mappings and a bounded seed-run ledger. It must never be journaled or applied through `db:migrate`/`db:push` while the database baseline is unresolved. Run `preflight_catalog_seed_reconciler.sql` read-only, save the schema fingerprint and collision report, take a backup, and rehearse the exact DDL and catalog workflow on a disposable copy first.

The production command is a manual Railway job only. Every command requires an exact reviewed manifest hash and runtime/expected Railway project, environment, service, database, release-ID, and release-commit pairs; `catalog:seed:plan` and `catalog:seed:verify` are read-only, while `catalog:seed:apply` and `catalog:seed:rollback` also require explicit command confirmation. Global duplicate category/product slug, SKU, and object-key scans fail the plan before writes. Existing managed-field hashes reject out-of-band edits rather than overwriting them. Newly created rows are deleted on rollback only when unreferenced; otherwise rollback stops and the backup/restore handle remains the final recovery boundary. Never run the destructive UAT fixture seed against production.

## `0009_catalog_enrichment.sql`

This additive source-only artifact adds many-to-many categories, normalized
tags, manufacturer identities, content areas, typed facets, guide links, and
media provenance. It remains outside the Drizzle journal until the baseline is
reconciled. Run `preflight_catalog_enrichment.sql`, save its output, rehearse on
a disposable production-shaped database, and take a fresh backup before apply.

`scripts/catalog-enrichment.ts` is the only supported runner. Its default
`plan` is read-only. `apply` requires exact Railway project, environment,
application-service, database-service, release, source-commit, database-name,
connection-fingerprint, artifact-hash, and backup-SHA attestations. It applies
DDL and deterministic backfill in one advisory-locked transaction. It never
changes prices, inventory, activation, users, carts, orders, capability flags,
or manufacturer truth.

Bundled `AI-MockAssets` remain `mock_test` with unverified rights and must be
disclosed as illustrative mock media. Do not infer a manufacturer from a
product name, merchant, provider, or supplier.
