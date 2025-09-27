# Component Library

A comprehensive set of composable and generic components built with DaisyUI and Swiss design principles.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Forms](#forms)
- [Layout](#layout)
- [Images](#images)
- [Navigation](#navigation)
- [UI Components](#ui-components)

## Installation & Setup

All components are built using DaisyUI and follow Swiss design principles with mobile-friendly responsive design.

```javascript
// Import individual components
import { BaseForm, MultiStepForm, Grid, OptimizedImage } from '$lib/components';

// Or import specific categories
import { BaseForm, RichTextEditor } from '$lib/components/forms';
import { Grid, Container, Section } from '$lib/components/layout';
```

## Forms

### BaseForm

A flexible form component that handles various input types, validation, and state management.

```javascript
import { BaseForm } from '$lib/components';

const formFields = [
  {
    id: 'name',
    name: 'name',
    type: 'text',
    label: 'Full Name',
    required: true,
    validation: {
      minLength: 2
    }
  },
  {
    id: 'email',
    name: 'email', 
    type: 'email',
    label: 'Email Address',
    required: true
  },
  {
    id: 'bio',
    name: 'bio',
    type: 'textarea',
    label: 'Biography',
    placeholder: 'Tell us about yourself...'
  }
];

function handleSubmit(data) {
  console.log('Form data:', data);
}
```

```svelte
<BaseForm 
  fields={formFields} 
  onSubmit={handleSubmit}
  submitButtonText="Create Account"
/>
```

### MultiStepForm

Create multi-step forms with progress tracking and validation per step.

```javascript
const multiStepConfig = {
  steps: [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Let us know about yourself',
      fields: [
        { id: 'firstName', name: 'firstName', type: 'text', label: 'First Name', required: true },
        { id: 'lastName', name: 'lastName', type: 'text', label: 'Last Name', required: true }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Details', 
      fields: [
        { id: 'email', name: 'email', type: 'email', label: 'Email', required: true },
        { id: 'phone', name: 'phone', type: 'tel', label: 'Phone Number' }
      ]
    }
  ],
  onSubmit: handleFormSubmit,
  showProgress: true,
  allowBackNavigation: true
};
```

```svelte
<MultiStepForm config={multiStepConfig} />
```

### Rich Text Editor

Rich text editing with Quill integration and fallback to textarea.

```javascript
const richTextField = {
  id: 'content',
  name: 'content',
  type: 'richtext',
  label: 'Content',
  richTextConfig: {
    placeholder: 'Start writing your content...',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image']
      ]
    }
  }
};
```

### File Upload

Drag-and-drop or button-based file uploads with preview.

```javascript
const fileField = {
  id: 'documents',
  name: 'documents', 
  type: 'multifile',
  label: 'Upload Documents',
  dragDrop: true,
  multiple: true,
  accept: '.pdf,.doc,.docx',
  fileHandler: (files) => {
    console.log('Files selected:', files);
  }
};
```

### Date Picker

Date, time, and datetime inputs with enhanced UI.

```javascript
const dateField = {
  id: 'eventDate',
  name: 'eventDate',
  type: 'date',
  label: 'Event Date',
  required: true,
  validation: {
    min: '2024-01-01',
    max: '2024-12-31'
  }
};
```

## Layout

### Grid System

Responsive grid layout following Swiss design principles.

```svelte
<Grid 
  columns={{ sm: 1, md: 2, lg: 3 }} 
  gap="md" 
  align="start"
>
  <GridItem span={2}>
    <div>Spans 2 columns</div>
  </GridItem>
  <GridItem>
    <div>Single column</div>
  </GridItem>
</Grid>
```

### Container

Responsive containers with Swiss design sizing.

```svelte
<Container size="lg" padding="md">
  <h1>Content goes here</h1>
</Container>
```

### Section  

Page sections with consistent spacing and backgrounds.

```svelte
<Section spacing="xl" background="primary">
  <h2>Hero Section</h2>
</Section>
```

### Flex

Flexible box layout with comprehensive options.

```svelte
<Flex direction="row" align="center" justify="between" gap="lg">
  <div>Left item</div>
  <div>Right item</div>
</Flex>
```

## Images

### OptimizedImage

Performance-optimized images with lazy loading, multiple formats, and responsive sizing.

```svelte
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={800}
  aspectRatio="video"
  loading="lazy"
  placeholder="blur"
  formats={['webp', 'jpg']}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### ImageGallery

Grid-based image gallery with lightbox functionality.

```javascript
const galleryImages = [
  {
    src: '/images/gallery1.jpg',
    alt: 'Gallery image 1',
    title: 'Beautiful Landscape',
    description: 'A stunning view of the mountains',
    thumbnail: '/images/gallery1-thumb.jpg'
  },
  // ... more images
];
```

```svelte
<ImageGallery
  images={galleryImages}
  columns={{ sm: 2, md: 3, lg: 4 }}
  showLightbox={true}
  aspectRatio="square"
/>
```

## Navigation

### Breadcrumbs

Dynamic breadcrumb navigation with customizable separators.

```javascript
const breadcrumbItems = [
  { name: 'Products', url: '/products' },
  { name: 'Electronics', url: '/products/electronics' },
  { name: 'Laptops', url: '/products/electronics/laptops' },
  { name: 'MacBook Pro', isActive: true }
];
```

```svelte
<Breadcrumbs
  items={breadcrumbItems}
  separator="chevron"
  showHome={true}
  maxItems={4}
/>
```

## UI Components

### Accordion

Collapsible content sections with accessibility support.

```javascript
const accordionItems = [
  {
    id: 'faq1',
    title: 'What is your return policy?',
    content: 'We offer a 30-day return policy on all items...',
    defaultOpen: true
  },
  {
    id: 'faq2', 
    title: 'How do I track my order?',
    content: 'You can track your order using the tracking number...'
  }
];
```

```svelte
<Accordion
  items={accordionItems}
  allowMultiple={false}
  variant="bordered"
  size="md"
/>
```

### Carousel

Responsive carousel with touch support, autoplay, and navigation.

```javascript
const carouselItems = [
  {
    id: 'slide1',
    content: '<img src="/slide1.jpg" alt="Slide 1" class="w-full h-64 object-cover" />'
  },
  {
    id: 'slide2', 
    content: '<img src="/slide2.jpg" alt="Slide 2" class="w-full h-64 object-cover" />'
  }
];
```

```svelte
<Carousel
  items={carouselItems}
  autoplay={true}
  interval={5000}
  showDots={true}
  showArrows={true}
  infinite={true}
  slidesToShow={1}
  responsive={[
    { breakpoint: 768, slidesToShow: 2 },
    { breakpoint: 1024, slidesToShow: 3 }
  ]}
/>
```

## Design Principles

All components follow Swiss design principles:

- **Modular Scale**: Consistent spacing using ratios (1:1.618 golden ratio)
- **Grid System**: 12-column responsive grid with proper gutters  
- **Typography Scale**: Harmonious font sizes and line heights
- **Whitespace**: Generous, purposeful spacing
- **Mobile First**: Responsive design starting from mobile breakpoints

## Accessibility

All components include:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Focus management and visible focus indicators
- Screen reader compatibility
- Semantic HTML structure

## Customization

Components are highly customizable through:

- CSS classes and DaisyUI theme variables
- Configurable props for behavior and appearance
- Slot-based content injection where appropriate
- TypeScript interfaces for type safety
