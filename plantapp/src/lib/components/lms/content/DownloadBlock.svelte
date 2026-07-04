<script lang="ts">
	interface Props {
		config: { filename: string; description?: string; fileSize?: number };
		signedUrl?: string;
	}
	let { config, signedUrl }: Props = $props();

	function formatSize(bytes?: number): string {
		if (!bytes) return '';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
		return `${(bytes / 1073741824).toFixed(1)} GB`;
	}

	const ext = $derived(config.filename.split('.').pop()?.toLowerCase() || '');
</script>

<div class="rounded-2xl border border-base-200/30 p-6 flex items-center gap-4 bg-base-200/30 hover:bg-base-200/50 transition-colors">
	<div class="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
		<svg viewBox="0 0 24 24" class="w-6 h-6 text-primary" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
		</svg>
	</div>
	<div class="flex-1 min-w-0">
		<p class="font-medium text-base-content truncate">{config.filename}</p>
		{#if config.description}
			<p class="text-sm text-base-content/60 mt-0.5">{config.description}</p>
		{/if}
		<div class="flex items-center gap-2 mt-1 text-xs text-base-content/40">
			{#if ext}<span class="uppercase">{ext}</span>{/if}
			{#if config.fileSize}<span>{formatSize(config.fileSize)}</span>{/if}
		</div>
	</div>
	{#if signedUrl}
		<a href={signedUrl} download={config.filename} class="btn btn-primary btn-sm" aria-label="Download file">
			<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
			Download
		</a>
	{:else}
		<span class="btn btn-ghost btn-sm btn-disabled">Unavailable</span>
	{/if}
</div>
