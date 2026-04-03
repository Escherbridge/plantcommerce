<script lang="ts">
	import '$lib/components/platform/platform.css';
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
				<svg viewBox="0 0 24 24" class="stat-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/>
				</svg>
			</div>
			<span class="platform-stat__label">Total Orders</span>
			<span class="platform-stat__value">{stats.totalOrders}</span>
		</div>

		<div class="platform-stat">
			<div class="stat-icon">
				<svg viewBox="0 0 24 24" class="stat-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
				</svg>
			</div>
			<span class="platform-stat__label">Wishlist Items</span>
			<span class="platform-stat__value">{stats.wishlistItems}</span>
		</div>

		<div class="platform-stat">
			<div class="stat-icon">
				<svg viewBox="0 0 24 24" class="stat-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
				</svg>
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
				<svg viewBox="0 0 24 24" class="empty-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
				</svg>
				<p class="platform-empty__title">No orders yet</p>
				<p class="platform-empty__text">Browse our collection and place your first order</p>
				<a href="/products" class="cta-btn">Browse Products</a>
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
				<svg viewBox="0 0 24 24" class="action-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11"/>
				</svg>
				Browse Products
			</a>
			<a href="/account/wishlist" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="action-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
				</svg>
				View Wishlist
			</a>
			<a href="/account/profile" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="action-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20v-1a8 8 0 0116 0v1"/>
				</svg>
				Edit Profile
			</a>
		</div>
	</div>

	<!-- Affiliate CTA (only for customers) -->
	{#if user?.role === 'customer'}
		<div class="platform-card affiliate-cta">
			<div class="affiliate-cta__content">
				<div class="affiliate-cta__icon">
					<svg viewBox="0 0 24 24" class="affiliate-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07C9.39 16.57 8 15.4 8 14c0-.55.45-1 1-1s1 .45 1 1c0 .28.37.57 1 .57.63 0 1-.29 1-.57 0-.29-.28-.56-1-.75-1.45-.37-3-.99-3-2.68 0-1.37 1.13-2.44 2.5-2.75V7h2v1.07c1.38.31 2.5 1.38 2.5 2.75 0 .55-.45 1-1 1s-1-.45-1-1c0-.28-.37-.57-1-.57-.63 0-1 .29-1 .57 0 .29.28.56 1 .75 1.45.37 3 .99 3 2.68 0 1.37-1.13 2.44-2.5 2.75V16h-1V16z"/>
					</svg>
				</div>
				<div>
					<h3 class="affiliate-cta__title">Become an Affiliate</h3>
					<p class="affiliate-cta__text">Earn commissions by referring customers to our store. Share your unique link and track your earnings.</p>
				</div>
			</div>
			<a href="/affiliate/join" class="cta-btn cta-btn--secondary">Join Program</a>
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
