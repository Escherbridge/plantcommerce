<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;

	$: stats = data.stats || {
		totalClicks: 0,
		totalConversions: 0,
		totalEarnings: 0,
		conversionRate: 0
	};
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-2">Affiliate Dashboard</h1>
			<p class="text-lg text-base-content/70">
				Welcome back, {data.affiliate?.user?.firstName || 'Affiliate'}! Here's your performance
				overview.
			</p>
		</div>

		<!-- Quick Stats -->
		<Grid columns={4} gap={6} class="mb-12">
			<div class="stat bg-base-100 shadow-xl rounded-lg">
				<div class="stat-title">Total Clicks</div>
				<div class="stat-value text-primary">{stats.totalClicks.toLocaleString()}</div>
				<div class="stat-desc">All time</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-lg">
				<div class="stat-title">Conversions</div>
				<div class="stat-value text-secondary">{stats.totalConversions.toLocaleString()}</div>
				<div class="stat-desc">Successful sales</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-lg">
				<div class="stat-title">Total Earnings</div>
				<div class="stat-value text-success">${stats.totalEarnings.toFixed(2)}</div>
				<div class="stat-desc">Commission earned</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-lg">
				<div class="stat-title">Conversion Rate</div>
				<div class="stat-value text-accent">{stats.conversionRate.toFixed(1)}%</div>
				<div class="stat-desc">Click to sale ratio</div>
			</div>
		</Grid>

		<!-- Quick Actions -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-4">Quick Actions</h2>
			<Grid columns={3} gap={4}>
				<a href="/affiliate/links" class="btn btn-primary btn-lg">
					<span class="text-xl mr-2">🔗</span>
					Generate Links
				</a>
				<a href="/affiliate/earnings" class="btn btn-outline btn-lg">
					<span class="text-xl mr-2">💰</span>
					View Earnings
				</a>
				<a href="/affiliate/materials" class="btn btn-outline btn-lg">
					<span class="text-xl mr-2">📦</span>
					Marketing Materials
				</a>
			</Grid>
		</div>

		<!-- Affiliate Info -->
		<div class="grid md:grid-cols-2 gap-6 mb-12">
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h3 class="card-title">Your Affiliate Code</h3>
					<div class="flex items-center gap-4">
						<code class="text-2xl font-mono bg-base-200 px-4 py-2 rounded flex-1">
							{data.affiliate?.affiliateCode || 'N/A'}
						</code>
						<button
							class="btn btn-square btn-outline"
							on:click={() => navigator.clipboard.writeText(data.affiliate?.affiliateCode || '')}
						>
							📋
						</button>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h3 class="card-title">Commission Rate</h3>
					<div class="text-4xl font-bold text-primary">
						{data.affiliate?.commissionRate
							? (parseFloat(data.affiliate.commissionRate) * 100).toFixed(1)
							: '5.0'}%
					</div>
					<p class="text-sm text-base-content/70">Your current commission rate</p>
				</div>
			</div>
		</div>

		<!-- Recent Activity -->
		<div>
			<h2 class="text-2xl font-bold mb-4">Recent Activity</h2>
			{#if data.recentClicks && data.recentClicks.length > 0}
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Date</th>
								<th>Product</th>
								<th>Clicks</th>
								<th>Converted</th>
								<th>Earnings</th>
							</tr>
						</thead>
						<tbody>
							{#each data.recentClicks as activity}
								<tr>
									<td>
										{new Date(activity.createdAt).toLocaleDateString()}
									</td>
									<td>{activity.product?.name || 'N/A'}</td>
									<td>{activity.clicks || 1}</td>
									<td>
										{#if activity.converted}
											<span class="badge badge-success">Yes</span>
										{:else}
											<span class="badge badge-ghost">No</span>
										{/if}
									</td>
									<td class="font-semibold">
										${activity.earnings ? parseFloat(activity.earnings).toFixed(2) : '0.00'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-center py-12 bg-base-200 rounded-lg">
					<p class="text-xl text-base-content/70">No recent activity. Start promoting your links!</p>
				</div>
			{/if}
		</div>
	</Container>
</Section>
