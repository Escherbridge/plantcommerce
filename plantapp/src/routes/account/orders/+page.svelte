<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function getStatusColor(status: string) {
		switch (status) {
			case 'delivered':
				return 'badge-success';
			case 'shipped':
				return 'badge-info';
			case 'processing':
				return 'badge-warning';
			case 'cancelled':
				return 'badge-error';
			default:
				return 'badge-ghost';
		}
	}
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-2">My Orders</h1>
			<p class="text-lg text-base-content/70">View and track your order history</p>
		</div>

		<!-- Order Filters -->
		<div class="flex flex-wrap gap-2 mb-8">
			<a href="/account/orders" class="btn btn-sm btn-primary">All Orders</a>
			<a href="/account/orders?status=processing" class="btn btn-sm btn-outline">Processing</a>
			<a href="/account/orders?status=shipped" class="btn btn-sm btn-outline">Shipped</a>
			<a href="/account/orders?status=delivered" class="btn btn-sm btn-outline">Delivered</a>
			<a href="/account/orders?status=cancelled" class="btn btn-sm btn-outline">Cancelled</a>
		</div>

		<!-- Orders List -->
		{#if data.orders && data.orders.length > 0}
			<div class="space-y-6">
				{#each data.orders as order}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<!-- Order Header -->
							<div class="flex flex-wrap justify-between items-start gap-4 mb-4">
								<div>
									<h3 class="text-xl font-bold mb-1">Order #{order.id}</h3>
									<p class="text-sm text-base-content/60">
										Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</p>
								</div>
								<div class="text-right">
									<div class="badge {getStatusColor(order.status)} badge-lg mb-2">
										{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
									</div>
									<p class="text-lg font-bold">${parseFloat(order.totalAmount).toFixed(2)}</p>
								</div>
							</div>

							<!-- Order Items -->
							<div class="divider"></div>
							<div class="space-y-3">
								{#each order.items as item}
									<div class="flex gap-4">
										<div class="avatar">
											<div class="w-16 h-16 rounded">
												<img
													src={item.product?.image || '/placeholder-product.jpg'}
													alt={item.product?.name}
												/>
											</div>
										</div>
										<div class="flex-1">
											<h4 class="font-semibold">{item.product?.name}</h4>
											<p class="text-sm text-base-content/60">Qty: {item.quantity}</p>
										</div>
										<div class="text-right">
											<p class="font-semibold">${parseFloat(item.price).toFixed(2)}</p>
										</div>
									</div>
								{/each}
							</div>

							<!-- Order Actions -->
							<div class="card-actions justify-end mt-4">
								<a href="/account/orders/{order.id}" class="btn btn-outline btn-sm">
									View Details
								</a>
								{#if order.status === 'shipped' || order.status === 'delivered'}
									<button class="btn btn-primary btn-sm">Track Order</button>
								{/if}
								{#if order.status === 'delivered'}
									<button class="btn btn-outline btn-sm">Reorder</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<div class="text-6xl mb-4">📦</div>
				<h3 class="text-2xl font-bold mb-2">No Orders Yet</h3>
				<p class="text-base-content/70 mb-6">
					Start shopping to see your orders here.
				</p>
				<a href="/products/hydroponics" class="btn btn-primary">Browse Products</a>
			</div>
		{/if}
	</Container>
</Section>
