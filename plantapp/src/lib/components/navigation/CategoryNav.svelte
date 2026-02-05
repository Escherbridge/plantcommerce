<script lang="ts">
	// Define props for Svelte 5
	const {
		showCounts = true,
		showIcons = true,
		compact = false
	} = $props<{
		showCounts?: boolean;
		showIcons?: boolean;
		compact?: boolean;
	}>();

	// Mock categories with counts (in real app, fetch from API)
	const categories = [
		{
			id: 'hydroponics',
			name: 'Hydroponics',
			slug: 'hydroponics',
			description: 'Soil-free growing systems',
			productCount: 42,
			icon: '💧',
			color: 'from-blue-50 to-blue-100'
		},
		{
			id: 'aquaponics',
			name: 'Aquaponics',
			slug: 'aquaponics',
			description: 'Fish & plant ecosystems',
			productCount: 28,
			icon: '🐟',
			color: 'from-teal-50 to-teal-100'
		},
		{
			id: 'silvopasture',
			name: 'Silvopasture',
			slug: 'silvopasture',
			description: 'Integrated tree-livestock systems',
			productCount: 18,
			icon: '🌳',
			color: 'from-green-50 to-green-100'
		},
		{
			id: 'agroforestry',
			name: 'Agroforestry',
			slug: 'agroforestry',
			description: 'Tree-based agricultural systems',
			productCount: 24,
			icon: '🌿',
			color: 'from-emerald-50 to-emerald-100'
		},
		{
			id: 'tools',
			name: 'Tools & Equipment',
			slug: 'tools',
			description: 'Gardening tools & supplies',
			productCount: 56,
			icon: '🛠️',
			color: 'from-gray-50 to-gray-100'
		},
		{
			id: 'seeds',
			name: 'Seeds & Plants',
			slug: 'seeds',
			description: 'Seeds, seedlings & plants',
			productCount: 89,
			icon: '🌱',
			color: 'from-lime-50 to-lime-100'
		}
	];
</script>

<nav class="category-navigation" aria-label="Product categories">
	{#if compact}
		<!-- Compact horizontal version -->
		<div class="flex flex-wrap gap-2">
			{#each categories as category}
				<a
					href="/products/{category.slug}"
					class="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
				>
					{#if showIcons}
						<span class="text-lg">{category.icon}</span>
					{/if}
					<span class="font-medium text-gray-700 group-hover:text-primary">
						{category.name}
					</span>
					{#if showCounts}
						<span class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 group-hover:bg-primary/10">
							{category.productCount}
						</span>
					{/if}
				</a>
			{/each}
		</div>
	{:else}
		<!-- Full featured grid version -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each categories as category}
				<a
					href="/products/{category.slug}"
					class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
				>
					<!-- Background gradient -->
					<div class="absolute inset-0 bg-gradient-to-br {category.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

					<div class="relative z-10">
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center gap-3">
								{#if showIcons}
									<div class="rounded-lg bg-white p-2 shadow-sm group-hover:shadow">
										<span class="text-2xl">{category.icon}</span>
									</div>
								{/if}
								<div>
									<h3 class="text-lg font-semibold text-gray-900 group-hover:text-gray-950">
										{category.name}
									</h3>
									<p class="text-sm text-gray-600 group-hover:text-gray-700">
										{category.description}
									</p>
								</div>
							</div>

							{#if showCounts}
								<div class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 group-hover:bg-primary/10 group-hover:text-primary">
									{category.productCount} products
								</div>
							{/if}
						</div>

						<div class="mt-4 flex justify-end">
							<span class="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
								Browse category
								<svg class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
								</svg>
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</nav>

<style>
	.category-navigation a {
		text-decoration: none;
	}
</style>
