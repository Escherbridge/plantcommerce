<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { publicOperator } from '$lib/config/site';
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Shipping
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">Shipping</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Independent seed houses, nurseries, and equipment makers ship directly from their own
					benches and workshops. Because live plants, dry seed packets, and heavy hardware ship
					differently, shipping rates, carriers, and handling terms are set per seller on every
					listing and confirmed at checkout.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Set per seller</h2>
				<p class="mt-3 text-base-content/80">
					Each seller sets clear shipping windows and rates directly on their product listings
					rather than squeezing specialty tools into a one-size-fits-all site policy.
				</p>
			</section>

			<p class="text-base-content/70">
				Questions about shipping?
				<a class="link link-primary" href="mailto:{publicOperator.email}">{publicOperator.email}</a>
				or the <a class="link link-primary" href="/contact">contact page</a>.
			</p>
		</div>
	</Container>
</Section>
