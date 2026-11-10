<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { publicOperator } from '$lib/config/site';
</script>

<svelte:head>
	<title>Warranty | Aevani</title>
	<meta
		name="description"
		content="Aevani does not currently offer a site-wide warranty. Warranty terms, if any, are set by the seller and confirmed at checkout."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Warranty
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">Warranty</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Nothing is for sale yet, so there is no warranty to claim. When a real seller lists a
					product, any warranty on that listing is the warranty that applies. Aevani does not
					currently offer a site-wide warranty.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Set per seller</h2>
				<p class="mt-3 text-base-content/80">
					Warranty terms are set by the seller and confirmed at checkout. They are not offered
					site-wide today.
				</p>
			</section>

			<p class="text-base-content/70">
				Return eligibility and warranty coverage are separate. See the
				<a class="link link-primary" href="/returns">returns page</a>.
			</p>

			<p class="text-base-content/70">
				Questions about a warranty?
				<a class="link link-primary" href="mailto:{publicOperator.email}">{publicOperator.email}</a>
				or the <a class="link link-primary" href="/contact">contact page</a>.
			</p>
		</div>
	</Container>
</Section>
