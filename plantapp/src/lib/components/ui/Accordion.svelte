<script lang="ts">
  interface AccordionItem {
    id: string;
    title: string;
    content: string;
    disabled?: boolean;
    defaultOpen?: boolean;
  }

  interface Props {
    items: AccordionItem[];
    allowMultiple?: boolean;
    variant?: 'default' | 'bordered' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onToggle?: (itemId: string, isOpen: boolean) => void;
  }

  let {
    items,
    allowMultiple = false,
    variant = 'default',
    size = 'md',
    className = '',
    onToggle
  }: Props = $props();

  // Track which items are open
  let openItems = $state(new Set<string>());

  // Initialize open items based on defaultOpen
  $effect(() => {
    const initialOpen = items.filter(item => item.defaultOpen).map(item => item.id);
    openItems = new Set(initialOpen);
  });

  function toggleItem(itemId: string) {
    const isCurrentlyOpen = openItems.has(itemId);
    
    if (isCurrentlyOpen) {
      // Close the item
      openItems.delete(itemId);
      openItems = new Set(openItems);
    } else {
      // Open the item
      if (!allowMultiple) {
        // Close all other items
        openItems.clear();
      }
      openItems.add(itemId);
      openItems = new Set(openItems);
    }
    
    onToggle?.(itemId, !isCurrentlyOpen);
  }

  function handleKeydown(event: KeyboardEvent, itemId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(itemId);
    }
  }

  const accordionClass = $derived(buildAccordionClass());
  const itemClass = $derived(buildItemClass());
  const contentClass = $derived(buildContentClass());

  function buildAccordionClass(): string {
    const baseClasses = ['accordion'];
    
    const variantClasses = {
      default: '',
      bordered: 'accordion-bordered',
      ghost: 'accordion-ghost'
    };
    
    if (variantClasses[variant]) {
      baseClasses.push(variantClasses[variant]);
    }
    
    return baseClasses.join(' ');
  }

  function buildItemClass(): string {
    const sizeClasses = {
      sm: 'collapse-sm',
      md: '',
      lg: 'collapse-lg'
    };
    
    return `collapse collapse-arrow ${sizeClasses[size]}`;
  }

  function buildContentClass(): string {
    const sizeClasses = {
      sm: 'text-sm',
      md: '',
      lg: 'text-lg'
    };
    
    return `collapse-content ${sizeClasses[size]}`;
  }
</script>

<div class="{accordionClass} {className}">
  {#each items as item}
    <div class="{itemClass} {variant === 'bordered' ? 'border border-base-300 rounded-box mb-2' : ''}">
      <input
        type="radio"
        name="accordion-{Math.random().toString(36)}"
        class="collapse-input"
        checked={openItems.has(item.id)}
        disabled={item.disabled}
        onchange={() => !item.disabled && toggleItem(item.id)}
      />
      
      <!-- Accordion Header -->
      <div
        class="collapse-title font-medium cursor-pointer
          {item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          {variant === 'ghost' ? 'hover:bg-base-200' : ''}"
        role="button"
        tabindex={item.disabled ? -1 : 0}
        aria-expanded={openItems.has(item.id)}
        aria-controls="content-{item.id}"
        onclick={() => !item.disabled && toggleItem(item.id)}
        onkeydown={(e) => !item.disabled && handleKeydown(e, item.id)}
      >
        <div class="flex items-center justify-between">
          <span>{item.title}</span>
          
          <!-- Custom arrow icon -->
          <svg
            class="w-4 h-4 transition-transform duration-200 {openItems.has(item.id) ? 'rotate-90' : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      <!-- Accordion Content -->
      <div
        id="content-{item.id}"
        class="{contentClass}"
        role="region"
        aria-labelledby="header-{item.id}"
      >
        <div class="py-2">
          {@html item.content}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  /* Override DaisyUI collapse behavior for custom control */
  .collapse-input {
    display: none;
  }
  
  .collapse-input:checked ~ .collapse-content {
    max-height: fit-content;
    padding-bottom: 1rem;
  }
  
  .collapse-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out, padding-bottom 0.3s ease-in-out;
    padding-bottom: 0;
  }
  
  /* Focus styles for accessibility */
  .collapse-title:focus {
    outline: 2px solid hsl(var(--p));
    outline-offset: 2px;
  }
  
  /* Smooth arrow transition */
  .collapse-title svg {
    transition: transform 0.2s ease-in-out;
  }
</style>
