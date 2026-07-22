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
			<h1 class="font-display mb-2 text-4xl tracking-tight uppercase">My Orders</h1>
			<p class="text-lg text-base-content/70">View and track your order history</p>
		</div>

		<!-- Order Filters -->
		<div class="mb-8 flex flex-wrap gap-2">
			<a href="/account/orders" class="font-display btn tracking-wider uppercase btn-sm btn-primary"
				>All Orders</a
			>
			<a
				href="/account/orders?status=processing"
				class="font-display btn tracking-wider uppercase btn-outline btn-sm">Processing</a
			>
			<a
				href="/account/orders?status=shipped"
				class="font-display btn tracking-wider uppercase btn-outline btn-sm">Shipped</a
			>
			<a
				href="/account/orders?status=delivered"
				class="font-display btn tracking-wider uppercase btn-outline btn-sm">Delivered</a
			>
			<a
				href="/account/orders?status=cancelled"
				class="font-display btn tracking-wider uppercase btn-outline btn-sm">Cancelled</a
			>
		</div>

		<!-- Orders List -->
		{#if data.orders && data.orders.length > 0}
			<div class="space-y-6">
				{#each data.orders as order}
					<div class="card rounded-3xl border border-base-200/30 bg-base-100 shadow-md">
						<div class="card-body">
							<!-- Order Header -->
							<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
								<div>
									<h3 class="mb-1 text-xl font-bold">Order #{order.id}</h3>
									<p class="text-sm text-base-content/60">
										Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</p>
								</div>
								<div class="text-right">
									<div class="badge {getStatusColor(order.status)} mb-2 badge-lg">
										{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
									</div>
									<p class="text-lg font-bold">${parseFloat(order.totalAmount).toFixed(2)}</p>
								</div>
							</div>

							<!-- Order summary -->
							<div class="divider"></div>
							<div class="text-sm text-base-content/60">
								{order.itemCount}
								{order.itemCount === 1 ? 'item' : 'items'} in this order
							</div>

							<!-- Order Actions -->
							<div class="mt-4 card-actions justify-end">
								<a
									href="/account/orders/{order.id}"
									class="font-display btn tracking-wider uppercase btn-outline btn-sm"
								>
									View Details
								</a>
								{#if order.status === 'shipped' || order.status === 'delivered'}
									<button class="font-display btn tracking-wider uppercase btn-sm btn-primary"
										>Track Order</button
									>
								{/if}
								{#if order.status === 'delivered'}
									<button class="font-display btn tracking-wider uppercase btn-outline btn-sm"
										>Reorder</button
									>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-16 text-center">
				<div class="mb-4 flex justify-center">
					<svg
						viewBox="0 0 24 24"
						class="h-16 w-16 text-base-content/30"
						stroke="currentColor"
						stroke-width="1.5"
						fill="none"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11" />
					</svg>
				</div>
				<h3 class="font-display mb-2 text-2xl tracking-tight uppercase">No Orders Yet</h3>
				<p class="mb-6 text-base-content/70">Start shopping to see your orders here.</p>
				<a href="/products" class="font-display btn tracking-wider uppercase btn-primary"
					>View Catalog Status</a
				>
			</div>
		{/if}
	</Container>
</Section>
