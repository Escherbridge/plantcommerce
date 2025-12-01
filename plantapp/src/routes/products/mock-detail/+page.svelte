<script lang="ts">
	import { Container, Section, Grid } from '$lib/components/layout';
	import { Carousel } from '$lib/components/ui';
	import type { PageData } from './$types';

	// Import real product images
	import tomatoImg from '$lib/images/AI-MockAssets/PlantProduct-TOMATO.png';
	import seedImg from '$lib/images/AI-MockAssets/PlantProduct-SEED.png';
	import medImg from '$lib/images/AI-MockAssets/PlantProduct-MED.png';
	import trowelImg from '$lib/images/AI-MockAssets/ToolProduct-TROWL.png';

	let { data }: { data: PageData } = $props();

	let quantity = $state(1);
	let selectedThumbnail = $state(0);

	// Create carousel items using real asset images
	const carouselItems = [
		{
			id: 'product-1',
			content: `<img src="${tomatoImg}" alt="Fresh Heirloom Tomato" class="w-full h-full object-cover" />`,
			alt: 'Fresh Heirloom Tomato'
		},
		{
			id: 'product-2',
			content: `<img src="${seedImg}" alt="Artisan Seed Packets" class="w-full h-full object-cover" />`,
			alt: 'Artisan Seed Packets'
		},
		{
			id: 'product-3',
			content: `<img src="${medImg}" alt="Medicinal Herbs" class="w-full h-full object-cover" />`,
			alt: 'Medicinal Herbs'
		},
		{
			id: 'product-4',
			content: `<img src="${trowelImg}" alt="Hand-Forged trowel" class="w-full h-full object-cover" />`,
			alt: 'Hand-Forged Garden Trowel'
		}
	];

	function addToCart() {
		// Mock add to cart functionality
		alert(`Added ${quantity} ${data.product.name} to cart!`);
	}

	function handleSlideChange(index: number) {
		selectedThumbnail = index;
	}
</script>

<svelte:head>
	<title>{data.product.name} - Aevani Marketplace</title>
	<meta name="description" content={data.product.shortDescription} />
</svelte:head>

<!-- Product Detail Section with Full Width -->
<div class="w-full">
	<!-- Breadcrumb in container -->
	<Container>
		<div class="breadcrumbs mb-8 pt-8 text-sm">
			<ul>
				<li>
					<a href="/" class="text-base-content/70 hover:text-primary transition-colors">Home</a>
				</li>
				<li>
					<a href="/products" class="text-base-content/70 hover:text-primary transition-colors"
						>Products</a
					>
				</li>
				<li>
					<a
						href="/products/{data.product.category?.slug}"
						class="text-base-content/70 hover:text-primary transition-colors"
						>{data.product.category?.name}</a
					>
				</li>
				<li class="text-base-content font-medium">{data.product.name}</li>
			</ul>
		</div>
	</Container>

	<!-- Full-width product section -->
	<div class="bg-base-100 w-full">
		<Container>
			<!-- Product Main Content -->
			<div class="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
				<!-- Product Images - Full width on mobile -->
				<div class="w-full space-y-6">
					<!-- Main Image Carousel -->
					<div class="aspect-square w-full overflow-hidden rounded-2xl shadow-2xl">
						<Carousel
							items={carouselItems}
							showArrows={true}
							showDots={true}
							infinite={true}
							className="h-full w-full"
							itemClassName="h-full w-full"
							onSlideChange={handleSlideChange}
						/>
					</div>

					<!-- Thumbnail Images -->
					{#if carouselItems && carouselItems.length > 1}
						<div class="grid w-full grid-cols-4 gap-3">
							{#each carouselItems as item, index}
								<button
									onclick={() => handleSlideChange(index)}
									class="aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 {selectedThumbnail ===
									index
										? 'border-primary ring-primary/20 ring-2 ring-offset-2'
										: 'hover:border-base-300 border-transparent opacity-70 hover:opacity-100'}"
								>
									{@html item.content}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Product Info -->
				<div class="w-full space-y-8">
					<!-- Header -->
					<div class="space-y-4">
						<a
							href="/products/{data.product.category?.slug}"
							class="badge badge-primary badge-lg inline-block font-bold uppercase tracking-wider"
						>
							{data.product.category?.name}
						</a>

						<h1
							class="text-4xl font-bold leading-tight tracking-tight text-[#1D3557] md:text-5xl lg:text-6xl"
						>
							{data.product.name}
						</h1>

						<p class="text-base-content/70 text-lg font-light leading-relaxed md:text-xl">
							{data.product.shortDescription}
						</p>
					</div>

					<!-- Price & Stock -->
					<div class="border-base-200 space-y-4 border-y py-6">
						<div class="flex items-baseline gap-3">
							<span class="text-4xl font-bold text-[#1D3557] md:text-5xl">
								${parseFloat(data.product.price).toFixed(2)}
							</span>
							<span class="text-base-content/60 text-lg font-light">per unit</span>
						</div>

						<div class="flex items-center gap-3">
							{#if data.product.inStock}
								<div class="text-success flex items-center gap-2 font-medium">
									<div class="bg-success h-2.5 w-2.5 animate-pulse rounded-full"></div>
									IN STOCK
								</div>
								<span class="text-base-content/40 text-sm">|</span>
								<span class="text-base-content/60"
									>{data.product.stockQuantity} units available</span
								>
							{:else}
								<div class="badge badge-error badge-lg">OUT OF STOCK</div>
							{/if}
						</div>
					</div>

					<!-- Actions -->
					<div class="space-y-4">
						<div class="flex items-center gap-4">
							<div class="join border-base-300 rounded-lg border shadow-sm">
								<button
									class="btn btn-ghost join-item hover:bg-base-200 px-4"
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
									class="input input-ghost join-item w-16 text-center font-bold focus:outline-none"
									disabled={!data.product.inStock}
								/>
								<button
									class="btn btn-ghost join-item hover:bg-base-200 px-4"
									onclick={() => (quantity = Math.min(data.product.stockQuantity, quantity + 1))}
									disabled={!data.product.inStock}
								>
									+
								</button>
							</div>

							<span class="text-base-content/60 text-sm font-medium">Quantity</span>
						</div>

						<button
							class="btn btn-primary btn-lg h-14 w-full text-base font-bold tracking-widest shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
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

					<!-- Features -->
					<div class="space-y-4 rounded-2xl bg-[#F1FAEE] p-6">
						<h3 class="text-lg font-bold uppercase tracking-wide text-[#1D3557]">Key Features</h3>
						<ul class="grid gap-3">
							<li class="flex items-start gap-3">
								<div class="mt-1 rounded-full bg-[#A8DADC] p-1">
									<svg
										class="h-4 w-4 text-[#1D3557]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="3"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-base text-[#1D3557]/80"
									>Premium quality sustainable materials</span
								>
							</li>
							<li class="flex items-start gap-3">
								<div class="mt-1 rounded-full bg-[#A8DADC] p-1">
									<svg
										class="h-4 w-4 text-[#1D3557]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="3"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-base text-[#1D3557]/80">Eco-friendly production process</span>
							</li>
							<li class="flex items-start gap-3">
								<div class="mt-1 rounded-full bg-[#A8DADC] p-1">
									<svg
										class="h-4 w-4 text-[#1D3557]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="3"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-base text-[#1D3557]/80">Expert support & 30-day guarantee</span>
							</li>
						</ul>
					</div>

					<div class="text-base-content/40 font-mono text-sm">SKU: {data.product.sku}</div>
				</div>
			</div>
		</Container>
	</div>

	<!-- Product Description -->
	<Container>
		<div class="mb-20">
			<div class="border-base-200 mx-auto border-t pt-12">
				<h2 class="mb-6 text-3xl font-bold tracking-tight text-[#1D3557]">Description</h2>
				<div class="prose prose-lg text-base-content/80 max-w-none font-light leading-relaxed">
					<p>{data.product.description}</p>
				</div>
			</div>
		</div>
	</Container>

	<!-- Related Products -->
	{#if data.relatedProducts && data.relatedProducts.length > 0}
		<div class="bg-base-200/30 w-full py-16">
			<Container>
				<div class="mb-10 flex items-center justify-between">
					<h2 class="text-3xl font-bold tracking-tight text-[#1D3557]">You May Also Like</h2>
					<a href="/products" class="btn btn-ghost hover:text-primary group hover:bg-transparent">
						View All
						<span class="transition-transform group-hover:translate-x-1">→</span>
					</a>
				</div>

				<Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="sm">
					{#each data.relatedProducts as product}
						<a
							href="/products/mock-detail"
							class="card bg-base-100 border-base-200 group overflow-hidden rounded-xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
						>
							<figure class="bg-base-200 relative h-60 overflow-hidden">
								<div
									class="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-blue-100"
								>
									<span class="text-6xl">🌱</span>
								</div>
								<div
									class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"
								></div>
							</figure>
							<div class="card-body space-y-2 p-4">
								<h3
									class="card-title group-hover:text-primary line-clamp-2 text-base font-bold transition-colors"
								>
									{product.name}
								</h3>
								<div class="text-primary text-xl font-bold">
									${parseFloat(product.price).toFixed(2)}
								</div>
							</div>
						</a>
					{/each}
				</Grid>
			</Container>
		</div>
	{/if}
</div>
