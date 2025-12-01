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
			<h1 class="text-4xl font-bold mb-2">My Wishlist</h1>
			<p class="text-lg text-base-content/70">
				Save your favorite products for later
			</p>
		</div>

		{#if data.wishlist && data.wishlist.length > 0}
			<!-- Wishlist Items -->
			<Grid columns={3} gap={6}>
				{#each data.wishlist as item}
					<div class="card bg-base-100 shadow-xl">
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
								❌
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
									class="btn btn-outline btn-sm"
								>
									View Details
								</a>
								<button
									class="btn btn-primary btn-sm"
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
				<button class="btn btn-outline">Share Wishlist</button>
				<button class="btn btn-primary">Add All to Cart</button>
			</div>
		{:else}
			<!-- Empty Wishlist -->
			<div class="text-center py-16">
				<div class="text-6xl mb-4">💚</div>
				<h3 class="text-2xl font-bold mb-2">Your Wishlist is Empty</h3>
				<p class="text-base-content/70 mb-6">
					Start adding products you love to your wishlist!
				</p>
				<a href="/products/hydroponics" class="btn btn-primary">Browse Products</a>
			</div>
		{/if}

		<!-- Recommendations -->
		{#if data.recommendations && data.recommendations.length > 0}
			<div class="mt-16">
				<h2 class="text-2xl font-bold mb-6">You Might Also Like</h2>
				<Grid columns={4} gap={4}>
					{#each data.recommendations as product}
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
				</Grid>
			</div>
		{/if}
	</Container>
</Section>
