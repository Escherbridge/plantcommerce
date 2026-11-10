<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { publicSiteUrl } from '$lib/config/site';
	import { fieldNoteTopics } from '$lib/content/writing';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const posts = $derived(data.posts ?? []);
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl">
			<h1 class="font-display text-4xl tracking-tight">Field notes</h1>
			<p class="mt-4 text-lg text-base-content/70">
				Dated writing from Escherbridge on growing, selling, and the fee. The catalogue is still a
				preview, and checkout is off.
			</p>
			<p class="mt-4 text-sm">
				<a class="link link-primary" href="/feed.xml">RSS</a>
				·
				<a class="link link-primary" href="/guides">Guides</a>
				·
				<a class="link link-primary" href="/news">News</a>
			</p>
			<ul class="mt-6 flex flex-wrap gap-2" aria-label="Topics">
				{#each fieldNoteTopics as topic}
					<li class="border border-base-300 px-2 py-1 font-mono text-xs tracking-wide uppercase">
						{topic}
					</li>
				{/each}
			</ul>
		</div>

		<div class="mx-auto mt-12 max-w-3xl space-y-8">
			{#if posts.length > 0}
				{#each posts as post}
					<article>
						<p class="font-mono text-xs text-base-content/60">
							{post.publishedAt
								? new Date(post.publishedAt).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										timeZone: 'UTC'
									})
								: 'Date unavailable'}
							· Escherbridge
						</p>
						<h2 class="font-display mt-2 text-2xl">
							<a href="/blog/{post.slug}" class="link link-hover">{post.title}</a>
						</h2>
						<p class="mt-2 text-base-content/70">
							{post.excerpt ?? 'No summary is available yet.'}
						</p>
					</article>
				{/each}
			{:else}
				<p class="text-lg text-base-content/70">No field notes yet.</p>
			{/if}
		</div>
	</Container>
</Section>

<StructuredData
	type="collection"
	data={{
		name: 'Field notes — Aevani',
		url: publicSiteUrl('/blog'),
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: posts.map((post, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: post.title,
				url: publicSiteUrl(`/blog/${post.slug}`)
			}))
		}
	}}
/>
<StructuredData
	type="breadcrumb"
	data={{
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: publicSiteUrl('/') },
			{ '@type': 'ListItem', position: 2, name: 'Field notes', item: publicSiteUrl('/blog') }
		]
	}}
/>
