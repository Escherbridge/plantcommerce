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
	<title>Silvopasture - Aevani</title>
</svelte:head>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="mb-4 text-4xl font-bold">Silvopasture</h1>
			<p class="text-lg text-base-content/70">
				Integrate trees, forage, and livestock for a sustainable, regenerative farming system that
				enhances biodiversity and productivity.
			</p>
		</div>

		<!-- Category Navigation -->
		<div class="mb-8 flex flex-wrap gap-2">
			<a href="/products/silvopasture?filter=seedlings" class="btn btn-outline btn-sm">
				Tree Seedlings
			</a>
			<a href="/products/silvopasture?filter=fencing" class="btn btn-outline btn-sm">
				Fencing Systems
			</a>
			<a href="/products/silvopasture?filter=watering" class="btn btn-outline btn-sm">
				Watering Solutions
			</a>
			<a href="/products/silvopasture?filter=management" class="btn btn-outline btn-sm">
				Pasture Management Tools
			</a>
			<a href="/products/silvopasture?filter=livestock" class="btn btn-outline btn-sm">
				Livestock Integration Products
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
								<a href="/products/silvopasture/{product.slug}" class="btn btn-primary">
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
