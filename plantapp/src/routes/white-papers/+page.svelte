<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { formatAbsoluteDate } from '$lib/utils/relativeTime';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const papers = $derived(data.papers ?? []);
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
				Library
			</p>
			<h1 class="font-display mt-3 text-4xl tracking-tight md:text-5xl">White papers</h1>
			<p class="mt-4 text-lg text-base-content/75">
				Published Aevani white papers. Each paper has a short summary and a PDF file.
			</p>
		</div>

		<div class="mx-auto mt-12 max-w-3xl space-y-8">
			{#if papers.length > 0}
				{#each papers as paper (paper.slug)}
					<article>
						<p class="font-mono text-xs text-base-content/60">
							<time datetime={paper.publishedAt}>{formatAbsoluteDate(paper.publishedAt)}</time>
						</p>
						<h2 class="font-display mt-2 text-2xl">
							<a class="link link-hover" href="/white-papers/{paper.slug}">{paper.title}</a>
						</h2>
						<p class="mt-2 text-base-content/70">{paper.summary}</p>
					</article>
				{/each}
			{:else}
				<p class="text-lg text-base-content/70">No white papers are published yet.</p>
			{/if}
		</div>
	</Container>
</Section>
