<script lang="ts">
	import { sanitizeRichText } from '$lib/utils/sanitizeRichText';

	interface Props {
		config: { content: string; format?: 'html' | 'markdown' };
	}
	let { config }: Props = $props();
	const content = $derived(sanitizeRichText(config.content));
</script>

<div class="prose prose-lg max-w-none">
	{@html content}
</div>
