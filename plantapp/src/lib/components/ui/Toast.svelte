<script lang="ts">
	import { toasts, type Toast } from '$lib/stores/toast';

	const variantClasses: Record<Toast['variant'], string> = {
		success: 'bg-success text-success-content',
		error: 'bg-error text-error-content',
		warning: 'bg-warning text-warning-content',
		info: 'bg-info text-info-content'
	};

	const variantIcons: Record<Toast['variant'], string> = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ℹ'
	};
</script>

<div
	class="toast-container"
	aria-live="polite"
	aria-atomic="false"
>
	{#each $toasts as toast (toast.id)}
		<div
			class="toast-item {variantClasses[toast.variant]}"
			role="alert"
			aria-live="assertive"
		>
			<span class="toast-icon" aria-hidden="true">{variantIcons[toast.variant]}</span>
			<p class="toast-message">{toast.message}</p>
			<button
				class="toast-dismiss"
				aria-label="Dismiss notification"
				onclick={() => toasts.removeToast(toast.id)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 24rem;
		width: calc(100vw - 3rem);
		pointer-events: none;
	}

	.toast-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md, 0.5rem);
		box-shadow: var(--shadow-lg);
		pointer-events: all;
		animation: toast-slide-in var(--duration-normal, 300ms) var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)) both;
	}

	@keyframes toast-slide-in {
		from {
			opacity: 0;
			transform: translateX(calc(100% + 1.5rem));
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.toast-icon {
		font-size: 0.875rem;
		font-weight: 700;
		flex-shrink: 0;
		width: 1.25rem;
		text-align: center;
	}

	.toast-message {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.4;
		margin: 0;
	}

	.toast-dismiss {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--radius-sm, 0.25rem);
		background: transparent;
		border: none;
		cursor: pointer;
		color: currentColor;
		opacity: 0.7;
		transition: opacity var(--duration-fast, 150ms) ease;
		padding: 0;
	}

	.toast-dismiss:hover {
		opacity: 1;
	}

	.toast-dismiss:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 1px;
	}
</style>
