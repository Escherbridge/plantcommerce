<script lang="ts">
	import '$lib/components/platform/platform.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let dateFrom = $state('');
	let dateTo = $state('');

	const thisMonth = $derived(data.currentMonthEarnings || 0);
	const lastMonth = $derived(0); // placeholder
	const allTime = $derived(data.totalEarnings || 0);
	const pendingPayout = $derived(data.pendingPayout || 0);

	function exportCsv() {
		const history = data.earningsHistory || [];
		if (history.length === 0) {
			alert('No earnings data to export.');
			return;
		}

		const headers = ['Date', 'Order ID', 'Product', 'Sale Amount', 'Commission Rate', 'Commission Earned', 'Status'];
		const rows = history.map((e: any) => [
			new Date(e.date).toLocaleDateString(),
			e.orderId,
			e.productName,
			e.saleAmount.toFixed(2),
			(e.commissionRate * 100).toFixed(1) + '%',
			e.commission.toFixed(2),
			e.status
		]);

		const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `affiliate-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Earnings</h1>
		<p class="platform-header__subtitle">
			Track your commission history, payment schedules, and performance analytics.
		</p>
	</div>

	<!-- Summary Stats -->
	<div class="platform-stats">
		<div class="platform-stat">
			<span class="platform-stat__label">This Month</span>
			<span class="platform-stat__value">${thisMonth.toFixed(2)}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Last Month</span>
			<span class="platform-stat__value">${lastMonth.toFixed(2)}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">All Time</span>
			<span class="platform-stat__value">${allTime.toFixed(2)}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Pending Payout</span>
			<span class="platform-stat__value">${pendingPayout.toFixed(2)}</span>
		</div>
	</div>

	<!-- Date Range + Export -->
	<div class="filter-row">
		<div class="date-range">
			<div class="field">
				<label for="date-from" class="field-label">From</label>
				<input id="date-from" type="date" class="field-input" bind:value={dateFrom} />
			</div>
			<div class="field">
				<label for="date-to" class="field-label">To</label>
				<input id="date-to" type="date" class="field-input" bind:value={dateTo} />
			</div>
		</div>
		<button class="export-btn" onclick={exportCsv}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
				<path d="M12 3v12M7 14l5 5 5-5M3 19h18"/>
			</svg>
			Export CSV
		</button>
	</div>

	<!-- Earnings History -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Commission History</h2>
		</div>
		{#if data.earningsHistory && data.earningsHistory.length > 0}
			<div class="platform-table-wrapper" style="border:none;">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Date</th>
							<th>Order ID</th>
							<th>Product</th>
							<th>Sale Amount</th>
							<th>Commission Rate</th>
							<th>Commission Earned</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{#each data.earningsHistory as earning}
							<tr>
								<td>{new Date(earning.date).toLocaleDateString()}</td>
								<td class="mono-cell">{earning.orderId}</td>
								<td>{earning.productName}</td>
								<td>${earning.saleAmount.toFixed(2)}</td>
								<td>{(earning.commissionRate * 100).toFixed(1)}%</td>
								<td class="earnings-cell">${earning.commission.toFixed(2)}</td>
								<td>
									{#if earning.status === 'paid'}
										<span class="platform-badge platform-badge--success">Paid</span>
									{:else if earning.status === 'pending'}
										<span class="platform-badge platform-badge--warning">Pending</span>
									{:else}
										<span class="platform-badge platform-badge--ghost">Processing</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No earnings yet</p>
				<p class="platform-empty__text">Start promoting your links to earn commissions.</p>
			</div>
		{/if}
	</div>

	<!-- Payment Schedule -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Payment Schedule</h2>
		</div>
		<div class="schedule-list">
			<div class="schedule-item">
				<span class="platform-badge platform-badge--primary">Monthly</span>
				<p>Payments are processed on the 15th of each month</p>
			</div>
			<div class="schedule-item">
				<span class="platform-badge platform-badge--secondary">Minimum</span>
				<p>$50 minimum payout threshold</p>
			</div>
			<div class="schedule-item">
				<span class="platform-badge platform-badge--warning">Processing</span>
				<p>Payments typically arrive within 3-5 business days</p>
			</div>
		</div>
		<div class="schedule-footer">
			<p>
				<strong>Next Payout Date:</strong>
				{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toLocaleDateString()}
			</p>
		</div>
	</div>
</div>

<style>
	.filter-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.date-range {
		display: flex;
		gap: 0.75rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--bc) / 0.5);
	}

	.field-input {
		padding: 0.5rem 0.75rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.8125rem;
		font-family: var(--font-body);
	}

	.field-input:focus {
		outline: none;
		border-color: oklch(var(--p));
	}

	.export-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: oklch(var(--p));
		color: oklch(var(--pc));
		border: none;
		border-radius: var(--input-radius, 10px);
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.export-btn:hover {
		opacity: 0.9;
	}

	.btn-icon {
		width: 1rem;
		height: 1rem;
	}

	.mono-cell {
		font-family: var(--font-mono, monospace);
		font-size: 0.8125rem;
	}

	.earnings-cell {
		font-weight: 600;
		color: oklch(var(--su));
	}

	.schedule-list {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.schedule-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.schedule-item p {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.7);
	}

	.schedule-footer {
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid var(--input-border);
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
	}
</style>
