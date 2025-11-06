<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">Product Management</h1>
			<p class="text-base-content/70">Manage your product catalog</p>
		</div>
		<a href="/admin/products/new" class="btn btn-primary">+ Add Product</a>
	</div>

	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex gap-4 mb-4">
				<input type="text" placeholder="Search products..." class="input input-bordered flex-1" />
				<select class="select select-bordered">
					<option>All Categories</option>
					<option>Hydroponics</option>
					<option>Aquaponics</option>
					<option>Silvopasture</option>
					<option>Agroforestry</option>
				</select>
			</div>

			{#if data.products && data.products.length > 0}
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Product</th>
								<th>SKU</th>
								<th>Category</th>
								<th>Price</th>
								<th>Stock</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.products as product}
								<tr>
									<td>
										<div class="flex items-center gap-3">
											<div class="avatar">
												<div class="w-12 h-12 rounded">
													<img src={product.image || '/placeholder.jpg'} alt={product.name} />
												</div>
											</div>
											<div class="font-semibold">{product.name}</div>
										</div>
									</td>
									<td class="font-mono text-sm">{product.sku}</td>
									<td>{product.category?.name}</td>
									<td>${product.price}</td>
									<td>
										<span class="badge {product.stockQuantity < 10 ? 'badge-warning' : 'badge-success'}">
											{product.stockQuantity}
										</span>
									</td>
									<td>
										<span class="badge {product.isActive ? 'badge-success' : 'badge-ghost'}">
											{product.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td>
										<div class="flex gap-2">
											<a href="/admin/products/{product.id}" class="btn btn-xs btn-outline">Edit</a>
											<button class="btn btn-xs btn-error btn-outline">Delete</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-center py-8 text-base-content/70">No products found</p>
			{/if}
		</div>
	</div>
</div>
