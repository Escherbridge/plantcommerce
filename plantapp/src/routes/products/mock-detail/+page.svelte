<script lang="ts">
	import { Container, Section, Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedImage = $state(0);
	let quantity = $state(1);

	function addToCart() {
		// Mock add to cart functionality
		alert(`Added ${quantity} ${data.product.name} to cart!`);
	}
</script>

<svelte:head>
	<title>{data.product.name} - Aevani Marketplace</title>
	<meta name="description" content={data.product.shortDescription} />
</svelte:head>

<!-- Product Detail Section -->
<Section>
	<Container>
		<!-- Breadcrumb -->
		<div class="breadcrumbs mb-8 text-sm">
			<ul>
				<li><a href="/" class="text-base-content/70 hover:text-primary">Home</a></li>
				<li><a href="/products" class="text-base-content/70 hover:text-primary">Products</a></li>
				<li>
					<a
						href="/products/{data.product.category?.slug}"
						class="text-base-content/70 hover:text-primary">{data.product.category?.name}</a
					>
				</li>
				<li class="text-base-content">{data.product.name}</li>
			</ul>
		</div>

		<!-- Product Main Content -->
		<div class="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
			<!-- Product Images -->
			<div class="space-y-6">
				<!-- Main Image -->
				<div class="bg-base-200 aspect-square overflow-hidden rounded-2xl shadow-2xl">
					{#if data.product.images && data.product.images.length > 0}
						<img
							src={data.product.images[selectedImage].url}
							alt={data.product.images[selectedImage].altText}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full items-center justify-center">
							<span class="text-9xl">🌱</span>
						</div>
					{/if}
				</div>

				<!-- Thumbnail Images -->
				{#if data.product.images && data.product.images.length > 1}
					<div class="grid grid-cols-4 gap-4">
						{#each data.product.images as image, index}
							<button
								onclick={() => (selectedImage = index)}
								class="bg-base-200 aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 {selectedImage ===
								index
									? 'border-primary scale-105 shadow-lg'
									: 'hover:border-base-300 border-transparent'}"
							>
								<img src={image.url} alt={image.altText} class="h-full w-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Product Info -->
			<div class="space-y-8">
				<!-- Category Badge -->
				<div>
					<a
						href="/products/{data.product.category?.slug}"
						class="badge badge-primary badge-lg font-semibold tracking-wide"
					>
						{data.product.category?.name}
					</a>
				</div>

				<!-- Product Title -->
				<div class="space-y-4">
					<h1 class="text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
						{data.product.name}
					</h1>
					<p class="text-base-content/70 text-2xl font-light lg:text-3xl">
						{data.product.shortDescription}
					</p>
				</div>

				<!-- Price -->
				<div class="border-base-300 border-y py-6">
					<div class="flex items-baseline gap-4">
						<span class="text-primary text-6xl font-bold">
							${parseFloat(data.product.price).toFixed(2)}
						</span>
						<span class="text-base-content/60 text-xl font-light">per unit</span>
					</div>
				</div>

				<!-- Stock Status -->
				<div class="flex items-center gap-3">
					{#if data.product.inStock}
						<div class="badge badge-success badge-lg gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="inline-block h-4 w-4 stroke-current"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path></svg
							>
							IN STOCK
						</div>
						<span class="text-base-content/70">{data.product.stockQuantity} units available</span>
					{:else}
						<div class="badge badge-error badge-lg">OUT OF STOCK</div>
					{/if}
				</div>

				<!-- Quantity Selector & Add to Cart -->
				<div class="space-y-4 pt-4">
					<div class="flex items-center gap-4">
						<label class="text-lg font-semibold">Quantity:</label>
						<div class="join shadow-lg">
							<button
								class="btn btn-outline join-item"
								onclick={() => (quantity = Math.max(1, quantity - 1))}
								disabled={!data.product.inStock}
							>
								-
							</button>
							<input
								type="number"
								bind:value={quantity}
								min="1"
								max={data.product.stockQuantity}
								class="input input-bordered join-item w-20 text-center font-bold"
								disabled={!data.product.inStock}
							/>
							<button
								class="btn btn-outline join-item"
								onclick={() => (quantity = Math.min(data.product.stockQuantity, quantity + 1))}
								disabled={!data.product.inStock}
							>
								+
							</button>
						</div>
					</div>

					<button
						class="btn btn-primary btn-lg w-full text-lg font-semibold tracking-wide transition-transform hover:scale-105"
						onclick={addToCart}
						disabled={!data.product.inStock}
					>
						{#if data.product.inStock}
							ADD TO CART
						{:else}
							OUT OF STOCK
						{/if}
					</button>
				</div>

				<!-- Product Features -->
				<div class="bg-base-200 space-y-4 rounded-2xl p-8">
					<h3 class="mb-4 text-2xl font-bold">Product Features</h3>
					<ul class="space-y-3">
						<li class="flex items-start gap-3">
							<svg
								class="text-primary mt-1 h-6 w-6 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path></svg
							>
							<span class="text-lg">Premium quality materials</span>
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="text-primary mt-1 h-6 w-6 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path></svg
							>
							<span class="text-lg">Sustainable and eco-friendly</span>
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="text-primary mt-1 h-6 w-6 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path></svg
							>
							<span class="text-lg">Expert support included</span>
						</li>
						<li class="flex items-start gap-3">
							<svg
								class="text-primary mt-1 h-6 w-6 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path></svg
							>
							<span class="text-lg">30-day satisfaction guarantee</span>
						</li>
					</ul>
				</div>

				<!-- SKU -->
				<div class="text-base-content/60 text-sm">
					SKU: <span class="font-mono">{data.product.sku}</span>
				</div>
			</div>
		</div>

		<!-- Product Description -->
		<div class="mb-20">
			<div class="max-w-4xl">
				<h2 class="mb-8 text-4xl font-bold tracking-tight">PRODUCT DESCRIPTION</h2>
				<div class="prose prose-lg max-w-none">
					<p class="text-base-content/80 text-xl font-light leading-relaxed">
						{data.product.description}
					</p>
				</div>
			</div>
		</div>

		<!-- Related Products -->
		{#if data.relatedProducts && data.relatedProducts.length > 0}
			<div class="border-base-300 border-t pt-12">
				<h2 class="mb-12 text-4xl font-bold tracking-tight">YOU MAY ALSO LIKE</h2>
				<Grid columns={4} gap={8}>
					{#each data.relatedProducts as product}
						<a
							href="/products/mock-detail"
							class="card bg-base-100 hover:shadow-3xl border-base-200 group overflow-hidden rounded-2xl border shadow-xl transition-all duration-500 hover:-translate-y-3"
						>
							<figure class="bg-base-200 relative h-56 overflow-hidden">
								{#if product.images && product.images.length > 0}
									<img
										src={product.images[0].url}
										alt={product.images[0].altText}
										class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
									/>
									<div
										class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"
									></div>
								{:else}
									<div class="flex h-full items-center justify-center">
										<span class="text-6xl">🌱</span>
									</div>
								{/if}
							</figure>
							<div class="card-body space-y-3 p-6">
								<h3
									class="card-title group-hover:text-primary line-clamp-2 text-lg font-bold leading-tight transition-colors"
								>
									{product.name}
								</h3>
								<div class="text-primary text-3xl font-bold">
									${parseFloat(product.price).toFixed(2)}
								</div>
							</div>
						</a>
					{/each}
				</Grid>
			</div>
		{/if}
	</Container>
</Section>
