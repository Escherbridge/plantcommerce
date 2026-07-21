<script lang="ts">
	import { sanitizeRichText } from '$lib/utils/sanitizeRichText';

	interface Props {
		config: { slides: Array<{ title?: string; content: string }>; theme?: string };
	}
	let { config }: Props = $props();
	let currentSlide = $state(0);
	let showOverview = $state(false);
	const total = $derived(config.slides?.length || 0);
	const slide = $derived(config.slides?.[currentSlide]);
	const slideContent = $derived(sanitizeRichText(slide?.content));

	function prev() { if (currentSlide > 0) currentSlide--; }
	function next() { if (currentSlide < total - 1) currentSlide++; }
	function goTo(i: number) { currentSlide = i; showOverview = false; }

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') prev();
		else if (e.key === 'ArrowRight') next();
		else if (e.key === 'Escape') showOverview = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="rounded-2xl border border-base-200/30 overflow-hidden">
	{#if showOverview}
		<div class="p-4 grid grid-cols-3 gap-3 bg-base-200/50">
			{#each config.slides as s, i}
				<button
					onclick={() => goTo(i)}
					class="p-3 rounded-xl text-left text-xs bg-base-100 border border-base-200/30 hover:border-primary/30 transition-colors {i === currentSlide ? 'ring-2 ring-primary' : ''}"
				>
					<p class="font-medium truncate">{s.title || `Slide ${i + 1}`}</p>
				</button>
			{/each}
		</div>
	{:else if slide}
		<div class="p-8 lg:p-12 min-h-[300px] bg-base-100">
			{#if slide.title}
				<h3 class="text-2xl font-bold mb-4">{slide.title}</h3>
			{/if}
			<div class="prose max-w-none">{@html slideContent}</div>
		</div>
	{/if}
	<div class="flex items-center justify-between px-4 py-3 bg-base-200/50 border-t border-base-200/30">
		<button onclick={prev} disabled={currentSlide === 0} class="btn btn-ghost btn-sm" aria-label="Previous slide">
			<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
		</button>
		<div class="flex items-center gap-3">
			<span class="text-sm text-base-content/60">{currentSlide + 1} / {total}</span>
			<button onclick={() => showOverview = !showOverview} class="btn btn-ghost btn-xs" aria-label="Toggle overview">
				<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
			</button>
		</div>
		<button onclick={next} disabled={currentSlide === total - 1} class="btn btn-ghost btn-sm" aria-label="Next slide">
			<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
		</button>
	</div>
</div>
