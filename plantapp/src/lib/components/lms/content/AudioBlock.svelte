<script lang="ts">
	interface Props {
		config: { url?: string; title?: string };
		signedUrl?: string;
		onProgress?: (percent: number) => void;
	}
	let { config, signedUrl, onProgress }: Props = $props();
	let audioEl: HTMLAudioElement | undefined = $state();
	let currentTime = $state(0);
	let duration = $state(0);
	let isPlaying = $state(false);

	$effect(() => {
		if (!audioEl) return;
		const timeHandler = () => {
			currentTime = audioEl!.currentTime;
			duration = audioEl!.duration || 0;
			if (onProgress && duration > 0) {
				onProgress(Math.round((currentTime / duration) * 100));
			}
		};
		const playHandler = () => {
			isPlaying = true;
		};
		const pauseHandler = () => {
			isPlaying = false;
		};
		audioEl.addEventListener('timeupdate', timeHandler);
		audioEl.addEventListener('play', playHandler);
		audioEl.addEventListener('pause', pauseHandler);
		return () => {
			audioEl?.removeEventListener('timeupdate', timeHandler);
			audioEl?.removeEventListener('play', playHandler);
			audioEl?.removeEventListener('pause', pauseHandler);
		};
	});

	const src = $derived(signedUrl || config.url || '');

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function togglePlay() {
		if (audioEl?.paused) audioEl.play();
		else audioEl?.pause();
	}
</script>

<div class="rounded-2xl border border-base-200/30 bg-base-200/50 p-6">
	{#if config.title}
		<p class="mb-3 text-sm font-medium text-base-content/70">{config.title}</p>
	{/if}
	<div class="flex items-center gap-4">
		<button
			onclick={togglePlay}
			class="btn btn-circle btn-sm btn-primary"
			aria-label={isPlaying ? 'Pause' : 'Play'}
		>
			{#if isPlaying}
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"
					><rect x="6" y="4" width="4" height="16" /><rect
						x="14"
						y="4"
						width="4"
						height="16"
					/></svg
				>
			{:else}
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"
					><polygon points="5,3 19,12 5,21" /></svg
				>
			{/if}
		</button>
		<div class="flex-1">
			<input
				type="range"
				min="0"
				max={duration || 100}
				value={currentTime}
				oninput={(e) => {
					if (audioEl) audioEl.currentTime = Number(e.currentTarget.value);
				}}
				class="range w-full range-primary range-xs"
			/>
			<div class="mt-1 flex justify-between text-xs text-base-content/40">
				<span>{formatTime(currentTime)}</span>
				<span>{formatTime(duration)}</span>
			</div>
		</div>
	</div>
	<audio bind:this={audioEl} {src} preload="metadata" class="hidden">
		<track kind="captions" />
	</audio>
</div>
