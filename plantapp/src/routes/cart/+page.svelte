<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;

	$: subtotal = data.cart?.items?.reduce(
		(sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
		0
	) || 0;
	$: shipping = subtotal > 100 ? 0 : 9.99;
	$: tax = subtotal * 0.08; // 8% tax rate
	$: total = subtotal + shipping + tax;

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
			<h1 class="text-4xl font-bold mb-2">Shopping Cart</h1>
			<p class="text-lg text-base-content/70">
				{data.cart?.items?.length || 0} items in your cart
			</p>
		</div>

		{#if data.cart?.items && data.cart.items.length > 0}
			<div class="grid lg:grid-cols-3 gap-8">
				<!-- Cart Items -->
				<div class="lg:col-span-2 space-y-4">
					{#each data.cart.items as item}
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<div class="flex gap-4">
									<!-- Product Image -->
									<div class="avatar">
										<div class="w-24 h-24 rounded">
											<img
												src={item.product?.image || '/placeholder-product.jpg'}
												alt={item.product?.name}
											/>
										</div>
									</div>

									<!-- Product Details -->
									<div class="flex-1">
										<h3 class="text-lg font-bold mb-1">{item.product?.name}</h3>
										<p class="text-sm text-base-content/70 mb-2">
											{item.product?.shortDescription}
										</p>
										<p class="text-xl font-bold text-primary">
											${parseFloat(item.price).toFixed(2)}
										</p>
									</div>

									<!-- Quantity Controls -->
									<div class="flex flex-col items-end gap-4">
										<button
											class="btn btn-ghost btn-sm btn-circle"
											on:click={() => removeItem(item.id)}
											aria-label="Remove item"
										>
											❌
										</button>
										<div class="join">
											<button
												class="join-item btn btn-sm"
												on:click={() => updateQuantity(item.id, item.quantity - 1)}
												disabled={item.quantity <= 1}
											>
												-
											</button>
											<div class="join-item btn btn-sm no-animation">
												{item.quantity}
											</div>
											<button
												class="join-item btn btn-sm"
												on:click={() => updateQuantity(item.id, item.quantity + 1)}
											>
												+
											</button>
										</div>
										<p class="font-semibold">
											${(parseFloat(item.price) * item.quantity).toFixed(2)}
										</p>
									</div>
								</div>
							</div>
						</div>
					{/each}

					<!-- Continue Shopping -->
					<a href="/products/hydroponics" class="btn btn-outline w-full">
						← Continue Shopping
					</a>
				</div>

				<!-- Order Summary -->
				<div class="lg:col-span-1">
					<div class="card bg-base-100 shadow-xl sticky top-4">
						<div class="card-body">
							<h2 class="card-title mb-4">Order Summary</h2>

							<!-- Promo Code -->
							<div class="form-control mb-4">
								<label class="label" for="promo-code">
									<span class="label-text">Promo Code</span>
								</label>
								<div class="join">
									<input
										id="promo-code"
										type="text"
										placeholder="Enter code"
										class="input input-bordered join-item flex-1"
									/>
									<button class="btn btn-primary join-item">Apply</button>
								</div>
							</div>

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
									<p class="text-xs text-success">Free shipping on orders over $100!</p>
								{:else}
									<p class="text-xs text-base-content/70">
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
							<a href="/checkout" class="btn btn-primary btn-lg w-full mt-6">
								Proceed to Checkout
							</a>

							<!-- Payment Methods -->
							<div class="mt-6">
								<p class="text-xs text-center text-base-content/70 mb-2">We accept</p>
								<div class="flex justify-center gap-2">
									<div class="badge badge-outline">Visa</div>
									<div class="badge badge-outline">Mastercard</div>
									<div class="badge badge-outline">PayPal</div>
									<div class="badge badge-outline">Amex</div>
								</div>
							</div>

							<!-- Trust Badges -->
							<div class="mt-4 p-4 bg-base-200 rounded-lg">
								<ul class="text-xs space-y-1 text-base-content/70">
									<li>✓ Secure checkout</li>
									<li>✓ 30-day money-back guarantee</li>
									<li>✓ Free returns on all orders</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Empty Cart -->
			<div class="text-center py-16">
				<div class="text-6xl mb-4">🛒</div>
				<h3 class="text-2xl font-bold mb-2">Your Cart is Empty</h3>
				<p class="text-base-content/70 mb-6">
					Looks like you haven't added anything to your cart yet.
				</p>
				<a href="/products/hydroponics" class="btn btn-primary">Start Shopping</a>
			</div>
		{/if}

		<!-- Recently Viewed -->
		{#if data.recentlyViewed && data.recentlyViewed.length > 0}
			<div class="mt-16">
				<h2 class="text-2xl font-bold mb-6">Recently Viewed</h2>
				<div class="grid grid-cols-4 gap-4">
					{#each data.recentlyViewed as product}
						<a
							href="/products/{product.categorySlug}/{product.slug}"
							class="card bg-base-100 shadow hover:shadow-xl transition-shadow"
						>
							<figure class="aspect-square">
								<img
									src={product.image || '/placeholder-product.jpg'}
									alt={product.name}
									class="object-cover w-full h-full"
								/>
							</figure>
							<div class="card-body p-4">
								<h3 class="font-semibold text-sm line-clamp-2">{product.name}</h3>
								<p class="text-lg font-bold text-primary">${product.price}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</Container>
</Section>
