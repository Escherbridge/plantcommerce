# PlantGeo integration boundary

This directory is a server-only boundary between Aevani and a future PlantGeo publisher integration. Its outbound event client and inbound catalog route are both disabled by default; it contains no database-backed catalog provider, service-identity provisioning, or checkout/cart call site.

## Safety contract

- `config.ts` defaults outbound events to disabled and requires a real HTTPS event endpoint, a scoped `plantgeo-*` machine identity, an API token, and a distinct 32-byte identifier HMAC secret before dispatch is possible. The inbound read-only catalog route has its own disabled feature gate and credential; never reuse the outbound token for it.
- `contracts.ts` projects only catalog fields explicitly approved for publication. It intentionally excludes SKU, cost, exact inventory, supplier/internal notes, raw product descriptions, and all account data.
- Commerce events carry either no subject or an HMAC-derived `pgh1_...` subject hash. Do not pass email addresses, IP addresses, session identifiers, free-form user text, or browser capabilities into this directory.
- `client.ts` strips unknown properties during serialization, omits credentials, and returns a result instead of throwing for disabled configuration or transport failures. It is telemetry only: a future caller must enqueue it after a durable commerce commit and must never await it in checkout, cart, payment, or fulfillment control flow.

## Operational prerequisites

Enabling outbound events requires a separately provisioned PlantGeo endpoint, a least-privilege machine identity, a rotating API token, an independent HMAC secret, data-governance approval for catalog claims/image rights/suitability evidence, and a delivery/outbox design. `GET /api/plantgeo/catalog` remains 404 until its own read gate is configured, requires the configured machine identity and bearer token when enabled, and returns 503 rather than an empty catalog until a reviewed data provider exists. No external PlantGeo service or credentials are bundled or implied by this repository.
