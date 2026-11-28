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

## Payout flow tests (`services/payoutFlows.test.ts`)

Real-Postgres flows for transfers and batches. Skipped unless `FLOW_TEST_DATABASE_URL` points at a throwaway database holding the schema. Run with `vitest run --no-file-parallelism` (the files share and truncate that database).
Build one with `DATABASE_URL=x npx drizzle-kit export --sql > schema.sql`, load it with `psql` (one FK error on `checkout_payment_attempt` is pre-existing and harmless), and run `ALTER DATABASE <db> SET session_replication_role = replica` so fixtures skip FK checks. `drizzle-kit push` cannot build it because of that FK.
Resume rule: a pending claim younger than `STALE_CLAIM_MS` belongs to a live worker; an older one is reconciled against Stripe (transfer_group + metadata) before anything is created.

## Invite approval rules (manager invites)

- Approval needs an active (not revoked) invite, a still-pending use, a verified email, and an account whose role is the base `customer` role (or already the invited role). One conditional UPDATE decides which reviewer wins. An account holds a single role; approving over `instructor`, `affiliate`, `seller` or `admin` is refused with an admin-facing message. **Owner question:** should an account be able to hold several roles? Until answered, remove the old role first.
- The use limit is enforced under a row lock on the invite (`insertUse`), so concurrent visitors cannot pass it.
- `manager_invite.token` keeps the raw token **on purpose**: the admin list and detail pages re-display and copy the invite link later (PR #49 body). Only `token_hash` is used for public lookup. If links should be shown once only, drop the column and the re-copy button together; that is a product decision, left as is.

## Seller and payout-account ownership (PR #52)

- `product.seller_id` is not writable through any route today: `SellerService.linkProduct` has no caller, and the admin product procedures strip unknown keys (no `sellerId` in their zod input). Whoever adds a UI for it must make it admin-only and keep the active-seller check in `linkProduct`.
- Payout accounts are derived from the signed-in session user only (`localOwner`): a seller must hold the `seller` role, an affiliate must be an active approved affiliate. No Stripe account id is accepted from a request. `attachStripeAccount` attaches once (`stripe_account_id IS NULL`), and unique indexes cover one account per seller, per affiliate, and per Stripe account id.
- `applyAccountSnapshot` only updates status flags on the row whose `stripe_account_id` matches a signature-verified Connect event; it cannot attach or move an account.

## Owner decisions left open (payout stack)

- **Shipping and the seller fee (H6).** `recordSellerEarnings` calls `sellerShare(lineTotalMinor, 0)`: shipping passthrough is always 0 and the 8% fee is taken on item price only. VENDOR-AGREEMENT 1.4 and 4.1 define Gross Sales as including shipping charged to the customer, and migration 0016 hard-codes `CHECK (fee_bps = 800)`. Code and contract disagree; the owner must pick (change the code to include shipping, or the contract), and a fee other than 8% needs the check constraint relaxed.
- **Affiliate recovery after payment (M1).** A reversal recorded after a commission was paid is netted from that affiliate later batches in the same currency, and a claimed-but-unsent batch is re-priced down at send. There is deliberately no Stripe reversal against an affiliate and no forfeiture rule (AFFILIATE-AGREEMENT 5.3 and 10.4 leave both open). Owner decision: whether to recover from affiliates who never earn again.
- **`AFFILIATE_PAYOUT_FLOAT_MINOR` (L4)** only has to be set for a batch to run; it is not compared with the platform Stripe balance. Treat it as a switch, not a safeguard, until the owner defines the check.
- **Attribution window (PR #48).** With `AFFILIATE_ATTRIBUTION_WINDOW_DAYS` unset no attribution cookie is issued, so affiliate links stop attributing once #48 merges. Production has the ledger off, so nothing accrues today either way. Set the window and rate together.

## Lock order (money paths)

`order` row -> `seller_earning` row(s) -> `affiliate_commission_ledger` row -> `payout_account` row. Seller claim and affiliate send-claim take only `payout_account`; the transfer success transaction takes only the earning row; refund handling takes order, then earnings, then commissions in phase 1 and `payout_account` alone in phase 2 (`settleReservedDebt`). No path takes `payout_account` and then reaches for an order, earning or commission lock, so there is no cycle. Keep it that way when adding a path.

## Refunds on multi-seller orders (PR #57)

- A **partial** refund on an order whose lines belong to more than one seller (house lines count as one) is never spread by order total: `charge.refunded` is recorded in `refund_allocation`, the order stays held (`order_balance_hold` `alloc:<orderId>`, which blocks release, seller transfers and commission approval), and nothing is clawed back until an admin assigns the refund to order lines (`allocateRefund`). Full refunds and single-seller orders keep the proportional rule. Stripe refunds are made in the Dashboard today, so there is no refund metadata to read line ids from.
- **Open owner policy:** how shipping and tax refunds are attributed. An allocation can only target item lines, so a shipping-only or tax-only partial refund on a multi-seller order cannot be assigned today; it stays held. A single-seller order still claws back proportionally on any partial refund, shipping and tax included.
- **L2.** `settleReservedDebt` keeps the seller payout-account row lock while it calls Stripe (find, create). That is what stops a payout run netting the same debt, and it is bounded by one Stripe call per reservation. Cost: a payout run for that seller waits, and a connection is held. If it shows up as latency, shorten it by moving the find/create outside the lock and re-checking inside it.
- Every path that reaches Stripe is find first, then create, then re-check the ledger. A reversal Stripe already holds is adopted even after the 24h idempotency window.

## Seller ledger vocabulary (one reader)

Every seller balance comes from `services/sellerLedgerBalance.ts` (`earningBalance`, `clawbackRows`,
`sellerNettableDebtMinor`). Payout planning, refund clawbacks, allocation, the console and reconciliation read through
it; do not re-derive balances from raw events elsewhere.

| event_type                        | amount   | meaning                                                                                                                                                                                                                                                                             |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pending`                         | +net     | the earning as accrued                                                                                                                                                                                                                                                              |
| `released`, `held`, `transferred` | 0        | lifecycle markers                                                                                                                                                                                                                                                                   |
| `reversed`                        | -x       | a reduction before payment (reason `refund`/`chargeback`), or money pulled back at Stripe (reason `reversal_of_debt`)                                                                                                                                                               |
| `debt`                            | +x or -x | owed by the seller; the reason says which: `refund`/`chargeback` (clawback; reference `:debt-reserved:` while waiting on a Stripe reversal), `dispute_fee`, `overpay`, `debt_released` (a reservation Stripe refused), `debt_restored`, `debt_settled` (-x, netted from a transfer) |
| `reversal_credited`               | +x       | undoes a `reversed` row (`credits_reference` is that row)                                                                                                                                                                                                                           |
| `debt_credited`                   | -x       | undoes a clawback or released `debt` row                                                                                                                                                                                                                                            |
| `fee_credited`                    | -x       | undoes a `dispute_fee` row                                                                                                                                                                                                                                                          |

Credits never reuse `reversed` or `debt` with a flipped sign, and always name the row they undo. Invariants: `clawedBack`
never exceeds the earning net; reserved debt is never nettable while active and is counted once (in `clawedBack`, and
in `reservedDebt` only until its outcome row exists); a credit of a clawback returns room for a later refund; the debt
shown to admins as collectable is `nettableDebt` only.

- **Disputes won after a loss.** A dispute that closes in the platform's favour credits back, through the ledger, what it clawed back from sellers (clawback, Stripe recovery, dispute fee, and a reservation that was still waiting is cancelled after a find-first at Stripe, under the payout-account lock). The credit is a ledger fact only: it does not send money to the seller. **Not covered:** the affiliate commission reversed by that dispute is not restored, because the affiliate ledger has no credit event (its amount-shape check allows only negative `reversed`); restoring it needs a migration. Stripe can only reach "won" without a prior "lost", so this path is defence for out-of-order or manually replayed events.
- The seeded property test (`ledgerPropertyFlows.test.ts`, `LEDGER_PROPERTY_SEEDS`, default 40) drives charge, transfers with a crash and resume, refunds, disputes lost and won with a fee, allocations and payout runs over one- and two-seller orders, and checks the single reader against the fake Stripe after every step.
