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

<div
	class="flex items-center gap-4 rounded-2xl border border-base-200/30 bg-base-200/30 p-6 transition-colors hover:bg-base-200/50"
>
	<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
		<svg
			viewBox="0 0 24 24"
			class="h-6 w-6 text-primary"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline
				points="14 2 14 8 20 8"
			/><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 18 15 15" />
		</svg>
	</div>
	<div class="min-w-0 flex-1">
		<p class="truncate font-medium text-base-content">{config.filename}</p>
		{#if config.description}
			<p class="mt-0.5 text-sm text-base-content/60">{config.description}</p>
		{/if}
		<div class="mt-1 flex items-center gap-2 text-xs text-base-content/40">
			{#if ext}<span class="uppercase">{ext}</span>{/if}
			{#if config.fileSize}<span>{formatSize(config.fileSize)}</span>{/if}
		</div>
	</div>
	{#if signedUrl}
		<a
			href={signedUrl}
			download={config.filename}
			class="btn btn-sm btn-primary"
			aria-label="Download file"
		>
			<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"
				><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline
					points="7 10 12 15 17 10"
				/><line x1="12" y1="15" x2="12" y2="3" /></svg
			>
			Download
		</a>
	{:else}
		<span class="btn-disabled btn btn-ghost btn-sm">Unavailable</span>
	{/if}
</div>
