<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats = $derived(
		data.stats || {
			totalClicks: 0,
			totalConversions: 0,
			totalEarnings: 0,
			conversionRate: 0
		}
	);
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-2">Affiliate Dashboard</h1>
			<p class="text-lg text-base-content/70">
				Welcome back, {data.affiliate?.user?.firstName || 'Affiliate'}! Here's your performance
				overview.
			</p>
		</div>

		<!-- Quick Stats -->
		<Grid columns={4} gap={6} class="mb-12">
			<div class="stat bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Total Clicks</div>
				<div class="stat-value text-primary">{stats.totalClicks.toLocaleString()}</div>
				<div class="stat-desc">All time</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Conversions</div>
				<div class="stat-value text-secondary">{stats.totalConversions.toLocaleString()}</div>
				<div class="stat-desc">Successful sales</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Total Earnings</div>
				<div class="stat-value text-success">${stats.totalEarnings.toFixed(2)}</div>
				<div class="stat-desc">Commission earned</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Conversion Rate</div>
				<div class="stat-value text-accent">{stats.conversionRate.toFixed(1)}%</div>
				<div class="stat-desc">Click to sale ratio</div>
			</div>
		</Grid>

		<!-- Quick Actions -->
		<div class="mb-12">
			<h2 class="text-2xl font-display uppercase tracking-tight mb-4">Quick Actions</h2>
			<Grid columns={3} gap={4}>
				<a href="/affiliate/links" class="btn btn-primary btn-lg font-display uppercase tracking-wider">
					<svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10 13a5 5 0 007-7l-1 1a4 4 0 00-6 6l1-1z"/>
						<path d="M14 11a5 5 0 00-7 7l1-1a4 4 0 006-6l-1 1z"/>
					</svg>
					Generate Links
				</a>
				<a href="/affiliate/earnings" class="btn btn-outline btn-lg font-display uppercase tracking-wider">
					<svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/>
						<line x1="12" y1="6" x2="12" y2="18"/>
						<line x1="8" y1="10" x2="16" y2="10"/>
						<line x1="9" y1="14" x2="15" y2="14"/>
					</svg>
					View Earnings
				</a>
				<a href="/affiliate/materials" class="btn btn-outline btn-lg font-display uppercase tracking-wider">
					<svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/>
						<line x1="3" y1="7" x2="12" y2="11"/>
						<line x1="21" y1="7" x2="12" y2="11"/>
						<line x1="12" y1="22" x2="12" y2="11"/>
					</svg>
					Marketing Materials
				</a>
			</Grid>
		</div>

		<!-- Affiliate Info -->
		<div class="grid md:grid-cols-2 gap-6 mb-12">
			<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="card-body">
					<h3 class="card-title font-display uppercase tracking-tight">Your Affiliate Code</h3>
					<div class="flex items-center gap-4">
						<code class="text-2xl font-mono bg-base-200 px-4 py-2 rounded flex-1">
							{data.affiliate?.affiliateCode || 'N/A'}
						</code>
						<button
							class="btn btn-square btn-outline"
							onclick={() => navigator.clipboard.writeText(data.affiliate?.affiliateCode || '')}
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<rect x="8" y="2" width="8" height="2" rx="1"/>
								<rect x="4" y="4" width="16" height="16" rx="2"/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="card-body">
					<h3 class="card-title font-display uppercase tracking-tight">Commission Rate</h3>
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
			<h2 class="text-2xl font-display uppercase tracking-tight mb-4">Recent Activity</h2>
			{#if data.recentClicks && data.recentClicks.length > 0}
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th class="font-mono text-xs uppercase tracking-widest">Date</th>
								<th class="font-mono text-xs uppercase tracking-widest">Product</th>
								<th class="font-mono text-xs uppercase tracking-widest">Clicks</th>
								<th class="font-mono text-xs uppercase tracking-widest">Converted</th>
								<th class="font-mono text-xs uppercase tracking-widest">Earnings</th>
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
				<div class="text-center py-12 bg-base-200 rounded-3xl border border-base-200/30">
					<p class="text-xl text-base-content/70">No recent activity. Start promoting your links!</p>
				</div>
			{/if}
		</div>
	</Container>
</Section>
