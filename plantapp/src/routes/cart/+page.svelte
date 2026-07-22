<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Cart availability | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-6 py-10">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
				Commerce status
			</p>
			<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Cart unavailable</h1>
			<p class="text-lg text-base-content/70">
				Aevani is not accepting cart additions or checkout while supplier, offer, fulfillment, and
				claim evidence is being verified.
			</p>
			<div class="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-base-content/80">
				Do not rely on a prior cart, displayed item, price, shipping estimate, payment method,
				return promise, or checkout link as a current commercial offer.
			</div>
			<div class="flex flex-wrap gap-3">
				<a href="/products" class="font-display btn tracking-wider uppercase btn-primary"
					>View catalog status</a
				>
				<a href="/support" class="font-display btn tracking-wider uppercase btn-outline"
					>Contact support</a
				>
			</div>
		</div>
	</Container>
</Section>
