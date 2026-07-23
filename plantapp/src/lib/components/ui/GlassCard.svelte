<script lang="ts">
	import type { Snippet } from 'svelte';

	// Aevani frosted glass surface wrapper. See .omc/research/aevani-design/design-spec.md §1.
	interface Props {
		/** Inner padding — number is treated as px. */
		padding?: string | number;
		/** Corner radius — number is treated as px. */
		radius?: string | number;
		class?: string;
		children: Snippet;
	}

	let { padding = 28, radius = 24, class: className = '', children }: Props = $props();

	const pad = $derived(typeof padding === 'number' ? `${padding}px` : padding);
	const rad = $derived(typeof radius === 'number' ? `${radius}px` : radius);
</script>

<div class="glass-card {className}" style="padding:{pad};border-radius:{rad};">
	{@render children()}
</div>

<style>
	.glass-card {
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 10px 34px rgba(23, 48, 31, 0.12);
	}
</style>
