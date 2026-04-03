<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('all');

	const products = $derived(data.products || []);

	const categories = $derived(() => {
		const cats = new Set<string>();
		products.forEach((p: any) => {
			if (p.category?.name) cats.add(p.category.name);
		});
		return Array.from(cats);
	});

	const filteredProducts = $derived(() => {
		let filtered = products;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p: any) =>
					p.name?.toLowerCase().includes(q) ||
					p.sku?.toLowerCase().includes(q)
			);
		}
		if (selectedCategory !== 'all') {
			filtered = filtered.filter((p: any) => p.category?.name === selectedCategory);
		}
		return filtered;
	});

	function getStockBadgeClass(qty: number): string {
		if (qty === 0) return 'platform-badge platform-badge--error';
		if (qty <= 10) return 'platform-badge platform-badge--warning';
		return 'platform-badge platform-badge--success';
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">Products</h1>
				<p class="platform-header__subtitle">Manage your product catalog</p>
			</div>
			<a href="/admin/products/new" class="platform-action-btn admin-header-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 5v14M5 12h14"/>
				</svg>
				Add Product
			</a>
		</div>
	</div>

	<!-- Filters -->
	<div class="admin-filters">
		<input
			type="text"
			placeholder="Search products..."
			class="admin-search-input"
			bind:value={searchQuery}
		/>
		<select class="admin-filter-select" bind:value={selectedCategory}>
			<option value="all">All Categories</option>
			{#each categories() as cat}
				<option value={cat}>{cat}</option>
			{/each}
		</select>
	</div>

	{#if filteredProducts().length > 0}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Image</th>
						<th>Name</th>
						<th>SKU</th>
						<th>Price</th>
						<th>Stock</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredProducts() as product}
						<tr>
							<td>
								<div class="admin-product-thumb">
									<img
										src={product.image || '/placeholder.jpg'}
										alt={product.name}
										class="admin-thumb-img"
									/>
								</div>
							</td>
							<td class="font-semibold">{product.name}</td>
							<td class="font-mono" style="font-size: 0.75rem">{product.sku}</td>
							<td>${product.price}</td>
							<td>
								<span class={getStockBadgeClass(product.stockQuantity)}>
									{product.stockQuantity}
								</span>
							</td>
							<td>
								<span class="platform-badge {product.isActive ? 'platform-badge--success' : 'platform-badge--ghost'}">
									{product.isActive ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td>
								<div class="admin-action-group">
									<a href="/admin/products/{product.id}" class="platform-action-btn admin-table-btn">
										Edit
									</a>
									<button class="platform-action-btn admin-table-btn">
										{product.isActive ? 'Deactivate' : 'Activate'}
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="platform-empty">
			<p class="platform-empty__title">No Products Found</p>
			<p class="platform-empty__text">
				{searchQuery || selectedCategory !== 'all'
					? 'Try adjusting your search or filter criteria.'
					: 'Add your first product to get started.'}
			</p>
		</div>
	{/if}
</div>

<style>
	.admin-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-header-btn {
		width: auto;
		white-space: nowrap;
	}

	.admin-filters {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.admin-search-input {
		flex: 1;
		min-width: 200px;
		padding: 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
		transition: border-color 150ms ease;
	}

	.admin-search-input:focus {
		outline: none;
		border-color: oklch(var(--p));
		box-shadow: var(--shadow-glow-focus);
	}

	.admin-search-input::placeholder {
		color: oklch(var(--bc) / 0.4);
	}

	.admin-filter-select {
		padding: 0.625rem 2rem 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
		cursor: pointer;
		appearance: auto;
	}

	.admin-product-thumb {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid var(--input-border);
	}

	.admin-thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.admin-action-group {
		display: flex;
		gap: 0.5rem;
	}

	.admin-table-btn {
		width: auto;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}
</style>
