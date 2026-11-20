<script lang="ts">
	import LeafMark from '$lib/components/ui/LeafMark.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { publicSiteUrl } from '$lib/config/site';
	import { WHITE_PAPER_OPERATOR_LINE, whitePaperInlineParts } from '$lib/content/white-papers';
	import { formatAbsoluteDate } from '$lib/utils/relativeTime';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const paper = $derived(data.paper);
	const publishedLabel = $derived(formatAbsoluteDate(`${paper.publishedAt}T00:00:00.000Z`));
</script>

<SEO
	title="{paper.title} — Aevani"
	description={paper.summary}
	url={publicSiteUrl(`/white-papers/${paper.slug}`)}
	type="article"
	publishedTime="{paper.publishedAt}T00:00:00.000Z"
	author="Escherbridge"
	image={paper.coverImage}
	useDefaultImage={!paper.coverImage}
	imageAlt={paper.coverImageAlt}
/>

<article class="white-paper mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
	<header class="paper-cover">
		<div class="flex items-center gap-3">
			<LeafMark size={48} />
			<p class="wordmark">AEVANI</p>
		</div>
		<p class="mt-8 font-mono text-xs font-bold tracking-[0.16em] text-primary uppercase">
			{paper.placeholder ? 'Placeholder white paper' : 'White paper'}
		</p>
		<h1 class="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">{paper.title}</h1>
		<p class="mt-5 text-lg leading-relaxed text-base-content/75">{paper.summary}</p>
		<figure class="cover-slot mt-8">
			{#if paper.coverImage}
				<img src={paper.coverImage} alt={paper.coverImageAlt} />
			{:else}
				<div class="cover-slot-empty">
					<p>Cover image</p>
					<p>{paper.coverImageAlt}</p>
				</div>
			{/if}
		</figure>
		<p class="mt-6 font-mono text-xs tracking-wider text-base-content/60 uppercase">
			<time datetime={paper.publishedAt}>{publishedLabel}</time>
		</p>
		<p class="mt-6">
			<a class="font-display btn tracking-wider uppercase btn-primary" href={paper.pdfPath}
				>Download PDF</a
			>
		</p>
	</header>

	<div class="paper-body mt-12 space-y-8">
		{#each paper.sections as section (section.heading)}
			<section>
				<h2 class="font-display text-2xl tracking-tight">{section.heading}</h2>
				{#each section.paragraphs as paragraph, index (index)}
					<p class="mt-3 leading-relaxed text-base-content/80">
						{#each whitePaperInlineParts(paragraph, paper.sources) as part, partIndex (partIndex)}
							{#if part.kind === 'text'}
								{part.text}
							{:else}
								<sup class="fn"><a href="#fn-{part.number}">{part.number}</a></sup>
							{/if}
						{/each}
					</p>
				{/each}
			</section>
		{/each}

		{#if paper.sources.length > 0}
			<section class="notes" aria-labelledby="white-paper-notes">
				<h2 id="white-paper-notes">Notes</h2>
				<ol>
					{#each paper.sources as source (source.number)}
						<li id="fn-{source.number}" value={source.number}>
							{#if source.href}
								<a href={source.href}>{source.label}</a>
							{:else}
								{source.label}
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		{/if}
	</div>

	<p class="operator">{WHITE_PAPER_OPERATOR_LINE}</p>
</article>

<style>
	.wordmark {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: 0.14em;
		line-height: 1;
		color: #1c3527;
	}

	.cover-slot img,
	.cover-slot-empty {
		width: 100%;
		min-height: 12rem;
		border: 1px solid #8fd8b4;
		border-radius: 12px;
		background: #e7f6ee;
	}

	.cover-slot img {
		display: block;
		max-height: 22rem;
		object-fit: cover;
	}

	.cover-slot-empty {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 0.25rem;
		margin: 0;
		padding: 1.25rem;
		color: #1e4a36;
	}

	.cover-slot-empty p {
		margin: 0;
	}

	.cover-slot-empty p:first-child {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #2e6b4f;
	}

	.fn {
		font-family: var(--font-mono);
		font-size: 0.72em;
		line-height: 0;
	}

	.notes {
		margin-top: 2.5rem;
		border-top: 1px solid #1e4a36;
		padding-top: 1rem;
	}

	.notes h2 {
		margin: 0 0 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #2e6b4f;
	}

	.notes ol {
		margin: 0;
		padding-left: 1.25rem;
		color: #1e4a36;
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.notes a {
		color: #2e6b4f;
	}

	.operator {
		margin-top: 3rem;
		color: #1e4a36;
		font-size: 0.9rem;
	}

	@media print {
		:global(.aevani-header),
		:global(.aevani-footer),
		:global(.user-bottom-bar),
		:global(.skip-link) {
			display: none !important;
		}

		.paper-cover {
			break-after: page;
			page-break-after: always;
		}
	}

	@page {
		size: letter;
		margin: 0.72in 0.7in 0.68in;
	}
</style>
