<script lang="ts">
  interface Props {
    direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    wrap?: boolean | 'reverse';
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    className?: string;
    children: any;
  }

  let {
    direction = 'row',
    align = 'start',
    justify = 'start',
    wrap = false,
    gap = 'md',
    className = '',
    children
  }: Props = $props();

  const flexClasses = $derived(buildFlexClasses());
  
  function buildFlexClasses(): string {
    let classes = ['flex'];

    // Direction
    const directionMap = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse'
    };
    classes.push(directionMap[direction]);

    // Alignment
    const alignMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    };
    classes.push(alignMap[align]);

    // Justification
    const justifyMap = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    };
    classes.push(justifyMap[justify]);

    // Wrap
    if (wrap === true) {
      classes.push('flex-wrap');
    } else if (wrap === 'reverse') {
      classes.push('flex-wrap-reverse');
    }

    // Gap (Swiss design spacing)
    if (typeof gap === 'number') {
      classes.push(`gap-${gap}`);
    } else {
      const gapMap = {
        xs: 'gap-1',    // 4px
        sm: 'gap-2',    // 8px
        md: 'gap-4',    // 16px
        lg: 'gap-6',    // 24px
        xl: 'gap-8'     // 32px
      };
      classes.push(gapMap[gap]);
    }

    return classes.join(' ');
  }
</script>

<div class="{flexClasses} {className}">
  {@render children()}
</div>
