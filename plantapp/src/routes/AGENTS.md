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

The canonical catalogue, category, product detail, cart, checkout-review, and
success routes use the server-owned commerce provider. `database` is the
normal/default provider. `demo` is a local-only test adapter selected solely by
private environment configuration; request input must never select it.

Every demo commerce surface is `noindex`, carries the persistent mock/test
notice, uses explicit test-price/action language, and omits production
Product/Offer structured data. Demo checkout collects no personal or payment
data and creates no database, Stripe, email, affiliate, inventory, fulfillment,
account, or production order side effect. See
`src/lib/server/commerce/AGENTS.md` for the provider and session contract.

## Remote release note

The source-level catalogue hold has been removed: the normal provider is the
database adapter. This local program does not inspect or change Railway, remote
environment variables, or a deployed database. Treat any remote release status
as separate operational state that requires fresh evidence and explicit release
approval.
