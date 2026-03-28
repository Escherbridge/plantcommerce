<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		icon: Snippet;
		class?: string;
	}

	let { title, description, icon, class: className = '' }: Props = $props();
</script>

<style>
	.feature-card {
		border-radius: var(--radius-lg, 0.75rem);
		box-shadow: var(--shadow-md);
		transition:
			box-shadow 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			transform 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			border-color 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}
</style>

<div class="feature-card border border-base-300 bg-base-100 hover:border-primary/30 p-6 flex flex-col items-center text-center {className}">
	<div class="w-16 h-16 flex items-center justify-center mb-4">
		{@render icon()}
	</div>
	<h3 class="font-display text-xl font-bold uppercase text-base-content mb-2">{title}</h3>
	<p class="font-sans text-base text-base-content/70">{description}</p>
</div>
