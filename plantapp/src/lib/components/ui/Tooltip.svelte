<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		placement?: 'top' | 'right' | 'bottom' | 'left';
		class?: string;
		children: Snippet;
	}

	let {
		text,
		placement = 'top',
		class: className = '',
		children
	}: Props = $props();

	const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;
	let visible = $state(false);

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="tooltip-wrapper {className}"
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
>
	<div aria-describedby={tooltipId}>
		{@render children()}
	</div>

	{#if visible}
		<div
			id={tooltipId}
			class="tooltip-bubble tooltip-{placement}"
			role="tooltip"
		>
			{text}
			<div class="tooltip-arrow tooltip-arrow-{placement}" aria-hidden="true"></div>
		</div>
	{/if}
</div>

<style>
	.tooltip-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.tooltip-bubble {
		position: absolute;
		z-index: 50;
		background-color: oklch(var(--n));
		color: oklch(var(--nc));
		font-size: 0.75rem;
		line-height: 1.4;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm, 0.25rem);
		box-shadow: var(--shadow-md);
		white-space: nowrap;
		max-width: 16rem;
		white-space: normal;
		word-break: break-word;
		pointer-events: none;
		animation: tooltip-in var(--duration-fast, 150ms) var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)) both;
	}

	/* Placement positioning */
	.tooltip-top {
		bottom: calc(100% + 0.5rem);
		left: 50%;
		transform: translateX(-50%);
	}

	.tooltip-bottom {
		top: calc(100% + 0.5rem);
		left: 50%;
		transform: translateX(-50%);
	}

	.tooltip-left {
		right: calc(100% + 0.5rem);
		top: 50%;
		transform: translateY(-50%);
	}

	.tooltip-right {
		left: calc(100% + 0.5rem);
		top: 50%;
		transform: translateY(-50%);
	}

	/* Animations per placement */
	@keyframes tooltip-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.tooltip-bottom {
		animation-name: tooltip-in-bottom;
	}

	@keyframes tooltip-in-bottom {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.tooltip-left {
		animation-name: tooltip-in-left;
	}

	@keyframes tooltip-in-left {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(4px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
		}
	}

	.tooltip-right {
		animation-name: tooltip-in-right;
	}

	@keyframes tooltip-in-right {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
		}
	}

	/* Arrow caret */
	.tooltip-arrow {
		position: absolute;
		width: 0;
		height: 0;
	}

	.tooltip-arrow-top {
		bottom: -0.3rem;
		left: 50%;
		transform: translateX(-50%);
		border-left: 0.3rem solid transparent;
		border-right: 0.3rem solid transparent;
		border-top: 0.3rem solid oklch(var(--n));
	}

	.tooltip-arrow-bottom {
		top: -0.3rem;
		left: 50%;
		transform: translateX(-50%);
		border-left: 0.3rem solid transparent;
		border-right: 0.3rem solid transparent;
		border-bottom: 0.3rem solid oklch(var(--n));
	}

	.tooltip-arrow-left {
		right: -0.3rem;
		top: 50%;
		transform: translateY(-50%);
		border-top: 0.3rem solid transparent;
		border-bottom: 0.3rem solid transparent;
		border-left: 0.3rem solid oklch(var(--n));
	}

	.tooltip-arrow-right {
		left: -0.3rem;
		top: 50%;
		transform: translateY(-50%);
		border-top: 0.3rem solid transparent;
		border-bottom: 0.3rem solid transparent;
		border-right: 0.3rem solid oklch(var(--n));
	}
</style>
