<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		title?: string;
		class?: string;
		children: Snippet;
	}

	let {
		open = $bindable(false),
		onclose,
		title,
		class: className = '',
		children
	}: Props = $props();

	let dialogEl = $state<HTMLDivElement | null>(null);
	let previouslyFocused = $state<HTMLElement | null>(null);
	const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

	const FOCUSABLE =
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	function getFocusableElements(): HTMLElement[] {
		if (!dialogEl) return [];
		return Array.from(dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE));
	}

	function trapFocus(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;
		const focusable = getFocusableElements();
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
		trapFocus(e);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	function close() {
		open = false;
		onclose?.();
	}

	$effect(() => {
		if (open) {
			previouslyFocused = document.activeElement as HTMLElement;
			document.body.style.overflow = 'hidden';
			tick().then(() => {
				const focusable = getFocusableElements();
				if (focusable.length > 0) {
					focusable[0].focus();
				} else {
					dialogEl?.focus();
				}
			});
		} else {
			document.body.style.overflow = '';
			if (previouslyFocused) {
				previouslyFocused.focus();
				previouslyFocused = null;
			}
		}
	});
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div
			bind:this={dialogEl}
			class="modal-content {className}"
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
			tabindex="-1"
		>
			{#if title}
				<h2 id={titleId} class="modal-title">{title}</h2>
			{/if}
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background-color: oklch(0 0 0 / 0.5);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 9000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		animation: backdrop-in var(--duration-fast, 150ms) ease both;
	}

	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background-color: oklch(var(--b1));
		border-radius: var(--radius-xl, 1rem);
		box-shadow: var(--shadow-xl);
		max-width: 32rem;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		overscroll-behavior: contain;
		outline: none;
		animation: modal-in var(--duration-normal, 300ms) var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)) both;
	}

	@keyframes modal-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.modal-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: oklch(var(--bc));
		padding: 1.5rem 1.5rem 0;
		margin: 0;
	}
</style>
