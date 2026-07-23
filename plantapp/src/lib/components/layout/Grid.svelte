<script lang="ts">
	interface Props {
		columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
		gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
		align?: 'start' | 'center' | 'end' | 'stretch';
		justify?: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around' | 'evenly';
		className?: string;
		class?: string;
		title?: string;
		children: any;
	}

	let {
		columns = 12,
		gap = 'md',
		align = 'stretch',
		justify = 'stretch',
		className = '',
		class: classProp = '',
		title,
		children
	}: Props = $props();

	const gridClasses = $derived(buildGridClasses());

	function buildGridClasses(): string {
		const classes = ['grid'];
		const baseColumns: Record<number, string> = {
			1: 'grid-cols-1',
			2: 'grid-cols-2',
			3: 'grid-cols-3',
			4: 'grid-cols-4',
			5: 'grid-cols-5',
			6: 'grid-cols-6',
			7: 'grid-cols-7',
			8: 'grid-cols-8',
			9: 'grid-cols-9',
			10: 'grid-cols-10',
			11: 'grid-cols-11',
			12: 'grid-cols-12'
		};
		const smColumns: Record<number, string> = {
			1: 'sm:grid-cols-1',
			2: 'sm:grid-cols-2',
			3: 'sm:grid-cols-3',
			4: 'sm:grid-cols-4',
			5: 'sm:grid-cols-5',
			6: 'sm:grid-cols-6',
			7: 'sm:grid-cols-7',
			8: 'sm:grid-cols-8',
			9: 'sm:grid-cols-9',
			10: 'sm:grid-cols-10',
			11: 'sm:grid-cols-11',
			12: 'sm:grid-cols-12'
		};
		const mdColumns: Record<number, string> = {
			1: 'md:grid-cols-1',
			2: 'md:grid-cols-2',
			3: 'md:grid-cols-3',
			4: 'md:grid-cols-4',
			5: 'md:grid-cols-5',
			6: 'md:grid-cols-6',
			7: 'md:grid-cols-7',
			8: 'md:grid-cols-8',
			9: 'md:grid-cols-9',
			10: 'md:grid-cols-10',
			11: 'md:grid-cols-11',
			12: 'md:grid-cols-12'
		};
		const lgColumns: Record<number, string> = {
			1: 'lg:grid-cols-1',
			2: 'lg:grid-cols-2',
			3: 'lg:grid-cols-3',
			4: 'lg:grid-cols-4',
			5: 'lg:grid-cols-5',
			6: 'lg:grid-cols-6',
			7: 'lg:grid-cols-7',
			8: 'lg:grid-cols-8',
			9: 'lg:grid-cols-9',
			10: 'lg:grid-cols-10',
			11: 'lg:grid-cols-11',
			12: 'lg:grid-cols-12'
		};
		const xlColumns: Record<number, string> = {
			1: 'xl:grid-cols-1',
			2: 'xl:grid-cols-2',
			3: 'xl:grid-cols-3',
			4: 'xl:grid-cols-4',
			5: 'xl:grid-cols-5',
			6: 'xl:grid-cols-6',
			7: 'xl:grid-cols-7',
			8: 'xl:grid-cols-8',
			9: 'xl:grid-cols-9',
			10: 'xl:grid-cols-10',
			11: 'xl:grid-cols-11',
			12: 'xl:grid-cols-12'
		};

		if (typeof columns === 'number') {
			classes.push(baseColumns[1]);
			if (columns >= 2) classes.push('md:grid-cols-2');
			if (columns >= 2) classes.push(lgColumns[columns] ?? 'lg:grid-cols-12');
		} else {
			classes.push(baseColumns[1]);
			if (columns.sm) classes.push(smColumns[columns.sm] ?? 'sm:grid-cols-1');
			if (columns.md) classes.push(mdColumns[columns.md] ?? 'md:grid-cols-1');
			if (columns.lg) classes.push(lgColumns[columns.lg] ?? 'lg:grid-cols-1');
			if (columns.xl) classes.push(xlColumns[columns.xl] ?? 'xl:grid-cols-1');
		}

		if (typeof gap === 'number') {
			const numericGapMap: Record<number, string> = {
				0: 'gap-0',
				1: 'gap-1',
				2: 'gap-2',
				3: 'gap-3',
				4: 'gap-4',
				5: 'gap-5',
				6: 'gap-6',
				7: 'gap-7',
				8: 'gap-8',
				9: 'gap-9',
				10: 'gap-10',
				11: 'gap-11',
				12: 'gap-12'
			};
			classes.push(numericGapMap[gap] ?? 'gap-6');
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

		const alignMap = {
			start: 'items-start',
			center: 'items-center',
			end: 'items-end',
			stretch: 'items-stretch'
		};
		classes.push(alignMap[align]);

		const justifyMap = {
			start: 'justify-items-start',
			center: 'justify-items-center',
			end: 'justify-items-end',
			stretch: 'justify-items-stretch',
			between: 'justify-items-stretch',
			around: 'justify-items-stretch',
			evenly: 'justify-items-stretch'
		};
		classes.push(justifyMap[justify]);

		return classes.join(' ');
	}
</script>

<div class="{gridClasses} {className} {classProp}" {title}>
	{@render children()}
</div>
