<script lang="ts">
  import { onMount } from 'svelte';

  interface CarouselItem {
    id: string;
    content: any; // Can be HTML string or component content
    alt?: string; // For accessibility
  }

  interface Props {
    items: CarouselItem[];
    autoplay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
    infinite?: boolean;
    slidesToShow?: number;
    slidesToScroll?: number;
    responsive?: {
      breakpoint: number;
      slidesToShow: number;
      slidesToScroll?: number;
    }[];
    className?: string;
    itemClassName?: string;
    onSlideChange?: (currentIndex: number) => void;
  }

  let {
    items,
    autoplay = false,
    interval = 5000,
    showDots = true,
    showArrows = true,
    infinite = true,
    slidesToShow = 1,
    slidesToScroll = 1,
    responsive = [],
    className = '',
    itemClassName = '',
    onSlideChange
  }: Props = $props();

  let currentIndex = $state(0);
  let containerElement: HTMLDivElement;
  let trackElement: HTMLDivElement;
  let autoplayTimer: ReturnType<typeof setInterval> | null = null;
  let isTransitioning = $state(false);
  let touchStartX = 0;
  let touchEndX = 0;
  let currentSlidesToShow = $state(slidesToShow);

  // Calculate responsive slides to show
  function updateResponsiveSettings() {
    const windowWidth = window.innerWidth;
    const matchingBreakpoint = responsive
      .sort((a, b) => b.breakpoint - a.breakpoint)
      .find(bp => windowWidth >= bp.breakpoint);
    
    if (matchingBreakpoint) {
      currentSlidesToShow = matchingBreakpoint.slidesToShow;
    } else {
      currentSlidesToShow = slidesToShow;
    }
  }

  // Initialize autoplay
  function startAutoplay() {
    if (!autoplay) return;
    
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
    }
    
    autoplayTimer = setInterval(() => {
      goToNext();
    }, interval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Navigation functions
  function goToPrevious() {
    if (isTransitioning) return;
    
    const newIndex = currentIndex - slidesToScroll;
    
    if (newIndex < 0) {
      if (infinite) {
        goToSlide(Math.max(0, items.length - currentSlidesToShow));
      }
    } else {
      goToSlide(newIndex);
    }
  }

  function goToNext() {
    if (isTransitioning) return;
    
    const newIndex = currentIndex + slidesToScroll;
    const maxIndex = items.length - currentSlidesToShow;
    
    if (newIndex > maxIndex) {
      if (infinite) {
        goToSlide(0);
      }
    } else {
      goToSlide(newIndex);
    }
  }

  function goToSlide(index: number) {
    if (isTransitioning) return;
    
    const maxIndex = Math.max(0, items.length - currentSlidesToShow);
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    
    if (newIndex !== currentIndex) {
      isTransitioning = true;
      currentIndex = newIndex;
      onSlideChange?.(newIndex);
      
      setTimeout(() => {
        isTransitioning = false;
      }, 300);
    }
  }

  // Touch handlers
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  }

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
    }
  }

  onMount(() => {
    updateResponsiveSettings();
    
    // Handle resize
    const handleResize = () => {
      updateResponsiveSettings();
    };
    
    window.addEventListener('resize', handleResize);
    startAutoplay();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      stopAutoplay();
    };
  });

  // Restart autoplay when user interacts
  function handleUserInteraction() {
    stopAutoplay();
    startAutoplay();
  }

  const slideWidth = $derived(100 / currentSlidesToShow);
  const translateX = $derived(-(currentIndex * (100 / currentSlidesToShow)));
  const maxDotIndex = $derived(Math.max(0, items.length - currentSlidesToShow));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="carousel-container relative overflow-hidden {className}"
  onmouseenter={stopAutoplay}
  onmouseleave={startAutoplay}
  onkeydown={handleKeydown}
  tabindex="0"
  role="region"
  aria-label="Image carousel"
  aria-roledescription="carousel"
>
  <div
    class="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
    role="group"
  >
  <!-- Main carousel track -->
  <div
    bind:this={containerElement}
    class="carousel-viewport overflow-hidden"
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
  >
    <div
      bind:this={trackElement}
      class="carousel-track flex transition-transform duration-300 ease-in-out"
      style="transform: translateX({translateX}%)"
    >
      {#each items as item, index}
        <div
          class="carousel-slide flex-shrink-0 {itemClassName}"
          style="width: {slideWidth}%"
          role="tabpanel"
          aria-label="Slide {index + 1} of {items.length}"
        >
          <div class="w-full h-full">
            {#if typeof item.content === 'string'}
              {@html item.content}
            {:else}
              {item.content}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Navigation arrows -->
  {#if showArrows && items.length > currentSlidesToShow}
    <!-- Previous arrow -->
    <button
      class="carousel-arrow carousel-arrow-prev absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost bg-black/20 text-white hover:bg-black/40 border-none z-10"
      onclick={() => { goToPrevious(); handleUserInteraction(); }}
      disabled={!infinite && currentIndex === 0}
      aria-label="Previous slide"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Next arrow -->
    <button
      class="carousel-arrow carousel-arrow-next absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost bg-black/20 text-white hover:bg-black/40 border-none z-10"
      onclick={() => { goToNext(); handleUserInteraction(); }}
      disabled={!infinite && currentIndex >= maxDotIndex}
      aria-label="Next slide"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  {/if}

  <!-- Dot indicators -->
  {#if showDots && items.length > currentSlidesToShow}
    <div class="carousel-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {#each Array(Math.ceil(items.length / currentSlidesToShow)) as _, dotIndex}
        <button
          class="carousel-dot w-3 h-3 rounded-full transition-all duration-200
            {currentIndex === dotIndex * slidesToScroll ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}"
          onclick={() => { goToSlide(dotIndex * slidesToScroll); handleUserInteraction(); }}
          aria-label="Go to slide {dotIndex + 1}"
        ></button>
      {/each}
    </div>
  {/if}
  </div>
</div>

<style>
  .carousel-container {
    user-select: none;
  }
  
  .carousel-container:focus {
    outline: 2px solid hsl(var(--p));
    outline-offset: 2px;
  }
  
  .carousel-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .carousel-slide {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Smooth touch scrolling on mobile */
  @media (hover: none) and (pointer: coarse) {
    .carousel-arrow {
      opacity: 0.8;
    }
  }
</style>
