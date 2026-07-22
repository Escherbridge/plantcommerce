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

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<Section>
	<Container>
		<!-- Enhanced Header -->
		<div class="mb-12 space-y-4">
			<h1 class="text-5xl font-bold tracking-tight lg:text-7xl">CATALOG</h1>
			<div class="h-1 w-24 bg-primary"></div>
			<p class="max-w-3xl text-xl font-light text-base-content/60 lg:text-2xl">
				We publish products only after their supplier, offer, fulfillment, and claim evidence is
				verified.
			</p>
		</div>

		{#if data.catalogAvailability.status === 'unavailable'}
			<div
				class="rounded-3xl border border-base-300 bg-base-200/40 p-8 text-center shadow-sm md:p-12"
			>
				<h2 class="font-display text-3xl font-bold tracking-tight uppercase">
					Catalog verification in progress
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-base-content/70">
					{data.catalogAvailability.reason}
				</p>
				<a href="/support" class="btn mt-8 btn-primary">Contact support</a>
			</div>
		{:else}
			<!-- Enhanced Filters -->
			<div class="mb-12 flex flex-col gap-6 md:flex-row md:items-end">
				<!-- Search -->
				<div class="flex-1">
					<label
						for="catalog-search"
						class="font-display mb-2 block text-xs tracking-widest text-base-content/40 uppercase"
					>
						Search
					</label>
					<div class="flex items-end gap-3">
						<div class="relative flex-1">
							<svg
								class="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-base-content/40"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<circle cx="11" cy="11" r="7" />
								<path stroke-linecap="round" d="M20 20l-3.5-3.5" />
							</svg>
							<input
								id="catalog-search"
								type="text"
								placeholder="Search products..."
								class="input-bordered input w-full pl-10 text-lg"
								bind:value={searchQuery}
								onkeydown={(e) => e.key === 'Enter' && handleSearch()}
							/>
						</div>
						<button
							class="font-display btn shrink-0 px-8 text-sm tracking-wider uppercase btn-primary"
							onclick={handleSearch}
						>
							Search
						</button>
					</div>
				</div>

				<!-- Category Filter -->
				<div class="md:w-72">
					<label
						for="catalog-category"
						class="font-display mb-2 block text-xs tracking-widest text-base-content/40 uppercase"
					>
						Category
					</label>
					<Select
						id="catalog-category"
						options={[
							{ value: '', label: 'All Categories' },
							...data.categories.map((c) => ({ value: c.id, label: c.name }))
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
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
						</a>
					</div>
				</div>
			{/if}

			<!-- Enhanced Products Grid -->
			<div>
				<h2 class="font-display mb-8 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
					{#if data.searchQuery}
						SEARCH RESULTS FOR "{data.searchQuery}"
					{:else if data.selectedCategory}
						FILTERED PRODUCTS
					{:else}
						ALL PRODUCTS
					{/if}
				</h2>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#if data.products && data.products.length > 0}
						{#each data.products as product}
							<a
								href="/products/{product.categorySlug ||
									product.category?.slug ||
									'all'}/{product.slug}"
								class="group flex flex-col overflow-hidden rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 hover:shadow-xl"
							>
								<figure class="relative h-56 overflow-hidden bg-base-200">
									{#if product.images && product.images.length > 0}
										<img
											src={product.images[0].url || '/placeholder.png'}
											alt={product.images[0].altText || product.name}
											class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
										/>
										<div
											class="absolute inset-0 flex items-center justify-center bg-primary/0 transition-colors duration-300 group-hover:bg-primary/15"
										>
											<span
												class="font-display text-sm tracking-widest text-white uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100"
												>Quick View</span
											>
										</div>
									{:else}
										<div class="flex h-full items-center justify-center">
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
								</figure>
								<div class="flex flex-1 flex-col space-y-3 p-6">
									<h3
										class="font-display line-clamp-2 text-lg leading-tight font-bold tracking-tight uppercase transition-colors group-hover:text-primary"
									>
										{product.name}
									</h3>
									<p
										class="line-clamp-2 flex-1 text-sm leading-relaxed font-light text-base-content/60"
									>
										{product.shortDescription || product.description || 'No description available'}
									</p>
									<div
										class="mt-auto flex items-center justify-between border-t border-base-200/50 pt-4"
									>
										<div class="font-mono text-2xl font-bold text-primary">
											${parseFloat(product.price).toFixed(2)}
										</div>
										<span
											class="font-display text-xs font-semibold tracking-widest text-primary uppercase"
										>
											VIEW DETAILS
										</span>
									</div>
								</div>
							</a>
						{/each}
					{:else}
						<div class="col-span-3 space-y-6 py-20 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
								class="mx-auto h-16 w-16 text-base-content/20"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<circle cx="20" cy="20" r="14" /><path d="M30 30l12 12" />
							</svg>
							<p class="text-2xl font-light text-base-content/70">
								{#if data.searchQuery || data.selectedCategory}
									No products found matching your criteria
								{:else}
									No products available
								{/if}
							</p>
							{#if data.searchQuery || data.selectedCategory}
								<button
									class="font-display btn rounded-none tracking-wider uppercase btn-lg btn-primary"
									onclick={() => goto('/products')}
								>
									Clear Filters
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</Container>
</Section>
