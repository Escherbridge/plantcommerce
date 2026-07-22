<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Warranty Information | Aevani</title>
	<meta
		name="description"
		content="Understand the current status of warranty information for Aevani product listings."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Product information
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
					Warranty information
				</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Aevani does not currently publish a single site-wide warranty. Coverage, exclusions,
					duration, and claim steps may vary by product and manufacturer.
				</p>
			</header>

			<section class="rounded-2xl border border-warning/30 bg-warning/10 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">
					What this means before purchase
				</h2>
				<p class="mt-3 text-base-content/80">
					Only warranty terms supplied with an individual product listing, order documentation, or
					manufacturer documentation should be treated as a warranty commitment. This page is
					informational and is not a warranty agreement.
				</p>
			</section>

			<section class="grid gap-6 md:grid-cols-2">
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">
							Look for product-specific terms
						</h2>
						<ul class="list-disc space-y-2 pl-5 text-base-content/70">
							<li>Who provides the coverage</li>
							<li>How long coverage lasts</li>
							<li>What is covered and excluded</li>
							<li>How to start a claim</li>
						</ul>
					</div>
				</div>

				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">If no terms are listed</h2>
						<p class="text-base-content/70">
							Warranty coverage is not confirmed. Wait for product documentation or written terms
							before relying on coverage for a purchase decision.
						</p>
						<a class="link link-primary" href="/support">Review support guidance</a>
					</div>
				</div>
			</section>

			<p class="text-sm text-base-content/60">
				Return eligibility and warranty coverage are separate. See the <a
					class="link link-primary"
					href="/returns">returns page</a
				>
				for the current return information.
			</p>
		</div>
	</Container>
</Section>
