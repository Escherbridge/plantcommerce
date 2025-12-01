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
		<h1 class="text-3xl font-bold mb-2">Dashboard Overview</h1>
		<p class="text-base-content/70">Welcome back! Here's what's happening with your store today.</p>
	</div>

	<!-- Key Metrics -->
	<Grid columns={4} gap={4}>
		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-figure text-primary">
				<span class="text-4xl">💰</span>
			</div>
			<div class="stat-title">Total Revenue</div>
			<div class="stat-value text-primary">${stats.totalRevenue.toLocaleString()}</div>
			<div class="stat-desc">All time earnings</div>
		</div>

		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-figure text-secondary">
				<span class="text-4xl">📦</span>
			</div>
			<div class="stat-title">Total Orders</div>
			<div class="stat-value text-secondary">{stats.totalOrders.toLocaleString()}</div>
			<div class="stat-desc">{stats.recentOrders} in the last 7 days</div>
		</div>

		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-figure text-accent">
				<span class="text-4xl">👥</span>
			</div>
			<div class="stat-title">Total Users</div>
			<div class="stat-value text-accent">{stats.totalUsers.toLocaleString()}</div>
			<div class="stat-desc">Registered customers</div>
		</div>

		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-figure text-warning">
				<span class="text-4xl">📊</span>
			</div>
			<div class="stat-title">Products</div>
			<div class="stat-value text-warning">{stats.totalProducts.toLocaleString()}</div>
			<div class="stat-desc">{stats.lowStockProducts} low stock</div>
		</div>
	</Grid>

	<!-- Quick Actions -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Quick Actions</h2>
			<Grid columns={4} gap={4} class="mt-4">
				<a href="/admin/products/new" class="btn btn-primary">
					<span class="text-xl mr-2">+</span>
					Add Product
				</a>
				<a href="/admin/orders?status=pending" class="btn btn-outline">
					<span class="text-xl mr-2">📋</span>
					Process Orders
				</a>
				<a href="/admin/content/new" class="btn btn-outline">
					<span class="text-xl mr-2">✍️</span>
					Create Content
				</a>
				<a href="/admin/analytics" class="btn btn-outline">
					<span class="text-xl mr-2">📈</span>
					View Reports
				</a>
			</Grid>
		</div>
	</div>

	<!-- Recent Orders & Alerts -->
	<div class="grid lg:grid-cols-2 gap-6">
		<!-- Recent Orders -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<div class="flex justify-between items-center mb-4">
					<h2 class="card-title">Recent Orders</h2>
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
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title mb-4">Alerts & Notifications</h2>
				<div class="space-y-3">
					{#if stats.lowStockProducts > 0}
						<div class="alert alert-warning">
							<span>
								⚠️ {stats.lowStockProducts} products are running low on stock
							</span>
						</div>
					{/if}

					{#if stats.recentOrders > 10}
						<div class="alert alert-info">
							<span>
								📈 {stats.recentOrders} new orders this week!
							</span>
						</div>
					{/if}

					{#if data.pendingReviews > 0}
						<div class="alert alert-info">
							<span>
								⭐ {data.pendingReviews} product reviews awaiting moderation
							</span>
						</div>
					{/if}

					{#if !stats.lowStockProducts && !data.pendingReviews}
						<div class="alert alert-success">
							<span>✓ All systems running smoothly!</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Revenue Chart Placeholder -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title mb-4">Revenue Overview (Last 30 Days)</h2>
			<div class="h-64 bg-base-200 rounded-lg flex items-center justify-center">
				<p class="text-base-content/50">Chart visualization will be rendered here</p>
			</div>
		</div>
	</div>
</div>
