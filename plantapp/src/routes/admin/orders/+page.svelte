<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const orders = $derived(data.orders || []);

	const statusTabs = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

	const activeStatus = $derived($page.url.searchParams.get('status') || 'all');

	let expandedRows = $state<Record<string, boolean>>({});

	function toggleRow(id: string) {
		expandedRows = { ...expandedRows, [id]: !expandedRows[id] };
	}

	function setStatusFilter(status: string) {
		if (status === 'all') {
			goto('/admin/orders');
		} else {
			goto(`/admin/orders?status=${status}`);
		}
	}

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

	function exportCSV() {
		const headers = ['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'];
		const rows = orders.map((order: any) => [
			`#${order.id}`,
			order.user?.email || 'Guest',
			order.items?.length || 0,
			`$${parseFloat(order.totalAmount).toFixed(2)}`,
			order.status,
			new Date(order.createdAt).toLocaleDateString()
		]);

		const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">Orders</h1>
				<p class="platform-header__subtitle">Review recorded customer orders</p>
			</div>
			<button class="platform-action-btn admin-header-btn" onclick={exportCSV}>
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
					<polyline points="7 10 12 15 17 10"/>
					<line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				Export CSV
			</button>
		</div>
	</div>

	<!-- Status Tabs -->
	<div class="admin-status-tabs">
		{#each statusTabs as tab}
			<button
				class="admin-tab"
				class:admin-tab--active={activeStatus === tab}
				onclick={() => setStatusFilter(tab)}
			>
				<span class="admin-tab-label">{tab}</span>
			</button>
		{/each}
	</div>

	{#if orders.length > 0}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th></th>
						<th>Order #</th>
						<th>Customer</th>
						<th>Items</th>
						<th>Total</th>
						<th>Status</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each orders as order}
						<tr onclick={() => toggleRow(order.id)} style="cursor: pointer">
							<td>
								<svg
									viewBox="0 0 24 24"
									class="w-4 h-4 admin-expand-icon"
									class:admin-expand-icon--open={expandedRows[order.id]}
									stroke="currentColor"
									stroke-width="1.5"
									fill="none"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="6 9 12 15 18 9"/>
								</svg>
							</td>
							<td class="font-mono" style="font-size: 0.75rem">#{order.id}</td>
							<td>{order.user?.email || 'Guest'}</td>
							<td>{order.items?.length || 0}</td>
							<td>${parseFloat(order.totalAmount).toFixed(2)}</td>
							<td>
								<span class={getStatusBadgeClass(order.status)}>{order.status}</span>
							</td>
							<td>{new Date(order.createdAt).toLocaleDateString()}</td>
						</tr>
						{#if expandedRows[order.id]}
							<tr class="admin-expanded-row">
								<td colspan="7">
									<div class="admin-order-detail">
										<div class="admin-detail-section">
											<h4 class="admin-detail-title">Order Items</h4>
											{#if order.items && order.items.length > 0}
												{#each order.items as item}
													<div class="admin-detail-item">
														<span>{item.product?.name || 'Product'} x{item.quantity}</span>
														<span>${parseFloat(item.price || '0').toFixed(2)}</span>
													</div>
												{/each}
											{:else}
												<p class="admin-detail-empty">No item details available</p>
											{/if}
										</div>
										<div class="admin-detail-section">
											<h4 class="admin-detail-title">Shipping Address</h4>
											<p class="admin-detail-empty">Address details not available</p>
										</div>
										{#if order.affiliateCode}
											<div class="admin-detail-section">
												<h4 class="admin-detail-title">Affiliate</h4>
												<p style="font-size: 0.875rem; color: oklch(var(--bc) / 0.7)">
													Code: {order.affiliateCode}
												</p>
											</div>
										{/if}
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="platform-empty">
			<p class="platform-empty__title">No Orders Found</p>
			<p class="platform-empty__text">
				{activeStatus !== 'all'
					? `No ${activeStatus} orders. Try a different filter.`
					: 'No orders are available for this view.'}
			</p>
		</div>
	{/if}
</div>

<style>
	.admin-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-header-btn {
		width: auto;
		white-space: nowrap;
	}

	.admin-status-tabs {
		display: flex;
		gap: 0.25rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}

	.admin-tab {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: transparent;
		color: oklch(var(--bc) / 0.6);
		font-size: 0.8125rem;
		font-weight: 500;
		text-transform: capitalize;
		cursor: pointer;
		white-space: nowrap;
		transition: all 150ms ease;
	}

	.admin-tab:hover {
		border-color: var(--input-border-hover);
		color: oklch(var(--bc));
	}

	.admin-tab--active {
		background: oklch(var(--p) / 0.08);
		border-color: oklch(var(--p) / 0.3);
		color: oklch(var(--p));
	}

	.admin-expand-icon {
		transition: transform 150ms ease;
		color: oklch(var(--bc) / 0.4);
	}

	.admin-expand-icon--open {
		transform: rotate(180deg);
	}

	.admin-expanded-row td {
		background: oklch(var(--b2));
		padding: 0 !important;
	}

	.admin-order-detail {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.25rem;
		padding: 1.25rem 1rem;
	}

	.admin-detail-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.admin-detail-title {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--bc) / 0.5);
		margin: 0;
	}

	.admin-detail-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.8);
	}

	.admin-detail-empty {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.4);
		margin: 0;
	}
</style>
