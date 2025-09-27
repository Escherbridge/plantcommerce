<script lang="ts">
  interface Props {
    span?: number | { sm?: number; md?: number; lg?: number; xl?: number };
    start?: number | { sm?: number; md?: number; lg?: number; xl?: number };
    end?: number | { sm?: number; md?: number; lg?: number; xl?: number };
    className?: string;
    children: any;
  }

  let {
    span,
    start,
    end,
    className = '',
    children
  }: Props = $props();

  const itemClasses = $derived(buildItemClasses());
  
  function buildItemClasses(): string {
    let classes: string[] = [];

    // Handle span
    if (span !== undefined) {
      if (typeof span === 'number') {
        classes.push(`col-span-${span}`);
      } else {
        if (span.sm) classes.push(`col-span-${span.sm}`);
        if (span.md) classes.push(`md:col-span-${span.md}`);
        if (span.lg) classes.push(`lg:col-span-${span.lg}`);
        if (span.xl) classes.push(`xl:col-span-${span.xl}`);
      }
    }

    // Handle start
    if (start !== undefined) {
      if (typeof start === 'number') {
        classes.push(`col-start-${start}`);
      } else {
        if (start.sm) classes.push(`col-start-${start.sm}`);
        if (start.md) classes.push(`md:col-start-${start.md}`);
        if (start.lg) classes.push(`lg:col-start-${start.lg}`);
        if (start.xl) classes.push(`xl:col-start-${start.xl}`);
      }
    }

    // Handle end
    if (end !== undefined) {
      if (typeof end === 'number') {
        classes.push(`col-end-${end}`);
      } else {
        if (end.sm) classes.push(`col-end-${end.sm}`);
        if (end.md) classes.push(`md:col-end-${end.md}`);
        if (end.lg) classes.push(`lg:col-end-${end.lg}`);
        if (end.xl) classes.push(`xl:col-end-${end.xl}`);
      }
    }

    return classes.join(' ');
  }
</script>

<div class="{itemClasses} {className}">
  {@render children()}
</div>
