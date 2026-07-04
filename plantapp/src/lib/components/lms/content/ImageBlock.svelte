<script lang="ts">
	interface Props {
		config: { alt?: string; caption?: string; width?: number; height?: number };
		signedUrl?: string;
	}
	let { config, signedUrl }: Props = $props();
</script>

<figure class="rounded-2xl overflow-hidden">
	{#if signedUrl}
		<img
			src={signedUrl}
			alt={config.alt || ''}
			width={config.width}
			height={config.height}
			loading="lazy"
			class="w-full h-auto object-contain max-h-[600px]"
		/>
	{:else}
		<div class="flex items-center justify-center h-48 bg-base-200 text-base-content/40">
			<span>No image available</span>
		</div>
	{/if}
	{#if config.caption}
		<figcaption class="text-sm text-base-content/60 text-center mt-3 px-4">{config.caption}</figcaption>
	{/if}
</figure>
