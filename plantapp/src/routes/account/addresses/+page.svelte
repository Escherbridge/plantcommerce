<script lang="ts">
	import '$lib/components/platform/platform.css';
</script>

<div class="platform-content">
	<!-- Page Header -->
	<div class="platform-header">
		<h1 class="platform-header__title">Saved Addresses</h1>
		<p class="platform-header__subtitle">Manage your shipping and billing addresses</p>
	</div>

	<!-- Empty State -->
	<div class="platform-empty">
		<svg viewBox="0 0 24 24" class="empty-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
		</svg>
		<p class="platform-empty__title">No addresses saved yet</p>
		<p class="platform-empty__text">Add a shipping or billing address to speed up checkout</p>
		<button class="add-btn" disabled>
			<svg viewBox="0 0 24 24" class="add-icon" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 5v14M5 12h14"/>
			</svg>
			Add Address
		</button>
	</div>
</div>

<style>
	.empty-svg {
		width: 3rem;
		height: 3rem;
		color: oklch(var(--bc) / 0.25);
		margin: 0 auto 1rem;
		display: block;
	}

	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.25rem;
		padding: 0.625rem 1.5rem;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--b1));
		background: oklch(var(--p));
		border: none;
		border-radius: var(--input-radius, 10px);
		cursor: not-allowed;
		opacity: 0.5;
	}

	.add-icon {
		width: 1rem;
		height: 1rem;
	}
</style>
