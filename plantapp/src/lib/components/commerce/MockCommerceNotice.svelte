<script lang="ts">
	const {
		compact = false,
		label = 'Local demo · Mock/test data · No real commerce'
	}: { compact?: boolean; label?: string } = $props();
</script>

<aside class:compact class="mock-commerce-notice" role="note" aria-label="Mock commerce notice">
	<strong>{label}</strong>
	{#if !compact}<span
			>No payment, email, fulfillment, production write, or real order will occur.</span
		>{/if}
</aside>

<style>
	.mock-commerce-notice {
		position: sticky;
		top: 0.5rem;
		z-index: 30;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.75rem;
		align-items: center;
		justify-content: center;
		width: min(100%, 72rem);
		margin: 0.75rem auto;
		padding: 0.7rem 1rem;
		border: 1px solid color-mix(in oklab, var(--color-primary, #334155) 35%, transparent);
		border-radius: 999px;
		background: color-mix(
			in oklab,
			var(--color-base-100, #f4f1e8) 94%,
			var(--color-accent, #c7f36b) 6%
		);
		box-shadow: 0 0.35rem 1rem rgb(15 23 42 / 0.08);
		color: var(--color-base-content, #0f172a);
		font-size: 0.82rem;
		line-height: 1.35;
	}

	.mock-commerce-notice strong {
		font-weight: 800;
		letter-spacing: 0.035em;
		text-transform: uppercase;
	}

	.mock-commerce-notice.compact {
		position: static;
		justify-content: flex-start;
		margin: 0;
		border-radius: 0.75rem;
		font-size: 0.75rem;
	}

	@media (max-width: 40rem) {
		.mock-commerce-notice {
			position: static;
			margin: 0.5rem;
			border-radius: 0.85rem;
			text-align: center;
		}
	}
</style>
