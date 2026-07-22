<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Returns availability | Aevani</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<Section>
	<Container>
		<div
			class="mx-auto max-w-3xl rounded-3xl border border-base-300 bg-base-200/40 p-8 text-center shadow-sm md:p-12"
		>
			<h1 class="font-display text-4xl font-bold tracking-tight uppercase">
				Returns policy unavailable
			</h1>
			<p class="mt-5 text-lg leading-relaxed text-base-content/70">
				Aevani is not currently publishing return windows, exchange eligibility, refunds,
				warranties, or return-shipping commitments. Please contact support before relying on a
				purchase, fulfillment, or return arrangement.
			</p>
			<a href="/support" class="btn mt-8 btn-primary">Contact support</a>
		</div>
	</Container>
</Section>
