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
			<h1 class="text-4xl font-display uppercase tracking-tight mb-2">My Orders</h1>
			<p class="text-lg text-base-content/70">View and track your order history</p>
		</div>

		<!-- Order Filters -->
		<div class="flex flex-wrap gap-2 mb-8">
			<a href="/account/orders" class="btn btn-sm btn-primary font-display uppercase tracking-wider">All Orders</a>
			<a href="/account/orders?status=processing" class="btn btn-sm btn-outline font-display uppercase tracking-wider">Processing</a>
			<a href="/account/orders?status=shipped" class="btn btn-sm btn-outline font-display uppercase tracking-wider">Shipped</a>
			<a href="/account/orders?status=delivered" class="btn btn-sm btn-outline font-display uppercase tracking-wider">Delivered</a>
			<a href="/account/orders?status=cancelled" class="btn btn-sm btn-outline font-display uppercase tracking-wider">Cancelled</a>
		</div>

		<!-- Orders List -->
		{#if data.orders && data.orders.length > 0}
			<div class="space-y-6">
				{#each data.orders as order}
					<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
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
								<a href="/account/orders/{order.id}" class="btn btn-outline btn-sm font-display uppercase tracking-wider">
									View Details
								</a>
								{#if order.status === 'shipped' || order.status === 'delivered'}
									<button class="btn btn-primary btn-sm font-display uppercase tracking-wider">Track Order</button>
								{/if}
								{#if order.status === 'delivered'}
									<button class="btn btn-outline btn-sm font-display uppercase tracking-wider">Reorder</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<div class="flex justify-center mb-4">
					<svg viewBox="0 0 24 24" class="w-16 h-16 text-base-content/30" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11"/>
					</svg>
				</div>
				<h3 class="text-2xl font-display uppercase tracking-tight mb-2">No Orders Yet</h3>
				<p class="text-base-content/70 mb-6">
					Start shopping to see your orders here.
				</p>
				<a href="/products/hydroponics" class="btn btn-primary font-display uppercase tracking-wider">Browse Products</a>
			</div>
		{/if}
	</Container>
</Section>
