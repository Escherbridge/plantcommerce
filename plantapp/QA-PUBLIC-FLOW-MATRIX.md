# Aevani public-flow QA matrix

Last evidence update: **2026-07-22**

This is the persistent status sheet for safe, unauthenticated QA of Aevani's public
surface. It supplements `QA-TEST-PLAN.md`; Conductor remains release truth. The
Railway deployment is a stable status/content release and the public catalog stays
closed until its operational evidence gates pass.

## Status and mutation policy

- **PASS**: the stated evidence was collected and matched the expectation.
- **EXPECTED**: a status-release guard or redirect behaved as designed.
- **PARTIAL**: useful evidence passed, but the complete interaction claim is not proven.
- **BLOCKED**: an environment, safety boundary, or data conflict prevents completion.
- **NOT RUN**: safe and in scope, but no current evidence exists.

Mutation modes used below:

- **Guest RO**: cookie-free requests to the explicit public/status route set in this
  matrix, plus read-only database metadata/`SELECT` observations.
- **UI-only**: open/close, focus, scroll, viewport, and link inspection without form
  submission.
- **Local validation**: synthetic client validation only when the local app cannot
  reach Railway or an external service.

`GET` and `HEAD` are not automatically read-only. Authenticated session validation
can update or delete session rows, and `/aff/[linkCode]` records attribution. Railway-
backed QA therefore uses a clean cookie-free browser/client, excludes affiliate-link
routes, and never reuses an authenticated session for a nominally read-only sweep.

## Coverage matrix

| Stable ID        | Flow / routes                                                                    | Safe expectation                                                                                            | Mutation                             | Local status                                    | Production status                | Evidence / gap                                                                                                                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PUB-HOME-001     | Homepage `/`                                                                     | Guest page renders; header, main, footer, and primary links are usable.                                     | Guest RO + UI-only                   | **PASS**                                        | **PASS (browser + HTTP)**        | Release `1843bc6` rendered one banner, main, and footer at desktop, 768 px, and 375 px; HTTP returned 200. The stable Railway origin had no horizontal overflow at any sampled viewport.                                                                           |
| PUB-NAV-001      | Desktop header, footer, logo, and internal navigation                            | Exposed destinations resolve without a broken link or misleading capability claim.                          | Guest RO + UI-only                   | **PASS (sampled)**                              | **PASS (browser + HTTP)**        | Catalog focus exposure and internal destinations passed. On the final release the explicit user menu opened by click, closed/restored focus with Escape, and ArrowDown opened it with focus on Login.                                                              |
| PUB-NAV-002      | Mobile menu at 375 px; tablet navigation at 768 px                               | Menu opens/closes, traps/restores focus, supports Escape, exposes links, and causes no horizontal overflow. | UI-only                              | **PASS at 375 px; 768 px partial**              | **PASS (browser)**               | At 375 px the 44 px opener/close target, bidirectional focus wrap, Escape restore, and no overflow passed. At 768 px the 44 px close target, modal state, Escape restore, and no overflow passed. Background inertness was also proven before release.             |
| PUB-CAT-001      | `/products` and category entry routes                                            | Status release exposes the catalog-closed contract with no mock fallback or sale claim.                     | Guest RO + UI-only                   | **PASS**                                        | **PASS (HTTP guard)**            | Browser copy showed “Catalog verification in progress”; local `/products` returned 200 and four category routes redirected to `/products`. Catalog activation remains out of scope.                                                                                |
| PUB-CART-001     | `/cart` and public cart entry                                                    | Closed catalog prevents a real cart mutation and presents a safe guest state.                               | Guest RO + UI-only                   | **PASS**                                        | **EXPECTED**                     | Browser rendered the closed/status cart without submission; clean-client local GET returned 200. No cart write was attempted.                                                                                                                                      |
| PUB-CHK-001      | `/checkout`, `/checkout/success`                                                 | Direct guest entry cannot create a draft, order, payment, or false success.                                 | Guest RO + UI-only                   | **PASS/EXPECTED**                               | **EXPECTED**                     | `/checkout` redirected 303 to `/cart`; `/checkout/success` rendered the protected informational state. No Stripe or checkout submission occurred.                                                                                                                  |
| PUB-AUTH-001     | `/login`, `/register`                                                            | Entry pages render with stable labels, autocomplete hints, and no credential leakage.                       | Guest RO                             | **PASS (rendering)**                            | **PASS (HTTP)**                  | Browser confirmed labels, required fields, and login autocomplete hints. Submission/credential behavior was not exercised.                                                                                                                                         |
| PUB-AUTH-002     | Recovery and verification entry routes                                           | Missing/malformed token states do not reveal account existence; no message is delivered.                    | Guest RO                             | **PASS (safe entry states)**                    | **PASS (browser + HTTP)**        | Forgot/reset/verify pages rendered safe entry or missing-token states and returned 200. Final browser QA confirmed forgot/reset each expose exactly one main landmark. No delivery, credential, or token mutation was attempted.                                   |
| PUB-INFO-001     | `/about`, `/careers`, `/press`, `/sustainability`, `/accessibility`              | Status content renders and claims remain truthful.                                                          | Guest RO + UI-only                   | **PASS (HTTP); PARTIAL (visual)**               | **PASS (HTTP)**                  | All routes returned 200; `/about` received browser inspection. Remaining visual/claim review is not complete.                                                                                                                                                      |
| PUB-INFO-002     | `/faq`, `/help`, `/support`, `/shipping`, `/returns`, `/warranty`, `/size-guide` | Content renders; interactive controls are keyboard-usable; policy claims stay bounded.                      | Guest RO + UI-only                   | **PASS (HTTP); PARTIAL (interaction)**          | **PASS (HTTP)**                  | All routes returned 200 after the schema baseline; support and FAQ received browser/HTTP inspection. Full accordion keyboard coverage remains open.                                                                                                                |
| PUB-INFO-003     | `/privacy`, `/terms`, `/cookies`, `/affiliate/terms`                             | Legal/status content renders without changing consent or affiliate state.                                   | Guest RO + UI-only                   | **PASS (HTTP)**                                 | **PASS (HTTP)**                  | All four routes returned 200; no consent control or affiliate mutation was exercised.                                                                                                                                                                              |
| PUB-CONTENT-001  | `/blog`, `/resources`, `/guides`, `/courses`, `/learn`, `/instructor`            | Public content renders without implying gated capabilities are operational.                                 | Guest RO + UI-only                   | **PASS/EXPECTED (HTTP)**                        | **PASS/EXPECTED (HTTP)**         | Five public routes returned 200; `/instructor` redirected 303 to login as expected. Visual/content-detail interaction remains partial.                                                                                                                             |
| PUB-FORM-001     | Contact/help/auth/newsletter controls                                            | Labels and client validation are accessible without persistence or external delivery.                       | Local validation only                | **BLOCKED by Railway-backed runtime**           | **NOT RUN by policy**            | The available healthy local runtime reaches Railway. No form was submitted and no external delivery or production validation path was invoked.                                                                                                                     |
| PUB-LINK-001     | Internal, external, mail/tel, and download controls                              | Internal links resolve; external destinations are labeled and do not auto-trigger effects.                  | Guest RO + UI-only                   | **PASS (internal HTTP); PARTIAL (external UI)** | **PASS (internal destinations)** | The full guest route sweep resolved all exposed internal destinations. External link labeling appeared in browser snapshots; external navigation/download behavior was not triggered.                                                                              |
| PUB-RESP-001     | 375 px, 768 px, and desktop public surfaces                                      | No clipping or overflow; targets, menus, forms, and text remain usable.                                     | UI-only                              | **PARTIAL**                                     | **PASS (core sample)**           | The final homepage passed desktop (1265 px client), requested 768 px (753 px client), and requested 375 px (360 px client) with no overflow. Sampled desktop routes also had no overflow; a full every-route/viewport visual pass remains open.                    |
| PUB-A11Y-001     | Keyboard, focus, landmarks, labels, names, contrast, alt text, reduced motion    | Core public routes meet WCAG 2.1 AA expectations with no keyboard trap.                                     | UI-only                              | **PARTIAL**                                     | **PARTIAL (core browser proof)** | Drawer trapping/wrap/Escape/restore, user-menu keyboard behavior, skip link, explicit states, 44 px targets, and one-main landmark structure passed. Forgot/reset password each now expose exactly one main. Automated axe and full contrast coverage remain open. |
| PUB-CONSOLE-001  | Browser console, first-party failures, and server logs                           | No uncaught error, hydration failure, failed asset/API request, or silent fallback.                         | UI-only + logs                       | **PASS (integrated gate)**                      | **PASS (browser + logs)**        | Final browser error/warning log was empty. Railway had no 5xx; bounded runtime logs contained only npm's production-config warning and the intentional `/health` 404 generated while locating the documented `/api/health` endpoint.                               |
| PUB-SEO-001      | `/sitemap.xml`, `/robots.txt`, canonical and robots metadata                     | Only truthful pages are indexable; private/capability routes are excluded.                                  | Guest RO                             | **PASS locally**                                | **PASS (Railway origin)**        | Sitemap is 200 with only `/`, `/size-guide`, and `/support` at `https://aevani-web-production.up.railway.app`; robots advertises that sitemap and blocks private/capability routes. Homepage is index/follow; sampled non-public routes are noindex/nofollow.      |
| PUB-SMOKE-001    | Public/status route smoke                                                        | Cookie-free guest routes have only expected 2xx/3xx responses.                                              | Guest RO                             | **PASS**                                        | **PASS (final release)**         | The migrated local sweep passed 40 expected responses. Final-release production sampling returned 200 for public/status/auth-entry routes, 303 checkout/instructor guards, and a 307 category guard; sitemap, robots, and `/api/health` returned 200.              |
| PUB-HEALTH-001   | `/api/health`                                                                    | Health reports connectivity but is not treated as a full schema fingerprint.                                | Guest RO + metadata                  | **PASS**                                        | **PASS**                         | Release `1843bc6` returned 200 with `status=ready`, `releaseMode=status`, database connected, and schema ready. Independent metadata read-back proved all 0003–0008 objects, `user.pending_email`, LMS uniqueness, and cart identity constraints.                  |
| PUB-AUTHHOME-001 | Authenticated homepage `/`                                                       | An existing valid session renders without a server error.                                                   | Pre-existing authorized session only | **NOT RUN**                                     | **NOT RUN after migration**      | The known missing-`pending_email` schema blocker is resolved by the authorized 0004 migration, but no authenticated production GET was made because session validation itself can mutate session state.                                                            |
| PUB-SEED-001     | Production launch-candidate catalog reconcile                                    | Plan has no integrity violations/conflicts before apply; candidates remain inactive and non-sellable.       | Plan RO; apply guarded               | **BLOCKED by data conflicts**                   | **BLOCKED; no seed write**       | Attested plan passed integrity checks but found 35 unmanaged collisions (33 products, 2 categories). The reconciler correctly refused to overwrite them. UAT/default-admin/CMS fixture seeds remain local/disposable-only.                                         |

## Current evidence summary

- A PostgreSQL 18 custom-format backup was validated at
  `C:\tmp\aevani-railway-pre-baseline-20260722.dump` before schema changes.
- Source-only migrations 0003–0008 passed their target preflights and were applied
  in dependency order. One legacy cart was reconciled from dual identity to its
  existing user identity; its two items were preserved.
- Post-migration read-back found no missing expected tables and confirmed
  `pending_email=1`, `lms_unique=1`, and `cart_identity_check=1`.
- The production-safe catalog plan is blocked by unmanaged fixture collisions;
  no catalog mapping or seed-run rows were written.
- The integrated release gate passed: Prettier/lint clean, `svelte-check` with zero
  errors, 23 test files/88 tests passed, and the adapter-node production build
  completed. An independent review approved the scoped diff after the affiliate
  status modal's keyboard scrolling, stacking, and 44 px close target were fixed.
- Commits `670b499` and `1843bc6` were pushed to the release branch and `main`.
  Railway deployments `008dc051-9591-4b15-a0f6-5c728a088136` and
  `070b61a9-00bf-4d9c-a889-9e77cd70a5d9` reached `SUCCESS`; the latter is the active
  verified release.
- Production browser QA passed the explicit user menu, 375/768 px drawer, guarded
  catalog/cart/checkout/auth/recovery routes, landmark count, metadata, overflow,
  and console checks without a submission or authenticated session.
- Railway metrics were nominal (about 67 MB current memory and 0 vCPU at read-back),
  bounded HTTP logs had no 5xx, and `/api/health` reported ready/status/schema-ready.
- `aevani.com` still serves an external registrar Coming Soon page and is not attached
  to the Railway service. The verified release origin and crawler URLs therefore use
  `https://aevani-web-production.up.railway.app` until domain ownership/DNS is handled
  as a separately authorized infrastructure change.

## Exact safety boundary

The user explicitly authorized the completed migration/seed attempt and the final
commit/push/deployment after hardening. That authorization does not permit unrelated
production mutations.

Until separately authorized, do **not**:

- rerun migrations 0003–0008, use `db:migrate`/`db:push`, or alter the historical
  Drizzle journal;
- bypass the disposable-database guard in `db:seed:uat`, create a default production
  admin, or run local CMS fixtures as production data;
- force/adopt/delete the 35 unmanaged catalog collisions or apply/rollback the
  catalog reconciler without a new reviewed reconciliation plan;
- enable catalog, checkout, auth, affiliate, PlantGeo, or other capability flags;
- submit production auth/recovery/contact/newsletter/upload/checkout forms, use real
  credentials, create accounts, send email, create carts/orders, or initiate Stripe;
- browse authenticated or `/aff/[linkCode]` GET routes under a “read-only” label.

Allowed verification is clean-cookie guest QA on the explicit routes above,
read-only metadata/`SELECT`, read-only logs/status, the one integrated local quality
sweep, and the authorized branch-to-main release workflow. Preserve unrelated
worktree changes and the existing stable release until its verified replacement is
healthy.

## Maintenance rule

Keep stable IDs unchanged. Update only evidence actually collected, distinguish HTTP
from browser proof, and never convert source inspection into a PASS. Apply all fixes
before the one integrated lint/check/test/build sweep.

Source of truth: `conductor/tracks.md`, the auth/storefront track specs,
`.omc/plans/aevani-post-release-hardening-handoff.md`, and `QA-TEST-PLAN.md`.
