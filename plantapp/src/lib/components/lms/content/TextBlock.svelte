<script lang="ts">
	interface Props {
		config: { content: string; format?: 'html' | 'markdown' };
	}
	let { config }: Props = $props();
</script>

<div class="prose prose-lg max-w-none">
	{@html config.content}
</div>
