# Specification: Discovery & Trust

## Overview

Raise conversion rate by replacing mock/static product pages with real data-driven category browsing, advanced filtering and search, certification badges, stock indicators, environmental impact displays, and provenance information. This track transforms the existing product catalog from a presentational shell into a fully functional discovery experience that builds buyer trust.

## Background

The Aevani storefront currently has:
- Four hardcoded category routes (`/products/hydroponics`, `/products/aquaponics`, `/products/silvopasture`, `/products/agroforestry`) with basic product grids using mock data
- A `ProductService` with `getProducts` (filtering by categoryId, search via ILIKE, featured, sort by name/price/created) and `getProductBySlug`
- An existing `Breadcrumbs.svelte` component in `src/lib/components/navigation/`
- A mock detail page at `/products/mock-detail` with hardcoded images and features
- Product images served via GCS through `FileService.generatePublicUrl`
- A `productCategory` loader in `src/lib/loaders/productCategory.ts`
- No schema support for certifications, environmental impact, provenance, or low-stock thresholds

This track must extend the schema, upgrade the search infrastructure to PostgreSQL full-text search, build reusable product card and filter components, and wire everything end-to-end with real data.

## Functional Requirements

### FR-1: Dynamic Category Pages with Real Data
**Description:** Replace hardcoded category pages with a single dynamic route that loads real products from the database via tRPC, with cursor-based or offset pagination.
**Acceptance Criteria:**
- Route `/products/[category]` resolves to a dynamic page loading products by category slug
- Products display with real images from GCS file storage (main image via `productImage` + `file` join)
- Pagination controls appear when product count exceeds page size (default 20)
- Page URL reflects current page/offset via query parameters (`?page=2`)
- Total product count is returned alongside results for pagination math
- Empty state shown when category has no products
- 404 returned for invalid category slugs
**Priority:** P0

### FR-2: Product Filtering
**Description:** Allow users to narrow product listings by price range, in-stock status, and featured/new designation.
**Acceptance Criteria:**
- Price range filter with min/max inputs, applied via query parameters
- In-stock toggle filters to products with `stockQuantity > 0`
- Featured filter shows only `isFeatured = true` products
- "New" filter shows products created within the last 30 days
- Filters combine with AND logic
- Active filters displayed as removable chips/badges
- Filter state persisted in URL query parameters for shareability
- Filters work on both `/products` (all products) and `/products/[category]` pages
**Priority:** P0

### FR-3: Full-Text Product Search
**Description:** Implement PostgreSQL full-text search across product name, description, and tags with ranked results.
**Acceptance Criteria:**
- Search uses `tsvector`/`tsquery` with English language configuration
- Search indexes product `name` (weight A), `tags` (weight B), and `description` (weight C)
- Results ranked by relevance using `ts_rank`
- Search input on `/products` page with instant feedback (debounced, minimum 2 characters)
- Search query reflected in URL (`?search=...`) for shareability
- Search highlights matching terms in results (optional, nice-to-have)
- Handles special characters and partial matches gracefully
- Migration adds a generated `tsvector` column and GIN index to the `product` table
**Priority:** P0

### FR-4: Product Sorting
**Description:** Allow users to sort product listings by various criteria.
**Acceptance Criteria:**
- Sort options: Price (Low to High), Price (High to Low), Newest First, Featured, Name (A-Z), Name (Z-A)
- Sort selection persisted in URL query parameter (`?sort=price_asc`)
- Default sort is "Featured" on category pages, "Newest" on search results
- Sort combines with active filters
**Priority:** P0

### FR-5: Certification Badge System
**Description:** Display sustainability and quality certification badges on product cards and detail pages.
**Acceptance Criteria:**
- New `certification` table with fields: id, name, slug, description, iconUrl, color, sortOrder, isActive
- New `productCertification` junction table linking products to certifications
- Pre-seeded certifications: Organic, Fair Trade, Non-GMO, Water-Efficient, Carbon-Neutral, Locally Sourced
- Badges render as small colored icons/labels on product cards (max 3 visible, "+N more" overflow)
- Full certification list displayed on product detail page with descriptions
- Admin can assign/remove certifications from products (admin procedure in tRPC router)
- Badge component is reusable (`CertificationBadge.svelte`)
**Priority:** P1

### FR-6: Stock Status Indicators
**Description:** Show real-time stock availability on product cards and detail pages.
**Acceptance Criteria:**
- Three stock states: In Stock (green), Low Stock (amber, with "Only X left" message), Out of Stock (red)
- New `lowStockThreshold` column on `product` table (integer, default 10)
- Low stock defined as `0 < stockQuantity <= lowStockThreshold`
- Out of stock products show disabled "Add to Cart" button on detail page
- Stock indicator component is reusable (`StockIndicator.svelte`)
- Stock status visible on both product cards and product detail pages
**Priority:** P1

### FR-7: Shop by System Navigation
**Description:** Provide primary navigation for the four sustainable agriculture systems.
**Acceptance Criteria:**
- Navigation section on `/products` page with visual cards for each system (Hydroponics, Aquaponics, Silvopasture, Agroforestry)
- Each card links to `/products/[category]`
- Navigation is data-driven from `productCategory` table (not hardcoded)
- Category cards show product count per category
- Visual hierarchy: prominent placement above product grid on the main products page
**Priority:** P1

### FR-8: Breadcrumb Navigation
**Description:** Display contextual breadcrumb navigation on category and product detail pages.
**Acceptance Criteria:**
- Breadcrumbs on category pages: Home > Products > [Category Name]
- Breadcrumbs on product detail pages: Home > Products > [Category Name] > [Product Name]
- Uses the existing `Breadcrumbs.svelte` component
- Breadcrumb data derived from route parameters and loaded product/category data
- Supports nested categories via `parentId` (if parent category exists, include it in trail)
**Priority:** P1

### FR-9: Environmental Impact Indicators
**Description:** Display per-product environmental impact data as visual cards.
**Acceptance Criteria:**
- New columns on `product` table: `waterSavedLiters` (integer, nullable), `co2ReductionKg` (numeric, nullable), `environmentalNotes` (text, nullable)
- Impact cards displayed on product detail page when data is present
- Visual presentation: icon + numeric value + unit label (e.g., water drop icon, "50L water saved/year")
- Impact data editable via admin product form
- Graceful handling when no impact data is set (cards simply not rendered)
**Priority:** P2

### FR-10: Product Provenance/Origin
**Description:** Display sourcing and origin information on product detail pages.
**Acceptance Criteria:**
- New columns on `product` table: `originRegion` (text, nullable), `originFarm` (text, nullable), `provenanceDescription` (text, nullable)
- Provenance section on product detail page: "Sourced from [region/farm]"
- Only displayed when at least one provenance field is populated
- Editable via admin product form
**Priority:** P2

### FR-11: Product Detail Page with Real Data
**Description:** Replace the mock detail page with a real product detail page loading data from the database.
**Acceptance Criteria:**
- Route `/products/[category]/[slug]` loads real product data via `getProductBySlug`
- Image gallery uses real product images from GCS (ordered by `sortOrder`, main image first)
- Displays: name, price, compare price (with strikethrough), description, SKU, category badge
- Stock indicator component integrated
- Certification badges displayed
- Environmental impact cards displayed (when data present)
- Provenance section displayed (when data present)
- Related products section loads other products from the same category
- SEO meta tags from `metaTitle` and `metaDescription` fields
- Quantity selector respects stock limits
**Priority:** P0

### FR-12: Product Comparison (Optional)
**Description:** Allow users to compare 2-3 products side by side.
**Acceptance Criteria:**
- "Compare" checkbox/button on product cards
- Comparison tray/bar at bottom of page showing selected products (max 3)
- Comparison page/modal showing products in columns with rows for: price, stock, certifications, environmental impact, category
- Clear all / remove individual items from comparison
- Comparison state managed in client-side store (not persisted to server)
**Priority:** P3 (Nice to have)

## Non-Functional Requirements

### NFR-1: Performance
- Category page loads in under 2 seconds with 100+ products
- Full-text search returns results in under 500ms
- Pagination queries use proper LIMIT/OFFSET with indexed columns
- Product images lazy-loaded below the fold
- GIN index on `tsvector` column for search performance

### NFR-2: SEO
- Dynamic meta tags (`<title>`, `<meta description>`) on category and product pages
- Breadcrumb structured data (JSON-LD) for search engines
- Clean, descriptive URLs (`/products/hydroponics/grow-light-panel`)

### NFR-3: Accessibility
- Filter controls have proper ARIA labels
- Stock indicators use both color and text (not color-only)
- Certification badges have alt text
- Keyboard-navigable filter and sort controls

### NFR-4: Responsiveness
- Product grid: 1 column on mobile, 2 on tablet, 3-4 on desktop
- Filter panel collapses to a drawer/modal on mobile
- Breadcrumbs horizontally scrollable on narrow screens (already supported by existing component)

## User Stories

### US-1: Browse by Category
**As a** hobbyist gardener,
**I want to** browse products within a specific sustainable agriculture system,
**So that** I can find relevant products for my setup.

**Given** the user navigates to `/products/hydroponics`
**When** the page loads
**Then** they see a grid of hydroponics products with real images, prices, and stock status
**And** pagination controls if more than 20 products exist

### US-2: Filter Products
**As a** price-conscious shopper,
**I want to** filter products by price range and availability,
**So that** I only see products I can afford and that are in stock.

**Given** the user is on a category page
**When** they set a price range of $10-$50 and toggle "In Stock Only"
**Then** only products priced between $10-$50 with stock > 0 are displayed
**And** the URL updates to reflect the active filters

### US-3: Search for Products
**As a** returning customer,
**I want to** search for a specific product by name or keyword,
**So that** I can find it quickly without browsing categories.

**Given** the user types "LED grow light" in the search bar
**When** results load
**Then** products matching "LED grow light" appear ranked by relevance
**And** the search works across product names, descriptions, and tags

### US-4: Trust Certification Badges
**As a** sustainability-conscious buyer,
**I want to** see certification badges on products,
**So that** I can trust the product meets certain environmental or ethical standards.

**Given** a product has "Organic" and "Fair Trade" certifications assigned
**When** the user views the product card or detail page
**Then** they see the corresponding badge icons with labels

### US-5: Check Stock Before Buying
**As a** customer ready to purchase,
**I want to** see clear stock availability,
**So that** I know if the product is available before adding it to my cart.

**Given** a product has 3 units remaining and a low-stock threshold of 10
**When** the user views the product
**Then** they see an amber "Low Stock - Only 3 left" indicator

### US-6: Understand Environmental Impact
**As an** environmentally motivated buyer,
**I want to** see the environmental impact of a product,
**So that** I can make informed purchasing decisions aligned with my values.

**Given** a product has `waterSavedLiters: 50` and `co2ReductionKg: 2.5`
**When** the user views the product detail page
**Then** they see visual impact cards showing "50L water saved/year" and "2.5kg CO2 reduced"

## Technical Considerations

### Schema Changes (Migration Required)
1. Add to `product` table: `lowStockThreshold` (integer, default 10), `waterSavedLiters` (integer, nullable), `co2ReductionKg` (numeric, nullable), `environmentalNotes` (text, nullable), `originRegion` (text, nullable), `originFarm` (text, nullable), `provenanceDescription` (text, nullable), `searchVector` (tsvector, generated)
2. New table: `certification` (id, name, slug, description, iconUrl, color, sortOrder, isActive, createdAt, updatedAt)
3. New table: `productCertification` (productId, certificationId, assignedAt) with composite primary key
4. GIN index on `product.searchVector`
5. Trigger or generated column to keep `searchVector` in sync with name/description/tags

### Existing Code to Modify
- `ProductService.getProducts` -- add price range filter, in-stock filter, "new" filter, full-text search, total count
- `productsRouter` -- extend `getProducts` input schema, add certification CRUD procedures
- Category page routes -- consolidate into dynamic `[category]` route
- Product detail route -- build real `[category]/[slug]` route replacing mock-detail
- `productCategory` loader -- add product count per category

### New Components
- `ProductCard.svelte` -- reusable product card with image, price, badges, stock indicator
- `ProductFilters.svelte` -- filter panel with price range, stock, featured, new
- `ProductSort.svelte` -- sort dropdown
- `CertificationBadge.svelte` -- individual certification badge
- `CertificationBadgeGroup.svelte` -- group of badges with overflow
- `StockIndicator.svelte` -- stock status display
- `EnvironmentalImpact.svelte` -- impact data cards
- `ProvenanceInfo.svelte` -- origin/provenance display
- `Pagination.svelte` -- page navigation controls
- `ProductComparison.svelte` -- comparison tray and table (Phase 5, optional)

## Out of Scope

- Product reviews and ratings (Track 7: growth-features)
- Admin UI for managing certifications (basic tRPC procedures only; full admin UI deferred)
- AI-powered product recommendations
- Wishlist / save for later functionality
- Product variant support (size, color)
- Inventory webhooks or real-time stock updates
- Search analytics / search suggestions / autocomplete

## Open Questions

1. Should the "New" filter duration (currently 30 days) be configurable by admin, or is 30 days a fixed business rule?
2. Are there specific icon assets for each certification, or should the system use generic SVG icons initially?
3. Should environmental impact units be standardized (always per year), or should each product specify its own time frame?
4. When Track 1 (transaction-core) ships cart functionality, should out-of-stock products hide the "Add to Cart" button entirely, or show it disabled with a "Notify Me" option?
