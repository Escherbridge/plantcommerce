<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
		center?: boolean;
		className?: string;
		children: any;
	}

	let { size = 'lg', padding = 'md', center = true, className = '', children }: Props = $props();

	const containerClasses = $derived(buildContainerClasses());

	function buildContainerClasses(): string {
		let classes = [];

		// Container sizing - wider for full-width layouts
		const sizeMap = {
			sm: 'max-w-3xl', // 768px - ~48rem
			md: 'max-w-5xl', // 1024px - ~64rem
			lg: 'max-w-7xl', // 1280px - ~80rem (default - much wider)
			xl: 'max-w-[1600px]', // 1600px - extra wide
			full: 'max-w-full'
		};
		classes.push(sizeMap[size]);

		// Padding with reduced side spacing
		if (padding !== 'none') {
			const paddingMap = {
				sm: 'px-4 py-2', // 16px horizontal, 8px vertical
				md: 'px-6 py-4', // 24px horizontal, 16px vertical
				lg: 'px-8 py-6', // 32px horizontal, 24px vertical
				xl: 'px-12 py-8' // 48px horizontal, 32px vertical
			};
			classes.push(paddingMap[padding]);
		}

		// Centering
		if (center) {
			classes.push('mx-auto');
		}

		// Responsive padding - reduced
		classes.push('sm:px-6 lg:px-12');

		return classes.join(' ');
	}
</script>

<div class="{containerClasses} {className}">
	{@render children()}
</div>
