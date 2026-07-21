# Aevani post-release hardening handoff

## Release boundary

The current Railway release is intentionally a **status/content release**, not an operational commerce launch. Keep `AEVANI_RELEASE_MODE=status` and all migration-dependent capability flags disabled until the database baseline is rehearsed and approved.

Do not run `drizzle-kit push`, `db:migrate`, or any source-only migration against production. The committed Drizzle journal currently stops at `0002`, while later SQL files are not yet a trusted deployment baseline.

## Railway release context

- Project: `Aevani` (`6faaf3ea-ac46-4c8b-bbfe-1351dbb9d990`)
- Environment: `production` (`b7cfa813-8a5c-4fcd-80f2-cab736d840a7`)
- Web service: `aevani-web` (`b6c06bf1-f1f4-4733-a33d-0f88d178c2fc`), `us-west2`
- PostgreSQL: `Aevani-Postgress` (`3e0ea761-f509-474e-97cf-0086acd9ab7a`), `us-west2`
- Internal database reference: `DATABASE_URL=${{Aevani-Postgress.DATABASE_URL}}`
- Main image bucket: `aevani-images` (`3ec6d799-d64a-4149-b98b-a29ca00ddef5`)
- Public URL: `https://aevani-web-production.up.railway.app`
- Health endpoint: `/api/health`
- Git release branch: `codex/aevani-railway-release`

Secrets and object-storage credentials are Railway variables. Do not copy them into Git or this handoff.

## First task: establish an operational database baseline

1. Inventory the runtime Drizzle schema and every SQL migration after `0002`.
2. Reconcile the journal and migration ordering without editing already-applied production history.
3. Rehearse a clean install and an upgrade from a production-shaped snapshot in disposable PostgreSQL databases.
4. Add migration preflight checks, rollback/forward-fix procedures, backups, and an explicit release approval gate.
5. Only after rehearsal succeeds, enable capabilities in dependency order and change `AEVANI_RELEASE_MODE` from `status` to the agreed operational mode.

## Remaining P0 hardening

### Upload and content delivery

- Replace the simulated virus scan with a real scanner and fail closed.
- Route LMS presigned uploads through the same validation/quarantine pipeline as multipart uploads.
- Prevent content blocks and public URLs from referencing files until their safe state is verified.
- Enforce upload limits before fully buffering multipart bodies.
- Add ownership, publication-state, malicious-file, and bypass regression tests.

### Commerce and privacy integrity

- Verify the checkout draft, Stripe webhook, inventory, order, guest-cart, and guest-order work against the reconciled schema.
- Prove server-priced totals, idempotent finalization, atomic stock changes, replay safety, and private order access with integration/concurrency tests.
- Keep `SECURE_CHECKOUT_ENABLED=false` until those tests and migration rehearsal pass.

### Authentication, authorization, and abuse resistance

- Verify the new login throttle/lockout and capability storage against the operational database and shared multi-replica state.
- Complete real password-reset/email delivery and enumeration-resistant tests.
- Run authorization-matrix tests for files, LMS, affiliates, carts, orders, products, and admin routes.
- Keep auth and affiliate capability flags disabled until their migrations and integration tests pass.

## Product truth and accessibility follow-up

- Remove or qualify unsupported accessibility, careers, impact, certification, press, customer-count, shipping, returns, and checkout-success claims.
- Repair CMS/detail-route slugs and every global-navigation destination.
- Fix keyboard/mobile navigation, drawer focus management, and responsive menu behavior.
- Add real error states so database/infrastructure failures cannot appear as empty catalogs.
- Run axe, keyboard, responsive, SEO/canonical, sitemap, and structured-data gates.

## Affiliate and PlantGeo follow-up

- Rehearse attribution and immutable commission-ledger migrations; verify refunds, reversals, payout references, deduplication, and fraud signals.
- Finish the scoped, versioned, read-only PlantGeo catalog contract and attributable event flow.
- Keep affiliate and PlantGeo feature flags disabled until schema and contract verification pass.

## Release verification for the next session

- Start by reading `.omc/plans/aevani-hardening-world-class.md` and this handoff.
- Confirm the current Railway deployment and `/api/health` before changing infrastructure.
- Preserve Git-triggered Railway deploys; do not use local archive uploads.
- Apply all source fixes first, then run one integrated lint, typecheck, test, build, audit, migration-rehearsal, E2E, and accessibility sweep.
- Update this handoff and the original plan with verified evidence, not inferred completion.
