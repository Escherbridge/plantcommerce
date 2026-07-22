<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Shipping availability | Aevani</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<Section>
	<Container>
		<div
			class="mx-auto max-w-3xl rounded-3xl border border-base-300 bg-base-200/40 p-8 text-center shadow-sm md:p-12"
		>
			<h1 class="font-display text-4xl font-bold tracking-tight uppercase">
				Shipping policy unavailable
			</h1>
			<p class="mt-5 text-lg leading-relaxed text-base-content/70">
				Aevani is not currently publishing shipping methods, prices, delivery estimates,
				destinations, or order tracking terms. Those details will appear only after a reviewed
				fulfillment policy is in place.
			</p>
			<a href="/support" class="btn mt-8 btn-primary">Contact support</a>
		</div>
	</Container>
</Section>
