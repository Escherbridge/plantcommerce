<script lang="ts">
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;

	$: analytics = data.analytics || {
		totalRevenue: 0,
		totalOrders: 0,
		averageOrderValue: 0,
		conversionRate: 0,
		topProducts: [],
		topCategories: [],
		revenueByMonth: []
	};
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold">Analytics & Reports</h1>

	<!-- Date Range Selector -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex gap-4">
				<div class="form-control">
					<label class="label" for="date-from">
						<span class="label-text">From</span>
					</label>
					<input id="date-from" type="date" class="input input-bordered" />
				</div>
				<div class="form-control">
					<label class="label" for="date-to">
						<span class="label-text">To</span>
					</label>
					<input id="date-to" type="date" class="input input-bordered" />
				</div>
				<div class="form-control">
					<label class="label">&nbsp;</label>
					<button class="btn btn-primary">Apply Filter</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Key Metrics -->
	<Grid columns={4} gap={4}>
		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-title">Total Revenue</div>
			<div class="stat-value text-primary">${analytics.totalRevenue.toLocaleString()}</div>
			<div class="stat-desc">↗︎ 14% increase from last period</div>
		</div>

		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-title">Total Orders</div>
			<div class="stat-value text-secondary">{analytics.totalOrders.toLocaleString()}</div>
			<div class="stat-desc">↗︎ 8% increase from last period</div>
		</div>

		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-title">Avg Order Value</div>
			<div class="stat-value text-accent">${analytics.averageOrderValue.toFixed(2)}</div>
			<div class="stat-desc">↗︎ 5% increase from last period</div>
		</div>

		<div class="stat bg-base-100 shadow-xl rounded-lg">
			<div class="stat-title">Conversion Rate</div>
			<div class="stat-value text-warning">{analytics.conversionRate.toFixed(1)}%</div>
			<div class="stat-desc">↘︎ 2% decrease from last period</div>
		</div>
	</Grid>

	<!-- Charts -->
	<Grid columns={2} gap={6}>
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Revenue Trend</h2>
				<div class="h-64 bg-base-200 rounded-lg flex items-center justify-center">
					<p class="text-base-content/50">Revenue chart will be rendered here</p>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Orders by Status</h2>
				<div class="h-64 bg-base-200 rounded-lg flex items-center justify-center">
					<p class="text-base-content/50">Status distribution chart will be rendered here</p>
				</div>
			</div>
		</div>
	</Grid>

	<!-- Top Products & Categories -->
	<Grid columns={2} gap={6}>
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title mb-4">Top Products</h2>
				{#if analytics.topProducts && analytics.topProducts.length > 0}
					<div class="space-y-2">
						{#each analytics.topProducts as product, index}
							<div class="flex justify-between items-center p-2 bg-base-200 rounded">
								<div class="flex items-center gap-3">
									<span class="font-bold text-lg">{index + 1}</span>
									<span>{product.name}</span>
								</div>
								<span class="badge badge-primary">{product.sales} sales</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-center py-8 text-base-content/70">No data available</p>
				{/if}
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title mb-4">Top Categories</h2>
				{#if analytics.topCategories && analytics.topCategories.length > 0}
					<div class="space-y-2">
						{#each analytics.topCategories as category, index}
							<div class="flex justify-between items-center p-2 bg-base-200 rounded">
								<div class="flex items-center gap-3">
									<span class="font-bold text-lg">{index + 1}</span>
									<span>{category.name}</span>
								</div>
								<span class="badge badge-secondary">${category.revenue.toLocaleString()}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-center py-8 text-base-content/70">No data available</p>
				{/if}
			</div>
		</div>
	</Grid>

	<!-- Export Reports -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title mb-4">Export Reports</h2>
			<div class="flex gap-4">
				<button class="btn btn-outline">Export as CSV</button>
				<button class="btn btn-outline">Export as PDF</button>
				<button class="btn btn-outline">Export as Excel</button>
			</div>
		</div>
	</div>
</div>
