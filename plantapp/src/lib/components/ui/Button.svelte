<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'mint';
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

	const sizeClasses = $derived(
		{
			sm: 'h-8 px-3 text-xs',
			md: 'h-10 px-5 text-sm',
			lg: 'h-12 px-8 text-base'
		}[size]
	);

	const baseClasses = $derived(
		[
			'btn-plant',
			`btn-plant--${variant}`,
			`btn-plant--${size}`,
			'inline-flex items-center justify-center gap-2 whitespace-nowrap',
			'font-semibold',
			'min-h-[44px]',
			sizeClasses,
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6B4F]/40 focus-visible:ring-offset-2',
			'transition-all',
			isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

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

<style>
	/* Aevani pill buttons. See design-spec.md §1 (Buttons). */
	.btn-plant {
		font-family: var(--font-body);
		border-radius: 999px;
		text-transform: none;
		letter-spacing: 0;
		transform: translateY(0);
		transition:
			transform 250ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			box-shadow 250ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			background 250ms ease;
	}

	/* Primary — forest gradient pill */
	.btn-plant--primary {
		background: linear-gradient(180deg, #347a56 0%, #1e4a36 100%);
		color: #f4f1ea;
		border: 1px solid rgba(30, 74, 54, 0.6);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			0 6px 20px rgba(30, 74, 54, 0.35);
	}

	.btn-plant--primary:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 10px 26px rgba(30, 74, 54, 0.45);
	}

	.btn-plant--primary:not(:disabled):active {
		transform: translateY(0);
	}

	/* Secondary — glass pill */
	.btn-plant--secondary {
		background: rgba(255, 255, 255, 0.5);
		color: #1c3527;
		border: 1px solid rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(var(--glass-blur, 12px));
		-webkit-backdrop-filter: blur(var(--glass-blur, 12px));
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 6px 18px rgba(23, 48, 31, 0.1);
	}

	.btn-plant--secondary:not(:disabled):hover {
		background: rgba(255, 255, 255, 0.7);
		transform: translateY(-1px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 10px 24px rgba(23, 48, 31, 0.14);
	}

	/* Ghost — outline pill */
	.btn-plant--ghost {
		background-color: transparent;
		color: #2e6b4f;
		border: 1px solid rgba(46, 107, 79, 0.3);
	}

	.btn-plant--ghost:not(:disabled):hover {
		background-color: rgba(46, 107, 79, 0.08);
		border-color: rgba(46, 107, 79, 0.45);
	}

	/* Mint — light CTA on dark surfaces */
	.btn-plant--mint {
		background: linear-gradient(180deg, #a8e6c8 0%, #7cc9a2 100%);
		color: #14261b;
		border: 1px solid rgba(124, 201, 162, 0.7);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.5),
			0 6px 20px rgba(20, 38, 27, 0.25);
	}

	.btn-plant--mint:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			0 10px 26px rgba(20, 38, 27, 0.32);
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
