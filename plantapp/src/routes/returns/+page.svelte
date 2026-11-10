<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { publicOperator } from '$lib/config/site';
</script>

<svelte:head>
	<title>Returns | Aevani</title>
	<meta
		name="description"
		content="Nothing is for sale yet, so there is nothing to return. Return terms will be set by the seller and confirmed at checkout."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Returns
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">Returns</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Nothing is for sale yet, so there is nothing to return. When a real seller lists a
					product, the return terms on that listing are the terms that apply. Aevani does not
					currently offer a site-wide 30-day return.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Set per seller</h2>
				<p class="mt-3 text-base-content/80">
					Return terms are set by the seller and confirmed at checkout. They are not offered
					site-wide today.
				</p>
			</section>

			<p class="text-base-content/70">
				Warranty coverage, when a seller offers it, is separate. See the
				<a class="link link-primary" href="/warranty">warranty page</a>.
			</p>

			<p class="text-base-content/70">
				Questions about returns?
				<a class="link link-primary" href="mailto:{publicOperator.email}">{publicOperator.email}</a>
				or the <a class="link link-primary" href="/contact">contact page</a>.
			</p>
		</div>
	</Container>
</Section>
