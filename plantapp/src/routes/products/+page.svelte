<script lang="ts">
	import { Container, Section, Grid } from '$lib/components/layout';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	import CategoryNav from '$lib/components/navigation/CategoryNav.svelte';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state(data.searchQuery || '');
	let selectedCategory = $state(data.selectedCategory || '');

	function handleSearch() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedCategory) params.set('category', selectedCategory);
		goto(`/products?${params.toString()}`);
	}

	function handleCategoryFilter(categoryId: string) {
		selectedCategory = categoryId;
		handleSearch();
	}
</script>

<Section>
	<Container>
		<!-- Enhanced Header -->
		<div class="mb-12 space-y-4">
			<h1 class="text-5xl font-bold tracking-tight lg:text-7xl">ALL PRODUCTS</h1>
			<div class="bg-primary h-1 w-24"></div>
			<p class="text-base-content/60 max-w-3xl text-xl font-light lg:text-2xl">
				Browse our complete selection of sustainable agriculture products
			</p>
		</div>

		<!-- Enhanced Filters -->
		<div class="mb-12 flex flex-col gap-6 md:flex-row">
			<!-- Search -->
			<div class="flex-1">
				<div class="join w-full shadow-lg">
					<input
						type="text"
						placeholder="Search products..."
						class="input input-bordered input-lg join-item focus:outline-primary w-full"
						bind:value={searchQuery}
						onkeypress={(e) => e.key === 'Enter' && handleSearch()}
					/>
					<button
						class="btn btn-primary join-item px-8 font-semibold tracking-wide"
						onclick={handleSearch}
					>
						SEARCH
					</button>
				</div>
			</div>

			<!-- Category Filter -->
			<div class="md:w-72">
				<select
					class="select select-bordered select-lg focus:outline-primary w-full shadow-lg"
					bind:value={selectedCategory}
					onchange={handleSearch}
				>
					<option value="">All Categories</option>
					{#each data.categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Enhanced Category Cards -->
		{#if !data.selectedCategory && !data.searchQuery}
			<div class="mb-16">
				<h2 class="mb-6 text-3xl font-bold tracking-tight lg:text-4xl">SHOP BY CATEGORY</h2>
				<CategoryNav showCounts={true} showIcons={true} compact={true} />
				<div class="mt-8 text-center">
					<a
						href="/products"
						class="inline-flex items-center text-lg font-medium text-primary hover:underline"
					>
						View all categories
						<svg class="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</a>
				</div>
			</div>
		{/if}

		<!-- Enhanced Products Grid -->
		<div>
			<h2 class="mb-8 text-3xl font-bold tracking-tight lg:text-4xl">
				{#if data.searchQuery}
					SEARCH RESULTS FOR "{data.searchQuery}"
				{:else if data.selectedCategory}
					FILTERED PRODUCTS
				{:else}
					ALL PRODUCTS
				{/if}
			</h2>

			<Grid columns={3} gap="sm">
				{#if data.products && data.products.length > 0}
					{#each data.products as product}
						<!-- All products redirect to mock detail page -->
						<a
							href="/products/mock-detail"
							class="card bg-base-100 hover:shadow-3xl border-base-200 group overflow-hidden rounded-2xl border shadow-xl transition-all duration-500 hover:-translate-y-3"
						>
							<figure class="bg-base-200 relative h-64 overflow-hidden">
								{#if product.images && product.images.length > 0}
									<img
										src={product.images[0].url || '/placeholder.png'}
										alt={product.images[0].altText || product.name}
										class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
									/>
									<!-- Overlay on hover -->
									<div
										class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"
									></div>
								{:else}
									<div class="flex h-full items-center justify-center">
										<span class="text-6xl">🌱</span>
									</div>
								{/if}
							</figure>
							<div class="card-body space-y-4 p-6">
								<h3
									class="card-title group-hover:text-primary text-2xl font-bold leading-tight transition-colors"
								>
									{product.name}
								</h3>
								<p class="text-base-content/70 line-clamp-2 text-base font-light leading-relaxed">
									{product.shortDescription || product.description || 'No description available'}
								</p>
								<div
									class="card-actions border-base-200 mt-6 items-center justify-between border-t pt-4"
								>
									<div class="text-primary text-4xl font-bold">
										${parseFloat(product.price).toFixed(2)}
									</div>
									<span
										class="btn btn-primary btn-sm font-semibold tracking-wide transition-transform group-hover:scale-110"
									>
										VIEW DETAILS
									</span>
								</div>
							</div>
						</a>
					{/each}
				{:else}
					<div class="col-span-3 space-y-6 py-20 text-center">
						<div class="text-8xl">🔍</div>
						<p class="text-base-content/70 text-2xl font-light">
							{#if data.searchQuery || data.selectedCategory}
								No products found matching your criteria
							{:else}
								No products available
							{/if}
						</p>
						{#if data.searchQuery || data.selectedCategory}
							<button
								class="btn btn-primary btn-lg font-semibold tracking-wide"
								onclick={() => goto('/products')}
							>
								CLEAR FILTERS
							</button>
						{/if}
					</div>
				{/if}
			</Grid>
		</div>
	</Container>
</Section>
