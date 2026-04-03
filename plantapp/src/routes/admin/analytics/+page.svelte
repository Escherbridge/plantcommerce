<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const analytics = $derived(
		data.analytics || {
			totalRevenue: 0,
			totalOrders: 0,
			averageOrderValue: 0,
			conversionRate: 0,
			topProducts: [],
			topCategories: [],
			revenueByMonth: []
		}
	);
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Analytics</h1>
		<p class="platform-header__subtitle">Insights and performance metrics for your store</p>
	</div>

	<!-- KPI Stats -->
	<div class="admin-analytics-grid">
		<div class="platform-stat">
			<span class="platform-stat__label">Total Revenue</span>
			<span class="platform-stat__value" style="color: oklch(var(--su))">
				${analytics.totalRevenue.toLocaleString()}
			</span>
		</div>

		<div class="platform-stat">
			<span class="platform-stat__label">Total Orders</span>
			<span class="platform-stat__value">{analytics.totalOrders.toLocaleString()}</span>
		</div>

		<div class="platform-stat">
			<span class="platform-stat__label">Avg Order Value</span>
			<span class="platform-stat__value">${analytics.averageOrderValue.toFixed(2)}</span>
		</div>

		<div class="platform-stat">
			<span class="platform-stat__label">Conversion Rate</span>
			<span class="platform-stat__value">{analytics.conversionRate.toFixed(1)}%</span>
		</div>
	</div>

	<!-- Charts Placeholder -->
	<div class="admin-charts-row">
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Revenue Trend</h2>
			</div>
			<div class="admin-chart-placeholder">
				<svg viewBox="0 0 24 24" class="w-8 h-8" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: oklch(var(--bc) / 0.2)">
					<path d="M3 17l6-6 4 4 8-8"/>
					<path d="M14 7h7v7"/>
				</svg>
				<p>Revenue chart will be rendered here</p>
			</div>
		</div>

		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Orders by Status</h2>
			</div>
			<div class="admin-chart-placeholder">
				<svg viewBox="0 0 24 24" class="w-8 h-8" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: oklch(var(--bc) / 0.2)">
					<path d="M4 20h16M8 16V8M12 16V4M16 16v-6"/>
				</svg>
				<p>Status distribution chart will be rendered here</p>
			</div>
		</div>
	</div>

	<!-- Top Products -->
	<div class="admin-charts-row">
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Top Products</h2>
			</div>
			{#if analytics.topProducts && analytics.topProducts.length > 0}
				<div class="admin-ranking-list">
					{#each analytics.topProducts as product, index}
						<div class="admin-ranking-item">
							<div class="admin-ranking-position">{index + 1}</div>
							<span class="admin-ranking-name">{product.name}</span>
							<span class="platform-badge platform-badge--primary">{product.sales} sales</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="platform-empty">
					<p class="platform-empty__text">No data available</p>
				</div>
			{/if}
		</div>

		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Top Categories</h2>
			</div>
			{#if analytics.topCategories && analytics.topCategories.length > 0}
				<div class="admin-ranking-list">
					{#each analytics.topCategories as category, index}
						<div class="admin-ranking-item">
							<div class="admin-ranking-position">{index + 1}</div>
							<span class="admin-ranking-name">{category.name}</span>
							<span class="platform-badge platform-badge--secondary">${category.revenue.toLocaleString()}</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="platform-empty">
					<p class="platform-empty__text">No data available</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Export -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Export Reports</h2>
		</div>
		<div class="admin-export-actions">
			<button class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
					<polyline points="7 10 12 15 17 10"/>
					<line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				Export as CSV
			</button>
			<button class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
					<polyline points="14 2 14 8 20 8"/>
				</svg>
				Export as PDF
			</button>
		</div>
	</div>
</div>

<style>
	.admin-analytics-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.admin-analytics-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.admin-analytics-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.admin-charts-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.admin-charts-row {
			grid-template-columns: 1fr 1fr;
		}
	}

	.admin-chart-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 16rem;
		background: oklch(var(--b2));
		border-radius: calc(var(--radius-lg, 16px) - 8px);
		border: 1px dashed var(--input-border);
		gap: 0.75rem;
	}

	.admin-chart-placeholder p {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.35);
		margin: 0;
	}

	.admin-ranking-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.admin-ranking-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: oklch(var(--b2));
		border-radius: 8px;
	}

	.admin-ranking-position {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		color: oklch(var(--bc) / 0.4);
		min-width: 1.5rem;
	}

	.admin-ranking-name {
		flex: 1;
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.85);
	}

	.admin-export-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
</style>
