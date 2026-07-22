<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Size & Fit Guide | Aevani</title>
	<meta
		name="description"
		content="Understand how to evaluate dimensions, compatibility, and included components for Aevani products."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Buying guidance
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Size & fit guide</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Aevani does not currently publish a universal size chart. Dimensions, capacity,
					compatibility, and included parts must come from the individual product listing or its
					documentation.
				</p>
			</header>

			<section class="grid gap-6 md:grid-cols-3">
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">Measure your space</h2>
						<p class="text-base-content/70">
							Compare the listed width, depth, height, and clearance requirements with the intended
							installation area.
						</p>
					</div>
				</div>

				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">Confirm compatibility</h2>
						<p class="text-base-content/70">
							Review the listing for required power, water, mounting, accessory, and environmental
							specifications.
						</p>
					</div>
				</div>

				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">Check what is included</h2>
						<p class="text-base-content/70">
							Do not assume accessories, growing media, plants, tools, or installation services are
							included unless they are listed.
						</p>
					</div>
				</div>
			</section>

			<section class="rounded-2xl border border-warning/30 bg-warning/10 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">
					When specifications are missing
				</h2>
				<p class="mt-3 text-base-content/80">
					If a product listing does not provide the measurement or compatibility detail you need, it
					is not yet ready for a fit recommendation. Do not rely on images, category labels, or
					general guidance as a substitute for product documentation.
				</p>
				<div class="mt-5 flex flex-wrap gap-4">
					<a class="btn btn-primary" href="/products">Browse product listings</a>
					<a class="btn btn-outline" href="/support">View support guidance</a>
				</div>
			</section>
		</div>
	</Container>
</Section>
