<script lang="ts">
	import type { GuideSectorPage } from '$lib/content/writing';

	let { sector }: { sector: GuideSectorPage } = $props();
</script>

<main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
	<nav class="mb-8 text-sm" aria-label="Breadcrumb">
		<a class="link" href="/guides">Guides</a>
		<span aria-hidden="true"> / </span>
		<span aria-current="page">{sector.name}</span>
	</nav>
	<article>
		<p class="font-mono text-xs font-bold tracking-[0.18em] uppercase">{sector.name}</p>
		<h1 class="font-display mt-3 text-4xl font-bold tracking-tight md:text-6xl">{sector.title}</h1>
		<p class="mt-5 text-xl leading-relaxed text-base-content/70">{sector.standfirst}</p>
		<p class="mt-4 font-mono text-xs tracking-wider text-base-content/50 uppercase">
			Escherbridge
			<span aria-hidden="true"> · </span>
			<time datetime={sector.reviewedAt}>Reviewed {sector.reviewedAt}</time>
		</p>

		<section class="mt-12">
			<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Figures</h2>
			{#if sector.stats.length > 0}
				<ul class="mt-4 space-y-4">
					{#each sector.stats as stat}
						<li>
							<p class="font-display text-3xl">{stat.figure}</p>
							<p>{stat.label}</p>
							<p class="text-sm text-base-content/60">{stat.source}</p>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-4 text-base-content/70">No figures are recorded yet.</p>
			{/if}
		</section>

		<section class="mt-12">
			<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Challenges</h2>
			{#if sector.challenges.length > 0}
				<ul class="mt-4 space-y-4">
					{#each sector.challenges as challenge}
						<li>
							<h3 class="font-display text-2xl">{challenge.title}</h3>
							<p class="mt-1">{challenge.body}</p>
							<p class="mt-1 text-sm text-base-content/60">{challenge.metric}</p>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-4 text-base-content/70">No challenges are recorded yet.</p>
			{/if}
		</section>

		<section class="mt-12">
			<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Applications</h2>
			{#if sector.applications.length > 0}
				<ul class="mt-4 space-y-4">
					{#each sector.applications as application}
						<li>
							<h3 class="font-display text-2xl">{application.title}</h3>
							<p class="mt-1">{application.body}</p>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-4 text-base-content/70">No applications are recorded yet.</p>
			{/if}
		</section>

		<section class="mt-12">
			<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">
				Every stat on this page is cited.
			</h2>
			{#if sector.sources.length > 0}
				<ul class="mt-4 list-disc space-y-2 pl-5">
					{#each sector.sources as source}
						<li>
							{source.organization}, {source.year}.
							<a class="link" href={source.href}>{source.title}</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-4 text-base-content/70">No sources are recorded yet.</p>
			{/if}
		</section>

		<section class="mt-12">
			<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Illustrative</h2>
			<p class="mt-2 text-sm text-base-content/60">
				A worked example. Not a customer, a site, or a completed job.
			</p>
			<h3 class="font-display mt-4 text-2xl">{sector.illustrative.heading}</h3>
			<p class="mt-2">{sector.illustrative.body}</p>
		</section>

		<section class="mt-12">
			<h2 class="font-mono text-xs font-bold tracking-[0.18em] uppercase">Also in this section</h2>
			{#if sector.siblings.length > 0}
				<ul class="mt-4 space-y-2">
					{#each sector.siblings as sibling}
						<li><a class="link" href={sibling.href}>{sibling.name}</a></li>
					{/each}
				</ul>
			{:else}
				<p class="mt-4 text-base-content/70">No sibling pages are published yet.</p>
			{/if}
			<p class="mt-6 text-sm">
				<a class="link link-primary" href="/guides">Back to guides</a>
				·
				<a class="link link-primary" href="/contact">Contact</a>
			</p>
		</section>
	</article>
</main>
