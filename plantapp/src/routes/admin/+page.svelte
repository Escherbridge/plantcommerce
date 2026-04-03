<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats = $derived(
		data.stats || {
			totalRevenue: 0,
			totalOrders: 0,
			totalUsers: 0,
			totalProducts: 0,
			recentOrders: 0,
			lowStockProducts: 0
		}
	);

	const recentOrders = $derived(data.recentOrders || []);

	const placeholderActivity = [
		{ description: 'New order #1042 placed by customer', time: '2 minutes ago', type: 'order' },
		{ description: 'Product "Hydroponic Starter Kit" stock updated', time: '15 minutes ago', type: 'product' },
		{ description: 'New user registration: jane@example.com', time: '1 hour ago', type: 'user' },
		{ description: 'Affiliate commission processed for $24.50', time: '3 hours ago', type: 'affiliate' },
		{ description: 'Order #1038 marked as shipped', time: '5 hours ago', type: 'order' }
	];

	function getStatusBadgeClass(status: string): string {
		switch (status?.toLowerCase()) {
			case 'delivered': return 'platform-badge platform-badge--success';
			case 'processing': return 'platform-badge platform-badge--warning';
			case 'pending': return 'platform-badge platform-badge--ghost';
			case 'cancelled': return 'platform-badge platform-badge--error';
			case 'shipped': return 'platform-badge platform-badge--primary';
			case 'confirmed': return 'platform-badge platform-badge--secondary';
			default: return 'platform-badge platform-badge--ghost';
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Admin Dashboard</h1>
		<p class="platform-header__subtitle">Overview of your store</p>
	</div>

	<!-- KPI Cards -->
	<div class="admin-kpi-grid">
		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--revenue">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
					<path d="M12 6v12M9 9h4.5a2.5 2.5 0 010 5H9"/>
				</svg>
			</div>
			<span class="platform-stat__label">Revenue (Today)</span>
			<span class="platform-stat__value" style="color: oklch(var(--su))">
				${stats.totalRevenue.toLocaleString()}
			</span>
		</div>

		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--orders">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 3h2l3 12h10l3-9H6"/>
					<circle cx="8" cy="21" r="1"/>
					<circle cx="18" cy="21" r="1"/>
				</svg>
			</div>
			<span class="platform-stat__label">Orders (This Week)</span>
			<span class="platform-stat__value">{stats.totalOrders.toLocaleString()}</span>
		</div>

		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--users">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z"/>
					<path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
				</svg>
			</div>
			<span class="platform-stat__label">New Users (This Week)</span>
			<span class="platform-stat__value">{stats.totalUsers.toLocaleString()}</span>
		</div>

		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--affiliates">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
					<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
				</svg>
			</div>
			<span class="platform-stat__label">Active Affiliates</span>
			<span class="platform-stat__value">{stats.totalProducts.toLocaleString()}</span>
		</div>
	</div>

	<!-- Recent Orders -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Recent Orders</h2>
			<a href="/admin/orders" class="admin-view-all-link">View All Orders</a>
		</div>

		{#if recentOrders.length > 0}
			<div class="platform-table-wrapper">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Order #</th>
							<th>Customer</th>
							<th>Status</th>
							<th>Total</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{#each recentOrders.slice(0, 5) as order}
							<tr>
								<td class="font-mono text-xs">#{order.id}</td>
								<td>{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</td>
								<td>
									<span class={getStatusBadgeClass(order.status)}>{order.status}</span>
								</td>
								<td>${parseFloat(order.totalAmount).toFixed(2)}</td>
								<td>{new Date(order.createdAt).toLocaleDateString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No Recent Orders</p>
				<p class="platform-empty__text">Orders will appear here once customers begin placing them.</p>
			</div>
		{/if}
	</div>

	<!-- Quick Actions -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Quick Actions</h2>
		</div>
		<div class="admin-actions-grid">
			<a href="/admin/products" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 5v14M5 12h14"/>
				</svg>
				Add Product
			</a>
			<a href="/admin/orders" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
				</svg>
				View Orders
			</a>
			<a href="/admin/users" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z"/>
					<path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
				</svg>
				Manage Users
			</a>
			<a href="/admin/analytics" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 17l6-6 4 4 8-8"/>
					<path d="M14 7h7v7"/>
				</svg>
				View Analytics
			</a>
		</div>
	</div>

	<!-- Activity Feed -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Recent Activity</h2>
			<a href="/admin/settings" class="admin-view-all-link">View Audit Log</a>
		</div>
		<div class="admin-activity-feed">
			{#each placeholderActivity as activity}
				<div class="admin-activity-item">
					<div class="admin-activity-icon">
						{#if activity.type === 'order'}
							<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 3h2l3 12h10l3-9H6"/>
								<circle cx="8" cy="21" r="1"/>
								<circle cx="18" cy="21" r="1"/>
							</svg>
						{:else if activity.type === 'product'}
							<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/>
							</svg>
						{:else if activity.type === 'user'}
							<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z"/>
								<path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
								<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
							</svg>
						{/if}
					</div>
					<div class="admin-activity-content">
						<p class="admin-activity-desc">{activity.description}</p>
						<span class="admin-activity-time">{activity.time}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.admin-kpi-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.admin-kpi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.admin-kpi-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.admin-stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 8px;
		margin-bottom: 0.5rem;
	}

	.admin-stat-icon--revenue {
		background: oklch(var(--su) / 0.1);
		color: oklch(var(--su));
	}

	.admin-stat-icon--orders {
		background: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
	}

	.admin-stat-icon--users {
		background: oklch(var(--s) / 0.1);
		color: oklch(var(--s));
	}

	.admin-stat-icon--affiliates {
		background: oklch(var(--wa) / 0.1);
		color: oklch(var(--wa));
	}

	.admin-actions-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.admin-actions-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.admin-actions-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.admin-view-all-link {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--p));
		text-decoration: none;
		transition: color 150ms ease;
	}

	.admin-view-all-link:hover {
		color: oklch(var(--p) / 0.7);
	}

	.admin-activity-feed {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.admin-activity-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid oklch(var(--bc) / 0.06);
	}

	.admin-activity-item:last-child {
		border-bottom: none;
	}

	.admin-activity-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 8px;
		background: oklch(var(--bc) / 0.06);
		color: oklch(var(--bc) / 0.5);
		flex-shrink: 0;
	}

	.admin-activity-content {
		flex: 1;
		min-width: 0;
	}

	.admin-activity-desc {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.85);
		margin: 0;
	}

	.admin-activity-time {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.45);
	}
</style>
