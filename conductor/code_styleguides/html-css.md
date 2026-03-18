# HTML/CSS Code Styleguide

## Framework

- **Tailwind CSS 4.x** with **DaisyUI 5.x** component library
- Tailwind Vite plugin (`@tailwindcss/vite`)
- Prettier plugin for Tailwind class ordering

## Component Styling Priority

1. **DaisyUI semantic classes** first (`btn`, `card`, `modal`, `alert`, `badge`)
2. **Tailwind utilities** for layout, spacing, responsive design
3. **Custom CSS** only as last resort (in `<style>` blocks within Svelte components)

## Accessibility (WCAG AA)

- Color contrast: 4.5:1 minimum for body text, 3:1 for large text
- All `<img>` tags must have meaningful `alt` attributes
- All form `<input>` elements must have associated `<label>` elements
- Interactive elements must have visible `:focus` states
- Use `aria-` attributes for dynamic content (modals, dropdowns, alerts)
- Ensure full keyboard navigation support

## Responsive Design

- Mobile-first approach using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- Test at 320px, 768px, 1024px, and 1440px widths
- Use DaisyUI responsive utilities where available

## Layout Patterns

- Grid layouts for product catalogs and search results
- Stack layouts for forms and detail views
- Card-based layouts for content (guides, blog posts)
- Consistent spacing using Tailwind's spacing scale (multiples of 4px)

## Image Handling

- Use `OptimizedImage.svelte` and `ImageGallery.svelte` from `src/lib/components/images/`
- Always provide width/height or aspect-ratio to prevent layout shift
- Use meaningful `alt` text for all product and content images
