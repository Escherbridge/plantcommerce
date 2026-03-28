<script lang="ts">
	import { Grid } from '$lib/components/layout';
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
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-display uppercase tracking-tight mb-2">Dashboard Overview</h1>
		<p class="text-base-content/70">Welcome back! Here's what's happening with your store today.</p>
	</div>

	<!-- Key Metrics -->
	<Grid columns={4} gap={4}>
		<div class="stat bg-base-100 shadow-md rounded-3xl border border-base-200/30">
			<div class="stat-figure text-primary">
				<svg viewBox="0 0 24 24" class="w-10 h-10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v12M8 10h8M9 14h6"/>
				</svg>
			</div>
			<div class="stat-title">Total Revenue</div>
			<div class="stat-value text-primary">${stats.totalRevenue.toLocaleString()}</div>
			<div class="stat-desc">All time earnings</div>
		</div>

		<div class="stat bg-base-100 shadow-md rounded-3xl border border-base-200/30">
			<div class="stat-figure text-secondary">
				<svg viewBox="0 0 24 24" class="w-10 h-10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11"/>
				</svg>
			</div>
			<div class="stat-title">Total Orders</div>
			<div class="stat-value text-secondary">{stats.totalOrders.toLocaleString()}</div>
			<div class="stat-desc">{stats.recentOrders} in the last 7 days</div>
		</div>

		<div class="stat bg-base-100 shadow-md rounded-3xl border border-base-200/30">
			<div class="stat-figure text-accent">
				<svg viewBox="0 0 24 24" class="w-10 h-10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
				</svg>
			</div>
			<div class="stat-title">Total Users</div>
			<div class="stat-value text-accent">{stats.totalUsers.toLocaleString()}</div>
			<div class="stat-desc">Registered customers</div>
		</div>

		<div class="stat bg-base-100 shadow-md rounded-3xl border border-base-200/30">
			<div class="stat-figure text-warning">
				<svg viewBox="0 0 24 24" class="w-10 h-10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 20h16M8 16V8M12 16V4M16 16v-6"/>
				</svg>
			</div>
			<div class="stat-title">Products</div>
			<div class="stat-value text-warning">{stats.totalProducts.toLocaleString()}</div>
			<div class="stat-desc">{stats.lowStockProducts} low stock</div>
		</div>
	</Grid>

	<!-- Quick Actions -->
	<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
		<div class="card-body">
			<h2 class="card-title font-display uppercase tracking-tight">Quick Actions</h2>
			<Grid columns={4} gap={4} class="mt-4">
				<a href="/admin/products/new" class="btn btn-primary font-display uppercase tracking-wider">
					<span class="text-xl mr-2">+</span>
					Add Product
				</a>
				<a href="/admin/orders?status=pending" class="btn btn-outline font-display uppercase tracking-wider">
					<svg viewBox="0 0 24 24" class="w-5 h-5 mr-1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
					</svg>
					Process Orders
				</a>
				<a href="/admin/content/new" class="btn btn-outline font-display uppercase tracking-wider">
					<svg viewBox="0 0 24 24" class="w-5 h-5 mr-1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 112.8 2.8L11.8 16H9v-2.8l9.6-9.6z"/>
					</svg>
					Create Content
				</a>
				<a href="/admin/analytics" class="btn btn-outline font-display uppercase tracking-wider">
					<svg viewBox="0 0 24 24" class="w-5 h-5 mr-1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 17l6-6 4 4 8-8M14 7h7v7"/>
					</svg>
					View Reports
				</a>
			</Grid>
		</div>
	</div>

	<!-- Recent Orders & Alerts -->
	<div class="grid lg:grid-cols-2 gap-6">
		<!-- Recent Orders -->
		<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
			<div class="card-body">
				<div class="flex justify-between items-center mb-4">
					<h2 class="card-title font-display uppercase tracking-tight">Recent Orders</h2>
					<a href="/admin/orders" class="link link-primary text-sm">View All</a>
				</div>

				{#if data.recentOrders && data.recentOrders.length > 0}
					<div class="overflow-x-auto">
						<table class="table table-sm">
							<thead>
								<tr>
									<th>Order #</th>
									<th>Customer</th>
									<th>Amount</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{#each data.recentOrders.slice(0, 5) as order}
									<tr>
										<td class="font-mono text-xs">#{order.id}</td>
										<td>{order.user?.firstName || 'Guest'}</td>
										<td>${parseFloat(order.totalAmount).toFixed(2)}</td>
										<td>
											<span class="badge badge-sm badge-primary">{order.status}</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="text-center text-base-content/70 py-4">No recent orders</p>
				{/if}
			</div>
		</div>

		<!-- Alerts & Notifications -->
		<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
			<div class="card-body">
				<h2 class="card-title font-display uppercase tracking-tight mb-4">Alerts & Notifications</h2>
				<div class="space-y-3">
					{#if stats.lowStockProducts > 0}
						<div class="alert alert-warning">
							<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
							</svg>
							<span>
								{stats.lowStockProducts} products are running low on stock
							</span>
						</div>
					{/if}

					{#if stats.recentOrders > 10}
						<div class="alert alert-info">
							<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 17l6-6 4 4 8-8M14 7h7v7"/>
							</svg>
							<span>
								{stats.recentOrders} new orders this week!
							</span>
						</div>
					{/if}

					{#if data.pendingReviews > 0}
						<div class="alert alert-info">
							<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 2l3 6.5L22 9.7l-5 5L18.2 22 12 18.5 5.8 22 7 14.7 2 9.7l7-1.2z"/>
							</svg>
							<span>
								{data.pendingReviews} product reviews awaiting moderation
							</span>
						</div>
					{/if}

					{#if !stats.lowStockProducts && !data.pendingReviews}
						<div class="alert alert-success">
							<span>All systems running smoothly!</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Revenue Chart Placeholder -->
	<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
		<div class="card-body">
			<h2 class="card-title font-display uppercase tracking-tight mb-4">Revenue Overview (Last 30 Days)</h2>
			<div class="h-64 bg-base-200 rounded-lg flex items-center justify-center">
				<p class="text-base-content/50">Chart visualization will be rendered here</p>
			</div>
		</div>
	</div>
</div>
