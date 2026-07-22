<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	type ProductPreview = {
		image?: string | null;
		name: string;
		price: string;
		shortDescription?: string | null;
		slug: string;
	};

	// This route redirects before rendering; preserve an explicit empty preview shape for type safety.
	const products: ProductPreview[] = [];
</script>

<svelte:head>
	<title>Agroforestry - Aevani</title>
</svelte:head>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="mb-4 text-4xl font-bold">Agroforestry</h1>
			<p class="text-lg text-base-content/70">
				Cultivate diverse, productive ecosystems by integrating trees with crops and livestock for
				enhanced sustainability and yields.
			</p>
		</div>

		<!-- Category Navigation -->
		<div class="mb-8 flex flex-wrap gap-2">
			<a href="/products/agroforestry?filter=trees" class="btn btn-outline btn-sm">
				Tree Varieties
			</a>
			<a href="/products/agroforestry?filter=tools" class="btn btn-outline btn-sm">
				Planting Tools
			</a>
			<a href="/products/agroforestry?filter=soil" class="btn btn-outline btn-sm">
				Soil Amendments
			</a>
			<a href="/products/agroforestry?filter=equipment" class="btn btn-outline btn-sm">
				Maintenance Equipment
			</a>
			<a href="/products/agroforestry?filter=education" class="btn btn-outline btn-sm">
				Educational Materials
			</a>
		</div>

		<!-- Products Grid -->
		<Grid columns={3} gap={6}>
			{#if products.length > 0}
				{#each products as product}
					<div class="card bg-base-100 shadow-xl">
						<figure class="aspect-square">
							<img
								src={product.image || '/placeholder-product.jpg'}
								alt={product.name}
								class="h-full w-full object-cover"
							/>
						</figure>
						<div class="card-body">
							<h2 class="card-title">{product.name}</h2>
							<p class="text-sm text-base-content/70">{product.shortDescription}</p>
							<div class="mt-4 card-actions items-center justify-between">
								<span class="text-2xl font-bold">${product.price}</span>
								<a href="/products/agroforestry/{product.slug}" class="btn btn-primary">
									View Details
								</a>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="col-span-3 py-12 text-center">
					<p class="text-xl text-base-content/70">No products available at this time.</p>
				</div>
			{/if}
		</Grid>
	</Container>
</Section>
