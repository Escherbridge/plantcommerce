<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Help status | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-6 py-10">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
				Support
			</p>
			<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">How to get help</h1>
			<p class="text-lg text-base-content/70">
				Looking for practical crop answers, seller onboarding terms, or technical help with a guide
				or listing? Reach us directly or jump straight to our growing library.
			</p>
			<div class="rounded-2xl border border-base-300 bg-base-200/50 p-6 text-base-content/80">
				Independent sellers set shipping, return, and warranty terms per listing, and our growing
				guides link straight to equipment categories and primary university extension references.
			</div>
			<div class="flex flex-wrap gap-3">
				<a href="/guides" class="font-display btn tracking-wider uppercase btn-primary"
					>Browse growing guides</a
				>
				<a href="/contact" class="font-display btn tracking-wider uppercase btn-outline"
					>Contact Escherbridge</a
				>
			</div>
		</div>
	</Container>
</Section>
