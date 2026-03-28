<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		disabled?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children: Snippet;
		[key: string]: any;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		href,
		type = 'button',
		class: className = '',
		children,
		...restProps
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);

	const sizeClasses = $derived({
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-5 text-sm',
		lg: 'h-12 px-8 text-base'
	}[size]);

	const baseClasses = $derived(
		[
			'btn-plant',
			`btn-plant--${variant}`,
			`btn-plant--${size}`,
			'inline-flex items-center justify-center gap-2',
			'font-sans font-semibold uppercase tracking-[0.05em]',
			'min-h-[44px]',
			sizeClasses,
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
			'transition-all',
			isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<style>
	/* Primary variant */
	.btn-plant--primary {
		background-color: oklch(var(--p));
		color: oklch(var(--pc));
		border: none;
		border-radius: var(--radius-md, 0.5rem);
		box-shadow: var(--shadow-sm);
		transform: translateY(0) scale(1);
		transition:
			transform 200ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			box-shadow 200ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}

	.btn-plant--primary:not(:disabled):hover {
		transform: scale(1.02);
		box-shadow: var(--shadow-lg);
	}

	.btn-plant--primary:not(:disabled):active {
		transform: scale(0.99);
	}

	/* Secondary variant */
	.btn-plant--secondary {
		background-color: transparent;
		color: oklch(var(--p));
		border: 2px solid oklch(var(--p));
		border-radius: var(--radius-md, 0.5rem);
		position: relative;
		overflow: hidden;
		transition: color 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}

	.btn-plant--secondary::before {
		content: '';
		position: absolute;
		inset: 0;
		background-color: oklch(var(--p));
		transform-origin: left center;
		transform: scaleX(0);
		transition: transform 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
		z-index: 0;
	}

	.btn-plant--secondary:not(:disabled):hover {
		color: oklch(var(--pc));
	}

	.btn-plant--secondary:not(:disabled):hover::before {
		transform: scaleX(1);
	}

	.btn-plant--secondary :global(*) {
		position: relative;
		z-index: 1;
	}

	/* Ghost variant */
	.btn-plant--ghost {
		background-color: transparent;
		color: oklch(var(--p));
		border: none;
		border-radius: var(--radius-md, 0.5rem);
		position: relative;
		padding-bottom: calc(var(--spacing, 0.25rem) * 2 + 2px);
	}

	.btn-plant--ghost::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background-color: oklch(var(--p));
		transform-origin: left center;
		transform: scaleX(0);
		transition: transform 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}

	.btn-plant--ghost:not(:disabled):hover::after {
		transform: scaleX(1);
	}

	/* Spinner */
	.btn-spinner {
		width: 1em;
		height: 1em;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: btn-spin 0.6s linear infinite;
	}

	@keyframes btn-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

{#if href}
	<a {href} class={baseClasses} aria-disabled={isDisabled} {...restProps}>
		{#if loading}
			<span class="btn-spinner" aria-hidden="true"></span>
			<span class="sr-only">Loading...</span>
		{:else}
			{@render children()}
		{/if}
	</a>
{:else}
	<button {type} class={baseClasses} disabled={isDisabled} {...restProps}>
		{#if loading}
			<span class="btn-spinner" aria-hidden="true"></span>
			<span class="sr-only">Loading...</span>
		{:else}
			{@render children()}
		{/if}
	</button>
{/if}
