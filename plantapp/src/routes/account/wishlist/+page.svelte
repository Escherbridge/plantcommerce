<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Wishlist availability | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-6 py-10">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
				Saved items
			</p>
			<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
				Wishlist unavailable
			</h1>
			<p class="text-lg text-base-content/70">
				Wishlist storage is not enabled yet. Browse the current catalogue without treating this page
				as a saved-product record.
			</p>
			<div class="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-base-content/80">
				No products are stored or displayed here, and this page does not create a wishlist record.
			</div>
			<a href="/products" class="font-display btn tracking-wider uppercase btn-primary"
				>Browse catalogue</a
			>
		</div>
	</Container>
</Section>
