<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Silvopasture</h1>
			<p class="text-lg text-base-content/70">
				Integrate trees, forage, and livestock for a sustainable, regenerative farming system that
				enhances biodiversity and productivity.
			</p>
		</div>

		<!-- Category Navigation -->
		<div class="flex flex-wrap gap-2 mb-8">
			<a href="/products/silvopasture?filter=seedlings" class="btn btn-sm btn-outline">
				Tree Seedlings
			</a>
			<a href="/products/silvopasture?filter=fencing" class="btn btn-sm btn-outline">
				Fencing Systems
			</a>
			<a href="/products/silvopasture?filter=watering" class="btn btn-sm btn-outline">
				Watering Solutions
			</a>
			<a href="/products/silvopasture?filter=management" class="btn btn-sm btn-outline">
				Pasture Management Tools
			</a>
			<a href="/products/silvopasture?filter=livestock" class="btn btn-sm btn-outline">
				Livestock Integration Products
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
								<a href="/products/silvopasture/{product.slug}" class="btn btn-primary">
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
