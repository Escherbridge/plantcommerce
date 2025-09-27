# Affiliate System Implementation Guide

## Overview

This guide explains how the affiliate link generation system works in Plant Commerce, following SOLID principles and implementing the Laravel-inspired pattern you referenced.

## System Architecture

### Core Components

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

## How the Affiliate System Works

### 1. Affiliate Registration
```typescript
// User becomes an affiliate
const affiliate = await AffiliateService.createAffiliate(userId, customCode);
// User role automatically updated to 'affiliate'
```

### 2. Link Generation
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

### 3. Click Tracking
When someone clicks an affiliate link:
1. Server captures tracking data (IP, User-Agent, Referer)
2. Records click in `affiliate_click` table
3. Sets attribution cookie for 30 days
4. Redirects to original product page
5. Updates click counts on affiliate and link records

### 4. Conversion Tracking
When an attributed user makes a purchase:
1. Order creation checks for affiliate attribution cookie
2. Commission calculated based on affiliate's rate
3. Conversion recorded and earnings updated
4. All statistics automatically updated

## API Usage Examples

### Client-Side Usage
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

### Link Structure
- **Original URL**: `/products/hydroponic-system`
- **Affiliate URL**: `/aff/ABC123XYZ`
- **Full Link**: `https://plantcommerce.com/aff/ABC123XYZ`

## Key Features

### 1. Automatic Attribution
- 30-day cookie-based attribution window
- Works for both registered and guest users
- Tracks complete customer journey

### 2. Real-time Analytics
- Click tracking with IP, User-Agent, Referer
- Conversion rates and earnings tracking
- Performance metrics per product/affiliate

### 3. Commission Management
- Configurable commission rates per affiliate
- Automatic calculation on order completion
- Real-time earnings updates

### 4. Link Management
- Unique codes for each affiliate/product combination
- Ability to enable/disable links
- Custom link codes for branding

## Database Schema Details

### Affiliate Table
- `affiliateCode` - Unique identifier for the affiliate
- `commissionRate` - Percentage commission (default 5%)
- `totalEarnings` - Running total of all commissions
- `totalClicks` - Total clicks across all links
- `totalConversions` - Total conversions across all links

### Affiliate Link Table
- `linkCode` - Unique identifier for the specific link
- `originalUrl` - The product URL without affiliate params
- `affiliateUrl` - The full affiliate URL path
- `clicks` - Click count for this specific link
- `conversions` - Conversion count for this specific link
- `earnings` - Earnings from this specific link

### Affiliate Click Table
- Complete tracking data for each click
- IP address, User-Agent, Referer headers
- Session and user ID tracking
- Timestamp for analytics

## Integration Points

### Order Processing
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

### Frontend Integration
```typescript
// Display affiliate dashboard
const stats = await trpc.affiliate.getStats.query();
// Shows: totalEarnings, totalClicks, totalConversions, conversionRate

// Generate links for products
const links = await trpc.affiliate.getLinks.query();
// Shows: all affiliate links with performance data
```

## Security Considerations

1. **Link Code Generation**: Uses cryptographically secure random bytes
2. **Attribution Verification**: Validates affiliate links before processing
3. **Commission Protection**: Only processes commissions for completed orders
4. **Rate Limiting**: Consider implementing rate limits on link generation
5. **Fraud Prevention**: IP and user agent tracking for analytics

## Performance Optimizations

1. **Database Indexes**: Optimized queries with proper indexing
2. **Batch Operations**: Efficient bulk statistics updates
3. **Caching**: Consider caching frequently accessed affiliate data
4. **Analytics**: Separate analytics tables for high-volume data

This system provides a robust, scalable affiliate program that can handle high traffic and provides detailed analytics for both affiliates and administrators.
