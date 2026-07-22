# Aevani UI, marketplace, and conversion hardening kickoff

## New-task mandate

Run a browser-led UI hardening and product-conversion program for Aevani. Replace mock/broken imagery and mock commerce paths with real, governed product data and media; formalize login and registration contracts; make every sellable item discoverable and shoppable; and produce a focused, affiliate-aware checkout journey.

Refresh the visual direction without discarding Aevani's strongest foundations: retain a restrained Swiss/editorial grid, generous whitespace, strong hierarchy, warm agricultural cues, accessibility, and an expert-but-friendly sustainable-growing voice. Remove motion that exists only as decoration, especially the repeating announcement marquee, text scramble, excessive parallax, and blanket reveal effects.

The task owns Conductor reconciliation before implementation. It must retro, supersede, and archive stale or contradictory work; repair track state; and create a smaller set of evidence-based tracks with OKF frontmatter.

## Stable release boundary

- Production URL: `https://aevani-web-production.up.railway.app`
- Stable Git commit: `ca35780bfa57b9ae6a5034d67e534095c236ddc1`
- Railway deployment: `cfccda69-5164-4942-abb8-ee0ed60b4ecf`, terminal `SUCCESS`
- Release mode: `status`
- Continue using GitHub-to-Railway deployments from `main`; do not use FTP or local archive uploads.
- Preserve disabled migration-dependent commerce/auth capabilities until their database and flow contracts are rehearsed.
- Do not run production migrations or enable operational flags merely to make the UI appear complete.

Read `.omc/plans/aevani-post-release-hardening-handoff.md`, `.omc/plans/aevani-hardening-world-class.md`, and `.omc/plans/aevani-launch-catalog-seed-plan.md` before changing code or infrastructure.

## Live browser evidence

Observed on `/products` against the stable production release:

- All 36 listing images are broken. Their production URLs point to `/src/lib/images/AI-MockAssets/...`, which is not a deployable public asset contract.
- Every product card routes to the same `/products/mock-detail` page.
- The browser logs `Cannot read properties of undefined (reading 'products')`, then silently falls back to mock catalog data.
- The cart logs `Cannot read properties of undefined (reading 'cart')` and presents an empty state.
- The mock detail page's add-to-cart control only raises a client alert; it does not mutate a server-owned cart.
- The listing hierarchy is legible but visually sparse, generic, and low-trust because the primary product-media area is blank.
- The repeating shipping/community announcement animation competes with navigation and repeats claims that must be verified before publication.
- Login exposes named email/password fields with appropriate autocomplete hints.
- Registration inputs lack stable `name` and `autocomplete` contracts.
- The public UI exposes login/register links, but the end-to-end redirect, validation, session, error, recovery, and guest-cart-transfer behaviors still need explicit browser and server contracts.

## Branch and architecture reality

Reconcile deployed `origin/main` with the local hardening branch before UI implementation:

- Deployed `origin/main` uses mock fallback behavior in `plantapp/src/routes/products/+page.ts`.
- `plantapp/src/lib/utils/mockProducts.ts` owns the invalid `/src/lib/images/AI-MockAssets/...` URLs.
- `plantapp/src/routes/products/+page.svelte` hard-codes cards to `/products/mock-detail`.
- The current local hardening branch intentionally disables public catalog responses while schema/catalog readiness is unresolved.
- Real catalog/image machinery already exists in `plantapp/src/lib/server/services/product.ts`, `plantapp/src/lib/loaders/productCategory.ts`, `plantapp/src/lib/server/services/file.ts`, `plantapp/src/routes/api/files/serve/+server.ts`, and the `product`, `product_image`, and `file` schema.
- The intended product detail route is `plantapp/src/routes/products/[category]/[slug]`.
- Two checkout approaches compete: the legacy page-server order flow and the hardened checkout-draft/Stripe flow. Select one canonical architecture before polishing checkout UI.

Do not overwrite or casually rebase away the local hardening work. Produce an explicit branch-delta inventory and integration strategy first.

## Conductor state to reconcile

- 17 track directories exist.
- Metadata reports 9 `ready`, 3 `planned`, 1 `planning`, and 4 tracks with no metadata.
- `conductor/tracks.md` incorrectly labels all 17 tracks `ready`.
- Roughly 1,704 checklist items are unchecked despite substantial implementation already existing.
- All current Conductor Markdown files lack the required OKF `type` frontmatter.
- Metadata keys and status/priority formats are inconsistent.
- No archive convention currently exists.

Retro the implementation against each plan before marking work complete. Evidence may close an item; unchecked boxes alone do not prove it is undone, and existing code alone does not prove it is correct.

## Supersede and archive candidates

Retro these four tracks, extract still-valid requirements, record what shipped and what failed, then archive them as superseded instead of deleting them:

- `conductor/tracks/hero-landing-transform_20260328` — mandates text scramble, parallax, marquee, and broad reveal motion now rejected.
- `conductor/tracks/page-templates-mobile_20260328` — mandates AI mock assets, `/products/mock-detail`, and blanket animation while duplicating product/auth/checkout scope.
- `conductor/tracks/design-system-brand_20260328` — substantial implementation exists, but metadata and completion evidence are missing.
- `conductor/tracks/component-library-refresh_20260328` — components exist while the entire plan remains unchecked and overlaps later tracks.

Retro before closing, merging, or archiving these implemented-but-unreconciled tracks:

- `platform-shell_20260402`
- `account-dashboard_20260402`
- `affiliate-portal_20260402`
- `admin-enhancement_20260402`
- `cross-role-nav_20260402`

Preserve and update the functional contract truth in:

- `auth-accounts_20260314`
- `transaction-core_20260314`
- `discovery-trust_20260314`
- `mobile-checkout_20260314`
- `affiliate-system_20260314`

Resolve overlaps explicitly: hosted checkout versus Express/PaymentIntent, affiliate-system versus affiliate-portal ownership, duplicate Toast and breadcrumb systems, and competing token/theme definitions.

## Replacement tracks to create

After the status audit, create or refine this minimal track set. Use the local date suffix, OKF frontmatter, consistent metadata, explicit dependencies, measurable acceptance criteria, and links to superseded tracks.

### `conductor-state-retro_20260721`

- Establish canonical status and metadata schemas.
- Add OKF `type` frontmatter lazily to every touched Markdown file.
- Define a recoverable archive/supersession convention.
- Reconcile completed, partial, blocked, duplicate, and obsolete checklist items against code and browser evidence.
- Update `conductor/tracks.md` from metadata truth.

### `real-media-integrity_20260721`

- Establish one product/category/image DTO and canonical product URL contract.
- Replace all source-tree and AI-mock production URLs with real bucket-backed media.
- Use the Railway `aevani-images` bucket as the main application image store.
- Define upload/import, ownership, rights/provenance, moderation, publication, alt-text, responsive rendition, fallback, cache, and deletion contracts.
- Prevent a product from becoming publicly shoppable until its primary media and catalog truth are valid.

### `visual-system-refresh_20260721`

- Refresh tokens, typography, spacing, layout, components, content patterns, photography direction, and interaction states.
- Preserve the restrained Swiss/editorial foundation while making it warmer, more botanical, more credible, and friendlier to agricultural startups and growers.
- Replace decorative motion with purposeful state/feedback motion and honor reduced-motion preferences.
- Remove or rewrite unsupported shipping, customer-count, sustainability, certification, and community claims.
- Keep the system modular: tokens -> primitives -> components -> patterns -> page templates, with documented variants and migration paths.

### `storefront-marketplace-conversion_20260721`

- Restore a real public catalog, category/search/filter discovery, canonical PDPs, availability, pricing, trust content, recommendations, and accessible product media.
- Make every sellable item reachable through marketplace navigation and a canonical URL.
- Connect PDP CTAs to server-owned guest/auth carts; connect cart mutations to server actions.
- Choose one canonical hardened checkout flow and remove/deprecate the competing implementation.
- Preserve signed one-time affiliate attribution through landing, cart, checkout draft, Stripe completion, refunds, and commission ledger events.
- Optimize marketplace -> PDP -> cart -> checkout for low friction and high trust without dark patterns.
- Specify Shoppable Grow Plans now and activate them after the catalog, cart, checkout, and attribution P0 gates pass.

### `auth-journey-contracts_20260721`

- Define login, registration, logout, password recovery, verification, validation, error, redirect, throttle/lockout, session, and guest-cart-transfer contracts.
- Give every form field stable names, labels, autocomplete semantics, server validation, accessible errors, loading/disabled states, and safe retry behavior.
- Test success and failure paths without leaking account existence or weakening existing abuse protection.
- Keep auth capability flags disabled until database and integration requirements are proven.

## Launch catalog and seed safety

`documentation/WHITELABEL.MD` is the assortment reference for the launch seed. It maps to 35 SKU candidates and one collection-only concept. The exact normalized identities, slugs, SKUs, sales models, validation waves, risk gates, UAT-fixture reconciliation, and production procedure are specified in `.omc/plans/aevani-launch-catalog-seed-plan.md`.

- Seed all candidates as research-only, inactive, not customer-facing, and not sellable.
- Never copy supplier price ranges into retail pricing or imply supplier/affiliate relationships without current evidence.
- Verify real SKU imagery and usage rights before uploading to `aevani-images`.
- Do not run `npm run db:seed` or reuse `plantapp/src/lib/server/db/seed.ts` in production; it is a destructive UAT reset.
- Build a separate versioned `catalog:seed:plan/apply/verify/rollback` workflow with dry-run default, immutable source IDs, managed-field ownership, transactional advisory locking, audit hashes, and non-destructive deactivation.
- Run production catalog work as a manual Railway worker/job on internal networking, never in the web start command or automatic predeploy hook.
- Query production read-only before and after any apply operation; never log database or bucket credentials.

## Grade-A empowerment feature: Shoppable Grow Plans

The white-label engagement strategy does contain one Grade-A feature worth planning, but it is not a launch blocker. Create four editorial, outcome-led, shareable grow plans:

- Countertop Hydroponics
- 10-Day Microgreens
- Pollinator Patch
- Soil Renewal / Composting

Each plan explains the goal, skill level, space, setup time, compatibility, required versus optional products, and next steps. Aevani-owned items use a server-owned add-required-items action. Affiliate-only items use clearly disclosed, attributable outbound actions and never appear to share Aevani checkout.

Keep the MVP bounded: no AI recommender, quiz engine, public community, supplier portal, multi-vendor checkout, LMS, subscription, or automated agronomic advice. Specify and model it during the P0 work; activate it only after catalog/media, auth, cart, checkout, and attribution contracts pass.

## Required guides

Read and reconcile these before setting visual direction:

- `conductor/product-guidelines.md`
- `conductor/product.md`
- `conductor/code_styleguides/html-css.md`
- `conductor/code_styleguides/typescript.md`
- `market_research/branding/BRAND_GUIDE.md`
- `market_research/branding/BRAND_EXPLORATION.md`
- `market_research/branding/DESIGN_SYSTEM.md`
- `plantapp/src/stories/DesignTokens.svelte`
- `plantapp/src/lib/components/README.md`
- `plantapp/src/routes/AGENTS.md`
- `plantapp/src/lib/images/AI-MockAssets/imagedesc.md` as a legacy/mock reference to remove from production paths, not as approved media.

## Execution order

1. Confirm production health and stable Git/Railway state.
2. Inventory branch divergence and protect unmerged hardening work.
3. Complete the Conductor retro and archive/supersession map.
4. Ask the user whether any additional pages, audiences, brand references, affiliate types, payment methods, or image/licensing constraints must be included.
5. Create/update the replacement tracks and obtain agreement on priorities.
6. Establish catalog, media, identity, cart, checkout, and attribution contracts before broad visual implementation.
7. Implement real-media/catalog and core journey fixes.
8. Apply the modular visual-system refresh across the proven journeys.
9. Run one integrated browser, accessibility, responsive, conversion, test, lint, typecheck, build, and release-verification sweep at the end, subject to the user's current test policy.

## Maximum-concurrency workflow for the implementation task

Use all four available execution slots with strict file ownership and an integrator-owned contract surface.

### Wave 1: audit and contract freeze

- Root/integrator: protect branch state, reconcile Conductor, and freeze DTO/route/event contracts.
- Lane 1: launch manifest, catalog truth, seed/schema preflight, and media provenance.
- Lane 2: browser-led design/storefront audit and design-system migration map.
- Lane 3: authentication, cart, checkout, affiliate, and logging contract audit.

### Wave 2: parallel implementation

- Root/integrator: shared contracts, Conductor state, merge sequencing, and Grow Plan specification/routes.
- Lane 1: production-safe catalog reconciler, real-image ingestion, bucket verification, and catalog APIs.
- Lane 2: tokens, components, marketplace/PDP/Grow Plan UI, copy, accessibility, and responsive behavior.
- Lane 3: auth journeys, server cart, canonical checkout, affiliate attribution/disclosure, and structured logging.

### Wave 3: integrated hardening and release

- Freeze feature edits and use a separate verifier/reviewer lane.
- Run one integrated test, lint, typecheck, build, migration-rehearsal, browser, accessibility, responsive, security, and conversion sweep.
- Run read-only production schema/catalog/media preflight and the catalog seed dry-run.
- Apply only the reviewed idempotent catalog command from the exact release commit, then verify the manifest by querying production.
- Push through Git-based CI, require a green main build, monitor Railway to terminal `SUCCESS`, and smoke-test production health and all critical journeys.
- Roll back or disable the affected capability when any gate fails.

## Acceptance evidence

- Zero broken production images and zero `/src/...` or mock-media URLs in public HTML.
- Every published sellable product has a unique canonical URL, primary image, price, availability state, and working cart action.
- Marketplace search, categories, PDP, guest cart, authenticated cart, login, registration, checkout, success, order access, and affiliate attribution pass documented browser contracts.
- No silent mock-data fallback can make a backend failure look like a valid catalog.
- Checkout totals and attribution remain server-owned and replay-safe.
- The design system has one canonical token source, documented component states, and accessible responsive patterns.
- Motion is purposeful, restrained, and reduced-motion safe.
- Conductor index, metadata, plans, retros, archive links, and actual implementation state agree.
