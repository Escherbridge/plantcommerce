<script lang="ts">
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { publicSiteUrl } from '$lib/config/site';
	import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const page = $derived(data.post.page);
	const author = $derived(data.post.author);

	const authorName = $derived.by(() => {
		const name = [author?.firstName, author?.lastName].filter(Boolean).join(' ');
		return name || author?.username || '';
	});

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

<svelte:head>
	<title>{page.metaTitle || page.title} | Aevani</title>
	<meta name="description" content={page.metaDescription || page.excerpt || page.title} />
	<StructuredData
		type="article"
		data={{
			headline: page.title,
			description: page.metaDescription || page.excerpt || undefined,
			datePublished: publishedIso,
			author: authorName ? { '@type': 'Person', name: authorName } : undefined,
			mainEntityOfPage: publicSiteUrl(`/blog/${page.slug}`),
			keywords: tags.length > 0 ? tags.join(', ') : undefined
		}}
	/>
</svelte:head>

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
	</article>
</main>
