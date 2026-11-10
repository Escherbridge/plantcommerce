<script lang="ts">
	import type { GuideBlock } from '$lib/content/research';
	import GuideInline from './GuideInline.svelte';

	let { blocks }: { blocks: GuideBlock[] } = $props();
</script>

{#each blocks as block}
	{#if block.kind === 'eyebrow'}
		<p class="font-mono text-xs font-bold tracking-[0.18em] uppercase">{block.text}</p>
	{:else if block.kind === 'h1'}
		<h1 class="font-display mt-3 text-4xl font-bold tracking-tight md:text-6xl">{block.text}</h1>
	{:else if block.kind === 'h2'}
		<h2 class="font-display mt-12 text-2xl">{block.text}</h2>
	{:else if block.kind === 'p'}
		<p
			class={block.standfirst
				? 'mt-5 text-xl leading-relaxed text-base-content/70'
				: 'mt-4 leading-relaxed'}
		>
			{#each block.inlines as part}<GuideInline {part} />{/each}
		</p>
	{:else if block.kind === 'ul'}
		<ul class="mt-4 list-disc space-y-2 pl-5">
			{#each block.items as item}
				<li>
					{#each item as part}<GuideInline {part} />{/each}
				</li>
			{/each}
		</ul>
	{:else if block.kind === 'ol'}
		<ol class="mt-4 list-decimal space-y-2 pl-5">
			{#each block.items as item}
				<li>
					{#each item as part}<GuideInline {part} />{/each}
				</li>
			{/each}
		</ol>
	{/if}
{/each}
