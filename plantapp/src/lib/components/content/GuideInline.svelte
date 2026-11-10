<script lang="ts">
	import type { GuideInline } from '$lib/content/research';

	let { part }: { part: GuideInline } = $props();
</script>

{#if part.kind === 'text'}{part.text}{:else if part.kind === 'strong'}<strong>{part.text}</strong
	>{:else if part.kind === 'em'}<em>{part.text}</em>{:else}<a
		class="link break-words"
		href={part.href}
		rel={part.href.startsWith('http') ? 'noopener noreferrer' : undefined}
		>{#if part.strong}<strong>{part.text}</strong>{:else}{part.text}{/if}</a
	>{/if}
