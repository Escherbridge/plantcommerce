<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function removeFromWishlist(productId: number) {
		// Implement remove from wishlist logic
		console.log('Remove from wishlist:', productId);
	}

	async function addToCart(productId: number) {
		// Implement add to cart logic
		console.log('Add to cart:', productId);
	}
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-2">My Wishlist</h1>
			<p class="text-lg text-base-content/70">
				Save your favorite products for later
			</p>
		</div>

		{#if data.wishlist && data.wishlist.length > 0}
			<!-- Wishlist Items -->
			<Grid columns={3} gap={6}>
				{#each data.wishlist as item}
					<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
						<figure class="aspect-square relative">
							<img
								src={item.product?.image || '/placeholder-product.jpg'}
								alt={item.product?.name}
								class="object-cover w-full h-full"
							/>
							<button
								class="btn btn-circle btn-sm btn-ghost absolute top-2 right-2 bg-base-100/80"
								onclick={() => removeFromWishlist(item.productId)}
								aria-label="Remove from wishlist"
							>
								<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<path d="M18 6L6 18M6 6l12 12"/>
								</svg>
							</button>
						</figure>
						<div class="card-body">
							<h2 class="card-title">{item.product?.name}</h2>
							<p class="text-sm text-base-content/70 line-clamp-2">
								{item.product?.shortDescription}
							</p>
							<div class="flex justify-between items-center mt-4">
								<span class="text-2xl font-bold">${item.product?.price}</span>
								{#if item.product?.stockQuantity > 0}
									<span class="badge badge-success">In Stock</span>
								{:else}
									<span class="badge badge-error">Out of Stock</span>
								{/if}
							</div>
							<div class="card-actions justify-between mt-4">
								<a
									href="/products/{item.product?.categorySlug}/{item.product?.slug}"
									class="btn btn-outline btn-sm font-display uppercase tracking-wider"
								>
									View Details
								</a>
								<button
									class="btn btn-primary btn-sm font-display uppercase tracking-wider"
									onclick={() => addToCart(item.productId)}
									disabled={item.product?.stockQuantity === 0}
								>
									Add to Cart
								</button>
							</div>
						</div>
					</div>
				{/each}
			</Grid>

			<!-- Wishlist Actions -->
			<div class="mt-12 flex gap-4 justify-center">
				<button class="btn btn-outline font-display uppercase tracking-wider">Share Wishlist</button>
				<button class="btn btn-primary font-display uppercase tracking-wider">Add All to Cart</button>
			</div>
		{:else}
			<!-- Empty Wishlist -->
			<div class="text-center py-16">
				<div class="flex justify-center mb-4">
					<svg viewBox="0 0 24 24" class="w-16 h-16 text-base-content/30" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
					</svg>
				</div>
				<h3 class="text-2xl font-display uppercase tracking-tight mb-2">Your Wishlist is Empty</h3>
				<p class="text-base-content/70 mb-6">
					Start adding products you love to your wishlist!
				</p>
				<a href="/products/hydroponics" class="btn btn-primary font-display uppercase tracking-wider">Browse Products</a>
			</div>
		{/if}

		<!-- Recommendations -->
		{#if data.recommendations && data.recommendations.length > 0}
			<div class="mt-16">
				<h2 class="text-2xl font-display uppercase tracking-tight mb-6">You Might Also Like</h2>
				<Grid columns={4} gap={4}>
					{#each data.recommendations as product}
						<a
							href="/products/{product.categorySlug}/{product.slug}"
							class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30 hover:shadow-xl transition-shadow"
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
				</Grid>
			</div>
		{/if}
	</Container>
</Section>
