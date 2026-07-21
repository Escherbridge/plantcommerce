# Server security boundaries

## Optional provider configuration

Disabled integrations must not require placeholder credentials during build or process startup. Stripe is initialized lazily from runtime environment values, and any payment or webhook path fails closed when its private key or webhook secret is absent. Keep `SECURE_CHECKOUT_ENABLED=false` until the checkout migrations, provider credentials, webhook endpoint, and target-specific rehearsal are approved.

## Authentication capabilities and throttles

Session identifiers, verification links, and password-reset links are bearer capabilities. Persist only a SHA-256 digest of verification and reset capabilities, issue a single active capability per user and purpose, and consume it inside a transaction before changing account state. Password-reset rows bind the capability to the active email address at issuance; issuance and consumption lock the user before the capability row, so an in-flight recovery link cannot survive an email promotion or password change. A staged email change stores distinct hashes for new-address proof and existing-address confirmation; neither proof alone changes the active recovery email.

`LoginProtectionService` records hashed identifiers for both the client address and submitted account identifier. Login failures use a five-attempt account policy and a twenty-attempt IP policy over fifteen minutes, each locking for fifteen minutes. Password-reset requests use a stricter three-per-account and ten-per-IP hourly policy. Atomic upserts activate only when both auth feature flags are enabled; before then, a transaction-scoped advisory lock serializes each hashed legacy subject. A legacy subject with duplicate rows fails closed until the `0004` recovery migration has reconciled it, and an active lock is preserved rather than extended by further attempts. Keep externally observable login and reset-request responses generic; changing limits requires a security review and matching regression tests.

Password reset and email verification depend on the source-only `drizzle/0004_auth_capabilities.sql` recovery artifact. Do not set `AUTH_CAPABILITIES_ENABLED=true` or `AUTH_ATOMIC_THROTTLES_ENABLED=true` until the target database has passed the documented preflight and disposable rehearsal. The migration intentionally invalidates legacy raw verification links, so release communication must offer a new verification email path.

## Affiliate attribution capabilities

Affiliate redirects issue a 30-day, HTTP-only HMAC-authenticated capability
only when `AFFILIATE_ATTRIBUTION_ENABLED=true` and
`AFFILIATE_ATTRIBUTION_COOKIE_SECRET` is a distinct private value of at least
32 bytes. The database stores only HMAC-derived capability and client values;
new tracking never persists raw IP address, user-agent, referer, or the legacy
numeric `affiliate-link` cookie. A separate signed client capability lasts 24
hours and supports one counted click per active link/client rolling 24-hour
window. Cart mutations resolve the server record and can attach only its active
approved affiliate link; they ignore and clear the legacy cookie.

This path depends on source-only `drizzle/0006_affiliate_attribution.sql`.
Keep it disabled until the target preflight and disposable rehearsal are saved
with release evidence. The feature does not create fallback attribution while
disabled, and `db:migrate`/`db:push` remain prohibited until the migration
baseline is reconciled.

Attribution hashes have a documented, operator-run retention policy in
`drizzle/retention_affiliate_attribution.sql`. It is intentionally read-only:
the operator must review its candidate report, preserve material under a fraud,
commission, audit, or legal hold, and approve a separate batched deletion. The
default review windows are 48 hours for dedupe markers, 30 days after expiry
for unconsumed attributions, 90 days for click records, and 365 days after
expiry for consumed attributions.

## Affiliate commission ledger

Stripe fulfillment records an attributed commission only from the immutable
checkout-draft quote, link, affiliate ID, rate basis points, tier marker/version,
terms/disclosure acceptance version, currency, and snapshot hash; it must never
recompute from the affiliate's current rate or current terms. The record and
its initial pending event are inserted in the same transaction as the order. An
affiliate or link may later be suspended without erasing a valid frozen claim;
refunds or clawbacks must append a reversal event instead.

The `0007_affiliate_commission_ledger.sql` recovery artifact is source-only.
Do not enable `AFFILIATE_LEDGER_ENABLED` until its target preflight and
disposable rehearsal are approved. With it disabled, an attributed paid Stripe
webhook fails closed and rolls back rather than persisting an order without its
commission source record. The ledger is append-only at the database layer:
approval, payable, and paid states use idempotent, validated lifecycle events,
while `affiliate_payout` is only an immutable payout instruction in this release
and never invokes a disbursement provider. Existing affiliate and link totals
are display projections, not accounting truth.

Usernames may not be email-shaped and are reserved across active and pending email addresses. Emails are trimmed and lowercased before writes and lookups; until the recovery migration normalizes historical records, reads use case-insensitive comparison and fail closed on ambiguous matches. Email-shaped login input is resolved only against `user.email`; the `0004` preflight blocks release where historical username/email or casing collisions, or email-shaped usernames, would make that policy unsafe. User creation and identity changes take transaction-scoped PostgreSQL advisory locks for the requested identifiers so concurrent requests cannot create a cross-column collision. Login performs an Argon2 verification even for absent or ambiguous accounts. Layout data must use the explicit public-session DTO, never a raw user or session record.

## Development seeds

`db/seed.ts` erases and recreates UAT fixtures. It is intentionally blocked unless the target database name is clearly disposable (`*_dev`, `*_test`, or `*_uat`), `AEVANI_UAT_SEED_CONFIRM` contains the exact destructive acknowledgement, and a unique 16-character-or-longer `AEVANI_UAT_SEED_PASSWORD` is supplied at runtime. Never add a shared seed credential or weaken the database-name check. The optional default-admin helper likewise requires `AEVANI_DEV_ADMIN_PASSWORD`; its purpose is local setup only, not production provisioning.
