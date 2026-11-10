<script lang="ts">
	import type { GuideDocument } from '$lib/content/research';
	import GuideCopy from './GuideCopy.svelte';

	let { guide }: { guide: GuideDocument } = $props();
</script>

<main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
	<nav class="mb-8 text-sm" aria-label="Breadcrumb">
		<a class="link" href="/guides">Guides</a>
		<span aria-hidden="true"> / </span>
		<span aria-current="page">{guide.breadcrumb}</span>
	</nav>
	<article class="max-w-3xl">
		<GuideCopy blocks={guide.blocks} />
	</article>
</main>
