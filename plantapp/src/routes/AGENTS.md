# Public-route truthfulness

Public routes must not claim a completed customer workflow unless that workflow
persists through its production service. Newsletter signup and reviewed SEO
publishing currently have no such service, so their surfaces state that they
are unavailable and point users to the truthful contact path instead.

The CMS SEO script creates local development fixtures only. Fixtures are
`noindex` and must be replaced with reviewed metadata and a configured
canonical origin before publication. Do not reintroduce marketing counts,
shipping thresholds, availability, or subscription-success copy without an
approved operational source of truth.

The public catalog is currently unavailable. `/products` is noindex and
explains the verification hold; legacy category and detail routes must route
there or return an unavailable response. Do not add a cart, checkout, or
affiliate route that exposes a seeded product outside the shared
`catalogTruth/publicCatalog.ts` guard.

## Railway status release

`AEVANI_RELEASE_MODE=status` is an explicit content-only deployment boundary while the production database baseline is pending. `/api/health` still requires a live database connection and reports `schemaReady=false`, but it may return HTTP 200 for this status release so Railway can keep the truthful public shell available. Remove status mode only after critical tables exist through a reviewed, rehearsed bootstrap; operational mode returns 503 when that schema probe fails.
