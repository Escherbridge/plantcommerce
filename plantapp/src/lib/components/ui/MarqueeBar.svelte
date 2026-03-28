<script lang="ts">
	interface Props {
		messages: string[];
		divider?: string;
		class?: string;
	}

	let {
		messages,
		divider = '•',
		class: className = ''
	}: Props = $props();

	let dismissed = $state(false);
	let mounted = $state(false);

	const STORAGE_KEY = 'marquee-dismissed';

	$effect(() => {
		try {
			if (sessionStorage.getItem(STORAGE_KEY) === '1') {
				dismissed = true;
			}
		} catch {
			// sessionStorage unavailable (e.g. private browsing with restrictions)
		}
		mounted = true;
	});

	function dismiss() {
		dismissed = true;
		try {
			sessionStorage.setItem(STORAGE_KEY, '1');
		} catch {
			// ignore
		}
	}

	// Build the flat list of tokens (message, divider, message, divider…)
	const tokens = $derived(
		messages.flatMap((msg, i) => (i < messages.length - 1 ? [msg, divider] : [msg]))
	);
</script>

{#if mounted && !dismissed}
	<div
		class="marquee-bar relative overflow-hidden bg-primary text-primary-content
		       h-7 sm:h-8 flex items-center {className}"
		role="region"
		aria-label="Announcements"
	>
		<!-- Accessible text for screen readers -->
		<span class="sr-only">
			{messages.join(` ${divider} `)}
		</span>

		<!-- Scrolling track (duplicated for seamless loop) -->
		<div class="marquee-track flex items-center whitespace-nowrap" aria-hidden="true">
			<!-- First copy -->
			<span class="marquee-content inline-flex items-center gap-4 px-4 font-mono text-xs sm:text-sm">
				{#each tokens as token}
					<span>{token}</span>
				{/each}
			</span>
			<!-- Duplicate for seamless loop -->
			<span class="marquee-content inline-flex items-center gap-4 px-4 font-mono text-xs sm:text-sm">
				{#each tokens as token}
					<span>{token}</span>
				{/each}
			</span>
		</div>

		<!-- Dismiss button -->
		<button
			onclick={dismiss}
			class="absolute right-0 top-0 bottom-0 px-3 flex items-center
			       bg-primary hover:bg-primary/80 transition-colors z-10"
			aria-label="Dismiss announcements"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<line x1="2" y1="2" x2="12" y2="12" />
				<line x1="12" y1="2" x2="2" y2="12" />
			</svg>
		</button>
	</div>
{/if}

<style>
	.marquee-track {
		animation: marquee 24s linear infinite;
	}

	@keyframes marquee {
		from { transform: translateX(0); }
		to   { transform: translateX(-50%); }
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation-play-state: paused;
		}
	}
</style>
