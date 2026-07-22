<script lang="ts">
	interface Props {
		config: { url?: string };
		signedUrl?: string;
		onProgress?: (percent: number) => void;
	}
	let { config, signedUrl, onProgress }: Props = $props();
	let videoEl: HTMLVideoElement | undefined = $state();

	$effect(() => {
		if (!videoEl || !onProgress) return;
		const handler = () => {
			if (videoEl && videoEl.duration) {
				onProgress(Math.round((videoEl.currentTime / videoEl.duration) * 100));
			}
		};
		videoEl.addEventListener('timeupdate', handler);
		return () => videoEl?.removeEventListener('timeupdate', handler);
	});

	const src = $derived(signedUrl || config.url || '');
</script>

<div class="w-full overflow-hidden rounded-2xl bg-base-300">
	<div class="relative" style="aspect-ratio: 16/9;">
		{#if src}
			<video
				bind:this={videoEl}
				{src}
				controls
				preload="metadata"
				class="h-full w-full object-contain"
			>
				<track kind="captions" />
			</video>
		{:else}
			<div class="flex h-full items-center justify-center text-base-content/40">
				<span>No video source available</span>
			</div>
		{/if}
	</div>
</div>
