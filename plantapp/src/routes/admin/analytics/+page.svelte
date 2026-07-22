<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const analytics = $derived(data.analytics);
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Analytics</h1>
		<p class="platform-header__subtitle">Recorded order totals and reporting availability</p>
	</div>

	{#if data.error}
		<div class="mb-6 alert alert-error">
			<span>{data.error}</span>
		</div>
	{/if}

	{#if analytics}
		<!-- KPI Stats -->
		<div class="admin-analytics-grid">
			<div class="platform-stat">
				<span class="platform-stat__label">Recorded Revenue</span>
				<span class="platform-stat__value" style="color: oklch(var(--su))">
					${analytics.totalRevenue.toLocaleString()}
				</span>
			</div>

			<div class="platform-stat">
				<span class="platform-stat__label">Recorded Orders</span>
				<span class="platform-stat__value">{analytics.totalOrders.toLocaleString()}</span>
			</div>

			<div class="platform-stat">
				<span class="platform-stat__label">Recorded Average Order Value</span>
				<span class="platform-stat__value">${analytics.averageOrderValue.toFixed(2)}</span>
			</div>
		</div>

		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Reporting Coverage</h2>
			</div>
			<div class="platform-empty">
				<p class="platform-empty__text">
					Conversion, trend, status-distribution, ranking, and file-export reports are unavailable
					until verified reporting queries and generated-file workflows are implemented.
				</p>
			</div>
		</div>
	{/if}
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
</style>
