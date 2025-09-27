<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    center?: boolean;
    className?: string;
    children: any;
  }

  let {
    size = 'lg',
    padding = 'md',
    center = true,
    className = '',
    children
  }: Props = $props();

  const containerClasses = $derived(buildContainerClasses());
  
  function buildContainerClasses(): string {
    let classes = [];

    // Container sizing (Swiss design principles - based on golden ratio and modular scale)
    const sizeMap = {
      sm: 'max-w-sm',      // 384px - ~24rem
      md: 'max-w-2xl',     // 672px - ~42rem  
      lg: 'max-w-4xl',     // 896px - ~56rem
      xl: 'max-w-6xl',     // 1152px - ~72rem
      full: 'max-w-full'
    };
    classes.push(sizeMap[size]);

    // Padding with Swiss design spacing
    if (padding !== 'none') {
      const paddingMap = {
        sm: 'px-4 py-2',     // 16px horizontal, 8px vertical
        md: 'px-6 py-4',     // 24px horizontal, 16px vertical
        lg: 'px-8 py-6',     // 32px horizontal, 24px vertical
        xl: 'px-12 py-8'     // 48px horizontal, 32px vertical
      };
      classes.push(paddingMap[padding]);
    }

    // Centering
    if (center) {
      classes.push('mx-auto');
    }

    // Responsive padding
    classes.push('sm:px-6 lg:px-8');

    return classes.join(' ');
  }
</script>

<div class="{containerClasses} {className}">
  {@render children()}
</div>
