<script lang="ts">
	import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
	import { Icon } from '$lib/components/icons';

	interface Props {
		config: { slides: Array<{ title?: string; content: string }>; theme?: string };
	}
	let { config }: Props = $props();
	let currentSlide = $state(0);
	let showOverview = $state(false);
	const total = $derived(config.slides?.length || 0);
	const slide = $derived(config.slides?.[currentSlide]);
	const slideContent = $derived(sanitizeRichText(slide?.content));

	function prev() {
		if (currentSlide > 0) currentSlide--;
	}
	function next() {
		if (currentSlide < total - 1) currentSlide++;
	}
	function goTo(i: number) {
		currentSlide = i;
		showOverview = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') prev();
		else if (e.key === 'ArrowRight') next();
		else if (e.key === 'Escape') showOverview = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="overflow-hidden rounded-2xl border border-base-200/30">
	{#if showOverview}
		<div class="grid grid-cols-3 gap-3 bg-base-200/50 p-4">
			{#each config.slides as s, i}
				<button
					onclick={() => goTo(i)}
					class="rounded-xl border border-base-200/30 bg-base-100 p-3 text-left text-xs transition-colors hover:border-primary/30 {i ===
					currentSlide
						? 'ring-2 ring-primary'
						: ''}"
				>
					<p class="truncate font-medium">{s.title || `Slide ${i + 1}`}</p>
				</button>
			{/each}
		</div>
	{:else if slide}
		<div class="min-h-[300px] bg-base-100 p-8 lg:p-12">
			{#if slide.title}
				<h3 class="mb-4 text-2xl font-bold">{slide.title}</h3>
			{/if}
			<div class="prose max-w-none">{@html slideContent}</div>
		</div>
	{/if}
	<div
		class="flex items-center justify-between border-t border-base-200/30 bg-base-200/50 px-4 py-3"
	>
		<button
			onclick={prev}
			disabled={currentSlide === 0}
			class="btn btn-ghost btn-sm"
			aria-label="Previous slide"
		>
			<Icon name="chevron-left" size={16} />
		</button>
		<div class="flex items-center gap-3">
			<span class="text-sm text-base-content/60">{currentSlide + 1} / {total}</span>
			<button
				onclick={() => (showOverview = !showOverview)}
				class="btn btn-ghost btn-xs"
				aria-label="Toggle overview"
			>
				<Icon name="grid" size={16} />
			</button>
		</div>
		<button
			onclick={next}
			disabled={currentSlide === total - 1}
			class="btn btn-ghost btn-sm"
			aria-label="Next slide"
		>
			<Icon name="chevron-right" size={16} />
		</button>
	</div>
</div>
