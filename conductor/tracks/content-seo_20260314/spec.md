# Specification: Content & SEO

## Overview

Build a full CMS-powered content layer and search engine optimization system for Aevani. This track transforms the existing content scaffolding (schema, service, tRPC router, placeholder routes) into a production-ready editorial and SEO platform that drives long-term organic growth through educational content about sustainable agriculture.

## Background

Aevani has a `contentPage` table, a `ContentService` with CRUD operations, a `contentRouter` with public/protected/admin procedures, and placeholder frontend routes (`/blog`, `/guides`, `/faq`, `/resources`, `/learn`). The existing `RichTextEditor.svelte` component falls back to a plain textarea because Quill is not installed. The admin content management page (`/admin/content`) has basic listing UI but lacks create/edit forms, preview, or content-type-specific workflows. No SEO infrastructure (meta tags, sitemaps, structured data, RSS) exists yet.

This track will:
- Install Quill and build a functional WYSIWYG editor
- Wire all public content routes to real database data
- Build a complete admin content management interface
- Add product-content linking for cross-selling
- Implement SEO meta tags, Open Graph, sitemap.xml, structured data, and RSS
- Add image optimization with multi-size variant generation on upload
- Add category landing pages with editorial content

## Functional Requirements

### FR-1: Quill Rich Text Editor Integration
**Description:** Install Quill and integrate it into the existing `RichTextEditor.svelte` component for WYSIWYG content editing in all admin content forms.
**Priority:** High
**Acceptance Criteria:**
- Quill is installed as a dependency and loads in the browser
- `RichTextEditor.svelte` renders a Quill editor with toolbar (headings, bold, italic, underline, lists, links, images, blockquotes, code blocks)
- Editor outputs HTML content that is saved to the `content` field
- Editor loads existing HTML content for editing
- Image upload within the editor uses the existing file upload system (GCS)
- Editor is responsive and works on tablet-sized screens and above

### FR-2: Blog Publishing System
**Description:** Wire the `/blog` route to display published blog posts from the database with listing, detail pages, pagination, and tag filtering.
**Priority:** High
**Acceptance Criteria:**
- `/blog` lists published `blog_post` content pages, sorted by `publishedAt` descending
- Pagination with configurable page size (default 12)
- Tag-based filtering via URL query parameters
- `/blog/[slug]` displays a single blog post with full content, author info, published date, tags, and featured image
- Blog detail page renders HTML content from the Quill editor safely (sanitized)
- "Related posts" section on detail page showing posts with shared tags
- Reading time estimate displayed on listing cards and detail page

### FR-3: Growing Guides System
**Description:** Wire the `/guides` route to display published guides from the database, organized by system type (hydroponics, aquaponics, silvopasture, agroforestry) and topic category.
**Priority:** High
**Acceptance Criteria:**
- `/guides` lists published `guide` content pages grouped by system type
- Category filtering by system type and topic (getting-started, setup, maintenance, troubleshooting, seasonal)
- `/guides/[slug]` displays a single guide with full content, table of contents (auto-generated from headings), and step indicators
- Related products section on guide detail pages (via `content_product_link` table)
- Related guides section showing guides with shared tags

### FR-4: FAQ Management
**Description:** Wire the `/faq` route to display categorized FAQ entries from the database using the existing `contentPage` table with type `faq`.
**Priority:** High
**Acceptance Criteria:**
- `/faq` displays FAQ entries grouped by category, rendered as accordions
- Category filtering via tabs (General, Technical Support, Shipping & Returns, Product Information, Troubleshooting)
- FAQ entries use `contentPage` with type `faq`: title is the question, content is the answer
- Tags field on FAQ entries is used for categorization (first tag = category)
- FAQ page includes a search box for filtering questions by keyword
- Structured data (FAQPage JSON-LD) generated automatically

### FR-5: Content-Product Linking
**Description:** Create a many-to-many relationship between content pages and products for curated cross-references, plus tag-based auto-suggestions.
**Priority:** High
**Acceptance Criteria:**
- New `content_product_link` table with `contentPageId`, `productId`, `sortOrder`, `linkType` (featured, related, mentioned)
- Admin UI to link/unlink products when editing content
- Product autocomplete search in the linking UI
- Guide and blog detail pages display linked products in a "Recommended Products" section
- Product detail pages display linked content in a "Related Articles & Guides" section
- Tag-based auto-suggestion: when editing content, suggest products with matching tags (not saved automatically, admin confirms)

### FR-6: Category Landing Pages with Editorial Content
**Description:** Enhance product category pages with editorial content sections above product listings.
**Priority:** Medium
**Acceptance Criteria:**
- `productCategory` table extended with `editorialContent` (text), `editorialImageFileId` (text), and `editorialContentPageId` (integer, FK to contentPage) fields
- Category landing pages render the `editorialContent` blurb above product listings
- "Learn More" link to the full content page when `editorialContentPageId` is set
- Admin UI for editing category editorial content inline
- Editorial image displayed as a hero/banner on category pages

### FR-7: SEO Meta Tags
**Description:** Implement comprehensive SEO meta tags on all public pages including title, description, Open Graph, and Twitter Card tags.
**Priority:** High
**Acceptance Criteria:**
- `<svelte:head>` block on all public pages sets `<title>`, `<meta name="description">`, canonical URL
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`
- Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Content pages use `metaTitle` and `metaDescription` from the database (fallback to title/excerpt)
- Product pages use product name and description for meta tags
- Category pages use category name and description
- A reusable `SeoHead.svelte` component encapsulates all meta tag logic
- Default fallback meta tags for pages without specific SEO data

### FR-8: Dynamic Sitemap Generation
**Description:** Generate a dynamic `sitemap.xml` at build/request time that includes all public pages, products, content pages, and categories.
**Priority:** High
**Acceptance Criteria:**
- `/sitemap.xml` SvelteKit server route generates valid XML sitemap
- Includes: homepage, all published content pages, all active products, all active categories, static pages (/about, /contact, etc.)
- Each entry includes `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`
- Content pages use `updatedAt` for `<lastmod>`
- Products use `updatedAt` for `<lastmod>`
- Sitemap is cacheable (response headers set `Cache-Control` with appropriate TTL, e.g., 1 hour)
- `robots.txt` updated to reference sitemap URL

### FR-9: Structured Data (JSON-LD)
**Description:** Add JSON-LD structured data to product pages, blog posts, FAQ pages, and guide pages for enhanced search engine results.
**Priority:** Medium
**Acceptance Criteria:**
- Product pages: `Product` schema with name, description, image, price, availability, brand
- Blog posts: `Article` schema with headline, author, datePublished, dateModified, image, publisher
- FAQ page: `FAQPage` schema with `Question` and `Answer` entries
- Guide pages: `HowTo` or `Article` schema as appropriate
- Organization schema on homepage
- BreadcrumbList schema on all pages with breadcrumb navigation
- A reusable `JsonLd.svelte` component for injecting structured data

### FR-10: Content Tagging and Categorization
**Description:** Implement a robust tagging system for content discovery and cross-referencing.
**Priority:** Medium
**Acceptance Criteria:**
- Tags are stored as JSON arrays in the existing `tags` field on `contentPage`
- Tag input component in admin forms with autocomplete from existing tags
- Tag listing page (`/tags/[tag]`) showing all content with a given tag
- Tag cloud or list on blog/guides sidebar
- Tags displayed as clickable badges on content cards and detail pages

### FR-11: Image Optimization
**Description:** Generate multiple image size variants on upload and serve optimized images with lazy loading throughout content pages.
**Priority:** Medium
**Acceptance Criteria:**
- On image upload, generate variants: thumbnail (150x150), small (400px wide), medium (800px wide), large (1200px wide), original
- Variants stored alongside original in storage with naming convention: `{id}_thumb.webp`, `{id}_sm.webp`, `{id}_md.webp`, `{id}_lg.webp`
- File table `metadata` field stores variant URLs/paths as JSON
- New `OptimizedImage.svelte` component that renders `<picture>` with `srcset` and `sizes` attributes
- Lazy loading via `loading="lazy"` attribute on all content images
- Featured images on content listing cards use small/medium variants
- Featured images on detail pages use large variant
- WebP format for all generated variants (with original format as fallback)

### FR-12: Admin Content Management
**Description:** Build complete admin CRUD interface for all content types with preview functionality.
**Priority:** High
**Acceptance Criteria:**
- `/admin/content/new` form for creating content with type selector (blog_post, guide, faq, page)
- `/admin/content/[id]` form for editing existing content
- Form includes: title, slug (auto-generated from title, editable), content (Quill editor), excerpt, type, tags, featured image upload, meta title, meta description, status, publish date
- Content preview: "Preview" button opens content as it would appear on the public site (draft preview URL)
- Bulk actions: publish, archive, delete multiple items
- Content list filtering by type, status, author, and search
- Slug auto-generation from title with URL-safe sanitization
- Autosave draft every 60 seconds while editing
- Confirmation dialog before publishing or deleting

### FR-13: RSS Feed
**Description:** Generate an RSS 2.0 feed for blog posts to support syndication and feed readers.
**Priority:** Low
**Acceptance Criteria:**
- `/rss.xml` SvelteKit server route generates valid RSS 2.0 XML
- Includes the 20 most recent published blog posts
- Each item includes: title, link, description (excerpt), pubDate, author, categories (tags)
- Feed metadata: title ("Aevani Blog"), description, link, language (en-US)
- `<link rel="alternate" type="application/rss+xml">` tag in `<head>` on blog pages
- Response headers set correct `Content-Type: application/rss+xml`

## Non-Functional Requirements

### NFR-1: Performance
- Content listing pages load in under 2 seconds on a 3G connection
- Sitemap generation completes in under 500ms for up to 1000 entries
- Image variants are generated asynchronously (upload returns immediately, variants processed in background)
- Content queries use appropriate database indexes (existing indexes on `contentPage` are sufficient)
- RSS and sitemap responses are cached with appropriate headers

### NFR-2: Security
- All HTML content rendered from the editor is sanitized (DOMPurify or equivalent) before display to prevent XSS
- Admin content routes require `admin` role
- Draft content is only accessible via authenticated preview URLs
- File uploads validate MIME types and file sizes before processing
- Slug values are sanitized to prevent path traversal

### NFR-3: SEO Best Practices
- All pages have unique, descriptive `<title>` tags (50-60 characters recommended)
- All pages have unique `<meta name="description">` tags (150-160 characters recommended)
- Canonical URLs prevent duplicate content issues
- Structured data validates against Google's Rich Results Test
- Images have descriptive `alt` text
- Heading hierarchy is correct (single h1, logical h2/h3 nesting)

### NFR-4: Accessibility
- Rich text editor is keyboard navigable
- Content images require alt text
- FAQ accordions are keyboard accessible with ARIA attributes
- Color contrast meets WCAG 2.1 AA standards

## User Stories

### US-1: Admin Creates a Blog Post
**As** an admin, **I want** to create and publish blog posts with rich text content, images, and SEO metadata, **so that** I can drive organic traffic and educate customers.

**Given** I am logged in as an admin and on `/admin/content/new`
**When** I select "Blog Post" as the content type, fill in the title, write content in the Quill editor, add tags, upload a featured image, fill in SEO fields, and click "Publish"
**Then** the blog post is saved with status "published", appears on `/blog`, and is accessible at `/blog/[slug]`

### US-2: Visitor Reads a Growing Guide
**As** a hobbyist gardener, **I want** to read detailed growing guides for my hydroponics system, **so that** I can learn best practices and find recommended products.

**Given** I navigate to `/guides` and filter by "Hydroponics"
**When** I click on a guide title
**Then** I see the full guide content with a table of contents, step-by-step instructions, and a "Recommended Products" section with links to purchase

### US-3: Visitor Searches FAQs
**As** a customer, **I want** to search and browse categorized FAQs, **so that** I can quickly find answers to my questions.

**Given** I navigate to `/faq`
**When** I type a keyword in the search box or click a category tab
**Then** I see relevant FAQ entries displayed as expandable accordions

### US-4: Search Engine Indexes Content
**As** a search engine crawler, **I want** to find a valid sitemap, structured data, and proper meta tags, **so that** Aevani pages appear in search results with rich snippets.

**Given** a crawler requests `/sitemap.xml`
**When** the sitemap is parsed
**Then** it contains valid URLs for all published content, products, and categories with correct `lastmod` dates

### US-5: Admin Links Products to Guides
**As** an admin, **I want** to link specific products to growing guides, **so that** readers can easily purchase recommended equipment.

**Given** I am editing a guide in the admin
**When** I search for products in the "Linked Products" section and add them
**Then** those products appear in the "Recommended Products" section on the public guide page

## Technical Considerations

### Existing Infrastructure to Leverage
- `contentPage` schema with type enum, status, tags, meta fields -- no schema changes needed for core content
- `ContentService` with full CRUD, permission checks, pagination, and filtering
- `contentRouter` with public/protected/admin procedures
- `file` table with GCS integration for media storage
- mdsvex configured in `svelte.config.js` (available for static content if needed)
- `@tailwindcss/typography` plugin installed for prose styling
- Existing admin layout with sidebar navigation

### New Schema Additions
- `content_product_link` table (contentPageId, productId, sortOrder, linkType)
- `productCategory` table additions: `editorialContent`, `editorialImageFileId`, `editorialContentPageId`

### Key Dependencies
- `quill` -- WYSIWYG editor
- `dompurify` + `@types/dompurify` -- HTML sanitization for rendered content
- `sharp` -- server-side image processing for variant generation (if not using a cloud service)

### Content Rendering Pipeline
1. Admin writes content in Quill editor (outputs HTML)
2. HTML saved to `contentPage.content` field
3. On public page render, HTML is sanitized with DOMPurify
4. Sanitized HTML rendered within Tailwind Typography `prose` container

## Out of Scope

- Full-text search engine (Elasticsearch, Meilisearch) -- basic SQL LIKE search is sufficient for now
- Content versioning / revision history
- Multi-author workflow with editorial review/approval pipeline
- Content scheduling (future publish dates with automatic publishing)
- Internationalization / multi-language content
- Comments or discussions on content pages
- AMP pages
- PDF generation from content pages
- Content import/export (CSV, WordPress import)
- A/B testing for content or SEO

## Open Questions

1. **Image processing location:** Should `sharp` run on the Railway server during upload, or should image processing be offloaded to a cloud function? Railway servers have limited CPU; heavy image processing could affect request handling. For now, plan assumes server-side with `sharp` but with async processing so uploads are not blocked.

2. **Content editor permissions:** Currently only admins can publish. Should there be a "content editor" role that can create and publish content without full admin access? Current plan maintains admin-only publishing.

3. **CDN for static assets:** Should optimized images be served through a CDN? Current plan stores variants in the same storage bucket. CDN integration could be added later without architectural changes.
