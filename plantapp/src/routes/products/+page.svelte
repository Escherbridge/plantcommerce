<script lang="ts">
	import { Container, Section, Grid } from '$lib/components/layout';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let searchQuery = data.searchQuery || '';
	let selectedCategory = data.selectedCategory || '';

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
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-2">All Products</h1>
			<p class="text-lg text-base-content/70">
				Browse our complete selection of sustainable agriculture products
			</p>
		</div>

		<!-- Filters -->
		<div class="mb-8 flex flex-col md:flex-row gap-4">
			<!-- Search -->
			<div class="flex-1">
				<div class="join w-full">
					<input
						type="text"
						placeholder="Search products..."
						class="input input-bordered join-item w-full"
						bind:value={searchQuery}
						on:keypress={(e) => e.key === 'Enter' && handleSearch()}
					/>
					<button class="btn btn-primary join-item" on:click={handleSearch}>Search</button>
				</div>
			</div>

			<!-- Category Filter -->
			<div class="md:w-64">
				<select
					class="select select-bordered w-full"
					bind:value={selectedCategory}
					on:change={handleSearch}
				>
					<option value="">All Categories</option>
					{#each data.categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Category Cards -->
		{#if !data.selectedCategory && !data.searchQuery}
			<div class="mb-12">
				<h2 class="text-2xl font-bold mb-6">Shop by Category</h2>
				<Grid columns={4} gap={6}>
					{#each data.categories as category}
						<a href="/products/{category.slug}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
							<div class="card-body">
								<h3 class="card-title">{category.name}</h3>
								<p class="text-sm text-base-content/70">{category.description || 'Explore our selection'}</p>
								<div class="card-actions justify-end">
									<button class="btn btn-primary btn-sm">Browse</button>
								</div>
							</div>
						</a>
					{/each}
				</Grid>
			</div>
		{/if}

		<!-- Products Grid -->
		<div>
			<h2 class="text-2xl font-bold mb-6">
				{#if data.searchQuery}
					Search Results for "{data.searchQuery}"
				{:else if data.selectedCategory}
					Filtered Products
				{:else}
					All Products
				{/if}
			</h2>

			<Grid columns={3} gap={6}>
				{#if data.products && data.products.length > 0}
					{#each data.products as product}
						<a href="/products/{product.category?.slug || 'uncategorized'}/{product.slug}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
							<figure class="h-48 bg-base-200">
								{#if product.images && product.images.length > 0}
									<img
										src={product.images[0].url || '/placeholder.png'}
										alt={product.images[0].altText || product.name}
										class="w-full h-full object-cover"
									/>
								{:else}
									<div class="flex items-center justify-center h-full">
										<span class="text-4xl">🌱</span>
									</div>
								{/if}
							</figure>
							<div class="card-body">
								<h3 class="card-title text-lg">{product.name}</h3>
								<p class="text-sm text-base-content/70 line-clamp-2">
									{product.description || 'No description available'}
								</p>
								<div class="card-actions justify-between items-center mt-4">
									<div class="text-2xl font-bold text-primary">
										${parseFloat(product.price).toFixed(2)}
									</div>
									<button class="btn btn-primary btn-sm">View Details</button>
								</div>
							</div>
						</a>
					{/each}
				{:else}
					<div class="col-span-3 text-center py-12">
						<div class="text-6xl mb-4">🔍</div>
						<p class="text-xl text-base-content/70">
							{#if data.searchQuery || data.selectedCategory}
								No products found matching your criteria
							{:else}
								No products available
							{/if}
						</p>
						{#if data.searchQuery || data.selectedCategory}
							<button class="btn btn-primary mt-4" on:click={() => goto('/products')}>
								Clear Filters
							</button>
						{/if}
					</div>
				{/if}
			</Grid>
		</div>
	</Container>
</Section>
