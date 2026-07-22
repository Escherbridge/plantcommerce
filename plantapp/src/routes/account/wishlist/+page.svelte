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
				Catalog status
			</p>
			<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
				Wishlist unavailable
			</h1>
			<p class="text-lg text-base-content/70">
				Saved product details, prices, and stock status are unavailable while Aevani verifies the
				catalog and fulfillment evidence.
			</p>
			<div class="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-base-content/80">
				Existing saved items are not displayed as current offers and cannot be added to a cart until
				catalog publication resumes.
			</div>
			<a href="/products" class="font-display btn tracking-wider uppercase btn-primary"
				>View catalog status</a
			>
		</div>
	</Container>
</Section>
