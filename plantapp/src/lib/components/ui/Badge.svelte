<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
		size?: 'sm' | 'md';
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'neutral',
		size = 'sm',
		class: className = '',
		children
	}: Props = $props();

	const classes = $derived(
		[
			'badge',
			`badge-${variant}`,
			size === 'sm' ? 'badge-sm' : 'badge-md',
			'font-mono uppercase tracking-wider rounded-full',
			size === 'sm' ? 'text-xs' : 'text-sm',
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<span class={classes}>
	{@render children()}
</span>
