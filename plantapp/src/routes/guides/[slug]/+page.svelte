<script lang="ts">
	import GuideSector from '$lib/components/content/GuideSector.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { publicSiteUrl } from '$lib/config/site';
	import { articleBreadcrumbData, articleStructuredData } from '$lib/content/research';
	import { renderMarkdownBody } from '$lib/utils/renderMarkdown';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const sector = $derived(data.sector);
	const page = $derived(data.guide?.page);
	const title = $derived(sector ? sector.seoTitle : `${page?.title} — Aevani`);
	const description = $derived(
		sector?.description ||
			page?.metaDescription ||
			page?.excerpt ||
			'A growing note from Escherbridge.'
	);
	const url = $derived(sector?.canonical ?? publicSiteUrl(`/guides/${page?.slug}`));
</script>

<svelte:head>
	<SEO
		{title}
		{description}
		{url}
		type="article"
		author="Escherbridge"
		publishedTime={sector?.publishedAt ?? null}
		modifiedTime={sector?.reviewedAt ?? null}
	/>
</svelte:head>
{#if sector}
	<StructuredData type="article" data={articleStructuredData(sector)} />
	<StructuredData type="breadcrumb" data={articleBreadcrumbData(sector)} />
	<GuideSector guide={sector} />
{:else if page}
	<StructuredData
		type="article"
		data={{
			headline: page.title,
			description: page.metaDescription || page.excerpt || undefined,
			author: { '@type': 'Organization', name: 'Escherbridge' },
			publisher: { '@type': 'Organization', name: 'Escherbridge, LLC' },
			mainEntityOfPage: url
		}}
	/>
	<StructuredData
		type="breadcrumb"
		data={{
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: publicSiteUrl('/') },
				{ '@type': 'ListItem', position: 2, name: 'Guides', item: publicSiteUrl('/guides') },
				{ '@type': 'ListItem', position: 3, name: page.title, item: url }
			]
		}}
	/>
	<main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
		<nav class="mb-8 text-sm" aria-label="Breadcrumb">
			<a class="link" href="/guides">Growing Guides</a>
			<span aria-hidden="true"> / </span>
			<span aria-current="page">{page.title}</span>
		</nav>
		<article>
			<p class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Guide · Escherbridge</p>
			<h1 class="font-display mt-3 text-4xl font-bold tracking-tight uppercase md:text-6xl">
				{page.title}
			</h1>
			<p class="mt-5 text-xl leading-relaxed text-base-content/70">
				{page.excerpt ?? 'A practical growing guide from the Aevani editorial catalogue.'}
			</p>
			<div class="prose prose-lg mt-10 max-w-none">
				<!-- Legacy CMS markdown is rendered, then sanitized. Structured guides use GuideSector. -->
				{@html renderMarkdownBody(page.content)}
			</div>
		</article>
	</main>
{/if}
