<script lang="ts">
	import StructuredData from '$lib/components/StructuredData.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { browser } from '$app/environment';
	import { Container, Section, Grid } from '$lib/components/layout';
	import { cart } from '$lib/stores/cart';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let quantity = $state(1);
	let adding = $state(false);

	const productUrl = `/products/${data.categorySlug}/${data.product.slug}`;

	async function addToCart() {
		if (adding) return;
		adding = true;
		try {
			await cart.addItem(data.product.id, quantity, data.product.name);
		} finally {
			adding = false;
		}
	}
</script>

<svelte:head>
	<title>{data.product.name} - Aevani</title>
	<meta name="description" content={data.product.shortDescription || data.product.description || ''} />

	<SEO
		title="{data.product.name} | Aevani"
		description={data.product.shortDescription || data.product.description || ''}
		image={data.product.images?.[0]?.url || '/api/files/serve?path=AI-MockAssets%2FMAINHERO.png'}
		type="product"
		tags={[data.product.category?.name || 'Gardening']}
	/>

	<StructuredData
		type="product"
		data={{
			name: data.product.name,
			description: data.product.description || data.product.shortDescription,
			image: data.product.images?.[0]?.url || '/api/files/serve?path=AI-MockAssets%2FMAINHERO.png',
			brand: { '@type': 'Brand', name: 'Aevani' },
			offers: {
				'@type': 'Offer',
				price: data.product.price,
				priceCurrency: 'USD',
				availability: data.product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
				url: browser ? window.location.href : `https://aevani.com${productUrl}`,
				itemCondition: 'https://schema.org/NewCondition'
			}
		}}
	/>

	<StructuredData
		type="breadcrumb"
		data={{
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aevani.com' },
				{ '@type': 'ListItem', position: 2, name: 'Products', item: 'https://aevani.com/products' },
				{ '@type': 'ListItem', position: 3, name: data.product.category?.name || 'Products', item: `https://aevani.com/products/${data.categorySlug}` },
				{ '@type': 'ListItem', position: 4, name: data.product.name, item: `https://aevani.com${productUrl}` }
			]
		}}
	/>
</svelte:head>

<div class="w-full">
	<!-- Breadcrumb -->
	<Container>
		<div class="breadcrumbs mb-8 pt-8 text-sm">
			<ul>
				<li>
					<a href="/" class="text-base-content/70 hover:text-primary transition-colors">Home</a>
				</li>
				<li>
					<a href="/products" class="text-base-content/70 hover:text-primary transition-colors">Products</a>
				</li>
				<li>
					<a
						href="/products/{data.categorySlug}"
						class="text-base-content/70 hover:text-primary transition-colors"
					>{data.product.category?.name || data.categorySlug}</a>
				</li>
				<li class="text-base-content font-medium">{data.product.name}</li>
			</ul>
		</div>
	</Container>

	<!-- Product Main Content -->
	<div class="bg-base-100 w-full">
		<Container>
			<div class="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
				<!-- Product Image -->
				<div class="w-full">
					<div class="aspect-square w-full overflow-hidden rounded-2xl shadow-2xl">
						{#if data.product.images && data.product.images.length > 0}
							<img
								src={data.product.images[0].url}
								alt={data.product.images[0].altText || data.product.name}
								class="h-full w-full object-cover"
							/>
						{:else}
							<div class="flex h-full items-center justify-center bg-base-200">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-20 h-20 text-base-content/20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
									<path d="M24 42c-3-1-5 1-8 0M24 42c3-1 5 1 8 0M24 42V20M24 30c-6-1-11-7-9-14 4 4 8 9 9 14zM24 24c6-1 11-7 9-14-4 4-8 9-9 14z" />
								</svg>
							</div>
						{/if}
					</div>
				</div>

				<!-- Product Info -->
				<div class="w-full space-y-8">
					<div class="space-y-4">
						<a
							href="/products/{data.categorySlug}"
							class="badge badge-primary badge-lg inline-block font-bold uppercase tracking-wider"
						>
							{data.product.category?.name || data.categorySlug}
						</a>

						<h1 class="text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl lg:text-6xl">
							{data.product.name}
						</h1>

						<p class="text-base-content/70 text-lg font-light leading-relaxed md:text-xl">
							{data.product.shortDescription}
						</p>
					</div>

					<!-- Price & Stock -->
					<div class="border-base-200 space-y-4 border-y py-6">
						<div class="flex items-baseline gap-3">
							<span class="text-4xl font-bold text-primary md:text-5xl">
								${parseFloat(data.product.price).toFixed(2)}
							</span>
							{#if data.product.comparePrice}
								<span class="text-base-content/40 text-xl line-through">
									${parseFloat(data.product.comparePrice).toFixed(2)}
								</span>
							{/if}
							<span class="text-base-content/60 text-lg font-light">per unit</span>
						</div>

						<div class="flex items-center gap-3">
							{#if data.product.inStock}
								<div class="text-success flex items-center gap-2 font-medium">
									<div class="bg-success h-2.5 w-2.5 animate-pulse rounded-full"></div>
									IN STOCK
								</div>
								<span class="text-base-content/40 text-sm">|</span>
								<span class="text-base-content/60">{data.product.stockQuantity} units available</span>
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
								>-</button>
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
								>+</button>
							</div>
							<span class="text-base-content/60 text-sm font-medium">Quantity</span>
						</div>

						<button
							class="btn btn-primary btn-lg h-14 w-full text-base font-bold tracking-widest shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
							onclick={addToCart}
							disabled={!data.product.inStock || adding}
						>
							{#if adding}
								<span class="loading loading-spinner loading-sm"></span>
								ADDING...
							{:else if data.product.inStock}
								ADD TO CART
							{:else}
								OUT OF STOCK
							{/if}
						</button>
					</div>

					<!-- Features -->
					<div class="space-y-4 rounded-2xl bg-base-200 p-6">
						<h3 class="text-lg font-bold uppercase tracking-wide text-primary">Key Features</h3>
						<ul class="grid gap-3">
							{#each ['Premium quality sustainable materials', 'Eco-friendly production process', 'Expert support & 30-day guarantee'] as feature}
								<li class="flex items-start gap-3">
									<div class="mt-1 rounded-full bg-info p-1">
										<svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
										</svg>
									</div>
									<span class="text-base text-primary/80">{feature}</span>
								</li>
							{/each}
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
				<h2 class="mb-6 text-3xl font-bold tracking-tight text-primary">Description</h2>
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
					<h2 class="text-3xl font-bold tracking-tight text-primary">You May Also Like</h2>
					<a href="/products/{data.categorySlug}" class="btn btn-ghost hover:text-primary group hover:bg-transparent">
						View All
						<span class="transition-transform group-hover:translate-x-1">&rarr;</span>
					</a>
				</div>

				<Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="sm">
					{#each data.relatedProducts as product}
						<a
							href="/products/{data.categorySlug}/{product.slug}"
							class="card bg-base-100 border-base-200 group overflow-hidden rounded-xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
						>
							<figure class="bg-base-200 relative h-60 overflow-hidden">
								{#if product.images && product.images.length > 0}
									<img
										src={product.images[0].url}
										alt={product.images[0].altText || product.name}
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-12 h-12 text-base-content/20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
											<path d="M24 42c-3-1-5 1-8 0M24 42c3-1 5 1 8 0M24 42V20M24 30c-6-1-11-7-9-14 4 4 8 9 9 14zM24 24c6-1 11-7 9-14-4 4-8 9-9 14z" />
										</svg>
									</div>
								{/if}
								<div class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"></div>
							</figure>
							<div class="card-body space-y-2 p-4">
								<h3 class="card-title group-hover:text-primary line-clamp-2 text-base font-bold transition-colors">
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
