<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { publicOperator } from '$lib/config/site';
	import { prelaunchSellerTerms } from '$lib/content/prelaunchPolicy';
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<p class="max-w-3xl text-lg text-base-content/70">{prelaunchSellerTerms}</p>
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Returns
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">Returns</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					When sellers join, return terms will depend on the item. Each seller will write those
					terms on the listing.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Set per seller</h2>
				<p class="mt-3 text-base-content/80">
					Return terms will be shown on each listing when sellers join, rather than as one rule for
					every item.
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
