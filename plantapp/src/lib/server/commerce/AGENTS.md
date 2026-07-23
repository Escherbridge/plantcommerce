# Commerce provider boundary

The canonical product, cart, checkout, and success routes resolve their provider
on the server. `database` is the default and remains the production-capable
path. `demo` is accepted only with the exact acknowledgement, a loopback URL,
a loopback client address, and no Railway identity variables. Never let a query
parameter, header, cookie, form field, or browser store choose the provider.

Local demo startup requires both `AEVANI_COMMERCE_MODE=demo` and
`AEVANI_DEMO_COMMERCE_CONFIRM=mock-test-data-only`. Do not place either value in
a deployed environment or a public environment variable.

## Demo isolation

The `demo/` subtree may import the source-only launch manifest and shared pure
commerce contracts, but it must not import the database, Stripe, email,
affiliate, auth, order, checkout, or file services. Its bounded in-memory store
is keyed by a separate HTTP-only cookie, expires after two hours, and stores no
real identity, contact, address, payment, or fulfillment data.

All demo DTOs use the `mock_test` data class and `demo-*` opaque identifiers.
Every rendered demo surface must show `MockCommerceNotice`, use explicit test
language, be `noindex`, and omit production Product/Offer structured data.

## Database adapter truth

Database availability is `stockQuantity - reservedQuantity`; product displays,
cart validation, and checkout must use that same amount. Cart reads join the
category and public main-image records in the cart query rather than issuing
per-item product lookups. Checkout review exposes whether secure checkout is
enabled, and the UI must render an unavailable state instead of an actionable
payment claim when it is disabled.
