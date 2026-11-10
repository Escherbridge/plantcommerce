<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { publicSiteUrl } from '$lib/config/site';
	import { relatedEssays } from '$lib/content/writing';
	import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const page = $derived(data.post.page);
	const authorName = 'Escherbridge';
	const related = $derived(relatedEssays(page.slug));
	const description = $derived(page.metaDescription || page.excerpt || page.title);

	const publishedIso = $derived.by(() => {
		if (!page.publishedAt) return undefined;
		const date = new Date(page.publishedAt);
		return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
	});

	const tags = $derived.by(() => {
		if (!page.tags) return [];
		try {
			const parsed = JSON.parse(page.tags);
			return Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === 'string') : [];
		} catch {
			return [];
		}
	});
</script>

<SEO
	title={`${page.title} — Aevani`}
	{description}
	url={publicSiteUrl(`/blog/${page.slug}`)}
	type="article"
	publishedTime={publishedIso}
	author={authorName}
	{tags}
/>
<StructuredData
	type="article"
	data={{
		headline: page.title,
		description,
		datePublished: publishedIso,
		author: { '@type': 'Organization', name: 'Escherbridge' },
		publisher: { '@type': 'Organization', name: 'Escherbridge, LLC' },
		mainEntityOfPage: publicSiteUrl(`/blog/${page.slug}`)
	}}
/>
<StructuredData
	type="breadcrumb"
	data={{
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: publicSiteUrl('/') },
			{ '@type': 'ListItem', position: 2, name: 'Field notes', item: publicSiteUrl('/blog') },
			{
				'@type': 'ListItem',
				position: 3,
				name: page.title,
				item: publicSiteUrl(`/blog/${page.slug}`)
			}
		]
	}}
/>

<main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
	<nav class="mb-8 text-sm" aria-label="Breadcrumb">
		<a class="link" href="/blog">Field notes</a>
		<span aria-hidden="true"> / </span>
		<span aria-current="page">{page.title}</span>
	</nav>
	<article>
		<p class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Field note</p>
		<h1 class="font-display mt-3 text-4xl font-bold tracking-tight uppercase md:text-6xl">
			{page.title}
		</h1>
		{#if page.excerpt}
			<p class="mt-5 text-xl leading-relaxed text-base-content/70">{page.excerpt}</p>
		{/if}
		{#if authorName || publishedIso}
			<p class="mt-4 font-mono text-xs tracking-wider text-base-content/50 uppercase">
				{#if authorName}{authorName}{/if}
				{#if authorName && publishedIso}
					<span aria-hidden="true"> · </span>
				{/if}
				{#if publishedIso}
					<time datetime={publishedIso}>
						{new Date(publishedIso).toLocaleDateString(undefined, {
							month: 'long',
							day: 'numeric',
							year: 'numeric',
							timeZone: 'UTC'
						})}
					</time>
				{/if}
			</p>
		{/if}
		<div class="prose prose-lg mt-10 max-w-none whitespace-pre-wrap">
			{@html sanitizeRichText(page.content)}
		</div>
		{#if data.post.sources.length > 0}
			<section class="mt-12">
				<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Sources</h2>
				<ul class="mt-4 list-disc space-y-2 pl-5">
					{#each data.post.sources as source}
						<li>
							<a class="link" href={source.href}>{source.label}</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
		{#if related.length > 0}
			<section class="mt-12">
				<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Related</h2>
				<ul class="mt-4 space-y-2">
					{#each related as essay}
						<li>
							<a class="link link-primary" href="/blog/{essay.slug}">{essay.title}</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
		<p class="mt-12 text-sm">
			<a class="link link-primary" href="/feed.xml">RSS</a>
			·
			<a class="link link-primary" href="/contact">Contact</a>
		</p>
	</article>
</main>
