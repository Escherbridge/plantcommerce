# Aevani design and commerce QA evidence

Date: 2026-07-22
Scope: local worktree and disposable PostgreSQL 16 database only
Remote boundary: no Railway CLI, environment, service, database, deploy, or push was used
during this local evidence collection. A later, separately authorized release
handoff does not change the provenance of these results.

## Approval evidence

- [Desktop homepage, 1440px viewport](home-desktop-1440-viewport.png)
- [Desktop catalogue grid, 1440px](catalogue-desktop-1440.png)
- [Growing Guides, 768px viewport](guides-tablet-768-viewport.png)
- [Catalogue, 375px viewport](catalogue-mobile-375-viewport.png)
- [Desktop test checkout review](checkout-review-desktop.png)
- [Desktop simulated order success](order-success-desktop.png)

The full-page checkout captures repeat the sticky header at browser stitching
boundaries. This is a screenshot-stitching artifact; viewport inspection and
DOM geometry did not show duplicated live content.

## Responsive and accessibility observations

| Surface        |    Viewport | Measured result                                                                          |
| -------------- | ----------: | ---------------------------------------------------------------------------------------- |
| Catalogue      | 1440 × 1000 | Four 289px cards with 20px horizontal gutters; no horizontal overflow.                   |
| Growing Guides |   768 × 900 | Two 341px columns with 24px gutters; fifth 341px card centered at x=206; no overflow.    |
| Growing Guides |   375 × 812 | One 328px column with 16px side margins and 24px vertical rhythm; no overflow.           |
| Catalogue      |   375 × 812 | One 328px card column; filter stack reflows; Apply target is 44px high; no overflow.     |
| Growing Guides |   320 × 700 | 273px card width with 16px side margin; document width equals client width; no overflow. |

Keyboard focus was verified on the mobile header user-menu control using a real
Tab key event. The focused 44px target matched `:focus-visible` and rendered a
2px dark-lime outline (`rgb(79, 103, 20)`) plus a 2px paper separation ring.
The chartreuse signal is paired with navy ink; the measured design-token
contrasts are 12.22:1 for navy/chartreuse, 13.80:1 for navy/paper, 10.96:1 for
forest/paper, and 5.66:1 for dark-lime/paper.

Final demo and clean database browser tabs had no console warnings or errors.
All inspected pages had no horizontal overflow. Canonical icons rendered from
the shared stroke system; brand marks rendered from the separate fill system.

## Mock commerce E2E

The local demo ran with both private gates:

- `AEVANI_COMMERCE_MODE=demo`
- `AEVANI_DEMO_COMMERCE_CONFIRM=mock-test-data-only`

The browser completed this route sequence:

1. `/products`: mock notice present; `noindex,nofollow`; search `digital`,
   Hydroponics filter, and price ascending sort returned exactly one result.
2. `/products/hydroponics/digital-ph-ec-meter-set`: product-detail mock notice,
   fictional claims, test price, simulated inventory, and bounded quantity.
3. `/cart`: added quantity 2, updated to 3, and recalculated the test subtotal
   to `$324.30`.
4. `/checkout`: fixed fictional `.invalid` contact/address only; no PII or
   payment input; test total `$355.24`.
5. `/checkout/success`: session-bound test reference rendered; page explicitly
   confirmed no payment, email, inventory, fulfillment, production database,
   account, or real order was created.

Every mock catalogue card, PDP, cart item, totals panel, checkout, and success
surface displayed explicit mock/test labeling. Demo pages emitted no Product or
Offer structured-data claim. After the browser flow, local database counts were
`products=0`, `orders=0`, `checkout_drafts=0`, and `payment_attempts=0`.

## Database-mode smoke

The native PostgreSQL 16.9 service was available on `127.0.0.1:5433`; port 5432
belongs to a separate PostgreSQL 17 service. A dedicated
`aevani_codex_e2e_20260722` database was created without a seed.

`npm run db:migrate` applied the three journaled migrations. The repository's
documented recovery migrations remain intentionally outside Drizzle's journal,
so their read-only preflights and exact DDL were rehearsed in order on this
disposable database:

- `preflight_secure_checkout_drafts.sql` → `0003_secure_checkout_drafts.sql`
- `preflight_auth_capabilities.sql` → `0004_auth_capabilities.sql`
- `preflight_lms_quiz_integrity.sql` → `0005_lms_quiz_integrity.sql`
- `preflight_affiliate_attribution.sql` → `0006_affiliate_attribution.sql`
- `preflight_affiliate_commission_ledger.sql` → `0007_affiliate_commission_ledger.sql`

All preflights completed with no conflicts and every transaction committed on
the disposable database. With default database mode and secure checkout kept
disabled, `/products` rendered the truthful empty catalogue, emitted no mock
notice, had no overflow, and produced a clean browser console. No catalogue
seed, Stripe request, email, account, cart item, checkout draft, or order write
was made.

QA uncovered two issues—the missing recovery schema in the first database smoke
and a conflicting demo robots directive. Both were corrected and reverified in
fresh browser tabs; the generated development-server logs were intentionally
excluded from the release commit.

## Integrated verification

- `npm test`: 27 files, 103 tests passed.
- Final cold-start verification exposed only the database adapter test's default
  5-second timeout; its local allowance is now 15 seconds, and the targeted rerun
  passed both tests in 5.46 seconds.
- `npm run check`: 0 errors and 0 warnings after final fixes.
- `npm run build`: production SSR/client build passed (528/500 transformed modules).
- Changed-file Prettier check: passed.
- `git diff --check`: passed.
- Independent source review: no remaining source-level blocker; final gates were
  execution and browser evidence, now completed here.

Repository-wide `npm run lint` still reports the existing baseline of 273
untouched files that do not match current Prettier output. The changed-file set
is clean; unrelated source was not bulk-reformatted.

## Design references

The original critique and source captures are retained in
[`../../research/aevani-screenshot-critique-2026-07-22.md`](../../research/aevani-screenshot-critique-2026-07-22.md)
and
[`../../research/aevani-design-principles-2026-07-22.md`](../../research/aevani-design-principles-2026-07-22.md).
The implementation translates those references into an original warm-neutral,
navy, forest, and chartreuse editorial system rather than copying a showcased
site.
