# Aevani launch catalog seed plan

## Decision

Use `documentation/WHITELABEL.MD` as the assortment reference for the initial launch-candidate catalog. It contains 36 source rows: 35 sellable product concepts and one collection-only concept (`Hydroponic Consumables`).

This document is a sourcing lead sheet, not verified catalog truth. Supplier names, availability, MOQs, costs, margins, certifications, claims, imagery, and commercial relationships must be reverified from primary sources before publication.

Every candidate enters the database as research-only, not customer-facing, not sellable, and `product.isActive=false`. A product may become public only after its offer, fulfillment, compliance, pricing, inventory, media rights, and catalog-truth gates pass. Source-document price ranges must never populate checkout pricing.

## Launch-candidate manifest

Status meanings:

- `R0`: validate first for the launch assortment.
- `R1`: second-wave candidate.
- `R2`: later, high-ticket, freight-heavy, or affiliate-first candidate.
- `HOLD`: material compliance or operational blocker.
- `COLL`: collection/landing page, not a sellable SKU.

### General gardening and permaculture

| # | Product | Slug | SKU | Model | Status | Principal gate |
|---|---|---|---|---|---|---|
| 1 | Heirloom Tomato Seed Collection | `heirloom-tomato-collection` | `PLT-TOM-001` | White-label | R0 | Cultivar, lot, germination, state seed labels; no live plants |
| 2 | Medicinal Herb Garden Kit | `medicinal-herb-garden-kit` | `PLT-MED-001` | White-label | R1 | Exact species/BOM; remove unsupported health claims |
| 3 | Hand-Forged Garden Trowel | `hand-forged-garden-trowel` | `TLS-TRW-001` | White-label | R0 | Materials, origin claims, safety, warranty, sample approval |
| 4 | Artisan Seed Packet Collection | `artisan-seed-packet-collection` | `PLT-ASP-001` | White-label | R0 | Cultivars, quantities, germination, labels, illustration rights |
| 5 | Microgreens Growing Kit | `microgreens-growing-kit` | `KIT-MCG-001` | White-label | R0 | BOM, lot traceability, seed treatment and food safety |
| 6 | Mushroom Cultivation Kit | `mushroom-cultivation-kit` | `KIT-MSH-001` | White-label | R1 | Species, substrate, shelf life, biological-material shipping |
| 7 | Composting Starter Kit | `composting-starter-kit` | `KIT-CMP-001` | White-label | R0 | Dry-goods BOM; live worms require a separate contract |
| 8 | Pollinator Garden Seed Collection | `pollinator-garden-seed-collection` | `PLT-POL-001` | White-label | R1 | Regional mix, invasive review, labels, substantiated claims |
| 9 | Soil Building Amendment Kit | `soil-building-amendment-kit` | `KIT-SBA-001` | White-label | HOLD | Analysis, SDS, state registrations, verified OMRI claims only |
| 10 | Grafting & Propagation Kit | `grafting-propagation-kit` | `KIT-GPK-001` | White-label | R0 | BOM, blade safety, replacement parts, instructions |
| 11 | Seed Saving Starter Kit | `seed-saving-starter-kit` | `KIT-SSK-001` | White-label | R0 | BOM, packaging rights, seed rules if seeds are included |
| 12 | Season Extension Kit | `season-extension-kit` | `KIT-SEK-001` | White-label | R0 | Dimensions, fabric/UV data, weather/load limits |
| 13 | Beneficial Insect Habitat Kit | `beneficial-insect-habitat-kit` | `KIT-BIH-001` | White-label | R0 | No live insects; durability and restrained ecological claims |

### Hydroponics

| # | Product | Slug | SKU | Model | Status | Principal gate |
|---|---|---|---|---|---|---|
| 14 | NFT Hydroponic Channel System | `nft-hydroponic-channel-system` | `HYD-NFT-001` | Affiliate-only | R2 | Partner approval, food-contact materials, electrical safety, freight |
| 15 | Deep Water Culture Bucket System | `deep-water-culture-bucket-system` | `HYD-DWC-001` | Hybrid | R1 | Food-contact PE, pump certification, leak test, BOM |
| 16 | Vertical Tower Garden System | `vertical-tower-garden-system` | `HYD-VTG-001` | Affiliate-only | R2 | Partner approval, stability, materials, electrical proof |
| 17 | Hydroponic Grow Tent Kit | `hydroponic-grow-tent-kit` | `HYD-GTK-001` | Affiliate-only | R2 | NRTL/electrical evidence, fire performance, wattage, warranty |
| 18 | Aeroponic Misting System | `aeroponic-misting-system` | `HYD-AER-001` | Hybrid | R1 | Pressure/nozzles, pump safety, water-contact materials, spares |
| 19 | Hydroponic Nutrients Trio | `hydroponic-nutrients-trio` | `HYD-NUT-001` | Hybrid | HOLD | Formula, analysis, SDS, registrations, shelf life, claim proof |
| 20 | Rockwool Cubes & Growing Media Sampler | `rockwool-cubes-growing-media-sampler` | `HYD-MED-001` | White-label | R0 | Brand authorization, sizes/count, handling guidance |
| 21 | Digital pH & EC Meter Set | `digital-ph-ec-meter-set` | `TLS-PHE-001` | Hybrid | R0 | Accuracy/calibration, battery/electrical compliance, warranty |
| 22 | Net Pots & Clay Pebbles Bundle | `net-pots-clay-pebbles-bundle` | `HYD-NPC-001` | White-label | R0 | Dimensions/count, food-contact evidence, media cleanliness |
| 23 | Hydroponic Consumables | `hydroponic-consumables` | none | Collection | COLL | Landing-page taxonomy only; no price, inventory, or checkout |

### Aquaponics

| # | Product | Slug | SKU | Model | Status | Principal gate |
|---|---|---|---|---|---|---|
| 24 | Countertop Aquaponics Starter System | `countertop-aquaponics-starter-system` | `AQP-CTR-001` | Affiliate-only | R2 | Partner approval, tank/pump safety, fish-welfare guidance |
| 25 | Commercial Aquaponics Grow Bed | `commercial-aquaponics-grow-bed` | `AQP-BED-001` | Affiliate-only | R2 | Configuration, food-grade liner, installation, freight/quote model |
| 26 | IBC Aquaponics Fish Tank | `ibc-aquaponics-fish-tank` | `AQP-IBC-001` | Affiliate-only | R2 | Chain of custody, food-grade proof, structural safety, freight |
| 27 | Aquaponics Bell Siphon Kit | `aquaponics-bell-siphon-kit` | `AQP-BSK-001` | White-label | R0 | Pipe compatibility, dimensions, materials, installation guide |
| 28 | Aquaponics Water Testing Kit | `aquaponics-water-testing-kit` | `AQP-WTK-001` | Hybrid | R1 | Reagent SDS, shipping, accuracy, test count, expiration |
| 29 | Tilapia Aquaponics Illustrated Guide | `tilapia-aquaponics-illustrated-guide` | `AQP-TIG-001` | Owned/white-label | R0 | Owned illustrations/content, format, fish-law and welfare review |

The Tilapia entry is educational content, not live fingerlings.

### Silvopasture and agroforestry

| # | Product | Slug | SKU | Model | Status | Principal gate |
|---|---|---|---|---|---|---|
| 30 | Silvopasture Seed Mix | `silvopasture-seed-mix` | `SIL-SSM-001` | White-label | R1 | Regional composition, lot/germination/weed analysis, labels |
| 31 | Tree Shelters & Protectors, 25-pack | `tree-shelters-protectors-25-pack` | `SIL-TSP-001` | White-label | R0 | Dimensions, material, UV durability, installation guide |
| 32 | Chestnut Tree Seedlings, 10-pack | `chestnut-tree-seedlings-10-pack` | `AGF-CTS-001` | Hybrid | HOLD | Nursery licensing, quarantine, cultivar, seasonality, live-arrival policy |
| 33 | Forage Chicory Seed | `forage-chicory-seed` | `SIL-FCS-001` | White-label | R1 | Package weight, lot/germination/weed analysis, seed labels |
| 34 | Portable Electric Netting, 164 ft | `portable-electric-netting-164-ft` | `SIL-PEN-001` | Hybrid | R1 | Energizer compatibility, warnings, livestock suitability, warranty |
| 35 | Livestock Water Trough | `livestock-water-trough` | `SIL-LWT-001` | Affiliate-only | R2 | Capacity/dimensions, water-contact proof, freight, warranty |
| 36 | Black Locust Seed Collection | `nitrogen-fixing-tree-seeds-collection` | `SIL-NFT-001` | White-label | HOLD | Species/seed proof, invasive review, destination geo-blocking |

## Existing seed reconciliation

The current UAT fixture contains 40 products and is not a production source of truth.

- Replace `AQP-TFP-001` (live Tilapia fingerlings) with educational `AQP-TIG-001`.
- Replace `SIL-FCP-001` (Forage Chicory plugs) with seed `SIL-FCS-001`.
- Archive/deactivate these five unsupported extras unless separate launch evidence approves them:
  - `PLT-SED-001` Heirloom Seed Vault
  - `KIT-PRM-001` Permaculture Starter Kit
  - `KIT-WRM-001` Worm Composting Kit
  - `KIT-RWH-001` Rainwater Harvesting Kit
  - `KIT-HSG-001` Herb Spiral Garden Kit
- Preserve every other semantically valid SKU and slug to protect URLs, references, and analytics.

Never run `plantapp/src/lib/server/db/seed.ts` or `npm run db:seed` against production. That path is an explicitly destructive UAT reset and deletes orders, carts, wishlists, affiliate records, products, categories, users, and related data.

## Required manifest contract

Create a versioned reviewed manifest rather than parsing the Markdown source at runtime. Each candidate needs:

- Immutable seed `sourceId` and manifest version/hash
- Canonical category, slug, SKU, name, short/long copy, tags, and compatibility data
- Offering kind: Aevani-owned, affiliate-only, hybrid, collection, or educational
- Currency and price semantics; never infer a retail price from sourcing ranges
- Supplier/merchant identity and verified agreement state
- Inventory/availability ownership, fulfillment region, lead time, returns, and warranty
- Compliance evidence and claim provenance
- Real primary/additional image object keys in `aevani-images`, rights source, alt text, and verification timestamp
- Customer-facing, sellable, and operational-verification states
- Managed-field ownership so reconciliation cannot overwrite unrelated editorial/admin changes

The current schema lacks several of these fields and lacks an immutable source key. Any schema change must follow the database-baseline rehearsal from the post-release hardening handoff.

## Production-safe catalog reconciler

Add distinct commands such as:

- `catalog:seed:plan`
- `catalog:seed:apply`
- `catalog:seed:verify`
- `catalog:seed:rollback`

Rename or label the existing command visibly as `db:seed:uat`; do not reuse its implementation.

### Preflight

- Default to dry-run and open a `BEGIN READ ONLY` transaction.
- Assert exact Railway project, environment, service/database identity, release commit, and expected manifest hash.
- Capture the schema/migration fingerprint without assuming source schema equals production.
- Count managed/unmanaged categories, products, files, images, and references.
- Detect duplicate slugs/SKUs/bucket paths, orphan image references, multiple main images, invalid commerce values, and conflicting unmanaged rows.
- Emit only redacted counts, stable source IDs, and create/update/deactivate/conflict summaries.

### Apply

- Run only as a manual, non-public Railway worker/job in the Aevani production environment, sourced from the reviewed Git commit.
- Use `DATABASE_URL=${{Aevani-Postgress.DATABASE_URL}}` inside Railway's private network.
- Require an explicit confirmation containing the deployment/release ID and exact manifest hash.
- Use one transaction and a transaction-scoped advisory lock.
- Upsert only rows owned by the launch-manifest namespace using immutable source IDs.
- Insert categories before children/products.
- Never delete unrelated records or cascade-delete referenced products; deactivate removed managed products.
- Confirm each image exists in `aevani-images`, then upsert the `file`/`product_image` relationship and enforce exactly one primary image.
- Keep all new products inactive unless their full catalog-truth evidence is verified.

### Postflight

- Recompute manifest/database hashes and expected counts.
- Assert canonical slug/SKU/source-ID uniqueness and zero orphan/multiple-primary images.
- Assert no negative price/stock/reserved values and no sellable record with missing evidence.
- HEAD-check public image delivery without logging credentials.
- Keep the public catalog gate closed until selected records satisfy the reviewed operational contract.
- Save a bounded audit result containing release ID, manifest hash, counts, and non-secret conflicts.

### Rollback

- Persist a seed-run ledger with pre-images/change hashes.
- Reject rollback when managed rows changed after the seed run.
- Restore prior values and activation states; delete newly created rows only when unreferenced.
- Maintain a production backup/restore handle as the final recovery boundary.

Do not put catalog reconciliation in the web service start command or an automatic predeploy hook.

## Grade-A feature: Shoppable Grow Plans

Plan one bounded empowerment/conversion feature after the P0 marketplace contracts are working: four editorial, outcome-led grow plans.

- Countertop Hydroponics
- 10-Day Microgreens
- Pollinator Patch
- Soil Renewal / Composting

Each plan explains outcome, experience level, space, setup time, required versus optional items, compatibility, and next steps. Owned products use a single server-owned add-required-items cart mutation. Affiliate items use clearly labeled, disclosed, attributable outbound actions and never imply a shared checkout.

Dependencies: verified catalog/media, canonical URLs/PDPs, cart/checkout, auth/guest continuity, plan-aware affiliate attribution, and verified claims. Ship no quiz engine, AI recommender, supplier portal, community feed, LMS, subscription, or multi-vendor checkout in the MVP.

Specify and model the feature now; activate it after the catalog, authentication, cart, checkout, and attribution P0 gates pass.

## Final release gate

1. Run one integrated hardening sweep after all implementation changes.
2. Query production read-only for schema fingerprint, expected managed products, unique slugs/SKUs, evidence states, image links, and plan completeness.
3. Run the production catalog plan/diff.
4. Apply only the reviewed idempotent command with exact manifest/release confirmation.
5. Re-query and compare expected versus actual manifest state.
6. Push through Git-based CI and require the main build to succeed.
7. Monitor Railway to terminal `SUCCESS`.
8. Verify health, real images, marketplace/PDP, login/register, guest/auth cart, checkout, order access, affiliate attribution, and Grow Plan behavior in production.
9. Roll back or disable affected capabilities if any gate fails.
