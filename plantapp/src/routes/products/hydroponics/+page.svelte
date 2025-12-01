<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Hydroponics</h1>
			<p class="text-lg text-base-content/70">
				Explore our comprehensive selection of hydroponic growing systems, nutrients, lighting
				solutions, and accessories for soil-free cultivation.
			</p>
		</div>

		<!-- Category Navigation -->
		<div class="flex flex-wrap gap-2 mb-8">
			<a href="/products/hydroponics?filter=systems" class="btn btn-sm btn-outline">
				Growing Systems
			</a>
			<a href="/products/hydroponics?filter=nutrients" class="btn btn-sm btn-outline">
				Nutrients & Supplements
			</a>
			<a href="/products/hydroponics?filter=lighting" class="btn btn-sm btn-outline">
				Lighting Solutions
			</a>
			<a href="/products/hydroponics?filter=media" class="btn btn-sm btn-outline">
				Growing Media
			</a>
			<a href="/products/hydroponics?filter=tools" class="btn btn-sm btn-outline">
				Tools & Accessories
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
								<a href="/products/hydroponics/{product.slug}" class="btn btn-primary">
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
