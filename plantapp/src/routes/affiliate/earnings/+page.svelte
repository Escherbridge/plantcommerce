<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-2">Earnings</h1>
			<p class="text-lg text-base-content/70">
				Track your commission history, payment schedules, and performance analytics.
			</p>
		</div>

		<!-- Earnings Summary -->
		<div class="grid md:grid-cols-3 gap-6 mb-12">
			<div class="stat bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Total Earnings</div>
				<div class="stat-value text-success">
					${data.totalEarnings?.toFixed(2) || '0.00'}
				</div>
				<div class="stat-desc">All time commission</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Pending Payout</div>
				<div class="stat-value text-warning">
					${data.pendingPayout?.toFixed(2) || '0.00'}
				</div>
				<div class="stat-desc">Next payment cycle</div>
			</div>
			<div class="stat bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">This Month</div>
				<div class="stat-value text-primary">
					${data.currentMonthEarnings?.toFixed(2) || '0.00'}
				</div>
				<div class="stat-desc">Current month earnings</div>
			</div>
		</div>

		<!-- Payment Methods -->
		<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30 mb-12">
			<div class="card-body">
				<h2 class="card-title font-display uppercase tracking-tight mb-4">Payment Method</h2>
				{#if data.paymentMethod}
					<div class="flex items-center justify-between">
						<div>
							<p class="font-semibold">{data.paymentMethod.type}</p>
							<p class="text-sm text-base-content/70">{data.paymentMethod.details}</p>
						</div>
						<button class="btn btn-outline btn-sm font-display uppercase tracking-wider">Update</button>
					</div>
				{:else}
					<div class="alert alert-warning">
						<span>No payment method configured. Please add one to receive payouts.</span>
						<button class="btn btn-sm btn-primary font-display uppercase tracking-wider">Add Payment Method</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Earnings History -->
		<div class="mb-12">
			<h2 class="text-2xl font-display uppercase tracking-tight mb-4">Commission History</h2>
			{#if data.earningsHistory && data.earningsHistory.length > 0}
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th class="font-mono text-xs uppercase tracking-widest">Date</th>
								<th class="font-mono text-xs uppercase tracking-widest">Order ID</th>
								<th class="font-mono text-xs uppercase tracking-widest">Product</th>
								<th class="font-mono text-xs uppercase tracking-widest">Sale Amount</th>
								<th class="font-mono text-xs uppercase tracking-widest">Commission Rate</th>
								<th class="font-mono text-xs uppercase tracking-widest">Commission Earned</th>
								<th class="font-mono text-xs uppercase tracking-widest">Status</th>
							</tr>
						</thead>
						<tbody>
							{#each data.earningsHistory as earning}
								<tr>
									<td>
										{new Date(earning.date).toLocaleDateString()}
									</td>
									<td class="font-mono text-sm">{earning.orderId}</td>
									<td>{earning.productName}</td>
									<td>${earning.saleAmount.toFixed(2)}</td>
									<td>{(earning.commissionRate * 100).toFixed(1)}%</td>
									<td class="font-semibold text-success">
										${earning.commission.toFixed(2)}
									</td>
									<td>
										{#if earning.status === 'paid'}
											<span class="badge badge-success">Paid</span>
										{:else if earning.status === 'pending'}
											<span class="badge badge-warning">Pending</span>
										{:else}
											<span class="badge badge-ghost">Processing</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-center py-12 bg-base-200 rounded-3xl border border-base-200/30">
					<p class="text-xl text-base-content/70">No earnings yet. Start promoting your links!</p>
				</div>
			{/if}
		</div>

		<!-- Payment Schedule -->
		<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
			<div class="card-body">
				<h2 class="card-title font-display uppercase tracking-tight mb-4">Payment Schedule</h2>
				<div class="space-y-4">
					<div class="flex items-center gap-4">
						<div class="badge badge-primary">Monthly</div>
						<p>Payments are processed on the 15th of each month</p>
					</div>
					<div class="flex items-center gap-4">
						<div class="badge badge-secondary">Minimum</div>
						<p>$50 minimum payout threshold</p>
					</div>
					<div class="flex items-center gap-4">
						<div class="badge badge-accent">Processing</div>
						<p>Payments typically arrive within 3-5 business days</p>
					</div>
				</div>
				<div class="divider"></div>
				<div class="text-sm text-base-content/70">
					<p class="mb-2">
						<strong>Next Payout Date:</strong>
						{new Date(
							new Date().getFullYear(),
							new Date().getMonth() + 1,
							15
						).toLocaleDateString()}
					</p>
					<p>
						<strong>Tax Documents:</strong>
						<a href="/affiliate/tax-documents" class="link link-primary ml-2">
							View 1099 Forms
						</a>
					</p>
				</div>
			</div>
		</div>
	</Container>
</Section>
