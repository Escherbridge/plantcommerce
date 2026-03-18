# Implementation Plan: Discovery & Trust

## Overview

This plan is organized into 5 phases, progressing from schema foundations through core browsing, search, trust signals, and an optional comparison feature. Each phase builds on the previous one and ends with a verification checkpoint. Total estimated effort: 8-12 working days.

**Dependency note:** This track assumes Track 1 (transaction-core) has wired basic tRPC product queries to real DB data. If that is not yet complete, Phase 1 of this track can proceed independently since it focuses on schema extensions and new service methods.

---

## Phase 1: Schema Extensions & Search Infrastructure
**Goal:** Extend the database schema with all new columns and tables, set up PostgreSQL full-text search, and seed certification data.

### Task 1.1: Add product discovery columns migration
- [ ] Write test: Integration test that verifies `lowStockThreshold`, `waterSavedLiters`, `co2ReductionKg`, `environmentalNotes`, `originRegion`, `originFarm`, `provenanceDescription` columns exist on the `product` table and accept correct data types
- [ ] Implement: Add columns to `product` table in `src/lib/server/db/schema.ts`, generate and run Drizzle migration
- [ ] Verify: Migration applies cleanly, existing product data unaffected, new columns default correctly (lowStockThreshold=10, others nullable)

### Task 1.2: Create certification tables
- [ ] Write test: Integration test that verifies `certification` and `productCertification` tables exist, enforce foreign keys, and support composite primary key on the junction table
- [ ] Implement: Add `certification` table (id, name, slug, description, iconUrl, color, sortOrder, isActive, createdAt, updatedAt) and `productCertification` junction table (productId, certificationId, assignedAt) to schema, generate migration
- [ ] Verify: Tables created, foreign key constraints work (cannot insert productCertification with invalid productId or certificationId)

### Task 1.3: Seed default certifications
- [ ] Write test: Integration test that verifies 6 default certifications exist after seeding (Organic, Fair Trade, Non-GMO, Water-Efficient, Carbon-Neutral, Locally Sourced)
- [ ] Implement: Create seed script or migration that inserts default certifications with appropriate slugs, colors, and sort orders
- [ ] Verify: Seed is idempotent (running twice does not duplicate records)

### Task 1.4: Add full-text search vector column and GIN index
- [ ] Write test: Integration test that inserts a product with name "Hydroponic LED Grow Light", description containing "energy efficient lighting", tags ["led", "grow-light"], and verifies a `tsquery` for "hydroponic" matches, "unrelated" does not match, and results are ranked
- [ ] Implement: Add `searchVector` generated tsvector column to `product` table using `setweight` (name=A, tags=B, description=C), add GIN index, generate migration. Use a SQL-level generated column or trigger to keep it in sync
- [ ] Verify: Index exists (check via `pg_indexes`), vector updates when product name/description/tags change

### Task 1.5: Verification checkpoint
- [ ] Verification: Run all migrations on a clean database, confirm schema matches expectations, run `npm run check` for type safety, verify no regressions in existing tests [checkpoint marker]

---

## Phase 2: Core Product Browsing & Filtering
**Goal:** Build the data layer and UI for dynamic category pages, filtering, sorting, and pagination with real product data.

### Task 2.1: Extend ProductService with total count and advanced filters
- [ ] Write test: Unit tests for `ProductService.getProducts` verifying: (a) returns `{ products, total }` shape, (b) price range filter works (min/max), (c) in-stock filter excludes stockQuantity=0, (d) "new" filter returns only products created within 30 days, (e) total count is accurate regardless of limit/offset
- [ ] Implement: Modify `ProductService.getProducts` to accept `minPrice`, `maxPrice`, `inStock`, `isNew` filters, return `{ products, total }` with a parallel count query. Add `sql` import from drizzle-orm for raw expressions where needed
- [ ] Verify: All filter combinations produce correct results, total count is independent of pagination

### Task 2.2: Extend ProductService with full-text search
- [ ] Write test: Unit tests verifying: (a) search for "hydroponic" finds products with that word in name, (b) search for "energy efficient" finds products with those words in description, (c) results are ordered by relevance rank, (d) empty search returns unfiltered results, (e) special characters are handled safely
- [ ] Implement: Replace `ILIKE` search in `getProducts` with `to_tsquery` against `searchVector` column, use `ts_rank` for ordering when search is active, fall back to normal sort when no search term
- [ ] Verify: Search returns ranked results, combines with other filters correctly

### Task 2.3: Extend ProductService to return product images and category counts
- [ ] Write test: Unit tests verifying: (a) `getProducts` includes main image URL for each product, (b) `getCategoriesWithCount` returns each category with its active product count
- [ ] Implement: Join `productImage` and `file` tables in `getProducts` to include main image URL. Add `getCategoriesWithCount` method that counts active products per category
- [ ] Verify: Products without images return null for image URL, categories with zero products return count of 0

### Task 2.4: Update tRPC products router
- [ ] Write test: Integration tests for the `getProducts` procedure verifying: (a) new input fields (`minPrice`, `maxPrice`, `inStock`, `isNew`, `search`) are accepted, (b) response includes `total` field, (c) invalid inputs rejected by Zod validation
- [ ] Implement: Update `getProducts` input schema in `src/lib/server/api/products.ts` to accept new filter/sort parameters, update response shape. Add `getCategoriesWithCount` procedure
- [ ] Verify: tRPC type inference works end-to-end, existing callers still compatible

### Task 2.5: Build Pagination component
- [ ] Write test: Component test for `Pagination.svelte` verifying: (a) renders correct number of page buttons, (b) highlights current page, (c) disables prev on first page and next on last page, (d) emits page change events, (e) handles edge cases (1 page = no pagination shown)
- [ ] Implement: Create `src/lib/components/ui/Pagination.svelte` accepting `currentPage`, `totalPages`, `onPageChange` props. Use DaisyUI `join` button group styling
- [ ] Verify: Visual review in Storybook or dev server

### Task 2.6: Build ProductCard component
- [ ] Write test: Component test for `ProductCard.svelte` verifying: (a) renders product name, price, image, (b) shows compare price with strikethrough when present, (c) links to correct `/products/[category]/[slug]` URL, (d) shows placeholder when no image
- [ ] Implement: Create `src/lib/components/ui/ProductCard.svelte` extracting card markup from existing `/products/+page.svelte`. Accept typed product prop. Use `OptimizedImage` component for product image
- [ ] Verify: Card renders correctly with various data shapes (with/without image, with/without compare price)

### Task 2.7: Build ProductFilters component
- [ ] Write test: Component test for `ProductFilters.svelte` verifying: (a) price range inputs update state, (b) in-stock toggle works, (c) featured toggle works, (d) "new" toggle works, (e) active filters shown as removable chips, (f) "Clear All" resets all filters
- [ ] Implement: Create `src/lib/components/ui/ProductFilters.svelte` with price range (min/max number inputs), toggle switches for in-stock/featured/new, active filter chips. Emits filter change events. Collapses to drawer on mobile
- [ ] Verify: Filter state syncs with URL query parameters

### Task 2.8: Build ProductSort component
- [ ] Write test: Component test for `ProductSort.svelte` verifying: (a) renders all sort options, (b) shows current selection, (c) emits sort change event with correct value
- [ ] Implement: Create `src/lib/components/ui/ProductSort.svelte` as a DaisyUI select dropdown with options: Price Low-High, Price High-Low, Newest, Featured, Name A-Z, Name Z-A
- [ ] Verify: Sort selection reflected in UI and emitted correctly

### Task 2.9: Build dynamic category page
- [ ] Write test: Integration/page test verifying: (a) `/products/hydroponics` loads real products from DB, (b) pagination works with query param `?page=2`, (c) filters apply via query params, (d) sort applies via query param, (e) 404 for invalid category slug, (f) breadcrumbs show correct trail
- [ ] Implement: Create `src/routes/products/[category]/+page.svelte` and `+page.ts` (or `+page.server.ts`). Load products via tRPC `getProducts` with category filter. Wire up `ProductCard`, `ProductFilters`, `ProductSort`, `Pagination`, and `Breadcrumbs` components. Remove or redirect old hardcoded category routes
- [ ] Verify: Navigate to each category, verify real data loads, filters/sort/pagination all functional

### Task 2.10: Update all-products page
- [ ] Write test: Page test verifying: (a) `/products` loads all products with pagination, (b) category cards show real counts, (c) search/filter/sort all work, (d) links point to correct dynamic category URLs
- [ ] Implement: Update `src/routes/products/+page.svelte` and its loader to use new `getProducts` (with total) and `getCategoriesWithCount`. Replace mock-detail links with real `/products/[category]/[slug]` links. Wire up shared filter/sort/pagination components
- [ ] Verify: Full browsing flow works: land on /products, click category, filter, search, paginate, click product

### Task 2.11: Verification checkpoint
- [ ] Verification: Full browsing flow end-to-end: navigate categories, apply filters, search, sort, paginate. Run test suite, verify 70% coverage on new code, run `npm run check` [checkpoint marker]

---

## Phase 3: Product Detail Page
**Goal:** Replace the mock product detail page with a real data-driven page including image gallery, stock indicators, and breadcrumbs.

### Task 3.1: Build StockIndicator component
- [ ] Write test: Component test verifying: (a) stockQuantity > lowStockThreshold shows green "In Stock", (b) 0 < stockQuantity <= lowStockThreshold shows amber "Low Stock - Only X left", (c) stockQuantity === 0 shows red "Out of Stock", (d) uses both color and text for accessibility
- [ ] Implement: Create `src/lib/components/ui/StockIndicator.svelte` accepting `stockQuantity` and `lowStockThreshold` (default 10) props
- [ ] Verify: Visual review with all three states

### Task 3.2: Build real product detail page
- [ ] Write test: Page test verifying: (a) `/products/hydroponics/some-slug` loads real product data, (b) image gallery shows real GCS images, (c) price and compare price displayed correctly, (d) stock indicator reflects real stock, (e) quantity selector max bounded by stock, (f) breadcrumbs show Home > Products > Category > Product, (g) 404 for invalid slug, (h) SEO meta tags populated from product data
- [ ] Implement: Create `src/routes/products/[category]/[slug]/+page.svelte` and `+page.ts`. Load product via tRPC `getProduct`. Build image gallery using existing `Carousel` component with real product images. Integrate `StockIndicator`. Wire breadcrumbs. Add SEO head tags. Add related products section (same category, exclude current product)
- [ ] Verify: Navigate to a real product, verify all sections render with real data

### Task 3.3: Build related products section
- [ ] Write test: Unit test for a new `ProductService.getRelatedProducts(productId, categoryId, limit)` method verifying: (a) returns products from same category excluding the given product, (b) respects limit, (c) only returns active products
- [ ] Implement: Add `getRelatedProducts` to `ProductService`, add tRPC procedure, integrate into product detail page
- [ ] Verify: Related products section shows relevant products, handles edge case of category with only one product

### Task 3.4: Clean up legacy mock routes
- [ ] Write test: Verify old routes (`/products/mock-detail`) redirect or 404 appropriately
- [ ] Implement: Remove `/products/mock-detail` route. Update any internal links pointing to mock-detail. Remove or redirect hardcoded category routes (`/products/hydroponics/+page.svelte` etc.) to the dynamic `[category]` route if they still exist
- [ ] Verify: No broken links, all product navigation uses real routes

### Task 3.5: Verification checkpoint
- [ ] Verification: Navigate to product detail pages for multiple products, verify images, stock, pricing, breadcrumbs, related products, meta tags. Run test suite [checkpoint marker]

---

## Phase 4: Trust Signals — Certifications, Impact, Provenance
**Goal:** Add certification badges, environmental impact cards, and provenance information to product cards and detail pages.

### Task 4.1: Build certification service and tRPC procedures
- [ ] Write test: Integration tests verifying: (a) `CertificationService.getAll()` returns all active certifications, (b) `assignToProduct(productId, certificationId)` creates junction record, (c) `removeFromProduct` deletes junction record, (d) `getByProduct(productId)` returns certifications for a product, (e) duplicate assignment prevented
- [ ] Implement: Create `src/lib/server/services/certification.ts` with CRUD methods. Add tRPC procedures: `getCertifications` (public), `assignCertification` (admin), `removeCertification` (admin), `getProductCertifications` (public)
- [ ] Verify: Service methods work against real database, tRPC procedures validate inputs

### Task 4.2: Integrate certifications into product queries
- [ ] Write test: Unit test verifying `ProductService.getProducts` and `getProductBySlug` include certification data in their responses
- [ ] Implement: Modify product queries to left-join `productCertification` and `certification` tables. Include certification array in product response type. Update `ProductWithImages` interface
- [ ] Verify: Products with certifications return them, products without return empty array

### Task 4.3: Build CertificationBadge and CertificationBadgeGroup components
- [ ] Write test: Component tests verifying: (a) `CertificationBadge` renders name, color, and icon, (b) `CertificationBadgeGroup` shows max 3 badges with "+N more" overflow, (c) badges have descriptive alt text/tooltips
- [ ] Implement: Create `src/lib/components/ui/CertificationBadge.svelte` and `CertificationBadgeGroup.svelte`. Use DaisyUI badge/tooltip components. Support custom colors from certification data
- [ ] Verify: Visual review with various badge counts (0, 1, 3, 6)

### Task 4.4: Build EnvironmentalImpact component
- [ ] Write test: Component test verifying: (a) renders water saved card when `waterSavedLiters` present, (b) renders CO2 card when `co2ReductionKg` present, (c) renders environmental notes when present, (d) renders nothing when all impact fields are null
- [ ] Implement: Create `src/lib/components/ui/EnvironmentalImpact.svelte` with icon + value + unit layout. Water drop icon for water, leaf/cloud icon for CO2
- [ ] Verify: Visual review with various data combinations

### Task 4.5: Build ProvenanceInfo component
- [ ] Write test: Component test verifying: (a) renders "Sourced from [region]" when originRegion set, (b) renders farm name when originFarm set, (c) renders description when provenanceDescription set, (d) renders nothing when all fields null
- [ ] Implement: Create `src/lib/components/ui/ProvenanceInfo.svelte` with map-pin icon and origin text
- [ ] Verify: Visual review with various data combinations

### Task 4.6: Integrate trust signals into ProductCard
- [ ] Write test: Component test verifying `ProductCard` renders certification badges and stock indicator
- [ ] Implement: Update `ProductCard.svelte` to accept certifications array and stock data, render `CertificationBadgeGroup` and `StockIndicator`
- [ ] Verify: Product cards on category pages show badges and stock status

### Task 4.7: Integrate trust signals into product detail page
- [ ] Write test: Page test verifying product detail page renders: (a) full certification list with descriptions, (b) environmental impact cards, (c) provenance section
- [ ] Implement: Add `CertificationBadge` list, `EnvironmentalImpact`, and `ProvenanceInfo` components to the product detail page template. Position certifications near the product title, impact cards in a dedicated section, provenance below description
- [ ] Verify: Product detail page shows all trust signals when data present, clean layout when data absent

### Task 4.8: Verification checkpoint
- [ ] Verification: Assign certifications to test products via tRPC, set environmental impact and provenance data, verify all trust signals render on cards and detail pages. Run test suite, verify coverage [checkpoint marker]

---

## Phase 5: Product Comparison (Optional)
**Goal:** Allow users to compare 2-3 products side by side. This phase is optional and should only be implemented if time allows after Phases 1-4 are complete.

### Task 5.1: Build comparison store
- [ ] Write test: Unit test for a Svelte store verifying: (a) can add product to comparison (max 3), (b) rejects adding beyond max, (c) can remove product by ID, (d) can clear all, (e) persists selected product IDs
- [ ] Implement: Create `src/lib/stores/comparison.ts` using Svelte 5 runes or a writable store. Store product IDs only, fetch full data when comparison view opens
- [ ] Verify: Store operations work correctly in isolation

### Task 5.2: Build ComparisonTray component
- [ ] Write test: Component test verifying: (a) tray appears when 1+ products selected for comparison, (b) shows product thumbnails and names, (c) "Compare" button enabled when 2+ products selected, (d) "Remove" button works per product, (e) tray hidden when empty
- [ ] Implement: Create `src/lib/components/ui/ComparisonTray.svelte` as a fixed bottom bar. Integrate with comparison store
- [ ] Verify: Tray appears/disappears correctly, does not obstruct other UI

### Task 5.3: Build ComparisonTable component
- [ ] Write test: Component test verifying: (a) renders 2-3 product columns, (b) rows include: image, name, price, stock status, certifications, environmental impact, category, (c) highlights differences between products
- [ ] Implement: Create `src/lib/components/ui/ComparisonTable.svelte` or a modal/page. Load full product data for selected IDs via tRPC. Render structured comparison table
- [ ] Verify: Visual review with 2 and 3 products of varying data completeness

### Task 5.4: Integrate comparison into product browsing
- [ ] Write test: Integration test verifying: (a) "Compare" toggle appears on product cards, (b) toggling adds/removes from comparison store, (c) ComparisonTray appears on category pages
- [ ] Implement: Add compare toggle to `ProductCard.svelte`. Mount `ComparisonTray` in the products layout. Add route or modal for full comparison view
- [ ] Verify: Full comparison flow: select products, open comparison, review, clear

### Task 5.5: Verification checkpoint
- [ ] Verification: Full comparison flow end-to-end. Run test suite, verify no regressions from Phases 1-4 [checkpoint marker]
