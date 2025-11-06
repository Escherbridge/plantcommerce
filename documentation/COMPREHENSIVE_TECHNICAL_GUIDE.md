# Aevani: Comprehensive Technical Guide

Welcome to the Aevani documentation hub. This directory contains comprehensive guides and technical documentation for the Aevani sustainable agriculture e-commerce platform.

## 1. Information Architecture (Content-First Model)

This section outlines the complete information architecture for Aevani, a content-first media platform and affiliate marketplace for sustainable agriculture. The architecture is designed to build a community around high-quality educational content and then monetize that audience through affiliate recommendations.

### Site Structure

#### Primary Navigation

##### 1. Learn (Primary Focus)
- **Guides** (`/guides`)
  - In-depth guides on hydroponics, aquaponics, silvopasture, and agroforestry.
  - Beginner-friendly tutorials and setup guides.
  - Advanced techniques and troubleshooting.

- **Blog** (`/blog`)
  - Industry news, case studies, and success stories.
  - Interviews with experts and community spotlights.

- **Courses** (`/courses`)
  - Structured video courses on various sustainable agriculture topics.

- **Resources** (`/resources`)
  - Downloadable checklists, calculators, and plans.
  - Links to external research and tools.

##### 2. Gear & Recommendations (Formerly "Shop")
- **Hydroponics Gear** (`/gear/hydroponics`)
  - Recommended beginner kits.
  - In-depth reviews of grow lights, nutrients, and systems.
  - Comparison guides and "best of" lists.

- **Aquaponics Gear** (`/gear/aquaponics`)
  - Recommended beginner kits.
  - Reviews of pumps, grow media, and fish care products.

- **Tools & Supplies** (`/gear/tools`)
  - General-purpose tools for sustainable agriculture.
  - Recommendations for soil testing, composting, etc.

##### 3. Community
- **Forums** (`/forums`)
  - Discussion boards for different topics.
  - Q&A sections where users can ask for help.

- **Events** (`/events`)
  - Webinars, workshops, and live Q&A sessions.

- **Member Showcase** (`/showcase`)
  - A place for community members to share their projects and success stories.

##### 4. Affiliate Program
- **Join** (`/affiliate/join`)
  - Information about the affiliate program and how to apply.

- **Dashboard** (`/affiliate/dashboard`)
  - For affiliates to track their performance, generate links, and view earnings.

#### User Account Areas

##### User Account (`/account`)
- **Profile** (`/account/profile`)
- **My Content** (`/account/content`)
  - Saved articles, courses, and resources.
- **My Orders** (`/account/orders`)
  - History of any direct purchases (e.g., courses).

#### Administrative Areas

##### Admin Dashboard (`/admin`)
- **Content Management** (`/admin/content`)
- **User Management** (`/admin/users`)
- **Affiliate Management** (`/admin/affiliates`)
- **Analytics** (`/admin/analytics`)

### Content Strategy

- **Cornerstone Content:** In-depth, long-form guides that are the definitive resource on a topic.
- **Product Reviews:** Unbiased, detailed reviews of products with clear affiliate links.
- **Comparison Guides:** "Best of" lists and comparison tables to help users make purchasing decisions.
- **Community-Generated Content:** User-submitted projects, questions, and success stories.

## 2. Affiliate System Implementation Guide

This guide explains how the affiliate link generation system works in Plant Commerce, following SOLID principles and implementing a Laravel-inspired pattern.

### System Architecture

#### Core Components

1. **Database Schema** (`src/lib/server/db/schema.ts`)
   - `affiliate` - Main affiliate records with earnings tracking
   - `affiliate_link` - Individual product affiliate links
   - `affiliate_click` - Detailed click tracking and analytics
   - Integration with `user`, `product`, and `order` tables

2. **Service Layer** (`src/lib/server/services/affiliate.ts`)
   - `AffiliateService` - Main business logic class
   - Link generation, click tracking, conversion processing
   - Statistics calculation and reporting

3. **API Layer** (`src/lib/server/api/affiliate.ts`)
   - tRPC routes for all affiliate functionality
   - Protected and public endpoints
   - Type-safe API with Zod validation

4. **Link Handling** (`src/routes/aff/[linkCode]/+page.server.ts`)
   - Automatic redirect handling
   - Click tracking and attribution
   - Cookie-based attribution for future purchases

### How the Affiliate System Works

#### 1. Affiliate Registration
```typescript
// User becomes an affiliate
const affiliate = await AffiliateService.createAffiliate(userId, customCode);
// User role automatically updated to 'affiliate'
```

#### 2. Link Generation
```typescript
// Create affiliate link for any product
const link = await AffiliateService.createAffiliateLink({
  affiliateId: affiliate.id,
  productId: product.id,
  customCode: 'optional-custom-code'
});

// Generated link: https://yoursite.com/aff/ABC123XYZ
// Redirects to: https://yoursite.com/products/product-slug
```

#### 3. Click Tracking
When someone clicks an affiliate link:
1. Server captures tracking data (IP, User-Agent, Referer)
2. Records click in `affiliate_click` table
3. Sets attribution cookie for 30 days
4. Redirects to original product page
5. Updates click counts on affiliate and link records

#### 4. Conversion Tracking
When an attributed user makes a purchase:
1. Order creation checks for affiliate attribution cookie
2. Commission calculated based on affiliate's rate
3. Conversion recorded and earnings updated
4. All statistics automatically updated

### API Usage Examples

#### Client-Side Usage
```typescript
import { trpc } from '$lib/trpc/client';

// Create affiliate account
const affiliate = await trpc.affiliate.createAffiliate.mutate({
  customCode: 'MYCODE' // optional
});

// Generate product affiliate link
const link = await trpc.affiliate.createLink.mutate({
  productId: 123,
  customCode: 'PRODUCT123' // optional
});

// Get affiliate statistics
const stats = await trpc.affiliate.getStats.query();

// Get all affiliate links
const links = await trpc.affiliate.getLinks.query();
```

#### Link Structure
- **Original URL**: `/products/hydroponic-system`
- **Affiliate URL**: `/aff/ABC123XYZ`
- **Full Link**: `https://aevani.com/aff/ABC123XYZ`

### Key Features

#### 1. Automatic Attribution
- 30-day cookie-based attribution window
- Works for both registered and guest users
- Tracks complete customer journey

#### 2. Real-time Analytics
- Click tracking with IP, User-Agent, Referer
- Conversion rates and earnings tracking
- Performance metrics per product/affiliate

#### 3. Commission Management
- Configurable commission rates per affiliate
- Automatic calculation on order completion
- Real-time earnings updates

#### 4. Link Management
- Unique codes for each affiliate/product combination
- Ability to enable/disable links
- Custom link codes for branding

### Database Schema Details

#### Affiliate Table
- `affiliateCode` - Unique identifier for the affiliate
- `commissionRate` - Percentage commission (default 5%)
- `totalEarnings` - Running total of all commissions
- `totalClicks` - Total clicks across all links
- `totalConversions` - Total conversions across all links

#### Affiliate Link Table
- `linkCode` - Unique identifier for the specific link
- `originalUrl` - The product URL without affiliate params
- `affiliateUrl` - The full affiliate URL path
- `clicks` - Click count for this specific link
- `conversions` - Conversion count for this specific link
- `earnings` - Earnings from this specific link

#### Affiliate Click Table
- Complete tracking data for each click
- IP address, User-Agent, Referer headers
- Session and user ID tracking
- Timestamp for analytics

### Integration Points

#### Order Processing
When processing orders, check for affiliate attribution:

```typescript
// In your order creation logic
const affiliateLinkId = cookies.get('affiliate-link');
if (affiliateLinkId) {
  // Include in order record
  orderData.affiliateLinkId = parseInt(affiliateLinkId);
}

// After order completion
await AffiliateService.processConversion(order.id);
```

#### Frontend Integration
```typescript
// Display affiliate dashboard
const stats = await trpc.affiliate.getStats.query();
// Shows: totalEarnings, totalClicks, totalConversions, conversionRate

// Generate links for products
const links = await trpc.affiliate.getLinks.query();
// Shows: all affiliate links with performance data
```

### Security Considerations

1. **Link Code Generation**: Uses cryptographically secure random bytes
2. **Attribution Verification**: Validates affiliate links before processing
3. **Commission Protection**: Only processes commissions for completed orders
4. **Rate Limiting**: Consider implementing rate limits on link generation
5. **Fraud Prevention**: IP and user agent tracking for analytics

### Performance Optimizations

1. **Database Indexes**: Optimized queries with proper indexing
2. **Batch Operations**: Efficient bulk statistics updates
3. **Caching**: Consider caching frequently accessed affiliate data
4. **Analytics**: Separate analytics tables for high-volume data

This system provides a robust, scalable affiliate program that can handle high traffic and provides detailed analytics for both affiliates and administrators.

## 3. Security

This section outlines the security features implemented in the Aevani platform.

### 3.1. Content Security Policy (CSP)

A Content Security Policy (CSP) is implemented in `src/hooks.server.ts` to mitigate cross-site scripting (XSS) and other code injection attacks. The policy is applied to all server-rendered pages.

**Policy Directives:**

- `default-src 'self'`: Only allows content from the application's own origin by default.
- `script-src 'self' 'unsafe-inline'`: Allows scripts from the application's own origin. `'unsafe-inline'` is included for SvelteKit's development features and should be replaced with a nonce or hash-based approach in production.
- `style-src 'self' 'unsafe-inline'`: Allows styles from the application's own origin. `'unsafe-inline'` is included for Svelte's component styles.
- `img-src 'self' data:`: Allows images from the application's own origin and `data:` URIs.
- `font-src 'self'`: Allows fonts from the application's own origin.
- `object-src 'none'`: Disallows plugins (e.g., Flash).
- `base-uri 'self'`: Restricts the URLs that can be used in a document's `<base>` element.
- `form-action 'self'`: Restricts the URLs that can be used as the target of a form submission.
- `frame-ancestors 'none'`: Prevents the page from being embedded in an an `<iframe>` or `<frame>`.

### 3.2. File Upload Validation

The file upload system in `src/routes/api/files/upload/+server.ts` includes robust validation to prevent malicious file uploads.

**Validation Steps:**

1.  **Authentication:** Only authenticated users can upload files.
2.  **File Size and Count Limits:** The server enforces a maximum file size (10MB) and a maximum number of files per upload (5).
3.  **MIME Type Validation:** A whitelist of allowed MIME types is enforced on the server.
4.  **File Signature Validation:** The first few bytes of each file are checked to ensure that the file's actual type matches its claimed MIME type. This is handled by the `validateFileSignature` function in `src/lib/server/fileValidation.ts`.
5.  **Virus Scanning:** A placeholder `scanForViruses` function is included in `src/lib/server/fileValidation.ts`. This function should be integrated with a real virus scanning service (e.g., ClamAV) in a production environment.

### 3.3. Audit Logging

An audit logging system is implemented to track important events that occur in the application. This is crucial for security monitoring and incident response.

**Audit Log Table:**

The `auditLog` table in the database (`src/lib/server/db/schema.ts`) stores the audit log entries. It includes the following columns:

- `id`: A serial primary key.
- `timestamp`: A timestamp with time zone.
- `userId`: The ID of the user who performed the action.
- `action`: The type of action that was performed (e.g., `'login'`, `'create_product'`)
- `details`: A JSON object containing additional details about the event.

**Audit Log Service:**

The `AuditLogService` in `src/lib/server/services/auditLog.ts` provides a `log` function for creating new audit log entries.

**Logged Events:**

The following events are currently logged:

- **Authentication:**
    - `register`: When a new user registers.
    - `login_success`: When a user successfully logs in.
    - `login_failure`: When a user fails to log in.
    - `logout`: When a user logs out.
- **Products:**
    - `create_product`: When a new product is created.
    - `update_product`: When a product is updated.
    - `delete_product`: When a product is deleted.

## 4. Setup Guides

### 3.1. DaisyUI and Tailwind CSS Setup Guide

This section outlines the DaisyUI and Tailwind CSS configuration for the Aevani SvelteKit application.

#### What's Configured

##### 1. Dependencies Installed
- **DaisyUI**: Latest version installed as a dev dependency
- **Tailwind CSS v4**: Already present with plugins for forms and typography
- **@tailwindcss/forms**: Form styling utilities
- **@tailwindcss/typography**: Typography utilities

##### 2. Configuration Files

###### `tailwind.config.js`
- DaisyUI plugin configured with all available themes
- Content paths set to scan all Svelte files
- Default dark theme set to "dark"
- All DaisyUI features enabled (base, styled, utils)

###### `src/app.css`
- Updated to work with DaisyUI
- Removed conflicting custom styles
- Kept essential CSS variables and utilities
- Uses Tailwind's `@apply` directive for custom classes

##### 3. Components Updated

###### `src/routes/+layout.svelte`
- Converted to DaisyUI drawer layout
- Added responsive navigation
- Modern footer with DaisyUI classes
- Mobile-first responsive design

###### `src/routes/Header.svelte` (New)
- DaisyUI navbar component
- Theme selector dropdown with 6 popular themes
- User menu dropdown
- Mobile hamburger menu
- Accessibility improvements

###### `src/routes/+page.svelte`
- Hero section with DaisyUI components
- Feature cards showcase
- Interactive form components
- Stats display
- Success alerts

#### Available Themes
The following themes are configured and can be switched via the header:
- Light (default)
- Dark
- Cupcake
- Forest  
- Luxury
- Business

#### DaisyUI Components Demonstrated
- **Navigation**: Navbar, drawer, menu
- **Layout**: Hero, cards, stats
- **Forms**: Input, textarea, checkbox, labels
- **Feedback**: Alerts with icons
- **Actions**: Buttons with variants

#### Theme Switching
Themes can be switched by:
1. Using the theme dropdown in the header
2. Programmatically setting `data-theme` attribute on the document element
3. The selected theme persists during the session

#### Development
- Run `npm run dev` to start the development server
- DaisyUI components work out of the box
- All Tailwind utilities remain available
- Custom CSS can use `@apply` directive for DaisyUI classes

#### Next Steps
- Add more complex components as needed
- Customize the theme colors in `tailwind.config.js`
- Create component library based on DaisyUI
- Add theme persistence to localStorage

#### Resources
- [DaisyUI Documentation](https://daisyui.com/)
- [DaisyUI Components](https://daisyui.com/components/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### 3.2. File Upload System Setup Guide

This section explains how to configure and use the file upload system with Google Cloud Storage integration.

#### Environment Variables

Add these environment variables to your `.env` file:

```bash
# Google Cloud Storage Configuration
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=aevani-files

# Optional: Custom base URL for file access
GCS_BASE_URL=https://storage.googleapis.com/aevani-files
```

#### GCP Setup

1. **Create a GCP Project** (if you don't have one)

2. **Enable Cloud Storage API**
   ```bash
   gcloud services enable storage-component.googleapis.com
   ```

3. **Create a Storage Bucket**
   ```bash
   gsutil mb gs://aevani-files
   ```

4. **Create a Service Account**
   ```bash
   gcloud iam service-accounts create aevani-storage \
     --display-name="Aevani Storage Service Account"
   ```

5. **Grant Permissions to the Service Account**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:aevani-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   ```

6. **Create and Download Service Account Key**
   ```bash
   gcloud iam service-accounts keys create ~/aevani-gcs-key.json \
     --iam-account=aevani-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

#### File Upload API Endpoints

##### Upload Files (POST /api/files/upload)

Upload one or more files via multipart form data.

**Parameters:**
- `files`: File(s) to upload (max 5 files, 10MB each)
- `entityType`: Type of entity ('user', 'product', 'content', 'general')
- `entityId`: Optional ID of the related entity
- `isPublic`: Boolean, whether file should be publicly accessible
- `metadata`: Optional JSON string with additional file metadata

**Example using fetch:**
```javascript
const formData = new FormData();
formData.append('files', fileInput.files[0]);
formData.append('entityType', 'product');
formData.append('entityId', '123');
formData.append('isPublic', 'true');
formData.append('metadata', JSON.stringify({ alt: 'Product image' }));

const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.files); // Array of uploaded file objects
```

#### TRPC API Methods

##### Get File Information
```typescript
const file = await trpc.files.getFile.query({ fileId: 'uuid' });
```

##### Get Files by Entity
```typescript
const files = await trpc.files.getFilesByEntity.query({
  entityType: 'product',
  entityId: '123',
  limit: 10
});
```

##### Generate Signed URL (for private files)
```typescript
const { signedUrl } = await trpc.files.getSignedUrl.query({
  fileId: 'uuid',
  expiresIn: 3600 // 1 hour
});
```

##### Update File Metadata
```typescript
const updatedFile = await trpc.files.updateFileMetadata.mutate({
  fileId: 'uuid',
  metadata: { alt: 'Updated alt text' },
  isPublic: true
});
```

##### Delete File
```typescript
await trpc.files.deleteFile.mutate({ fileId: 'uuid' });
```

##### Get Public Images
```typescript
const images = await trpc.files.getImages.query({
  limit: 20,
  entityType: 'product',
  entityId: '123'
});
```

#### File Organization

Files are organized in the bucket using this structure:
```
{entityType}/{year}/{month}/{entityId}/{unique-filename}
```

Examples:
- `user/2024/01/user123/avatar-a1b2c3d4.jpg`
- `product/2024/01/product456/main-image-e5f6g7h8.png`
- `content/2024/01/page789/featured-i9j0k1l2.webp`
- `general/2024/01/document-m3n4o5p6.pdf`

#### Database Schema

The file system uses a dedicated `file` table that stores:
- Unique file ID (UUID)
- Original and sanitized filenames
- File metadata (size, MIME type, etc.)
- Bucket path and name
- Entity relationships
- Access control settings
- Upload tracking

Related tables reference files by ID instead of storing URLs directly:
- `user.avatarFileId` → `file.id`
- `productImage.fileId` → `file.id`
- `contentPage.featuredImageFileId` → `file.id`

#### Security Features

- **Authentication required** for uploads and private file access
- **File type validation**: A whitelist of allowed MIME types is enforced on the server.
- **File signature validation**: The magic numbers of each file are checked to ensure the file type matches its extension and MIME type.
- **Virus scanning**: A placeholder for a virus scanning service is included. This should be integrated with a real virus scanner in a production environment.
- **File size limits** (10MB per file, 5 files per upload)
- **Access control** based on file ownership and user roles
- **Signed URLs** for temporary access to private files
- **Automatic cleanup** if database operations fail

#### Usage Examples

##### Product Image Upload
1. Upload image via `/api/files/upload` with `entityType: 'product'`
2. Use the returned `fileId` to create a `productImage` record
3. Set `isMain: true` for the primary product image

##### User Avatar
1. Upload image via `/api/files/upload` with `entityType: 'user'`
2. Update user record to set `avatarFileId` to the returned file ID

##### Content Featured Image
1. Upload image via `/api/files/upload` with `entityType: 'content'`
2. Update content page to set `featuredImageFileId`

#### Migration from URL-based System

If migrating from a system that stores image URLs directly:

1. **Run database migration** to add new file-reference columns
2. **Upload existing images** to GCS using the file service
3. **Update existing records** to reference file IDs instead of URLs
4. **Remove old URL columns** after verification

The migration can be done gradually by supporting both systems during transition.

## 5. Recent Changes

This section provides a summary of recent changes to the codebase.

### Security Improvements

- **Authentication Race Conditions:** Fixed a race condition in the session management logic by using a database transaction and a `SELECT ... FOR UPDATE` query to prevent concurrent session updates.
- **File Upload Validation:** Implemented robust file upload validation, including file signature validation and a placeholder for virus scanning.
- **Input Sanitization:** Sanitized `like` queries to prevent SQL injection attacks.
- **Content Security Policy (CSP):** Implemented a Content Security Policy to mitigate XSS and other code injection attacks.
- **Audit Logging:** Implemented an audit logging system to track important events, such as user logins and data changes.

### Performance Optimizations

- **Database Indexes:** Added missing database indexes to the `product` table to improve the performance of product searches.
- **N+1 Query Problems:** Reviewed the code for N+1 query problems related to product images and found that the issue had already been resolved.

### Other Changes

- **Tax and Shipping Calculations:** Implemented simple, configurable tax and shipping calculations in the order service.
- **Error Handling:** Improved the error handling to use structured logging.
