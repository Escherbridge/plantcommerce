# Implementation Plan: Content & SEO

## Overview

This plan is organized into 7 phases, progressing from foundational infrastructure (schema, editor, image pipeline) through public content pages, SEO layer, admin tooling, and finishing with content linking and feeds. Each phase builds on the prior one and ends with a verification checkpoint.

**Approach:** Brownfield. Significant existing code (schema, service, router, route scaffolds) will be extended rather than rewritten. TDD methodology with 70% coverage target.

**Working directory:** `plantapp/`

---

## Phase 1: Schema Extensions & Quill Editor Integration

**Goal:** Establish the database foundation for content-product linking and category editorial content, and replace the textarea fallback with a working Quill WYSIWYG editor.

### Task 1.1: Add content_product_link Table

- [ ] Write test: Verify `content_product_link` table schema exists with correct columns (contentPageId, productId, sortOrder, linkType) and constraints (composite unique on contentPageId+productId, FK references)
- [ ] Implement: Add `contentProductLink` table to `plantapp/src/lib/server/db/schema.ts` with columns: `id` (serial PK), `contentPageId` (integer FK to contentPage), `productId` (integer FK to product), `sortOrder` (integer default 0), `linkType` (text enum: featured/related/mentioned), `createdAt` timestamp. Add relations to `contentPageRelations` and `productRelations`. Export `ContentProductLink` type.
- [ ] Generate migration: Run `npm run db:generate` to create migration SQL
- [ ] Verify: Migration file is generated, schema compiles without TypeScript errors

### Task 1.2: Extend productCategory with Editorial Fields

- [ ] Write test: Verify `productCategory` table has `editorialContent`, `editorialImageFileId`, and `editorialContentPageId` columns
- [ ] Implement: Add three columns to the `productCategory` table in schema.ts: `editorialContent` (text, nullable), `editorialImageFileId` (text, nullable), `editorialContentPageId` (integer, nullable, FK to contentPage). Update `productCategoryRelations` to include the content page relation.
- [ ] Generate migration: Run `npm run db:generate`
- [ ] Verify: Schema compiles, migration generated

### Task 1.3: Install and Integrate Quill Editor

- [ ] Install dependencies: `npm install quill` and `npm install dompurify @types/dompurify`
- [ ] Write test: Component test that Quill editor mounts, renders toolbar, and emits content changes
- [ ] Implement: Rewrite `plantapp/src/lib/components/forms/RichTextEditor.svelte` to properly load Quill, configure toolbar (headings h1-h3, bold, italic, underline, strike, ordered list, bullet list, blockquote, code block, link, image, clean), handle content input/output as HTML, and support initial value loading
- [ ] Implement: Add Quill CSS import and custom styling to match DaisyUI theme
- [ ] Verify: Editor renders in browser, typing produces HTML output, existing content loads correctly

### Task 1.4: HTML Content Sanitization Utility

- [ ] Write test: Unit test for `sanitizeHtml()` -- strips script tags, onerror attributes, javascript: URLs while preserving safe HTML (headings, lists, links, images, formatting)
- [ ] Implement: Create `plantapp/src/lib/utils/sanitize.ts` exporting `sanitizeHtml(html: string): string` using DOMPurify (with server-side fallback using jsdom or a simple regex strip for SSR)
- [ ] Write test: Unit test for `renderContentHtml()` that sanitizes and wraps in prose container class
- [ ] Implement: Create `plantapp/src/lib/utils/content-renderer.ts` for content rendering helpers
- [ ] Verify: All tests pass, utility handles edge cases (empty string, null, malformed HTML)

### Task 1.5: Phase 1 Verification

- [ ] Run `npm run db:push` to apply schema changes to dev database
- [ ] Run `npm run check` -- no TypeScript errors
- [ ] Run Vitest -- all new and existing tests pass
- [ ] Manually verify Quill editor loads on a test page
- [ ] Verify: Coverage meets 70% for new code [checkpoint marker]

---

## Phase 2: Content Service & Router Extensions

**Goal:** Extend the existing ContentService and contentRouter with new capabilities: content-product linking, tag queries, pagination counts, and FAQ category support.

### Task 2.1: ContentService -- Content-Product Link Methods

- [ ] Write test: `ContentService.linkProduct(contentPageId, productId, linkType)` creates a link record; duplicate link throws error
- [ ] Write test: `ContentService.unlinkProduct(contentPageId, productId)` removes a link record
- [ ] Write test: `ContentService.getLinkedProducts(contentPageId)` returns products linked to a content page, sorted by sortOrder
- [ ] Write test: `ContentService.getLinkedContent(productId)` returns content pages linked to a product
- [ ] Implement: Add all four methods to `plantapp/src/lib/server/services/content.ts`
- [ ] Verify: All tests pass

### Task 2.2: ContentService -- Tag and Related Content Methods

- [ ] Write test: `ContentService.getAllTags()` returns distinct tags across all published content, with count per tag
- [ ] Write test: `ContentService.getRelatedContent(contentPageId, limit)` returns published content sharing tags with the given page, excluding itself
- [ ] Write test: `ContentService.getPublishedPages()` returns total count alongside results for pagination
- [ ] Implement: Add methods to ContentService. Update `getPublishedPages` to return `{ items, totalCount }` shape. Add `getContentByTag(tag, type?, limit?, offset?)` method.
- [ ] Verify: All tests pass

### Task 2.3: ContentService -- FAQ Category Support

- [ ] Write test: `ContentService.getPublishedFaqs(category?)` returns FAQ entries filtered by first tag as category
- [ ] Write test: `ContentService.getFaqCategories()` returns distinct first-tag values from published FAQ entries
- [ ] Implement: Add FAQ-specific query methods to ContentService
- [ ] Verify: All tests pass

### Task 2.4: Content Router Extensions

- [ ] Write test: `contentRouter.getLinkedProducts` procedure returns products for a content page (public)
- [ ] Write test: `contentRouter.getLinkedContent` procedure returns content for a product (public)
- [ ] Write test: `contentRouter.linkProduct` procedure (admin) creates a content-product link
- [ ] Write test: `contentRouter.unlinkProduct` procedure (admin) removes a content-product link
- [ ] Write test: `contentRouter.getTags` procedure returns all tags with counts (public)
- [ ] Write test: `contentRouter.getRelatedContent` procedure returns related content (public)
- [ ] Write test: `contentRouter.getFaqs` procedure returns categorized FAQs (public)
- [ ] Implement: Add all new procedures to `plantapp/src/lib/server/api/content.ts` with Zod input validation
- [ ] Verify: All tests pass, no TypeScript errors

### Task 2.5: Phase 2 Verification

- [ ] Run full test suite -- all tests pass
- [ ] Run `npm run check` -- no TypeScript errors
- [ ] Manually test new procedures via tRPC panel or direct API calls
- [ ] Verify: Coverage meets 70% for changed service and router code [checkpoint marker]

---

## Phase 3: Public Content Pages

**Goal:** Wire all public content routes (`/blog`, `/blog/[slug]`, `/guides`, `/guides/[slug]`, `/faq`) to real database data with proper rendering, pagination, and content display.

### Task 3.1: Blog Listing Page (`/blog`)

- [ ] Write test: Blog page loader fetches published blog posts via tRPC
- [ ] Implement: Create/update `plantapp/src/routes/blog/+page.ts` loader to call `content.getPublishedPages({ type: 'blog_post' })` with pagination and tag filter from URL params
- [ ] Implement: Update `plantapp/src/routes/blog/+page.svelte` to render blog cards from real data with pagination controls, tag filtering, reading time estimate, and featured images
- [ ] Implement: Add pagination component (or reuse existing) with page numbers and prev/next
- [ ] Verify: Blog page displays real content from database, pagination works, tag filtering works

### Task 3.2: Blog Detail Page (`/blog/[slug]`)

- [ ] Write test: Blog detail loader fetches a single published blog post by slug; 404 on missing
- [ ] Implement: Create `plantapp/src/routes/blog/[slug]/+page.ts` loader
- [ ] Implement: Create `plantapp/src/routes/blog/[slug]/+page.svelte` with: featured image, title, author, date, reading time, sanitized HTML content in `prose` container, tag badges, related posts section (via `getRelatedContent`)
- [ ] Verify: Blog detail page renders content correctly, related posts appear

### Task 3.3: Guides Listing Page (`/guides`)

- [ ] Write test: Guides page loader fetches published guides with category filter
- [ ] Implement: Update `plantapp/src/routes/guides/+page.ts` loader to call `content.getPublishedPages({ type: 'guide' })` with category filter
- [ ] Implement: Update `plantapp/src/routes/guides/+page.svelte` to render guides from real data, organized by system type categories, with tag filtering
- [ ] Verify: Guides page displays real content, category filtering works

### Task 3.4: Guide Detail Page (`/guides/[slug]`)

- [ ] Write test: Guide detail loader fetches guide by slug and its linked products
- [ ] Implement: Create `plantapp/src/routes/guides/[slug]/+page.ts` loader
- [ ] Implement: Create `plantapp/src/routes/guides/[slug]/+page.svelte` with: title, author, content rendered in `prose` container, auto-generated table of contents (parse headings from HTML), related guides, and "Recommended Products" section showing linked products
- [ ] Implement: Create `TableOfContents.svelte` component that extracts h2/h3 from rendered content and generates anchor links
- [ ] Verify: Guide detail page renders, TOC works, linked products displayed

### Task 3.5: FAQ Page (`/faq`)

- [ ] Write test: FAQ page loader fetches published FAQ entries with category filter
- [ ] Implement: Update `plantapp/src/routes/faq/+page.ts` loader to call FAQ-specific procedures
- [ ] Implement: Update `plantapp/src/routes/faq/+page.svelte` to render real FAQ data with category tabs, accordion display, and keyword search (client-side filtering)
- [ ] Verify: FAQ page displays real data, category tabs work, search filters questions

### Task 3.6: Tag Listing Page (`/tags/[tag]`)

- [ ] Write test: Tag page loader fetches content filtered by tag
- [ ] Implement: Create `plantapp/src/routes/tags/[tag]/+page.ts` and `+page.svelte` showing all content with the given tag, with type tabs (blog, guide, all)
- [ ] Verify: Tag page displays filtered content

### Task 3.7: Phase 3 Verification

- [ ] All public content routes render with real data
- [ ] Navigation between listing and detail pages works
- [ ] Tag links navigate correctly
- [ ] HTML content from Quill renders safely in prose containers
- [ ] Run `npm run check` and full test suite
- [ ] Verify: Coverage meets 70% for page components and loaders [checkpoint marker]

---

## Phase 4: SEO Infrastructure

**Goal:** Add meta tags, sitemap, structured data (JSON-LD), robots.txt, and RSS feed across all public pages.

### Task 4.1: SeoHead Component

- [ ] Write test: `SeoHead.svelte` renders correct title, meta description, canonical, OG tags, and Twitter Card tags from props
- [ ] Implement: Create `plantapp/src/lib/components/seo/SeoHead.svelte` accepting props: `title`, `description`, `canonicalUrl`, `ogImage`, `ogType` (default "website"), `twitterCard` (default "summary_large_image"), `noindex` (boolean). Component renders `<svelte:head>` with all meta tags. Site name: "Aevani".
- [ ] Implement: Add `SeoHead` to all public pages: homepage, `/blog`, `/blog/[slug]`, `/guides`, `/guides/[slug]`, `/faq`, product pages, category pages
- [ ] Verify: View page source on each page confirms correct meta tags

### Task 4.2: JsonLd Component and Structured Data

- [ ] Write test: `JsonLd.svelte` renders a valid `<script type="application/ld+json">` tag with provided data
- [ ] Implement: Create `plantapp/src/lib/components/seo/JsonLd.svelte` accepting a `data` prop (object) and rendering it as JSON-LD in `<svelte:head>`
- [ ] Implement: Create `plantapp/src/lib/utils/structured-data.ts` with builder functions:
  - `buildProductSchema(product)` -- returns Product JSON-LD
  - `buildArticleSchema(post, author)` -- returns Article JSON-LD
  - `buildFaqPageSchema(faqs)` -- returns FAQPage JSON-LD
  - `buildBreadcrumbSchema(items)` -- returns BreadcrumbList JSON-LD
  - `buildOrganizationSchema()` -- returns Organization JSON-LD for Aevani
- [ ] Write test: Each builder function produces valid JSON-LD matching schema.org specifications
- [ ] Implement: Add JsonLd to blog detail, guide detail, FAQ page, product pages
- [ ] Verify: Google Rich Results Test validates structured data on key pages

### Task 4.3: Dynamic Sitemap Generation

- [ ] Write test: Sitemap endpoint returns valid XML with correct structure
- [ ] Write test: Sitemap includes published content pages, active products, active categories
- [ ] Implement: Create `plantapp/src/routes/sitemap.xml/+server.ts` that queries all published content, active products, and active categories, generates XML sitemap with loc, lastmod, changefreq, priority
- [ ] Implement: Set response headers: `Content-Type: application/xml`, `Cache-Control: public, max-age=3600`
- [ ] Verify: `/sitemap.xml` returns valid XML, includes all expected URLs

### Task 4.4: Robots.txt

- [ ] Implement: Create `plantapp/src/routes/robots.txt/+server.ts` returning robots.txt content with `Sitemap: https://aevani.com/sitemap.xml`, allow all crawlers, disallow `/admin/` and `/api/`
- [ ] Verify: `/robots.txt` returns correct content

### Task 4.5: RSS Feed

- [ ] Write test: RSS endpoint returns valid RSS 2.0 XML with blog posts
- [ ] Implement: Create `plantapp/src/routes/rss.xml/+server.ts` that queries 20 most recent published blog posts and generates RSS 2.0 feed with channel metadata and item entries
- [ ] Implement: Add `<link rel="alternate" type="application/rss+xml" title="Aevani Blog" href="/rss.xml">` to blog pages via SeoHead or directly
- [ ] Verify: RSS feed validates, contains correct blog post data

### Task 4.6: Breadcrumb Navigation Component

- [ ] Write test: `Breadcrumbs.svelte` renders correct breadcrumb trail from props
- [ ] Implement: Create `plantapp/src/lib/components/seo/Breadcrumbs.svelte` accepting `items: Array<{ label: string, href?: string }>` and rendering accessible breadcrumb nav with BreadcrumbList JSON-LD
- [ ] Implement: Add breadcrumbs to blog detail, guide detail, product detail, category pages
- [ ] Verify: Breadcrumbs render correctly, JSON-LD is valid

### Task 4.7: Phase 4 Verification

- [ ] All public pages have correct meta tags (view source check)
- [ ] Sitemap includes all expected URLs
- [ ] RSS feed validates with an RSS validator
- [ ] JSON-LD validates with Google Rich Results Test (or schema.org validator)
- [ ] Run full test suite
- [ ] Verify: Coverage meets 70% for SEO components and utilities [checkpoint marker]

---

## Phase 5: Image Optimization Pipeline

**Goal:** Build server-side image processing to generate multiple size variants on upload, and create an OptimizedImage component for responsive image display.

### Task 5.1: Image Processing Service

- [ ] Install dependency: `npm install sharp`
- [ ] Write test: `ImageService.generateVariants(buffer, mimeType)` returns an object with variant buffers: thumb (150x150 cover crop), sm (400w), md (800w), lg (1200w) -- all in WebP format
- [ ] Write test: `ImageService.generateVariants` preserves aspect ratio for sm/md/lg variants
- [ ] Write test: `ImageService.generateVariants` handles PNG, JPEG, and WebP input formats
- [ ] Implement: Create `plantapp/src/lib/server/services/image.ts` with `ImageService` class using `sharp` for resizing and format conversion
- [ ] Verify: All tests pass

### Task 5.2: Upload Integration with Variant Generation

- [ ] Write test: File upload flow generates variants and stores variant paths in file metadata JSON
- [ ] Implement: Extend the existing file upload handler to call `ImageService.generateVariants` for image files after the original is uploaded, upload each variant to storage, and update the `file.metadata` field with a JSON object: `{ variants: { thumb: "path", sm: "path", md: "path", lg: "path" } }`
- [ ] Implement: Variant generation runs after the upload response is sent (non-blocking) using a fire-and-forget async pattern, or if simplicity is preferred, synchronously with a reasonable timeout
- [ ] Verify: Uploading an image creates 4 variants plus original in storage

### Task 5.3: OptimizedImage Component

- [ ] Write test: `OptimizedImage.svelte` renders `<img>` with `srcset`, `sizes`, `loading="lazy"`, and `alt` attributes
- [ ] Implement: Create `plantapp/src/lib/components/images/OptimizedImage.svelte` accepting props: `file` (file record with metadata), `alt` (string, required), `sizes` (string, default "(max-width: 768px) 100vw, 50vw"), `class` (string), `eager` (boolean for above-fold images). Component reads variant URLs from file metadata and builds srcset.
- [ ] Implement: Fallback to original URL if no variants exist
- [ ] Verify: Component renders correct HTML, lazy loading works

### Task 5.4: Phase 5 Verification

- [ ] Upload a test image and verify all variants are generated
- [ ] OptimizedImage component renders with correct srcset
- [ ] Page load performance: verify lazy loading with browser DevTools
- [ ] Run full test suite
- [ ] Verify: Coverage meets 70% for image service and component [checkpoint marker]

---

## Phase 6: Admin Content Management

**Goal:** Build the complete admin CRUD interface for content management including create/edit forms, Quill editor integration, content-product linking UI, preview, and category editorial editing.

### Task 6.1: Content Create Form (`/admin/content/new`)

- [ ] Write test: Create form submits valid content data via tRPC mutation
- [ ] Implement: Create `plantapp/src/routes/admin/content/new/+page.svelte` with form fields: title input, slug input (auto-generated from title), type selector (blog_post, guide, faq, page), Quill editor for content, excerpt textarea, tag input with autocomplete, featured image upload, meta title input, meta description input, status toggle (draft/published), publish date picker
- [ ] Implement: Slug auto-generation: on title change, generate URL-safe slug (lowercase, hyphens, no special chars). Allow manual override.
- [ ] Implement: Form submission calls `content.createPage` mutation, redirects to edit page on success
- [ ] Verify: Content can be created via admin form, saved to database

### Task 6.2: Content Edit Form (`/admin/content/[id]`)

- [ ] Write test: Edit form loads existing content and submits updates
- [ ] Implement: Create `plantapp/src/routes/admin/content/[id]/+page.ts` loader to fetch content by ID (admin procedure)
- [ ] Implement: Create `plantapp/src/routes/admin/content/[id]/+page.svelte` reusing the same form layout as create, pre-populated with existing data. Add "Save", "Publish", "Archive" action buttons.
- [ ] Implement: Autosave draft: debounced auto-save every 60 seconds while editing (only for draft status, saves silently via tRPC mutation, shows "Saved" indicator)
- [ ] Verify: Content can be loaded, edited, and saved. Autosave works.

### Task 6.3: Tag Autocomplete Input Component

- [ ] Write test: `TagInput.svelte` adds/removes tags, shows autocomplete suggestions from existing tags
- [ ] Implement: Create `plantapp/src/lib/components/forms/TagInput.svelte` with: text input that fetches tag suggestions via `content.getTags`, dropdown with filtered suggestions, tag badges with remove button, Enter key adds tag, comma-separated input support
- [ ] Verify: Tag input works with autocomplete, tags are added/removed correctly

### Task 6.4: Content-Product Linking UI

- [ ] Write test: Product linking section shows linked products and allows search/add/remove
- [ ] Implement: Create `plantapp/src/lib/components/admin/ContentProductLinker.svelte` with: list of currently linked products (with unlink button), product search input with autocomplete (searches products by name via tRPC), link type selector (featured, related, mentioned), sort order drag handles or number inputs
- [ ] Implement: Integrate into content edit form, visible for blog_post and guide types
- [ ] Verify: Products can be linked and unlinked from content

### Task 6.5: Content Preview

- [ ] Implement: Add "Preview" button to edit form that opens a new tab/modal showing the content rendered as it would appear on the public page (using the same layout and styling as public pages)
- [ ] Implement: Create `plantapp/src/routes/admin/content/[id]/preview/+page.ts` and `+page.svelte` that loads content regardless of status (admin only) and renders it in the public content template
- [ ] Verify: Preview shows accurate representation of published output

### Task 6.6: Enhanced Admin Content List

- [ ] Implement: Update `plantapp/src/routes/admin/content/+page.svelte` with: type filter tabs (All, Blog, Guides, FAQs, Pages), status filter (All, Draft, Published, Archived), search input, sortable columns, bulk select with checkboxes, bulk actions (Publish, Archive, Delete) with confirmation dialog, pagination
- [ ] Implement: Update `plantapp/src/routes/admin/content/+page.ts` loader to pass filter params to `content.getAllPages`
- [ ] Verify: Filtering, search, pagination, and bulk actions work

### Task 6.7: Category Editorial Content Admin

- [ ] Write test: Category edit form saves editorial content and image
- [ ] Implement: Add editorial content fields to the existing product category admin form (or create one if it doesn't exist): editorial content textarea/editor, editorial image upload, content page link selector
- [ ] Implement: Create tRPC procedure `admin.updateCategoryEditorial` for saving editorial fields
- [ ] Verify: Category editorial content saves and displays on category pages

### Task 6.8: Phase 6 Verification

- [ ] Admin can create, edit, preview, publish, archive, and delete content of all types
- [ ] Content-product links can be managed from the edit form
- [ ] Tag autocomplete works with existing tags
- [ ] Bulk actions work on the content list
- [ ] Category editorial content saves and renders
- [ ] Autosave works for drafts
- [ ] Run full test suite
- [ ] Verify: Coverage meets 70% for admin components and routes [checkpoint marker]

---

## Phase 7: Category Landing Pages & Polish

**Goal:** Implement category landing pages with editorial content, integrate content recommendations on product pages, and final polish.

### Task 7.1: Category Landing Pages with Editorial Content

- [ ] Write test: Category page loader fetches editorial content alongside products
- [ ] Implement: Update category page loader to include `editorialContent`, `editorialImageFileId`, and linked content page data from `productCategory`
- [ ] Implement: Update category page component to render: editorial hero image (if set), editorial blurb above product grid, "Learn More" link to full content page (if set)
- [ ] Verify: Category pages display editorial content when present, fall back gracefully when absent

### Task 7.2: Related Content on Product Pages

- [ ] Write test: Product detail page loader fetches linked content via `getLinkedContent`
- [ ] Implement: Update product detail page to include a "Related Articles & Guides" section showing linked content cards (title, excerpt, type badge, link)
- [ ] Implement: If no explicit links exist, show tag-matched content as fallback
- [ ] Verify: Product pages display related content

### Task 7.3: Content Sidebar Components

- [ ] Implement: Create `plantapp/src/lib/components/content/TagCloud.svelte` displaying popular tags with relative sizing or uniform badges
- [ ] Implement: Create `plantapp/src/lib/components/content/RecentPosts.svelte` displaying the N most recent blog posts as a sidebar widget
- [ ] Implement: Add sidebar to blog listing page with tag cloud and recent posts
- [ ] Verify: Sidebar components render with real data

### Task 7.4: Reading Time Utility

- [ ] Write test: `calculateReadingTime(htmlContent)` returns correct minutes based on word count (average 200 wpm)
- [ ] Implement: Create `plantapp/src/lib/utils/reading-time.ts` that strips HTML tags, counts words, and returns estimated reading time in minutes (minimum 1)
- [ ] Implement: Integrate into blog listing cards and detail page
- [ ] Verify: Reading time displays accurately

### Task 7.5: Learn Hub Page (`/learn`)

- [ ] Implement: Update `plantapp/src/routes/learn/+page.ts` and `+page.svelte` as a hub page linking to guides, blog, FAQ, and resources with featured/recent content from each type
- [ ] Verify: Learn page displays curated content from all types

### Task 7.6: Final Polish and Cross-Page Consistency

- [ ] Implement: Ensure all content detail pages have consistent layout: breadcrumbs, SeoHead, JsonLd, prose container, related content section
- [ ] Implement: Add "Back to listing" links on detail pages
- [ ] Implement: Ensure 404 handling for non-existent slugs on all content routes
- [ ] Implement: Test all pages with no content in database (empty state handling)
- [ ] Verify: Consistent UX across all content pages

### Task 7.7: Phase 7 Verification (Final)

- [ ] All content pages render correctly with real and empty data
- [ ] Category pages show editorial content
- [ ] Product pages show related content
- [ ] SEO elements present on all pages (meta tags, JSON-LD, breadcrumbs)
- [ ] Sitemap and RSS include all expected URLs
- [ ] Image optimization pipeline works end-to-end
- [ ] Admin content management is fully functional
- [ ] Run `npm run check` -- no TypeScript errors
- [ ] Run `npm run build` -- build succeeds
- [ ] Run full test suite -- all tests pass
- [ ] Coverage meets 70% overall for track changes
- [ ] Verify: Track complete [checkpoint marker]
