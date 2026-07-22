<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Press status | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-6 py-10">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
				Press and media
			</p>
			<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
				Press materials unavailable
			</h1>
			<p class="text-lg text-base-content/70">
				Aevani does not currently publish press releases, customer or product statistics, coverage,
				awards, media assets, partner announcements, or newsletter subscriptions.
			</p>
			<div class="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-base-content/80">
				Public announcements will be published only with a reviewable source, publication date, and
				contact path. The previous placeholder entries are not factual statements.
			</div>
			<a href="/contact" class="font-display btn tracking-wider uppercase btn-primary"
				>Contact Aevani</a
			>
		</div>
	</Container>
</Section>
