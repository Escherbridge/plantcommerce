<script lang="ts">
  import OptimizedImage from './OptimizedImage.svelte';

  interface ImageItem {
    src: string;
    alt: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
    thumbnail?: string;
  }

  interface Props {
    images: ImageItem[];
    columns?: number | { sm?: number; md?: number; lg?: number };
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | string;
    showLightbox?: boolean;
    className?: string;
    onImageClick?: (image: ImageItem, index: number) => void;
  }

  let {
    images,
    columns = { sm: 1, md: 2, lg: 3 },
    gap = 'md',
    aspectRatio = 'square',
    showLightbox = false,
    className = '',
    onImageClick
  }: Props = $props();

  let lightboxOpen = $state(false);
  let currentImageIndex = $state(0);

  function openLightbox(index: number) {
    if (showLightbox) {
      currentImageIndex = index;
      lightboxOpen = true;
    }
    onImageClick?.(images[index], index);
  }

  function closeLightbox() {
    lightboxOpen = false;
  }

  function goToPrevious() {
    currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
  }

  function goToNext() {
    currentImageIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!lightboxOpen) return;
    
    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  }

  const gridClasses = $derived(buildGridClasses());

  function buildGridClasses(): string {
    let classes = ['grid'];

    if (typeof columns === 'number') {
      classes.push(`grid-cols-${columns}`);
    } else {
      if (columns.sm) classes.push(`grid-cols-${columns.sm}`);
      if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
      if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    }

    const currentGapClass = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    }[gap];
    
    classes.push(currentGapClass);
    return classes.join(' ');
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="{gridClasses} {className}">
  {#each images as image, index}
    <div
      class="group cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105"
      onclick={() => openLightbox(index)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      }}
      role="button"
      tabindex="0"
    >
      <OptimizedImage
        src={image.thumbnail || image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        {aspectRatio}
        className="transition-transform duration-300 group-hover:scale-110"
      />
      
      {#if image.title || image.description}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div class="p-4 text-white">
            {#if image.title}
              <h3 class="font-semibold text-sm mb-1">{image.title}</h3>
            {/if}
            {#if image.description}
              <p class="text-xs opacity-90">{image.description}</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

{#if lightboxOpen && showLightbox}
  <!-- Lightbox Modal -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    onclick={closeLightbox}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeLightbox();
      }
    }}
    role="dialog"
    aria-modal="true"
    aria-label="Image lightbox"
    tabindex="0"
  >
    <!-- Close button -->
    <button
      class="absolute top-4 right-4 z-10 btn btn-circle btn-ghost text-white hover:bg-white/20"
      onclick={closeLightbox}
      aria-label="Close lightbox"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Previous button -->
    {#if images.length > 1}
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost text-white hover:bg-white/20"
        onclick={(e) => { e.stopPropagation(); goToPrevious(); }}
        aria-label="Previous image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}

    <!-- Next button -->
    {#if images.length > 1}
      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost text-white hover:bg-white/20"
        onclick={(e) => { e.stopPropagation(); goToNext(); }}
        aria-label="Next image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}

    <!-- Main image -->
    <div
      class="relative max-w-full max-h-full"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="button"
      tabindex="0"
    >
      <OptimizedImage
        src={images[currentImageIndex].src}
        alt={images[currentImageIndex].alt}
        width={images[currentImageIndex].width}
        height={images[currentImageIndex].height}
        loading="eager"
        className="max-w-full max-h-[90vh] object-contain"
        objectFit="contain"
      />
      
      {#if images[currentImageIndex].title || images[currentImageIndex].description}
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          {#if images[currentImageIndex].title}
            <h3 class="font-semibold text-lg mb-2">{images[currentImageIndex].title}</h3>
          {/if}
          {#if images[currentImageIndex].description}
            <p class="opacity-90">{images[currentImageIndex].description}</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Image counter -->
    {#if images.length > 1}
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
        {currentImageIndex + 1} / {images.length}
      </div>
    {/if}
  </div>
{/if}
