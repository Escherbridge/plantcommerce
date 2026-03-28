<script lang="ts">
  import type { Snippet, Component } from 'svelte';

  let {
    pattern,
    patternProps = {},
    color = 'currentColor',
    opacity = 0.1,
    blendMode = 'multiply',
    animate = false,
    class: className = '',
    children,
  }: {
    pattern: Component<any>;
    patternProps?: Record<string, any>;
    color?: string;
    opacity?: number;
    blendMode?: string;
    animate?: boolean;
    class?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="relative {className}">
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden"
    style="opacity: {opacity}; mix-blend-mode: {blendMode}; color: {color};"
    aria-hidden="true"
  >
    <svelte:component this={pattern} color={color} opacity={1} animate={animate} {...patternProps} />
  </div>
  {#if children}
    <div class="relative z-10">
      {@render children()}
    </div>
  {/if}
</div>
