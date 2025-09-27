<script lang="ts">
  interface BreadcrumbItem {
    name: string;
    url?: string;
    isActive?: boolean;
  }

  interface Props {
    items: BreadcrumbItem[];
    separator?: 'slash' | 'arrow' | 'chevron' | 'dot';
    showHome?: boolean;
    homeUrl?: string;
    homeName?: string;
    className?: string;
    linkClassName?: string;
    activeClassName?: string;
    maxItems?: number;
  }

  let {
    items,
    separator = 'chevron',
    showHome = true,
    homeUrl = '/',
    homeName = 'Home',
    className = '',
    linkClassName = '',
    activeClassName = '',
    maxItems
  }: Props = $props();

  const processedItems = $derived(processItems());
  const separatorIcon = $derived(getSeparatorIcon());

  function processItems(): BreadcrumbItem[] {
    let processedList = [...items];
    
    // Add home item if requested
    if (showHome && (!processedList.length || processedList[0].url !== homeUrl)) {
      processedList.unshift({
        name: homeName,
        url: homeUrl,
        isActive: false
      });
    }

    // Handle max items with ellipsis
    if (maxItems && processedList.length > maxItems) {
      const firstItem = processedList[0];
      const lastItems = processedList.slice(-(maxItems - 2));
      
      processedList = [
        firstItem,
        { name: '...', isActive: false },
        ...lastItems
      ];
    }

    return processedList;
  }

  function getSeparatorIcon(): string {
    const icons = {
      slash: '/',
      arrow: '→',
      chevron: '›',
      dot: '·'
    };
    return icons[separator];
  }

  function handleItemClick(item: BreadcrumbItem) {
    if (item.url && !item.isActive) {
      // Let the browser handle navigation for regular URLs
      return;
    }
  }
</script>

<nav aria-label="Breadcrumb" class="breadcrumbs {className}">
  <ol class="flex items-center space-x-2 text-sm">
    {#each processedItems as item, index}
      <li class="flex items-center">
        {#if index > 0}
          <span class="mx-2 text-base-content/40 select-none" aria-hidden="true">
            {#if separator === 'chevron'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            {:else if separator === 'arrow'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            {:else}
              {separatorIcon}
            {/if}
          </span>
        {/if}

        {#if item.name === '...'}
          <!-- Ellipsis item -->
          <span class="text-base-content/40 px-2" aria-label="More breadcrumbs">
            ...
          </span>
        {:else if item.isActive || !item.url}
          <!-- Active/current item -->
          <span 
            class="text-base-content font-medium {activeClassName}"
            aria-current="page"
          >
            {item.name}
          </span>
        {:else}
          <!-- Linked item -->
          <a
            href={item.url}
            class="text-base-content/70 hover:text-base-content transition-colors duration-200 {linkClassName}"
            onclick={() => handleItemClick(item)}
          >
            {item.name}
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .breadcrumbs {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .breadcrumbs::-webkit-scrollbar {
    display: none;
  }
  
  .breadcrumbs ol {
    white-space: nowrap;
    min-width: max-content;
  }
</style>
