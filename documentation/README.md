# PlantCommerce Documentation

Welcome to the PlantCommerce documentation hub. This directory contains comprehensive guides and technical documentation for the PlantCommerce sustainable agriculture e-commerce platform.

## 📚 Documentation Index

### System Architecture & Guides

#### [Affiliate System Guide](AFFILIATE_SYSTEM_GUIDE.md)
**Complete guide to the affiliate marketing system**
- System architecture and core components
- Database schema and relationships
- API usage examples and client integration
- Click tracking and conversion processing
- Security considerations and performance optimizations
- Link generation and attribution tracking

#### [Information Architecture](INFORMATION_ARCHITECTURE.md)
**Complete site structure and navigation design**
- Primary navigation structure (Shop, Learn, Affiliate, Support)
- User account areas and administrative sections
- Content strategy and organization
- SEO considerations and technical implementation
- Navigation patterns for desktop and mobile
- Accessibility guidelines and analytics tracking

### Technical Setup Guides

#### [DaisyUI Setup Guide](DAISYUI_SETUP.md)
**UI framework configuration and component usage**
- DaisyUI and Tailwind CSS configuration
- Component library setup and theming
- Available themes and customization options
- Development workflow and best practices
- Component examples and usage patterns

#### [File Upload Setup](FILE_UPLOAD_SETUP.md)
**Google Cloud Storage integration and file management**
- GCP setup and configuration
- Environment variables and security setup
- API endpoints and tRPC integration
- File organization and database schema
- Security features and usage examples

## 🏗 Project Structure

```
plantcommerce/
├── plantapp/                    # Main SvelteKit application
├── documentation/              # This documentation hub
│   ├── README.md              # This index file
│   ├── AFFILIATE_SYSTEM_GUIDE.md
│   ├── DAISYUI_SETUP.md
│   ├── FILE_UPLOAD_SETUP.md
│   └── INFORMATION_ARCHITECTURE.md
└── README.md                  # Main project overview
```

## 🚀 Quick Navigation

### For Developers
- **Getting Started**: See [main README.md](../README.md) for setup instructions
- **API Reference**: Generated from tRPC schemas in the application
- **Component Library**: Run `npm run storybook` in the plantapp directory

### For System Administrators
- **Database Setup**: [Affiliate System Guide](AFFILIATE_SYSTEM_GUIDE.md#database-schema-details)
- **File Storage**: [File Upload Setup](FILE_UPLOAD_SETUP.md#gcp-setup)
- **UI Configuration**: [DaisyUI Setup Guide](DAISYUI_SETUP.md)

### For Content Managers
- **Site Structure**: [Information Architecture](INFORMATION_ARCHITECTURE.md#site-structure)
- **Content Strategy**: [Information Architecture](INFORMATION_ARCHITECTURE.md#content-strategy)
- **File Management**: [File Upload Setup](FILE_UPLOAD_SETUP.md#usage-examples)

### For Affiliate Partners
- **Program Overview**: [Affiliate System Guide](AFFILIATE_SYSTEM_GUIDE.md#overview)
- **Link Generation**: [Affiliate System Guide](AFFILIATE_SYSTEM_GUIDE.md#link-generation)
- **Analytics Dashboard**: [Affiliate System Guide](AFFILIATE_SYSTEM_GUIDE.md#real-time-analytics)

## 🔗 Related Resources

- **Main Project**: [../README.md](../README.md) - Complete project overview
- **Application Code**: [../plantapp/](../plantapp/) - Main application directory
- **API Documentation**: Generated from tRPC schemas in the running application
- **Component Library**: Storybook documentation (run `npm run storybook` in plantapp/)

## 📝 Documentation Standards

All documentation follows these standards:
- **Markdown Format**: Consistent formatting with clear headings
- **Code Examples**: Practical examples with syntax highlighting
- **Cross-References**: Links between related documentation
- **Regular Updates**: Documentation updated with code changes

## 🤝 Contributing to Documentation

When adding new features or making changes:
1. Update relevant documentation files
2. Add new guides to this index
3. Ensure cross-references are updated
4. Test all code examples and links

---

For the complete PlantCommerce project overview, architecture, and getting started guide, see the [main README.md](../README.md).
