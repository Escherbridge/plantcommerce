<script lang="ts">
	import { Icon } from '$lib/components/icons';
	interface Props {
		config: { code: string; language?: string; filename?: string };
	}
	let { config }: Props = $props();
	let copied = $state(false);

	const lines = $derived(config.code.split('\n'));

	async function copyCode() {
		await navigator.clipboard.writeText(config.code);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div class="overflow-hidden rounded-2xl border border-base-200/30">
	{#if config.filename}
		<div
			class="flex items-center justify-between border-b border-base-200/30 bg-base-300 px-4 py-2"
		>
			<span class="font-mono text-xs text-base-content/60">{config.filename}</span>
			{#if config.language}
				<span class="text-xs text-base-content/40">{config.language}</span>
			{/if}
		</div>
	{/if}
	<div class="relative bg-neutral text-neutral-content">
		<button
			onclick={copyCode}
			class="btn absolute top-3 right-3 text-neutral-content/60 btn-ghost btn-xs hover:text-neutral-content"
			aria-label="Copy code"
		>
			{#if copied}
				<Icon name="check" size={16} />
			{:else}
				<Icon name="copy" size={16} />
			{/if}
		</button>
		<pre class="overflow-x-auto p-4 text-sm leading-relaxed"><code
				>{#each lines as line, i}<span
						class="mr-4 inline-block w-8 text-right text-neutral-content/30 select-none"
						>{i + 1}</span
					>{line}
				{/each}</code
			></pre>
	</div>
</div>
