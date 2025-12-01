<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;
	$: order = data.order;
</script>

<Section>
	<Container>
		<div class="mb-8">
			<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 class="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
					<p class="text-base-content/70">
						Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(
							order.createdAt
						).toLocaleTimeString()}
					</p>
				</div>
				<div class="badge badge-lg uppercase font-bold" class:badge-primary={order.status === 'confirmed'} class:badge-ghost={order.status === 'pending'}>
					{order.status}
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Order Items -->
			<div class="lg:col-span-2 space-y-6">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-4">Items</h2>
						<div class="overflow-x-auto">
							<table class="table">
								<thead>
									<tr>
										<th>Product</th>
										<th class="text-right">Price</th>
										<th class="text-center">Qty</th>
										<th class="text-right">Total</th>
									</tr>
								</thead>
								<tbody>
									{#each order.items as item}
										<tr>
											<td>
												<div class="font-bold">{item.productName}</div>
												<div class="text-xs text-base-content/70">{item.productSku}</div>
											</td>
											<td class="text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
											<td class="text-center">{item.quantity}</td>
											<td class="text-right font-bold">${parseFloat(item.totalPrice).toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<!-- Shipping & Billing -->
				<div class="grid md:grid-cols-2 gap-6">
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title text-lg mb-2">Shipping Address</h3>
							<div class="text-sm">
								<p class="font-bold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
								<p>{order.shippingAddress.address1}</p>
								{#if order.shippingAddress.address2}
									<p>{order.shippingAddress.address2}</p>
								{/if}
								<p>
									{order.shippingAddress.city}, {order.shippingAddress.state}
									{order.shippingAddress.postalCode}
								</p>
								<p>{order.shippingAddress.country}</p>
							</div>
						</div>
					</div>

					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title text-lg mb-2">Billing Address</h3>
							<div class="text-sm">
								<p class="font-bold">{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
								<p>{order.billingAddress.address1}</p>
								{#if order.billingAddress.address2}
									<p>{order.billingAddress.address2}</p>
								{/if}
								<p>
									{order.billingAddress.city}, {order.billingAddress.state}
									{order.billingAddress.postalCode}
								</p>
								<p>{order.billingAddress.country}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Order Summary -->
			<div class="lg:col-span-1">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-4">Summary</h2>
						<div class="space-y-2">
							<div class="flex justify-between">
								<span>Subtotal</span>
								<span>${parseFloat(order.subtotalAmount).toFixed(2)}</span>
							</div>
							<div class="flex justify-between">
								<span>Shipping</span>
								<span>${parseFloat(order.shippingAmount).toFixed(2)}</span>
							</div>
							<div class="flex justify-between">
								<span>Tax</span>
								<span>${parseFloat(order.taxAmount).toFixed(2)}</span>
							</div>
							{#if parseFloat(order.discountAmount) > 0}
								<div class="flex justify-between text-success">
									<span>Discount</span>
									<span>-${parseFloat(order.discountAmount).toFixed(2)}</span>
								</div>
							{/if}
							<div class="divider"></div>
							<div class="flex justify-between text-xl font-bold">
								<span>Total</span>
								<span>${parseFloat(order.totalAmount).toFixed(2)}</span>
							</div>
						</div>

						<div class="mt-6 space-y-3">
							<a href="/products" class="btn btn-primary w-full">Continue Shopping</a>
							<a href="/account/orders" class="btn btn-outline w-full">View All Orders</a>
						</div>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl mt-6">
					<div class="card-body">
						<h3 class="card-title text-lg mb-2">Need Help?</h3>
						<p class="text-sm text-base-content/70 mb-4">
							If you have any questions about your order, please contact our support team.
						</p>
						<a href="/contact" class="btn btn-ghost btn-sm">Contact Support</a>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
