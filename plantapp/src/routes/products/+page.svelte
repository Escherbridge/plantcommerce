<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Select } from '$lib/components/ui';
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
		<div class="mb-12 flex flex-col gap-6 md:flex-row md:items-end">
			<!-- Search -->
			<div class="flex-1">
				<label class="text-base-content/40 font-display mb-2 block text-xs uppercase tracking-widest">
					Search
				</label>
				<div class="flex items-end gap-3">
					<div class="relative flex-1">
						<svg
							class="text-base-content/40 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<circle cx="11" cy="11" r="7" />
							<path stroke-linecap="round" d="M20 20l-3.5-3.5" />
						</svg>
						<input
							type="text"
							placeholder="Search products..."
							class="input input-bordered w-full pl-10 text-lg"
							bind:value={searchQuery}
							onkeypress={(e) => e.key === 'Enter' && handleSearch()}
						/>
					</div>
					<button
						class="btn btn-primary shrink-0 px-8 font-display text-sm uppercase tracking-wider"
						onclick={handleSearch}
					>
						Search
					</button>
				</div>
			</div>

			<!-- Category Filter -->
			<div class="md:w-72">
				<label class="text-base-content/40 font-display mb-2 block text-xs uppercase tracking-widest">
					Category
				</label>
				<Select
					options={[
						{ value: '', label: 'All Categories' },
						...data.categories.map(c => ({ value: c.id, label: c.name }))
					]}
					bind:value={selectedCategory}
					placeholder="All Categories"
					onchange={() => handleSearch()}
				/>
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
			<h2 class="mb-8 font-display text-3xl font-bold uppercase tracking-tight lg:text-4xl">
				{#if data.searchQuery}
					SEARCH RESULTS FOR "{data.searchQuery}"
				{:else if data.selectedCategory}
					FILTERED PRODUCTS
				{:else}
					ALL PRODUCTS
				{/if}
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#if data.products && data.products.length > 0}
					{#each data.products as product}
						<a
							href="/products/mock-detail"
							class="group flex flex-col overflow-hidden rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:scale-[1.02]"
						>
							<figure class="bg-base-200 relative h-56 overflow-hidden">
								{#if product.images && product.images.length > 0}
									<img
										src={product.images[0].url || '/placeholder.png'}
										alt={product.images[0].altText || product.name}
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<div class="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors duration-300 flex items-center justify-center">
										<span class="text-white font-display uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Quick View</span>
									</div>
								{:else}
									<div class="flex h-full items-center justify-center">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-12 h-12 text-base-content/20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
											<path d="M24 42c-3-1-5 1-8 0M24 42c3-1 5 1 8 0M24 42V20M24 30c-6-1-11-7-9-14 4 4 8 9 9 14zM24 24c6-1 11-7 9-14-4 4-8 9-9 14z" />
										</svg>
									</div>
								{/if}
							</figure>
							<div class="flex flex-1 flex-col p-6 space-y-3">
								<h3 class="font-display text-lg font-bold uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
									{product.name}
								</h3>
								<p class="text-base-content/60 line-clamp-2 text-sm font-light leading-relaxed flex-1">
									{product.shortDescription || product.description || 'No description available'}
								</p>
								<div class="flex items-center justify-between border-t border-base-200/50 pt-4 mt-auto">
									<div class="text-primary font-mono text-2xl font-bold">
										${parseFloat(product.price).toFixed(2)}
									</div>
									<span class="font-display text-xs uppercase tracking-widest text-primary font-semibold">
										VIEW DETAILS
									</span>
								</div>
							</div>
						</a>
					{/each}
				{:else}
					<div class="col-span-3 space-y-6 py-20 text-center">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-16 h-16 mx-auto text-base-content/20" fill="none" stroke="currentColor" stroke-width="1.5">
							<circle cx="20" cy="20" r="14" /><path d="M30 30l12 12" />
						</svg>
						<p class="text-base-content/70 text-2xl font-light">
							{#if data.searchQuery || data.selectedCategory}
								No products found matching your criteria
							{:else}
								No products available
							{/if}
						</p>
						{#if data.searchQuery || data.selectedCategory}
							<button
								class="btn btn-primary btn-lg rounded-none font-display uppercase tracking-wider"
								onclick={() => goto('/products')}
							>
								Clear Filters
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</Container>
</Section>
