<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Checkout availability | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-6 py-10">
			<p class="font-mono text-xs font-semibold uppercase tracking-widest text-secondary">Commerce status</p>
			<h1 class="font-display text-4xl uppercase tracking-tight md:text-5xl">Checkout unavailable</h1>
			<p class="text-lg text-base-content/70">Aevani is not accepting payment or order submissions while the catalog, price, tax, fulfillment, and policy evidence is being verified.</p>
			<a href="/cart" class="btn btn-primary font-display uppercase tracking-wider">View cart status</a>
		</div>
	</Container>
</Section>
