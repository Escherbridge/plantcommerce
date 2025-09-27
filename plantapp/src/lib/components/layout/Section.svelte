<script lang="ts">
  interface Props {
    spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    background?: 'transparent' | 'base' | 'neutral' | 'primary' | 'secondary' | 'accent';
    fullWidth?: boolean;
    className?: string;
    children: any;
  }

  let {
    spacing = 'lg',
    background = 'transparent',
    fullWidth = false,
    className = '',
    children
  }: Props = $props();

  const sectionClasses = $derived(buildSectionClasses());
  
  function buildSectionClasses(): string {
    let classes = [];

    // Swiss design vertical spacing (following modular scale)
    if (spacing !== 'none') {
      const spacingMap = {
        sm: 'py-8',      // 32px - ~2rem
        md: 'py-12',     // 48px - ~3rem
        lg: 'py-16',     // 64px - ~4rem
        xl: 'py-24',     // 96px - ~6rem
        '2xl': 'py-32'   // 128px - ~8rem
      };
      classes.push(spacingMap[spacing]);
    }

    // Background colors
    if (background !== 'transparent') {
      const backgroundMap = {
        base: 'bg-base-100',
        neutral: 'bg-neutral',
        primary: 'bg-primary text-primary-content',
        secondary: 'bg-secondary text-secondary-content',
        accent: 'bg-accent text-accent-content'
      };
      classes.push(backgroundMap[background]);
    }

    // Width
    if (!fullWidth) {
      classes.push('max-w-7xl mx-auto');
    }

    // Responsive padding
    classes.push('px-4 sm:px-6 lg:px-8');

    return classes.join(' ');
  }
</script>

<section class="{sectionClasses} {className}">
  {@render children()}
</section>
