<script lang="ts">
	import VideoBlock from './VideoBlock.svelte';
	import AudioBlock from './AudioBlock.svelte';
	import TextBlock from './TextBlock.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import ImageBlock from './ImageBlock.svelte';
	import SlidesBlock from './SlidesBlock.svelte';
	import EmbedBlock from './EmbedBlock.svelte';
	import DownloadBlock from './DownloadBlock.svelte';

	interface Props {
		block: {
			id: string;
			type: string;
			config: string;
			fileId?: string | null;
			signedUrl?: string;
			isRequired?: boolean;
		};
		onProgress?: (blockId: string, percent: number) => void;
	}
	let { block, onProgress }: Props = $props();

	const parsedConfig = $derived(() => {
		try {
			return JSON.parse(block.config);
		} catch {
			return {};
		}
	});

	function handleProgress(percent: number) {
		onProgress?.(block.id, percent);
	}
</script>

<div class="mb-6">
	{#if block.type === 'video'}
		<VideoBlock config={parsedConfig()} signedUrl={block.signedUrl} onProgress={handleProgress} />
	{:else if block.type === 'audio'}
		<AudioBlock config={parsedConfig()} signedUrl={block.signedUrl} onProgress={handleProgress} />
	{:else if block.type === 'text'}
		<TextBlock config={parsedConfig()} />
	{:else if block.type === 'code'}
		<CodeBlock config={parsedConfig()} />
	{:else if block.type === 'image'}
		<ImageBlock config={parsedConfig()} signedUrl={block.signedUrl} />
	{:else if block.type === 'slides'}
		<SlidesBlock config={parsedConfig()} />
	{:else if block.type === 'embed'}
		<EmbedBlock config={parsedConfig()} />
	{:else if block.type === 'download'}
		<DownloadBlock config={parsedConfig()} signedUrl={block.signedUrl} />
	{:else}
		<div class="rounded-2xl border border-warning/30 bg-warning/5 p-6 text-center">
			<p class="text-sm text-base-content/60">Unsupported content type: {block.type}</p>
		</div>
	{/if}
</div>
