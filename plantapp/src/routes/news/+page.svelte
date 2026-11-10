<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { publicSiteUrl } from '$lib/config/site';
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-6 py-10">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">News</p>
			<h1 class="font-display text-4xl tracking-tight">Nothing to announce yet.</h1>
			<p class="text-lg text-base-content/70">
				News is for things that have already happened and are public. There is no announcement
				today. Field notes are separate, and the press page is not a newsroom.
			</p>
			<p>
				<a class="link link-primary" href="/blog">Read the field notes</a>
				·
				<a class="link link-primary" href="/feed.xml">RSS</a>
			</p>
		</div>
	</Container>
</Section>

<StructuredData
	type="collection"
	data={{
		name: 'News — Aevani',
		url: publicSiteUrl('/news'),
		description: 'No public announcements yet.'
	}}
/>
<StructuredData
	type="breadcrumb"
	data={{
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: publicSiteUrl('/') },
			{ '@type': 'ListItem', position: 2, name: 'News', item: publicSiteUrl('/news') }
		]
	}}
/>
