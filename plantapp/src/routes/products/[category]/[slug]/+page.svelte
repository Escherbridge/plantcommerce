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
	<meta
		name="description"
		content={data.product.shortDescription || data.product.description || ''}
	/>

	<SEO
		title="{data.product.name} | Aevani"
		description={data.product.shortDescription || data.product.description || ''}
		image={data.product.images?.[0]?.url}
		type="product"
		tags={[data.product.category?.name || 'Gardening']}
	/>

	<StructuredData
		type="product"
		data={{
			name: data.product.name,
			description: data.product.description || data.product.shortDescription,
			image: data.product.images?.[0]?.url,
			brand: { '@type': 'Brand', name: 'Aevani' },
			offers: {
				'@type': 'Offer',
				price: data.product.price,
				priceCurrency: 'USD',
				availability: data.product.inStock
					? 'https://schema.org/InStock'
					: 'https://schema.org/OutOfStock',
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
				{
					'@type': 'ListItem',
					position: 3,
					name: data.product.category?.name || 'Products',
					item: `https://aevani.com/products/${data.categorySlug}`
				},
				{
					'@type': 'ListItem',
					position: 4,
					name: data.product.name,
					item: `https://aevani.com${productUrl}`
				}
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
					<a href="/" class="text-base-content/70 transition-colors hover:text-primary">Home</a>
				</li>
				<li>
					<a href="/products" class="text-base-content/70 transition-colors hover:text-primary"
						>Products</a
					>
				</li>
				<li>
					<a
						href="/products/{data.categorySlug}"
						class="text-base-content/70 transition-colors hover:text-primary"
						>{data.product.category?.name || data.categorySlug}</a
					>
				</li>
				<li class="font-medium text-base-content">{data.product.name}</li>
			</ul>
		</div>
	</Container>

	<!-- Product Main Content -->
	<div class="w-full bg-base-100">
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
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 48 48"
									class="h-20 w-20 text-base-content/20"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path
										d="M24 42c-3-1-5 1-8 0M24 42c3-1 5 1 8 0M24 42V20M24 30c-6-1-11-7-9-14 4 4 8 9 9 14zM24 24c6-1 11-7 9-14-4 4-8 9-9 14z"
									/>
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
							class="badge inline-block badge-lg font-bold tracking-wider uppercase badge-primary"
						>
							{data.product.category?.name || data.categorySlug}
						</a>

						<h1
							class="text-4xl leading-tight font-bold tracking-tight text-primary md:text-5xl lg:text-6xl"
						>
							{data.product.name}
						</h1>

						<p class="text-lg leading-relaxed font-light text-base-content/70 md:text-xl">
							{data.product.shortDescription}
						</p>
					</div>

					<!-- Price & Stock -->
					<div class="space-y-4 border-y border-base-200 py-6">
						<div class="flex items-baseline gap-3">
							<span class="text-4xl font-bold text-primary md:text-5xl">
								${parseFloat(data.product.price).toFixed(2)}
							</span>
							{#if data.product.comparePrice}
								<span class="text-xl text-base-content/40 line-through">
									${parseFloat(data.product.comparePrice).toFixed(2)}
								</span>
							{/if}
							<span class="text-lg font-light text-base-content/60">per unit</span>
						</div>

						<div class="flex items-center gap-3">
							{#if data.product.inStock}
								<div class="flex items-center gap-2 font-medium text-success">
									<div class="h-2.5 w-2.5 animate-pulse rounded-full bg-success"></div>
									IN STOCK
								</div>
								<span class="text-sm text-base-content/40">|</span>
								<span class="text-base-content/60"
									>{data.product.stockQuantity} units available</span
								>
							{:else}
								<div class="badge badge-lg badge-error">OUT OF STOCK</div>
							{/if}
						</div>
					</div>

					<!-- Actions -->
					<div class="space-y-4">
						<div class="flex items-center gap-4">
							<div class="join rounded-lg border border-base-300 shadow-sm">
								<button
									class="btn join-item px-4 btn-ghost hover:bg-base-200"
									onclick={() => (quantity = Math.max(1, quantity - 1))}
									disabled={!data.product.inStock}>-</button
								>
								<input
									type="number"
									bind:value={quantity}
									min="1"
									max={data.product.stockQuantity}
									class="input join-item w-16 input-ghost text-center font-bold focus:outline-none"
									disabled={!data.product.inStock}
								/>
								<button
									class="btn join-item px-4 btn-ghost hover:bg-base-200"
									onclick={() => (quantity = Math.min(data.product.stockQuantity, quantity + 1))}
									disabled={!data.product.inStock}>+</button
								>
							</div>
							<span class="text-sm font-medium text-base-content/60">Quantity</span>
						</div>

						<button
							class="btn h-14 w-full text-base font-bold tracking-widest shadow-xl transition-all btn-lg btn-primary hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
							onclick={addToCart}
							disabled={!data.product.inStock || adding}
						>
							{#if adding}
								<span class="loading loading-sm loading-spinner"></span>
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
						<h3 class="text-lg font-bold tracking-wide text-primary uppercase">Key Features</h3>
						<ul class="grid gap-3">
							{#each ['Product details require supplier verification', 'Claim evidence is reviewed before publication', 'Support and warranty terms are product-specific when available'] as feature}
								<li class="flex items-start gap-3">
									<div class="mt-1 rounded-full bg-info p-1">
										<svg
											class="h-4 w-4 text-primary"
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
									<span class="text-base text-primary/80">{feature}</span>
								</li>
							{/each}
						</ul>
					</div>

					<div class="font-mono text-sm text-base-content/40">SKU: {data.product.sku}</div>
				</div>
			</div>
		</Container>
	</div>

	<!-- Product Description -->
	<Container>
		<div class="mb-20">
			<div class="mx-auto border-t border-base-200 pt-12">
				<h2 class="mb-6 text-3xl font-bold tracking-tight text-primary">Description</h2>
				<div class="prose prose-lg max-w-none leading-relaxed font-light text-base-content/80">
					<p>{data.product.description}</p>
				</div>
			</div>
		</div>
	</Container>

	<!-- Related Products -->
	{#if data.relatedProducts && data.relatedProducts.length > 0}
		<div class="w-full bg-base-200/30 py-16">
			<Container>
				<div class="mb-10 flex items-center justify-between">
					<h2 class="text-3xl font-bold tracking-tight text-primary">You May Also Like</h2>
					<a
						href="/products/{data.categorySlug}"
						class="group btn btn-ghost hover:bg-transparent hover:text-primary"
					>
						View All
						<span class="transition-transform group-hover:translate-x-1">&rarr;</span>
					</a>
				</div>

				<Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="sm">
					{#each data.relatedProducts as product}
						<a
							href="/products/{data.categorySlug}/{product.slug}"
							class="group card overflow-hidden rounded-xl border border-base-200 bg-base-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
						>
							<figure class="relative h-60 overflow-hidden bg-base-200">
								{#if product.images && product.images.length > 0}
									<img
										src={product.images[0].url}
										alt={product.images[0].altText || product.name}
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-blue-100"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 48 48"
											class="h-12 w-12 text-base-content/20"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path
												d="M24 42c-3-1-5 1-8 0M24 42c3-1 5 1 8 0M24 42V20M24 30c-6-1-11-7-9-14 4 4 8 9 9 14zM24 24c6-1 11-7 9-14-4 4-8 9-9 14z"
											/>
										</svg>
									</div>
								{/if}
								<div
									class="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10"
								></div>
							</figure>
							<div class="card-body space-y-2 p-4">
								<h3
									class="card-title line-clamp-2 text-base font-bold transition-colors group-hover:text-primary"
								>
									{product.name}
								</h3>
								<div class="text-xl font-bold text-primary">
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
