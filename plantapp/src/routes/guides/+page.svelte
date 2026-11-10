<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { publicSiteUrl } from '$lib/config/site';
	import { guideSectors, relatedGuideNotes } from '$lib/content/writing';
</script>

<Section>
	<Container>
		<div class="mb-10 max-w-3xl">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
				Five sectors · no pages yet
			</p>
			<h1 class="font-display mt-3 text-4xl tracking-tight">Same climate. No invented figures.</h1>
			<p class="mt-4 text-lg text-base-content/70">
				This is the research shelf for growing systems and climate. Figures will belong to other
				people, with the links left on. None of the sector pages are written yet, so they are not
				linked. The catalogue is a preview and nothing in it is for sale.
			</p>
		</div>

		<div class="mb-10 max-w-3xl">
			<h2 class="font-display text-2xl">Shared questions, not scored</h2>
			<p class="mt-2 text-base-content/70">
				Water, labor, and climate show up in every sector. This index does not print a figure until
				a child page cites it.
			</p>
			<ul class="mt-4 list-disc space-y-2 pl-5">
				<li>How much of the water is reused, and who measured it?</li>
				<li>Where does the daily labor actually sit?</li>
				<li>What does a cold, dry season do to the system?</li>
			</ul>
		</div>

		<div class="mb-10 max-w-3xl">
			<h2 class="font-display text-2xl">Sectors</h2>
			<ul class="mt-4 space-y-2">
				{#each guideSectors as sector}
					<li>
						<span class="font-medium">{sector.name}</span>
						<span class="text-base-content/60"> — not written yet.</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="mb-10 max-w-3xl">
			<h2 class="font-display text-2xl">Related writing</h2>
			<p class="mt-2 text-base-content/70">
				These notes are not sector cards. They are the guides that already exist.
			</p>
			<ul class="mt-4 space-y-2">
				{#each relatedGuideNotes as note}
					<li><a class="link link-primary" href={note.href}>{note.title}</a></li>
				{/each}
			</ul>
		</div>

		<div class="max-w-3xl">
			<h2 class="font-display text-2xl">The shop</h2>
			<p class="mt-2 text-base-content/70">
				The catalogue is a preview. Nothing in it is for sale. Sellers can apply now.
			</p>
			<p class="mt-4 text-sm">
				<a class="link link-primary" href="/products">Catalogue preview</a>
				·
				<a class="link link-primary" href="/sell">Sell on Aevani</a>
				·
				<a class="link link-primary" href="/blog">Field notes</a>
				·
				<a class="link link-primary" href="/news">News</a>
				·
				<a class="link link-primary" href="/feed.xml">RSS</a>
			</p>
		</div>
	</Container>
</Section>

<StructuredData
	type="collection"
	data={{
		name: 'Guides — Aevani',
		url: publicSiteUrl('/guides'),
		description: 'Research sectors are named. Their pages are not written yet.'
	}}
/>
<StructuredData
	type="breadcrumb"
	data={{
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: publicSiteUrl('/') },
			{ '@type': 'ListItem', position: 2, name: 'Guides', item: publicSiteUrl('/guides') }
		]
	}}
/>
