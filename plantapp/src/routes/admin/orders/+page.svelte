<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold">Order Management</h1>

	<div class="flex gap-2 mb-4">
		<a href="/admin/orders" class="btn btn-sm btn-primary">All</a>
		<a href="/admin/orders?status=pending" class="btn btn-sm btn-outline">Pending</a>
		<a href="/admin/orders?status=processing" class="btn btn-sm btn-outline">Processing</a>
		<a href="/admin/orders?status=shipped" class="btn btn-sm btn-outline">Shipped</a>
		<a href="/admin/orders?status=delivered" class="btn btn-sm btn-outline">Delivered</a>
	</div>

	{#if data.orders && data.orders.length > 0}
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Order #</th>
						<th>Customer</th>
						<th>Date</th>
						<th>Total</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.orders as order}
						<tr>
							<td class="font-mono">#{order.id}</td>
							<td>{order.user?.email || 'Guest'}</td>
							<td>{new Date(order.createdAt).toLocaleDateString()}</td>
							<td>${parseFloat(order.totalAmount).toFixed(2)}</td>
							<td><span class="badge badge-primary">{order.status}</span></td>
							<td>
								<a href="/admin/orders/{order.id}" class="btn btn-xs btn-outline">View</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-center py-8">No orders found</p>
	{/if}
</div>
