<script lang="ts">
	interface Props {
		config: { url: string; provider?: string; aspectRatio?: string };
	}
	let { config }: Props = $props();

	const WHITELIST = ['youtube.com', 'youtu.be', 'vimeo.com', 'codepen.io', 'codesandbox.io'];

	const isAllowed = $derived(() => {
		try {
			const hostname = new URL(config.url).hostname;
			return WHITELIST.some(domain => hostname === domain || hostname.endsWith('.' + domain));
		} catch { return false; }
	});

	const embedUrl = $derived(() => {
		try {
			const url = new URL(config.url);
			if (url.hostname.includes('youtube.com') && url.searchParams.get('v')) {
				return `https://www.youtube.com/embed/${url.searchParams.get('v')}`;
			}
			if (url.hostname === 'youtu.be') {
				return `https://www.youtube.com/embed${url.pathname}`;
			}
			if (url.hostname.includes('vimeo.com')) {
				const id = url.pathname.split('/').pop();
				return `https://player.vimeo.com/video/${id}`;
			}
			return config.url;
		} catch { return config.url; }
	});
</script>

<div class="rounded-2xl overflow-hidden border border-base-200/30">
	{#if isAllowed()}
		<div class="relative" style="aspect-ratio: {config.aspectRatio || '16/9'};">
			<iframe
				src={embedUrl()}
				title="Embedded content"
				class="absolute inset-0 w-full h-full"
				sandbox="allow-scripts allow-same-origin allow-popups"
				allow="fullscreen"
				loading="lazy"
			></iframe>
		</div>
	{:else}
		<div class="flex items-center justify-center p-8 bg-base-200/50 text-base-content/60">
			<div class="text-center">
				<svg viewBox="0 0 24 24" class="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
				<p class="text-sm">This embed provider is not supported</p>
			</div>
		</div>
	{/if}
</div>
