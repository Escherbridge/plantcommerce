<script lang="ts">
	import { enhance } from '$app/forms';
	import { Container, Section } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const subtotal = $derived(
		data.cart?.items?.reduce(
			(sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
			0
		) || 0
	);
	const shipping = $derived(subtotal > 100 ? 0 : 9.99);
	const tax = $derived(subtotal * 0.08); // 8% tax rate
	const total = $derived(subtotal + shipping + tax);

	async function updateQuantity(itemId: number, quantity: number) {
		// Implement update quantity logic
		console.log('Update quantity:', itemId, quantity);
	}

	async function removeItem(itemId: number) {
		// Implement remove item logic
		console.log('Remove item:', itemId);
	}

	async function applyPromoCode(code: string) {
		// Implement promo code logic
		console.log('Apply promo code:', code);
	}
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="mb-2 text-4xl font-display uppercase tracking-tight">Shopping Cart</h1>
			<p class="text-base-content/70 text-lg">
				{data.cart?.items?.length || 0} items in your cart
			</p>
		</div>

		{#if data.cart?.items && data.cart.items.length > 0}
			<div class="grid gap-8 lg:grid-cols-3">
				<!-- Cart Items -->
				<div class="space-y-4 lg:col-span-2">
					{#each data.cart.items as item}
						<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
							<div class="card-body">
								<div class="flex gap-4">
									<!-- Product Image -->
									<div class="avatar">
										<div class="h-24 w-24 rounded">
											<img
												src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
												alt={item.product?.name}
											/>
										</div>
									</div>

									<!-- Product Details -->
									<div class="flex-1">
										<h3 class="mb-1 text-lg font-bold">{item.product?.name}</h3>
										<p class="text-base-content/70 mb-2 text-sm">
											{item.product?.shortDescription || ''}
										</p>
										<p class="text-primary text-xl font-bold">
											${parseFloat(item.unitPrice).toFixed(2)}
										</p>
									</div>

									<!-- Quantity Controls -->
									<div class="flex flex-col items-end gap-4">
										<button
											class="btn btn-ghost btn-sm btn-circle"
											onclick={() => removeItem(item.id)}
											aria-label="Remove item"
										>
											<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
												<path d="M18 6L6 18M6 6l12 12"/>
											</svg>
										</button>
										<div class="join">
											<button
												class="join-item btn btn-sm"
												onclick={() => updateQuantity(item.id, item.quantity - 1)}
												disabled={item.quantity <= 1}
											>
												-
											</button>
											<div class="join-item btn btn-sm no-animation">
												{item.quantity}
											</div>
											<button
												class="join-item btn btn-sm"
												onclick={() => updateQuantity(item.id, item.quantity + 1)}
											>
												+
											</button>
										</div>
										<p class="font-semibold">
											${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
										</p>
									</div>
								</div>
							</div>
						</div>
					{/each}

					<!-- Continue Shopping -->
					<a href="/products" class="btn btn-outline w-full font-display uppercase tracking-wider">
						<svg viewBox="0 0 24 24" class="w-5 h-5 mr-1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M19 12H5M12 5l-7 7 7 7"/>
						</svg>
						Continue Shopping
					</a>
				</div>

				<!-- Order Summary -->
				<div class="lg:col-span-1">
					<div class="card bg-base-100 sticky top-4 shadow-md rounded-3xl border border-base-200/30">
						<div class="card-body">
							<h2 class="card-title font-display uppercase tracking-tight mb-4">Order Summary</h2>

							<!-- Promo Code -->
							<form action="?/applyPromo" method="POST" use:enhance class="form-control mb-4">
								<label class="label" for="promo-code">
									<span class="label-text">Promo Code</span>
								</label>
								<div class="join">
									<input
										id="promo-code"
										name="code"
										type="text"
										placeholder="Enter code"
										class="input input-bordered join-item flex-1"
									/>
									<button class="btn btn-primary join-item font-display uppercase tracking-wider">Apply</button>
								</div>
							</form>

							<div class="divider"></div>

							<!-- Price Breakdown -->
							<div class="space-y-2">
								<div class="flex justify-between">
									<span>Subtotal</span>
									<span>${subtotal.toFixed(2)}</span>
								</div>
								<div class="flex justify-between">
									<span>Shipping</span>
									<span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
								</div>
								{#if shipping === 0}
									<p class="text-success text-xs">Free shipping on orders over $100!</p>
								{:else}
									<p class="text-base-content/70 text-xs">
										Add ${(100 - subtotal).toFixed(2)} more for free shipping
									</p>
								{/if}
								<div class="flex justify-between">
									<span>Tax</span>
									<span>${tax.toFixed(2)}</span>
								</div>
								<div class="divider"></div>
								<div class="flex justify-between text-xl font-bold">
									<span>Total</span>
									<span>${total.toFixed(2)}</span>
								</div>
							</div>

							<!-- Checkout Button -->
							<a href="/checkout" class="btn btn-primary btn-lg mt-6 w-full font-display uppercase tracking-wider">
								Proceed to Checkout
							</a>

							<!-- Payment Methods -->
							<div class="mt-6">
								<p class="text-base-content/70 mb-2 text-center text-xs">We accept</p>
								<div class="flex justify-center gap-2">
									<div class="badge badge-outline">Visa</div>
									<div class="badge badge-outline">Mastercard</div>
									<div class="badge badge-outline">PayPal</div>
									<div class="badge badge-outline">Amex</div>
								</div>
							</div>

							<!-- Trust Badges -->
							<div class="bg-base-200 mt-4 rounded-3xl p-4">
								<ul class="text-base-content/70 space-y-1 text-xs">
									<li>&#10003; Secure checkout</li>
									<li>&#10003; 30-day money-back guarantee</li>
									<li>&#10003; Free returns on all orders</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Empty Cart -->
			<div class="py-16 text-center">
				<div class="flex justify-center mb-4">
					<svg viewBox="0 0 24 24" class="w-16 h-16 text-base-content/30" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 3h2l3 12h10l3-9H6M8 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z"/>
					</svg>
				</div>
				<h3 class="mb-2 text-2xl font-display uppercase tracking-tight">Your Cart is Empty</h3>
				<p class="text-base-content/70 mb-6">
					Looks like you haven't added anything to your cart yet.
				</p>
				<a href="/products" class="btn btn-primary font-display uppercase tracking-wider">Start Shopping</a>
			</div>
		{/if}

		<!-- Recently Viewed -->
		{#if data.recentlyViewed && data.recentlyViewed.length > 0}
			<div class="mt-16">
				<h2 class="mb-6 text-2xl font-display uppercase tracking-tight">Recently Viewed</h2>
				<div class="grid grid-cols-4 gap-4">
					{#each data.recentlyViewed as product}
						<a
							href="/products/{product.category?.slug || 'uncategorized'}/{product.slug}"
							class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30 transition-shadow hover:shadow-xl"
						>
							<figure class="aspect-square">
								<img
									src={product.images?.[0]?.url || '/placeholder-product.jpg'}
									alt={product.name}
									class="h-full w-full object-cover"
								/>
							</figure>
							<div class="card-body p-4">
								<h3 class="line-clamp-2 text-sm font-semibold">{product.name}</h3>
								<p class="text-primary text-lg font-bold">${product.price}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</Container>
</Section>
