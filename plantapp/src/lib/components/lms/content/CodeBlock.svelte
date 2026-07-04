<script lang="ts">
	interface Props {
		config: { code: string; language?: string; filename?: string };
	}
	let { config }: Props = $props();
	let copied = $state(false);

	const lines = $derived(config.code.split('\n'));

	async function copyCode() {
		await navigator.clipboard.writeText(config.code);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}
</script>

<div class="rounded-2xl overflow-hidden border border-base-200/30">
	{#if config.filename}
		<div class="flex items-center justify-between px-4 py-2 bg-base-300 border-b border-base-200/30">
			<span class="text-xs font-mono text-base-content/60">{config.filename}</span>
			{#if config.language}
				<span class="text-xs text-base-content/40">{config.language}</span>
			{/if}
		</div>
	{/if}
	<div class="relative bg-neutral text-neutral-content">
		<button
			onclick={copyCode}
			class="absolute top-3 right-3 btn btn-ghost btn-xs text-neutral-content/60 hover:text-neutral-content"
			aria-label="Copy code"
		>
			{#if copied}
				<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
			{:else}
				<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
			{/if}
		</button>
		<pre class="overflow-x-auto p-4 text-sm leading-relaxed"><code>{#each lines as line, i}<span class="inline-block w-8 text-right mr-4 text-neutral-content/30 select-none">{i + 1}</span>{line}
{/each}</code></pre>
	</div>
</div>
