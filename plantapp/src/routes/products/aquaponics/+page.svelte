<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Aquaponics</h1>
			<p class="text-lg text-base-content/70">
				Discover aquaponic systems that combine fish farming with plant cultivation for a
				sustainable, symbiotic growing environment.
			</p>
		</div>

		<!-- Category Navigation -->
		<div class="flex flex-wrap gap-2 mb-8">
			<a href="/products/aquaponics?filter=tanks" class="btn btn-sm btn-outline">
				Fish Tanks & Systems
			</a>
			<a href="/products/aquaponics?filter=growbeds" class="btn btn-sm btn-outline">Grow Beds</a>
			<a href="/products/aquaponics?filter=pumps" class="btn btn-sm btn-outline">
				Pumps & Filters
			</a>
			<a href="/products/aquaponics?filter=fishcare" class="btn btn-sm btn-outline">
				Fish Food & Care
			</a>
			<a href="/products/aquaponics?filter=components" class="btn btn-sm btn-outline">
				System Components
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
								<a href="/products/aquaponics/{product.slug}" class="btn btn-primary">
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
