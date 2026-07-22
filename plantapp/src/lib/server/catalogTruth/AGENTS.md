# Catalog-truth research boundary

This directory holds source-only catalog research. It does not query the database, create inventory, make offers, or publish anything customer-facing.

## Contract and guards

Every record names one commerce model: stocked product, dropship/white-label, external affiliate offer, course, service, subscription, or marketplace. It must provide provenance and a separate status for supplier, offer, cost, MOQ, lead time, fulfillment, returns, and compliance.

The bundled fixture is deliberately `research_only`, `not_customer_facing`, and `not_sellable`. Its only citations are local files and line ranges. Seed values, mock imagery, historical research tables, and product concepts are leads—not evidence of current supplier availability, pricing, stock, certification, fulfillment, or return terms.

## Future ingestion and publication

A future reviewed ingestion flow must retain the original evidence, validate a current supplier/merchant source for every applicable operational fact, record verifier and verification time, apply claim/compliance and image-rights review, then persist the reviewed data through a dedicated schema. A `not_applicable` fact also needs reviewed evidence and a verification timestamp, and a public record needs at least one verified operational fact. Only then may it atomically set `customerVisibility` to `customer_facing` and `sellability` to `sellable`. Do not reuse this fixture as a database seed or public catalog feed.

## Public-surface observations

The production-capable public catalogue now uses the database commerce adapter
by default. The source-only records in this directory still never feed that
adapter. Local mock commerce uses a separate, loopback-only adapter and marks
every DTO and surface as mock/test data; see `../commerce/AGENTS.md`.

The following surfaces remain relevant until their claims are backed by reviewed operational facts:

| Surface                                  | Evidence                                                                                                                                                            | Required treatment                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Promotion marquee                        | `plantapp/src/routes/+layout.svelte:156-156` advertises free shipping and 10,000+ growers.                                                                          | Treat both as unavailable marketing/operational claims until policy and evidence exist.         |
| Newsletter                               | `plantapp/src/routes/+page.svelte:27-31,401-404` flips a local success state; footer/drawer controls at `+layout.svelte:229-235,393-393` have no delivery workflow. | Label signup unavailable rather than confirm subscription.                                      |
| Product availability and structured data | The database commerce adapter reads active catalogue records; demo pages suppress Product/Offer structured data.                                                    | Keep operational claims sourced from the selected provider and never promote research fixtures. |
| Seed catalog facts                       | `plantapp/src/lib/server/db/seed.ts:336-354,446-478,816-829` contain mock names, pricing, costs, quantities, and performance/ingredient claims.                     | Keep as UAT data only; never treat as supplier, offer, cost, MOQ, or compliance evidence.       |
