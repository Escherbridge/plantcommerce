# PlantCommerce

A comprehensive sustainable agriculture e-commerce platform built with modern web technologies, featuring hydroponics, aquaponics, silvopasture, and agroforestry products with a robust affiliate marketing system.

## 🌱 Overview

PlantCommerce is a full-stack e-commerce application designed to promote and sell products related to sustainable agriculture practices. The platform combines a modern, user-friendly shopping experience with powerful backend management tools, comprehensive affiliate marketing capabilities, and educational content management.

### Mission
To make sustainable agriculture accessible to everyone by providing high-quality products, comprehensive educational resources, and innovative affiliate marketing tools that support the growth of the sustainable farming community.

## 🚀 Key Features

### E-commerce Platform
- **Multi-Category Product Catalog**: Hydroponics, Aquaponics, Silvopasture, and Agroforestry products
- **Advanced Shopping Cart**: Full cart management with quantity adjustments and discount codes
- **Secure Checkout**: Integrated payment processing with order tracking
- **User Authentication**: Role-based access control (Customer, Affiliate, Admin)
- **Order Management**: Complete order lifecycle from placement to fulfillment

### Affiliate Marketing System
- **Automated Link Generation**: Create affiliate links for any product with unique tracking codes
- **Real-time Analytics**: Comprehensive click tracking, conversion monitoring, and earnings calculation
- **Commission Management**: Configurable commission rates with automatic calculations
- **Performance Dashboard**: Detailed statistics and performance metrics for affiliates
- **Attribution Tracking**: 30-day cookie-based attribution with detailed click analytics

### Content Management System
- **Educational Content**: Built-in CMS for guides, blog posts, and FAQs
- **Rich Text Editor**: Advanced content creation tools with SEO optimization
- **Media Management**: File upload system with Google Cloud Storage integration
- **Content Organization**: Categorization, tagging, and search functionality

### Admin Backend
- **Product Management**: Complete CRUD operations for products and categories
- **Order Processing**: Order tracking, status updates, and customer communication
- **User Management**: Customer and affiliate account management
- **Analytics Dashboard**: Sales reports, customer insights, and business intelligence

## 🛠 Technology Stack

### Frontend
- **SvelteKit**: Modern full-stack web framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for rapid UI development
- **Lucia Auth**: Secure authentication system

### Backend
- **tRPC**: End-to-end typesafe APIs
- **Zod**: Runtime type validation
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Relational database
- **Google Cloud Storage**: File storage and management

### Development Tools
- **Storybook**: Component development and documentation
- **Prettier**: Code formatting
- **Docker**: Containerized development environment
- **Vite**: Fast build tool and development server

## 📁 Project Structure

```
plantcommerce/
├── plantapp/                    # Main application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── server/          # Backend services and APIs
│   │   │   └── trpc/           # Type-safe API client
│   │   ├── routes/             # SvelteKit pages and API routes
│   │   └── stories/            # Storybook component stories
│   ├── static/                 # Static assets
│   └── package.json           # Dependencies and scripts
├── documentation/             # Project documentation
│   ├── AFFILIATE_SYSTEM_GUIDE.md
│   ├── DAISYUI_SETUP.md
│   ├── FILE_UPLOAD_SETUP.md
│   └── INFORMATION_ARCHITECTURE.md
└── README.md                  # This file
```

## 📚 Documentation

### System Documentation
- **[Affiliate System Guide](documentation/AFFILIATE_SYSTEM_GUIDE.md)** - Comprehensive guide to the affiliate marketing system, including API usage, database schema, and implementation details
- **[Information Architecture](documentation/INFORMATION_ARCHITECTURE.md)** - Complete site structure, navigation patterns, and content strategy
- **[DaisyUI Setup Guide](documentation/DAISYUI_SETUP.md)** - UI framework configuration and component usage
- **[File Upload Setup](documentation/FILE_UPLOAD_SETUP.md)** - Google Cloud Storage integration and file management system

### Application Features

#### E-commerce Core
- **Product Catalog**: Multi-category product management with advanced filtering
- **Shopping Experience**: Intuitive cart management and streamlined checkout
- **Order Processing**: Complete order lifecycle with status tracking
- **User Management**: Role-based access control and profile management

#### Affiliate Marketing
- **Link Generation**: Automatic creation of unique, trackable affiliate links
- **Click Tracking**: Detailed analytics with IP, user agent, and referrer data
- **Conversion Attribution**: Cookie-based attribution with configurable duration
- **Commission Calculation**: Automatic earnings calculation with real-time updates
- **Performance Analytics**: Comprehensive dashboard with conversion metrics

#### Content Management
- **Educational Resources**: Guides, tutorials, and FAQ management
- **Blog System**: Content creation with rich text editing and SEO optimization
- **Media Library**: File upload and management with cloud storage
- **Search & Discovery**: Advanced content organization and search capabilities

## 🎯 Goals & Objectives

### Primary Goals
1. **Accessible Sustainable Agriculture**: Make eco-friendly farming products and knowledge available to everyone
2. **Community Building**: Foster a community of sustainable agriculture enthusiasts through educational content
3. **Affiliate Growth**: Enable content creators and influencers to monetize their expertise in sustainable farming
4. **Business Intelligence**: Provide comprehensive analytics for data-driven business decisions

### Technical Objectives
1. **Performance**: Fast, responsive user experience across all devices
2. **Scalability**: Architecture that can grow with the business
3. **Security**: Robust authentication and data protection
4. **Maintainability**: Clean, well-documented, and testable codebase

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Docker (optional, for local database)
- Google Cloud Storage account (for file uploads)

### Quick Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd plantcommerce/plantapp
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and GCS credentials
   ```

3. **Database Setup**
   ```bash
   npm run db:start      # Start PostgreSQL with Docker
   npm run db:push       # Apply database schema
   npm run db:studio     # Open database GUI (optional)
   ```

4. **Development Server**
   ```bash
   npm run dev           # Start development server
   ```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:start` - Start PostgreSQL with Docker
- `npm run db:studio` - Open Drizzle Studio
- `npm run storybook` - Start Storybook component library
- `npm run format` - Format code with Prettier

## 🏗 Architecture

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following key areas:

#### Core Tables
- `user` - User accounts with role-based access
- `session` - Authentication sessions
- `product` & `product_category` - Product catalog
- `cart` & `cart_item` - Shopping cart functionality
- `order` & `order_item` - Order management

#### Affiliate System
- `affiliate` - Affiliate account details and statistics
- `affiliate_link` - Generated affiliate links for products
- `affiliate_click` - Detailed click tracking and analytics

#### Content Management
- `content_page` - Blog posts, guides, pages, and FAQs
- `file` - File metadata and cloud storage references

### API Architecture
- **tRPC**: End-to-end type safety with automatic client generation
- **Zod Validation**: Runtime type checking for all API endpoints
- **Role-based Access**: Protected routes with user authentication
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🌟 Key Differentiators

### Advanced Affiliate System
Unlike basic affiliate programs, PlantCommerce features:
- **Automatic Attribution**: Cookie-based tracking that works for both registered and guest users
- **Real-time Analytics**: Live click and conversion tracking with detailed metrics
- **Flexible Commission Rates**: Configurable rates per affiliate with automatic calculations
- **Comprehensive Reporting**: Detailed performance analytics and earnings tracking

### Educational Focus
- **Built-in CMS**: Content management system specifically designed for educational content
- **SEO Optimization**: Advanced SEO features for content discoverability
- **Rich Media Support**: Integration with cloud storage for images, videos, and documents
- **Community Features**: User-generated content and community engagement tools

### Modern Technology Stack
- **Type Safety**: End-to-end TypeScript with tRPC for type-safe APIs
- **Performance**: Optimized with SvelteKit's server-side rendering and code splitting
- **Developer Experience**: Comprehensive tooling with Storybook, Prettier, and hot reloading
- **Scalability**: Cloud-native architecture with containerization support

## 🤝 Contributing

We welcome contributions from the sustainable agriculture community! Please see our contributing guidelines for:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [See documentation/ folder]
- **API Reference**: [Generated from tRPC schemas]
- **Component Library**: Run `npm run storybook` for Storybook

---

**PlantCommerce** - Growing the future of sustainable agriculture through technology and community.
