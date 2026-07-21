# Aevani Application

This directory contains the main Aevani application built with SvelteKit, Drizzle ORM, and tRPC.

### Setup
```bash
npm install
npm run db:start
# Read drizzle/AGENTS.md before changing or applying any schema.
npm run dev
```

### Documentation
- **Complete Project Documentation**: [../README.md](../README.md)
- **Affiliate System Guide**: [../documentation/AFFILIATE_SYSTEM_GUIDE.md](../documentation/AFFILIATE_SYSTEM_GUIDE.md)
- **Information Architecture**: [../documentation/INFORMATION_ARCHITECTURE.md](../documentation/INFORMATION_ARCHITECTURE.md)
- **DaisyUI Setup**: [../documentation/DAISYUI_SETUP.md](../documentation/DAISYUI_SETUP.md)
- **File Upload Setup**: [../documentation/FILE_UPLOAD_SETUP.md](../documentation/FILE_UPLOAD_SETUP.md)

## Application Overview

This is the main Aevani application. It contains a hardening-in-progress commerce platform, educational content, and affiliate foundations. Public product publication remains disabled until supplier, offer, fulfillment, and claim evidence is reviewed.

## Key Features

### Public Facing Features

- **Catalog truth boundary**
  - Research records for hydroponics, aquaponics, silvopasture, and agroforestry
  - Public product, price, stock, and structured-data publication disabled until verified

- **User Authentication**
  - Secure login/register system
  - User profiles and order history

- **Shopping Cart**
  - Server-bound anonymous and authenticated cart identities
  - Mutation and ownership safeguards

- **Checkout System**
  - Immutable server-priced draft and Stripe verification architecture
  - Feature-gated until migration reconciliation and release rehearsal

- **Content Management System**
  - Built-in CMS for blog posts, guides, and educational content
  - Rich text editor for content creation
  - SEO optimization features
  - Content categorization and tagging

### Admin Backend Features

- **Product Management**
  - Upload new products
  - Edit existing products
  - Delete products
  - Manage product categories

- **Order Management**
  - View all orders
  - Track order status
  - Update order details

- **Affiliate Program**
  - Approved-affiliate links, signed attribution, and immutable commission-ledger foundations
  - Payout and external fulfillment activation require their source-only migration rehearsal

- **User Management**
  - Manage admin users
  - Role-based access control

## Technology Stack

- **Frontend**
  - SvelteKit for modern web development
  - TypeScript for type safety
  - Tailwind CSS for styling

- **Backend**
  - TrPC for type-safe API development
  - Zod for request/response validation
  - Drizzle ORM for database operations
  - Custom CMS built with SvelteKit

- **Database**
  - PostgreSQL for relational data storage
  - Comprehensive schema for e-commerce and affiliate tracking

- **Dependency Management**
  - npm for package management

- **Authentication**
  - Lucia Auth for secure session management
  - Role-based access control (admin, customer, affiliate)

## Goals

1. **E-commerce Platform**
   - User-friendly interface for browsing and purchasing products
   - Secure payment processing
   - Order tracking and management
   - Inventory management system

2. **Admin Backend**
   - User authentication and authorization
   - Product management (upload, edit, delete)
   - Order management and reporting
   - Affiliate link management

3. **Database Integration**
   - PostgreSQL database for product catalog and user data
   - Drizzle ORM for type-safe database operations
   - Data modeling for hydroponics, aquaponics, and agroforestry products

4. **API Development**
   - TrPC for type-safe API endpoints
   - Zod for request/response validation
   - RESTful API for frontend-backend communication

## Current Implementation Status

### ✅ Completed Features

- **Database Schema**: Drizzle schema with a documented unresolved migration baseline
- **User Authentication**: Session, capability, lockout, and recovery hardening
- **Affiliate System**: Approved-status and source-only immutable-ledger foundation
- **API Layer**: tRPC endpoints with resource authorization work in progress
- **Product Management**: Admin-side CRUD; public publication is deliberately fail-closed
- **Content Management System**: CMS, guides, and FAQ foundations with stored-HTML safeguards

### 🚧 In Development

- **Frontend UI Components**: Svelte components for admin and user interfaces
- **Shopping Cart**: Cart management and checkout flow
- **Payment Processing**: Integration with payment providers
- **File Upload**: Product image and content media management
- **Email System**: Account email delivery when a configured provider is present; newsletter signup is unavailable

### 📋 Planned Features

- **Advanced Analytics**: Revenue tracking and business intelligence
- **SEO Optimization**: Meta tags and structured data
- **Mobile App**: React Native mobile application
- **Multi-language Support**: Internationalization
- **Advanced Shipping**: Multiple shipping methods and calculations

## Database Schema Overview

### Core Tables
- `user` - User accounts with role-based access
- `session` - Authentication sessions
- `product` & `product_category` - Product catalog
- `product_image` - Product media management

### E-commerce Tables
- `cart` & `cart_item` - Shopping cart functionality
- `order` & `order_item` - Order management
- Affiliate attribution tracking in orders

### Affiliate System Tables
- `affiliate` - Affiliate account details and statistics
- `affiliate_link` - Generated affiliate links for products
- `affiliate_click` - Detailed click tracking and analytics

### CMS Tables
- `content_page` - Blog posts, guides, pages, and FAQs

## API Endpoints

### Affiliate System (`/api/trpc/affiliate.*`)
- `createAffiliate` - Create affiliate account
- `getStats` - Get affiliate statistics
- `createLink` - Generate product affiliate links
- `getLinks` - List user's affiliate links
- `trackClick` - Track link clicks (public)
- `getLinkByCode` - Get link details for redirects (public)

### Product Management (`/api/trpc/products.*`)
- `getProducts` - List products with filtering
- `getProduct` - Get single product details
- `createProduct` - Create new product (admin)
- `updateProduct` - Update product (admin)
- `deleteProduct` - Delete product (admin)

### Content Management (`/api/trpc/content.*`)
- `getPublishedPages` - List published content
- `getPage` - Get single page by slug
- `createPage` - Create content page
- `updatePage` - Update content page
- `deletePage` - Delete content page

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Docker (optional, for local database)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository>/plantapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `plantapp` directory (copy from `.env.example` if it exists):
   ```
   DATABASE_URL="postgresql://plantcommerce:plantcommerce_dev_password@localhost:5432/plantcommerce"
   ```
   
   For local development with Docker Compose, the default values are:
   - User: `plantcommerce`
   - Password: `plantcommerce_dev_password`
   - Database: `plantcommerce`
   - Port: `5432`

4. **Start PostgreSQL database**
   ```bash
   # Using Docker Compose
   npm run db:start
   
   # Or connect to your existing PostgreSQL instance
   ```

5. **Reconcile the database baseline before applying schema changes**
   ```bash
   # This repository currently has unresolved Drizzle history.
   # Read drizzle/AGENTS.md; do not run db:push or db:migrate against a shared database.
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

### Database Management Commands

- `npm run db:start` - Start PostgreSQL with Docker Compose
- `npm run db:generate` - Generate a migration only after the baseline is reconciled
- `npm run db:push` - Do not use until the baseline is reconciled and a release procedure is approved
- `npm run db:migrate` - Do not use until the baseline is reconciled and a release procedure is approved
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## License

MIT License
