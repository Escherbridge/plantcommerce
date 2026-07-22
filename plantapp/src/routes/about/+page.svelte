<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>About Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10 py-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					About Aevani
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
					Building verified growing resources
				</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Aevani is developing a commerce and education experience for sustainable growing. Public
					catalog, supplier, fulfillment, impact, partnership, and organization claims are being
					verified before publication.
				</p>
			</header>

			<section class="rounded-2xl border border-warning/30 bg-warning/10 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">Evidence before claims</h2>
				<p class="mt-3 text-base-content/80">
					Aevani does not currently publish customer counts, product counts, impact metrics,
					certifications, awards, partner relationships, team biographies, or company-history
					milestones as verified facts.
				</p>
			</section>

			<div class="flex flex-wrap gap-3">
				<a href="/learn" class="font-display btn tracking-wider uppercase btn-primary"
					>Explore learning</a
				>
				<a href="/support" class="font-display btn tracking-wider uppercase btn-outline"
					>Contact support</a
				>
			</div>
		</div>
	</Container>
</Section>
