<script lang="ts">
	import { Icon } from '$lib/components/icons';
	interface Props {
		messages: string[];
		divider?: string;
		class?: string;
	}

	let { messages, divider = '•', class: className = '' }: Props = $props();

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
		class="marquee-bar relative flex
		       h-7 items-center overflow-hidden sm:h-8 {className}"
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
			<span
				class="marquee-content inline-flex items-center gap-4 px-4 font-mono text-xs sm:text-sm"
			>
				{#each tokens as token}
					<span>{token}</span>
				{/each}
			</span>
			<!-- Duplicate for seamless loop -->
			<span
				class="marquee-content inline-flex items-center gap-4 px-4 font-mono text-xs sm:text-sm"
			>
				{#each tokens as token}
					<span>{token}</span>
				{/each}
			</span>
		</div>

		<!-- Dismiss button -->
		<button
			onclick={dismiss}
			class="marquee-dismiss absolute top-0 right-0 bottom-0 z-10 flex items-center
			       px-3 transition-colors"
			aria-label="Dismiss announcements"
		>
			<Icon name="x" size={14} />
		</button>
	</div>
{/if}

<style>
	.marquee-bar {
		background-color: #1b2d4a;
		color: #f7f5f0;
	}

	.marquee-dismiss {
		background-color: #1b2d4a;
	}

	.marquee-dismiss:hover {
		background-color: rgba(27, 45, 74, 0.85);
	}

	.marquee-track {
		animation: marquee 24s linear infinite;
	}

	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation-play-state: paused;
		}
	}
</style>
