<script lang="ts">
	import '$lib/components/platform/platform.css';
	import Icon from '$lib/components/icons/Icon.svelte';
</script>

<div class="platform-content">
	<!-- Page Header -->
	<div class="platform-header">
		<h1 class="platform-header__title">Saved Addresses</h1>
		<p class="platform-header__subtitle">Manage your shipping and billing addresses</p>
	</div>

	<!-- Empty State -->
	<div class="platform-empty">
		<Icon name="map-pin" size={48} class="mx-auto mb-4 text-base-content/25" />
		<p class="platform-empty__title">No addresses saved yet</p>
		<p class="platform-empty__text">Add a shipping or billing address to speed up checkout</p>
		<button class="add-btn" disabled>
			<Icon name="plus" size={16} />
			Add Address
		</button>
	</div>
</div>

<style>
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
</style>
