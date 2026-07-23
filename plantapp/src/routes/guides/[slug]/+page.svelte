<script lang="ts">
	import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const page = data.guide.page;
</script>

<svelte:head>
	<title>{page.title} | Aevani Guides</title>
	<meta name="description" content={page.excerpt ?? 'Aevani growing guide'} />
</svelte:head>

<main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
	<nav class="mb-8 text-sm" aria-label="Breadcrumb">
		<a class="link" href="/guides">Growing Guides</a>
		<span aria-hidden="true"> / </span>
		<span aria-current="page">{page.title}</span>
	</nav>
	<article>
		<p class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Guide</p>
		<h1 class="font-display mt-3 text-4xl font-bold tracking-tight uppercase md:text-6xl">
			{page.title}
		</h1>
		<p class="mt-5 text-xl leading-relaxed text-base-content/70">
			{page.excerpt ?? 'A practical growing guide from the Aevani editorial catalogue.'}
		</p>
		<div class="prose prose-lg mt-10 max-w-none">
			{@html sanitizeRichText(page.content)}
		</div>
	</article>
</main>
