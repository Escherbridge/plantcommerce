<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Agroforestry</h1>
			<p class="text-lg text-base-content/70">
				Cultivate diverse, productive ecosystems by integrating trees with crops and livestock for
				enhanced sustainability and yields.
			</p>
		</div>

		<!-- Category Navigation -->
		<div class="flex flex-wrap gap-2 mb-8">
			<a href="/products/agroforestry?filter=trees" class="btn btn-sm btn-outline">
				Tree Varieties
			</a>
			<a href="/products/agroforestry?filter=tools" class="btn btn-sm btn-outline">
				Planting Tools
			</a>
			<a href="/products/agroforestry?filter=soil" class="btn btn-sm btn-outline">
				Soil Amendments
			</a>
			<a href="/products/agroforestry?filter=equipment" class="btn btn-sm btn-outline">
				Maintenance Equipment
			</a>
			<a href="/products/agroforestry?filter=education" class="btn btn-sm btn-outline">
				Educational Materials
			</a>
		</div>

		<!-- Products Grid -->
		<Grid columns={3} gap={6}>
			{#if data.products && data.products.length > 0}
				{#each data.products as product}
					<div class="card bg-base-100 shadow-xl">
						<figure class="aspect-square">
							<img
								src={product.image || '/placeholder-product.jpg'}
								alt={product.name}
								class="object-cover w-full h-full"
							/>
						</figure>
						<div class="card-body">
							<h2 class="card-title">{product.name}</h2>
							<p class="text-sm text-base-content/70">{product.shortDescription}</p>
							<div class="card-actions justify-between items-center mt-4">
								<span class="text-2xl font-bold">${product.price}</span>
								<a href="/products/agroforestry/{product.slug}" class="btn btn-primary">
									View Details
								</a>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="col-span-3 text-center py-12">
					<p class="text-xl text-base-content/70">No products available at this time.</p>
				</div>
			{/if}
		</Grid>
	</Container>
</Section>
