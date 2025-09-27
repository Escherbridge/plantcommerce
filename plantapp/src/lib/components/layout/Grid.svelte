<script lang="ts">
  interface Props {
    columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    className?: string;
    children: any;
  }

  let {
    columns = 12,
    gap = 'md',
    align = 'start',
    justify = 'start',
    className = '',
    children
  }: Props = $props();

  const gridClasses = $derived(buildGridClasses());
  
  function buildGridClasses(): string {
    let classes = ['grid'];

    // Handle columns
    if (typeof columns === 'number') {
      classes.push(`grid-cols-${columns}`);
    } else {
      // Responsive columns
      if (columns.sm) classes.push(`grid-cols-${columns.sm}`);
      if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
      if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
      if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    }

    // Handle gap
    if (typeof gap === 'number') {
      classes.push(`gap-${gap}`);
    } else {
      const gapMap = {
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8'
      };
      classes.push(gapMap[gap]);
    }

    // Handle alignment
    const alignMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    };
    classes.push(alignMap[align]);

    // Handle justification
    const justifyMap = {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    };
    classes.push(justifyMap[justify]);

    return classes.join(' ');
  }
</script>

<div class="{gridClasses} {className}">
  {@render children()}
</div>
