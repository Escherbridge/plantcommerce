<script lang="ts">
	import '$lib/components/platform/platform.css';
	import Icon from '$lib/components/icons/Icon.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const user = $derived(data.user);

	// Mock data — will be replaced with real tRPC calls later
	const stats = $derived({
		totalOrders: 0,
		wishlistItems: 0,
		memberSince: user?.createdAt
			? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
			: 'N/A'
	});

	const recentOrders: Array<{
		orderNumber: string;
		date: string;
		status: string;
		statusVariant: string;
		total: string;
	}> = $derived([]);
</script>

<div class="platform-content">
	<!-- Welcome Header -->
	<div class="platform-header">
		<h1 class="platform-header__title">Welcome back, {user?.firstName || 'there'}</h1>
		<p class="platform-header__subtitle">Here is an overview of your account</p>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div class="platform-stat">
			<div class="stat-icon">
				<Icon name="clipboard-list" class="stat-svg" />
			</div>
			<span class="platform-stat__label">Total Orders</span>
			<span class="platform-stat__value">{stats.totalOrders}</span>
		</div>

		<div class="platform-stat">
			<div class="stat-icon">
				<Icon name="heart" class="stat-svg" />
			</div>
			<span class="platform-stat__label">Wishlist Items</span>
			<span class="platform-stat__value">{stats.wishlistItems}</span>
		</div>

		<div class="platform-stat">
			<div class="stat-icon">
				<Icon name="calendar" class="stat-svg" />
			</div>
			<span class="platform-stat__label">Member Since</span>
			<span class="platform-stat__value platform-stat__value--text">{stats.memberSince}</span>
		</div>
	</div>

	<!-- Recent Orders -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Recent Orders</h2>
			{#if recentOrders.length > 0}
				<a href="/account/orders" class="view-all-link">View All</a>
			{/if}
		</div>

		{#if recentOrders.length > 0}
			<div class="orders-list">
				{#each recentOrders as order}
					<div class="order-row">
						<div class="order-info">
							<span class="order-number">{order.orderNumber}</span>
							<span class="order-date">{order.date}</span>
						</div>
						<span class="platform-badge platform-badge--{order.statusVariant}">{order.status}</span>
						<span class="order-total">{order.total}</span>
						<a href="/account/orders/{order.orderNumber}" class="order-view-link">View</a>
					</div>
				{/each}
			</div>
		{:else}
			<div class="platform-empty">
				<Icon name="clipboard-list" class="empty-svg" />
				<p class="platform-empty__title">No orders yet</p>
				<p class="platform-empty__text">
					Browse the current catalogue when you are ready to place an order.
				</p>
				<a href="/products" class="cta-btn">Browse catalogue</a>
			</div>
		{/if}
	</div>

	<!-- Quick Actions -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Quick Actions</h2>
		</div>
		<div class="quick-actions">
			<a href="/products" class="platform-action-btn">
				<Icon name="package" class="action-svg" />
				Catalogue
			</a>
			<a href="/account/wishlist" class="platform-action-btn">
				<Icon name="heart" class="action-svg" />
				View Wishlist
			</a>
			<a href="/account/profile" class="platform-action-btn">
				<Icon name="user" class="action-svg" />
				Edit Profile
			</a>
		</div>
	</div>

	<!-- Affiliate CTA (only for customers) -->
	{#if user?.role === 'customer'}
		<div class="platform-card affiliate-cta">
			<div class="affiliate-cta__content">
				<div class="affiliate-cta__icon">
					<Icon name="dollar-circle" class="affiliate-svg" />
				</div>
				<div>
					<h3 class="affiliate-cta__title">Affiliate Program Status</h3>
					<p class="affiliate-cta__text">
						Applications may be recorded for manual review, but no commission, link, or payout terms
						are currently published.
					</p>
				</div>
			</div>
			<a href="/affiliate/terms" class="cta-btn cta-btn--secondary">Review Status</a>
		</div>
	{/if}
</div>

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 1rem;
	}

	.stat-icon {
		margin-bottom: 0.5rem;
		color: oklch(var(--p));
	}

	.stat-svg {
		width: 1.5rem;
		height: 1.5rem;
	}

	:global(.platform-stat__value--text) {
		font-size: 1rem !important;
	}

	/* Orders list */
	.orders-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.order-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--input-border);
		border-radius: calc(var(--radius-lg, 16px) - 4px);
		background: oklch(var(--b2));
	}

	.order-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.order-number {
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: oklch(var(--bc));
	}

	.order-date {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
	}

	.order-total {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(var(--bc));
	}

	.order-view-link {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--p));
		text-decoration: none;
	}

	.order-view-link:hover {
		text-decoration: underline;
	}

	.view-all-link {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--p));
		text-decoration: none;
	}

	.view-all-link:hover {
		text-decoration: underline;
	}

	.empty-svg {
		width: 2.5rem;
		height: 2.5rem;
		color: oklch(var(--bc) / 0.3);
		margin: 0 auto 1rem;
		display: block;
	}

	/* Quick actions */
	.quick-actions {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.quick-actions {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.action-svg {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}

	/* CTA buttons */
	.cta-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
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
		text-decoration: none;
		cursor: pointer;
		transition: opacity 200ms ease;
		margin-top: 1rem;
	}

	.cta-btn:hover {
		opacity: 0.85;
	}

	.cta-btn--secondary {
		background: oklch(var(--s));
		flex-shrink: 0;
	}

	/* Affiliate CTA */
	.affiliate-cta {
		border-color: oklch(var(--s) / 0.3);
	}

	.affiliate-cta__content {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.affiliate-cta__icon {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(var(--s) / 0.1);
		border-radius: calc(var(--radius-lg, 16px) - 6px);
		color: oklch(var(--s));
	}

	.affiliate-svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.affiliate-cta__title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: oklch(var(--bc));
		margin-bottom: 0.25rem;
	}

	.affiliate-cta__text {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		line-height: 1.5;
	}
</style>
