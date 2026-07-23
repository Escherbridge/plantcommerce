<script lang="ts">
	import type { Snippet } from 'svelte';

	// Aevani pill badge. New variants: tag-green / water / dark-glass / mint.
	// Legacy variants are retained (mapped to Aevani styles) so existing callers keep working.
	// See design-spec.md §1 (Badges / chips).
	interface Props {
		variant?:
			| 'tag-green'
			| 'water'
			| 'dark-glass'
			| 'mint'
			| 'primary'
			| 'secondary'
			| 'accent'
			| 'neutral'
			| 'success'
			| 'warning'
			| 'error'
			| 'info';
		size?: 'sm' | 'md';
		class?: string;
		children: Snippet;
	}

	let { variant = 'neutral', size = 'sm', class: className = '', children }: Props = $props();

	// Map legacy daisyUI-style variants onto the Aevani palette.
	const resolved = $derived(
		(
			{
				primary: 'tag-green',
				success: 'tag-green',
				neutral: 'tag-green',
				accent: 'mint',
				info: 'water',
				secondary: 'dark-glass',
				warning: 'tag-green',
				error: 'water'
			} as Record<string, string>
		)[variant] ?? variant
	);

	const classes = $derived(
		['aev-badge', `aev-badge--${resolved}`, `aev-badge--${size}`, className].filter(Boolean).join(' ')
	);
</script>

<span class={classes}>
	{@render children()}
</span>

<style>
	.aev-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border-radius: 999px;
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		line-height: 1;
		white-space: nowrap;
	}

	.aev-badge--sm {
		padding: 5px 10px;
	}

	.aev-badge--md {
		padding: 7px 14px;
	}

	.aev-badge--tag-green {
		background: rgba(46, 107, 79, 0.12);
		color: #2e6b4f;
	}

	.aev-badge--water {
		background: rgba(84, 162, 192, 0.14);
		color: #2a6480;
	}

	.aev-badge--dark-glass {
		background: rgba(20, 38, 27, 0.55);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.16);
		color: #eaf6ee;
	}

	.aev-badge--mint {
		background: linear-gradient(180deg, #a8e6c8 0%, #7cc9a2 100%);
		color: #14261b;
	}
</style>
