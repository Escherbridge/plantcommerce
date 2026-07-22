<script lang="ts">
	interface Props {
		config: { alt?: string; caption?: string; width?: number; height?: number };
		signedUrl?: string;
	}
	let { config, signedUrl }: Props = $props();
</script>

<figure class="overflow-hidden rounded-2xl">
	{#if signedUrl}
		<img
			src={signedUrl}
			alt={config.alt || ''}
			width={config.width}
			height={config.height}
			loading="lazy"
			class="h-auto max-h-[600px] w-full object-contain"
		/>
	{:else}
		<div class="flex h-48 items-center justify-center bg-base-200 text-base-content/40">
			<span>No image available</span>
		</div>
	{/if}
	{#if config.caption}
		<figcaption class="mt-3 px-4 text-center text-sm text-base-content/60">
			{config.caption}
		</figcaption>
	{/if}
</figure>
