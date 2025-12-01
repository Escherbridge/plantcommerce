<script lang="ts">
	interface Props {
		columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
		gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
		align?: 'start' | 'center' | 'end' | 'stretch';
		justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
		className?: string;
		class?: string;
		title?: string;
		children: any;
	}

	let {
		columns = 12,
		gap = 'md',
		align = 'start',
		justify = 'start',
		className = '',
		class: classProp = '',
		title,
		children
	}: Props = $props();

	const gridClasses = $derived(buildGridClasses());

	function buildGridClasses(): string {
		let classes = ['grid'];

		// Handle columns - make numeric columns responsive by default
		if (typeof columns === 'number') {
			// Default responsive behavior: 1 col mobile, 2 col tablet, specified number desktop
			classes.push('grid-cols-1');
			if (columns >= 2) {
				classes.push('md:grid-cols-2');
			}
			if (columns >= 3) {
				classes.push(`lg:grid-cols-${columns}`);
			} else if (columns === 2) {
				classes.push('lg:grid-cols-2');
			}
		} else {
			// Responsive columns object
			if (columns.sm) classes.push(`grid-cols-${columns.sm}`);
			if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
			if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
			if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
		}

		// Handle gap with better defaults
		if (typeof gap === 'number') {
			classes.push(`gap-${gap}`);
		} else {
			const gapMap = {
				xs: 'gap-2',
				sm: 'gap-4',
				md: 'gap-6',
				lg: 'gap-8',
				xl: 'gap-10'
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

<div class="{gridClasses} {className} {classProp}" {title}>
	{@render children()}
</div>
