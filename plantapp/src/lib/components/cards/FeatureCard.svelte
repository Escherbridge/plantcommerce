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

<div
	class="feature-card flex flex-col items-center border border-base-300 bg-base-100 p-6 text-center hover:border-primary/30 {className}"
>
	<div class="mb-4 flex h-16 w-16 items-center justify-center">
		{@render icon()}
	</div>
	<h3 class="font-display mb-2 text-xl font-bold text-base-content uppercase">{title}</h3>
	<p class="font-sans text-base text-base-content/70">{description}</p>
</div>

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
