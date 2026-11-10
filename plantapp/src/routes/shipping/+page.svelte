<script lang="ts">
	import { Container, Section } from '$lib/components/layout';

	const listingNotes = [
		'free shipping · arrives in 3–5 days',
		'free shipping over $75 · arrives in 3–5 days',
		'free shipping · arrives in 5–8 days',
		'ships Mon–Wed · overnight for live goods'
	];
</script>

<svelte:head>
	<title>Shipping | Aevani</title>
	<meta
		name="description"
		content="Shipping notes shown on Aevani product listings, including free shipping on qualifying orders."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Shipping
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Shipping</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Every product page states free shipping on qualifying orders. The shipping note on a
					listing is the note for that product.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">On the product page</h2>
				<p class="mt-3 text-base-content/80">Free shipping. On qualifying orders.</p>
			</section>

			<section class="space-y-4">
				<h2 class="font-display text-2xl tracking-tight uppercase">Notes on current listings</h2>
				<ul class="list-disc space-y-2 pl-5 text-base-content/70">
					{#each listingNotes as note}
						<li>{note}</li>
					{/each}
				</ul>
			</section>

			<p class="text-base-content/70">
				Questions about shipping? <a class="link link-primary" href="/contact">Contact us</a>.
			</p>
		</div>
	</Container>
</Section>
