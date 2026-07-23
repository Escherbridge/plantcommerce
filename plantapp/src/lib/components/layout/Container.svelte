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
		const classes = ['w-full'];
		const sizeMap = {
			sm: 'max-w-3xl',
			md: 'max-w-5xl',
			lg: 'max-w-7xl',
			xl: 'max-w-[90rem]',
			full: 'max-w-none'
		};
		classes.push(sizeMap[size]);

		if (padding !== 'none') {
			const paddingMap = {
				sm: 'px-3 sm:px-4',
				md: 'px-4 sm:px-6 lg:px-8',
				lg: 'px-4 sm:px-8 lg:px-12',
				xl: 'px-4 sm:px-10 lg:px-16'
			};
			classes.push(paddingMap[padding]);
		}

		if (center) classes.push('mx-auto');

		return classes.join(' ');
	}
</script>

<div class="{containerClasses} {className}">
	{@render children()}
</div>
